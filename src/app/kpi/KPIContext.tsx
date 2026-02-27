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

interface KPIContextValue {
  marketingData: MarketingKPI[];
  bdData: BDKpi[];
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
  // Default to current month (February) for smart analytics
  const [selectedMonths, setSelectedMonths] = useState<string[]>([CURRENT_MONTH]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('FY2026');

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

