import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SAMPLE_KPIS } from '../../lib/sampleKPIData';
import { FULL_MONTHS, QUARTER_MONTH_MAP, getQuartersFromMonths, getQuarterMonthMapForYear, getAvailableQuartersForYear } from '../../lib/quarterUtils';
import { CURRENT_MONTH, analyzeTimeSelection, getComparisonPeriods, isCompleteQuarter, TimeSelectionContext, ComparisonPeriod } from '../../lib/smartTimeUtils';

export interface MarketingKPI {
  id?: string;
  kpi_category: string;
  kpi_name: string;
  q3_target?: number | string;
  q3_actual?: number | string;
  q4_target?: number | string;
  q4_jan_actual?: number | string;
  q4_feb_actual?: number | string;
  q4_mar_actual?: number | string;
}

export interface BDKpi {
  id?: string;
  region: string;
  kpi_category: string;
  kpi_name: string;
  q3_target?: number | string;
  q3_actual?: number | string;
  q4_target?: number | string;
  q4_jan_actual?: number | string;
  q4_feb_actual?: number | string;
  q4_mar_actual?: number | string;
}

/**
 * Comprehensive KPI Data Structure with Comparison Support
 * Supports MoM, QoQ, and YoY comparisons
 */
export interface ComprehensiveKPI {
  id?: string;
  department: string;
  kpi_name: string;
  category: string;
  
  // Current period
  current_month: string;
  current_month_target: number;
  current_month_actual: number;
  
  // MoM comparison
  previous_month?: string;
  previous_month_actual?: number;
  mom_pct_change?: number;
  
  // Current quarter
  current_quarter?: string;
  current_quarter_target?: number;
  current_quarter_actual?: number;
  
  // QoQ comparison
  previous_quarter?: string;
  previous_quarter_actual?: number;
  qoq_pct_change?: number;
  
  // YoY comparison
  same_month_prior_year_actual?: number;
  yoy_pct_change?: number;
  
  // Reference
  financial_year: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Comparison Data extracted from a KPI
 */
export interface KPIComparison {
  mom: {
    value: number | null;
    percentChange: number | null;
    trend: 'up' | 'down' | 'neutral';
  };
  qoq: {
    value: number | null;
    percentChange: number | null;
    trend: 'up' | 'down' | 'neutral';
  };
  yoy: {
    value: number | null;
    percentChange: number | null;
    trend: 'up' | 'down' | 'neutral';
  };
}

interface KPIContextValue {
  marketingData: MarketingKPI[];
  bdData: BDKpi[];
  
  // New comprehensive KPI data
  comprehensiveKPIData: ComprehensiveKPI[];
  isLoadingData: boolean;
  
  selectedMonths: string[]; // Full month names: January, February, etc.
  selectedQuarters: string[]; // Q1, Q2, Q3, Q4
  selectedYear: string; // FY2025, FY2026 etc.
  setSelectedMonths: (m: string[]) => void;
  setSelectedQuarters: (q: string[]) => void;
  setSelectedYear: (year: string) => void;
  reload: () => Promise<void>;
  currentQuarters: string[];
  // Smart time utilities
  timeContext: TimeSelectionContext;
  comparisonPeriods: ComparisonPeriod;
  isQuarterView: boolean;
  
  // Utility functions for comparisons
  getKPIComparisons: (kpi: ComprehensiveKPI) => KPIComparison;
  getTrendColor: (trend: 'up' | 'down' | 'neutral', isNegativeMetric?: boolean) => string;
  formatPercentChange: (value: number | null) => string;
}

const KPIContext = createContext<KPIContextValue | undefined>(undefined);

/**
 * Get quarters from selected full month names
 * Returns null if no complete quarter is selected, otherwise returns first matching quarter
 */
export const getQuarterFromMonths = (selectedMonths: string[]): string | null => {
  if (selectedMonths.length === 0) return null;
  
  for (const [quarter, months] of Object.entries(QUARTER_MONTH_MAP)) {
    const match = months.every(m => selectedMonths.includes(m));
    if (match) return quarter;
  }
  return null;
};

export const KPIProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [marketingData, setMarketingData] = useState<MarketingKPI[]>([]);
  const [bdData, setBdData] = useState<BDKpi[]>([]);
  const [comprehensiveKPIData, setComprehensiveKPIData] = useState<ComprehensiveKPI[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  // Default to current month (February) for smart analytics
  const [selectedMonths, setSelectedMonths] = useState<string[]>([CURRENT_MONTH]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('FY2026');

  /**
   * Extract comparison data from a comprehensive KPI
   */
  const getKPIComparisons = (kpi: ComprehensiveKPI): KPIComparison => {
    return {
      mom: {
        value: kpi.previous_month_actual || null,
        percentChange: kpi.mom_pct_change || null,
        trend: kpi.mom_pct_change ? (kpi.mom_pct_change > 0 ? 'up' : kpi.mom_pct_change < 0 ? 'down' : 'neutral') : 'neutral',
      },
      qoq: {
        value: kpi.previous_quarter_actual || null,
        percentChange: kpi.qoq_pct_change || null,
        trend: kpi.qoq_pct_change ? (kpi.qoq_pct_change > 0 ? 'up' : kpi.qoq_pct_change < 0 ? 'down' : 'neutral') : 'neutral',
      },
      yoy: {
        value: kpi.same_month_prior_year_actual || null,
        percentChange: kpi.yoy_pct_change || null,
        trend: kpi.yoy_pct_change ? (kpi.yoy_pct_change > 0 ? 'up' : kpi.yoy_pct_change < 0 ? 'down' : 'neutral') : 'neutral',
      },
    };
  };

  /**
   * Get trend color based on direction (supports positive and negative metrics)
   */
  const getTrendColor = (trend: 'up' | 'down' | 'neutral', isNegativeMetric = false): string => {
    if (isNegativeMetric) {
      // For metrics where lower is better (costs, errors, etc.)
      return trend === 'down' ? 'text-green-600' : trend === 'up' ? 'text-red-600' : 'text-gray-600';
    } else {
      // For metrics where higher is better (revenue, growth, etc.)
      return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
    }
  };

  /**
   * Format percentage change for display
   */
  const formatPercentChange = (value: number | null): string => {
    if (value === null || value === undefined) return '—';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch data for selected months and year
      const monthsToFetch = selectedMonths.length > 0 ? selectedMonths : [CURRENT_MONTH];
      const yearToFetch = selectedYear === 'FY2026' ? 2026 : 2025; // Extract year from FY string
      
      console.log(`📊 Fetching KPI data for months:`, monthsToFetch, `year: ${yearToFetch}`);
      
      const [mktRes, bdRes, prodRes, salesRes, mkgRes, rndRes, finRes] = await Promise.all([
        supabase.from('marketing_dashboard').select('*').catch(() => ({ data: [] })),
        supabase.from('bd_dashboard').select('*').catch(() => ({ data: [] })),
        supabase
          .from('product_kpis')
          .select('*')
          .in('month', monthsToFetch)
          .eq('year', yearToFetch)
          .catch(() => ({ data: null })),
        supabase
          .from('sales_kpis')
          .select('*')
          .in('month', monthsToFetch)
          .eq('year', yearToFetch)
          .catch(() => ({ data: null })),
        supabase
          .from('marketing_kpis')
          .select('*')
          .in('month', monthsToFetch)
          .eq('year', yearToFetch)
          .catch(() => ({ data: null })),
        supabase
          .from('rnd_kpis')
          .select('*')
          .in('month', monthsToFetch)
          .eq('year', yearToFetch)
          .catch(() => ({ data: null })),
        supabase
          .from('finance_kpis')
          .select('*')
          .in('month', monthsToFetch)
          .eq('year', yearToFetch)
          .catch(() => ({ data: null })),
      ]);

      if (mktRes?.error) console.warn('Marketing fetch error (using sample data instead):', mktRes.error);
      if (bdRes?.error) console.warn('BD fetch error (using sample data instead):', bdRes.error);
      if (prodRes?.error) console.warn('Product KPI fetch error (using sample data instead):', prodRes.error);
      if (salesRes?.error) console.warn('Sales KPI fetch error (using sample data instead):', salesRes.error);
      if (mkgRes?.error) console.warn('Marketing KPI fetch error (using sample data instead):', mkgRes.error);
      if (rndRes?.error) console.warn('RnD KPI fetch error (using sample data instead):', rndRes.error);
      if (finRes?.error) console.warn('Finance KPI fetch error (using sample data instead):', finRes.error);

      setMarketingData((mktRes?.data || []) as MarketingKPI[]);
      setBdData((bdRes?.data || []) as BDKpi[]);
      
      // Combine all comprehensive KPI data from all department tables or use sample data
      const allComprehensiveKPIs = [
        ...(prodRes?.data && Array.isArray(prodRes.data) && prodRes.data.length > 0 ? prodRes.data : SAMPLE_KPIS.product),
        ...(salesRes?.data && Array.isArray(salesRes.data) && salesRes.data.length > 0 ? salesRes.data : SAMPLE_KPIS.sales),
        ...(mkgRes?.data && Array.isArray(mkgRes.data) && mkgRes.data.length > 0 ? mkgRes.data : SAMPLE_KPIS.marketing),
        ...(rndRes?.data && Array.isArray(rndRes.data) && rndRes.data.length > 0 ? rndRes.data : SAMPLE_KPIS.rnd),
        ...(finRes?.data && Array.isArray(finRes.data) && finRes.data.length > 0 ? finRes.data : SAMPLE_KPIS.finance),
      ] as ComprehensiveKPI[];
      
      console.log(`✓ Loaded ${allComprehensiveKPIs.length} total KPIs`);
      setComprehensiveKPIData(allComprehensiveKPIs);
    } catch (err) {
      console.error('Fetch error:', err);
      // Use all sample data on error
      const allSampleKPIs = [
        ...SAMPLE_KPIS.product,
        ...SAMPLE_KPIS.sales,
        ...SAMPLE_KPIS.marketing,
        ...SAMPLE_KPIS.rnd,
        ...SAMPLE_KPIS.finance,
      ] as ComprehensiveKPI[];
      setComprehensiveKPIData(allSampleKPIs);
      console.log('Using sample data after fetch error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data in the background and refetch when month/year changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedMonths, selectedYear]);

  const reload = async () => {
    await fetchData();
  };

  // Derive current quarters from selected months
  const currentQuarters = getQuartersFromMonths(selectedMonths);
  
  // Compute smart time context
  const timeContext = analyzeTimeSelection(selectedMonths, selectedYear);
  const comparisonPeriods = getComparisonPeriods(selectedMonths, selectedYear);
  const isQuarterView = isCompleteQuarter(selectedMonths, selectedYear);

  // Sync quarters with months - when quarters change, update months
  // But only if user is in "quarter mode" (not custom month mode)
  useEffect(() => {
    if (selectedQuarters.length > 0) {
      const monthsFromQuarters: string[] = [];
      const yearMap = getQuarterMonthMapForYear(selectedYear);
      selectedQuarters.forEach((quarter) => {
        const months = yearMap[quarter];
        if (months) {
          months.forEach((m) => {
            if (!monthsFromQuarters.includes(m)) {
              monthsFromQuarters.push(m);
            }
          });
        }
      });
      setSelectedMonths(monthsFromQuarters);
    }
  }, [selectedQuarters, selectedYear]);

  // Default to first available quarter when year changes
  useEffect(() => {
    const availableQuarters = getAvailableQuartersForYear(selectedYear);
    if (availableQuarters.length > 0) {
      setSelectedQuarters([availableQuarters[0]]);
      setSelectedMonths([]);
    }
  }, [selectedYear]);

  // Default to current month if nothing selected
  useEffect(() => {
    if (selectedMonths.length === 0 && selectedQuarters.length === 0) {
      setSelectedMonths([CURRENT_MONTH]);
    }
  }, [selectedMonths.length, selectedQuarters.length]);

  return (
    <KPIContext.Provider
      value={{
        marketingData,
        bdData,
        comprehensiveKPIData,
        isLoadingData,
        selectedMonths,
        selectedQuarters,
        selectedYear,
        setSelectedMonths,
        setSelectedQuarters,
        setSelectedYear,
        reload,
        currentQuarters,
        timeContext,
        comparisonPeriods,
        isQuarterView,
        getKPIComparisons,
        getTrendColor,
        formatPercentChange,
      }}
    >
      {children}
    </KPIContext.Provider>
  );
};

export const useKPI = () => {
  const ctx = useContext(KPIContext);
  if (!ctx) throw new Error('useKPI must be used within KPIProvider');
  return ctx;
};

export default KPIContext;

