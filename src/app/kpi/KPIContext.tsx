import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FULL_MONTHS, QUARTER_MONTH_MAP, getQuartersFromMonths } from '../../lib/quarterUtils';

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
  setSelectedMonths: (m: string[]) => void;
  setSelectedQuarters: (q: string[]) => void;
  reload: () => Promise<void>;
  currentQuarters: string[];
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
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);

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

  // Sync quarters with months - when quarters change, update months
  useEffect(() => {
    if (selectedQuarters.length > 0) {
      const monthsFromQuarters: string[] = [];
      selectedQuarters.forEach((quarter) => {
        const months = QUARTER_MONTH_MAP[quarter];
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
  }, [selectedQuarters]);

  // Default to Q4 months if nothing selected
  useEffect(() => {
    if (selectedMonths.length === 0 && selectedQuarters.length === 0) {
      setSelectedQuarters(['Q4']);
    }
  }, [selectedMonths.length, selectedQuarters.length]);

  return (
    <KPIContext.Provider
      value={{
        marketingData,
        bdData,
        selectedMonths,
        selectedQuarters,
        setSelectedMonths,
        setSelectedQuarters,
        reload,
        currentQuarters,
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

