import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
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
    try {
      const [mktRes, bdRes] = await Promise.all([
        supabase.from('marketing_dashboard').select('*'),
        supabase.from('bd_dashboard').select('*'),
      ]);

      if (mktRes.error) console.error('Marketing fetch error:', mktRes.error);
      if (bdRes.error) console.error('BD fetch error:', bdRes.error);

      setMarketingData((mktRes.data || []) as MarketingKPI[]);
      setBdData((bdRes.data || []) as BDKpi[]);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

