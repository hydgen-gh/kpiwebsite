import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

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
  selectedMonths: string[];
  setSelectedMonths: (m: string[]) => void;
  reload: () => Promise<void>;
}

const KPIContext = createContext<KPIContextValue | undefined>(undefined);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = {
  'Q4': ['Jan', 'Feb', 'Mar'],
  'Q1': ['Apr', 'May', 'Jun'],
  'Q2': ['Jul', 'Aug', 'Sep'],
  'Q3': ['Oct', 'Nov', 'Dec'],
};

export const getQuarterFromMonths = (selectedMonths: string[]): string | null => {
  if (selectedMonths.length === 0) return null;
  
  for (const [quarter, months] of Object.entries(QUARTERS)) {
    const match = months.every(m => selectedMonths.includes(m));
    if (match) return quarter;
  }
  return null;
};

export const KPIProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [marketingData, setMarketingData] = useState<MarketingKPI[]>([]);
  const [bdData, setBdData] = useState<BDKpi[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

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

  // Default to Q4 months if nothing selected
  useEffect(() => {
    if (selectedMonths.length === 0) {
      setSelectedMonths(['Jan', 'Feb', 'Mar']);
    }
  }, [selectedMonths.length]);

  return (
    <KPIContext.Provider value={{ marketingData, bdData, selectedMonths, setSelectedMonths, reload }}>
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

