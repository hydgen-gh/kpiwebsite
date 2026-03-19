import { useEffect, useState } from 'react';
import { useTimeFilter } from '../useTimeFilter';
import { supabase } from '../supabase';

export interface KPIValue {
  id: string;
  kpi_code: string;
  department: string;
  sub_department?: string;
  month: string;
  year: number;
  value: number;
  target?: number;
  created_at: string;
}

export interface KPIData {
  value: number | null;
  target: number | null;
  month?: string;
  previousValue?: number | null;
  momChange?: number | null; // Month-over-month percentage change
}

/**
 * Hook to fetch a single KPI based on navbar time filter
 * 
 * Usage:
 * const { value, target, loading, error } = useKPI('FIN_CASH_BALANCE');
 * 
 * Automatically adjusts query based on selected period:
 * - Month view: Returns single month data
 * - Quarter view: Returns aggregated quarter data (sum values, avg targets)
 * - FY view: Returns aggregated full year data
 */
export function useKPI(kpiCode: string) {
  const { year, month, monthsToQuery, isMonthView, isQuarterView, isFYView } = useTimeFilter();
  const [data, setData] = useState<KPIData>({ value: null, target: null });
  const [rawData, setRawData] = useState<KPIValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kpiCode) return;

    const fetchKPI = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isMonthView && month) {
          // Single month query
          const { data, error: err } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', year)
            .eq('month', month)
            .limit(1);

          if (err) throw err;

          const record = data?.[0];
          if (record) {
            setRawData([record]);
            setData({
              value: record.value ?? null,
              target: record.target ?? null,
              month: record.month,
            });
          } else {
            setData({ value: null, target: null, month });
            setRawData([]);
          }
        } else if (isQuarterView && monthsToQuery.length > 0) {
          // Quarter query - aggregate months
          const { data, error: err } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', year)
            .in('month', monthsToQuery);

          if (err) throw err;

          setRawData(data || []);

          if (data && data.length > 0) {
            // Sum values, average targets
            const totalValue = data.reduce((sum: number, d: any) => sum + (d.value ?? 0), 0);
            const avgTarget = data.length > 0
              ? data.reduce((sum: number, d: any) => sum + (d.target ?? 0), 0) / data.length
              : null;

            setData({
              value: totalValue,
              target: avgTarget,
            });
          } else {
            setData({ value: null, target: null });
          }
        } else if (isFYView) {
          // Full year aggregate
          const { data, error: err } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', year);

          if (err) throw err;

          setRawData(data || []);

          if (data && data.length > 0) {
            // Sum values, average targets
            const totalValue = data.reduce((sum: number, d: any) => sum + (d.value ?? 0), 0);
            const avgTarget = data.length > 0
              ? data.reduce((sum: number, d: any) => sum + (d.target ?? 0), 0) / data.length
              : null;

            setData({
              value: totalValue,
              target: avgTarget,
            });
          } else {
            setData({ value: null, target: null });
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch KPI data';
        setError(errorMsg);
        console.error(`Error fetching KPI ${kpiCode}:`, err);
        setData({ value: null, target: null });
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, [kpiCode, year, month, monthsToQuery.join(','), isMonthView, isQuarterView, isFYView]);

  return {
    ...data,
    rawData,
    loading,
    error,
    kpiCode,
  };
}

/**
 * Hook to fetch KPI time series (for charts)
 * Returns monthly data for the selected period
 * 
 * Usage:
 * const { data, loading } = useKPITimeSeries('FIN_CASH_BALANCE');
 * data = [{ month: 'Jan', value: 1000 }, { month: 'Feb', value: 1100 }, ...]
 */
export function useKPITimeSeries(kpiCode: string) {
  const { year, monthsToQuery, isMonthView, isFYView } = useTimeFilter();
  const [data, setData] = useState<Array<{ month: string; value: number; target?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kpiCode) return;

    const fetchTimeSeries = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isMonthView) {
          // Single month - no series needed, but return it anyway
          const { data, error: err } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', year)
            .order('month', { ascending: true });

          if (err) throw err;

          const series = (data || []).map((d: any) => ({
            month: d.month,
            value: d.value ?? 0,
            target: d.target,
          }));

          setData(series);
        } else {
          // Quarter or FY view - return all months
          const { data, error: err } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', year)
            .order('month', { ascending: true });

          if (err) throw err;

          // Filter by selected months if in quarter mode
          let filtered = data || [];
          if (monthsToQuery.length > 0) {
            filtered = filtered.filter((d: any) => monthsToQuery.includes(d.month));
          }

          const series = filtered.map((d: any) => ({
            month: d.month,
            value: d.value ?? 0,
            target: d.target,
          }));

          setData(series);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch KPI time series';
        setError(errorMsg);
        console.error(`Error fetching KPI time series ${kpiCode}:`, err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSeries();
  }, [kpiCode, year, monthsToQuery.join(','), isMonthView, isFYView]);

  return {
    data,
    loading,
    error,
  };
}

/**
 * Hook to fetch and compare KPI data with previous period
 */
export function useKPIWithComparison(kpiCode: string) {
  const { year, month, isMonthView } = useTimeFilter();
  const [current, setCurrent] = useState<KPIData>({ value: null, target: null });
  const [previous, setPrevious] = useState<KPIData>({ value: null, target: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kpiCode) return;

    const fetchWithComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isMonthView && month) {
          // Fetch current month
          const { data: currentData, error: err1 } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', year)
            .eq('month', month)
            .limit(1);

          if (err1) throw err1;

          const currentRecord = currentData?.[0];
          if (currentRecord) {
            setCurrent({
              value: currentRecord.value ?? null,
              target: currentRecord.target ?? null,
            });
          }

          // Fetch previous month (simple approach - just subtract 1 month)
          // For production, implement proper month math
          const monthIndex = currentRecord?.month ? getMonthNumber(currentRecord.month) : 0;
          const prevMonthIndex = monthIndex === 1 ? 12 : monthIndex - 1;
          const prevMonthName = getMonthName(prevMonthIndex);
          const prevYear = monthIndex === 1 ? year - 1 : year;

          const { data: previousData, error: err2 } = await supabase
            .from('kpi_values')
            .select('*')
            .eq('kpi_code', kpiCode)
            .eq('year', prevYear)
            .eq('month', prevMonthName)
            .limit(1);

          if (err2) throw err2;

          const previousRecord = previousData?.[0];
          if (previousRecord) {
            setPrevious({
              value: previousRecord.value ?? null,
              target: previousRecord.target ?? null,
            });
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch comparison data';
        setError(errorMsg);
        console.error(`Error fetching KPI comparison ${kpiCode}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithComparison();
  }, [kpiCode, year, month, isMonthView]);

  return {
    current,
    previous,
    loading,
    error,
  };
}

// Utility functions
function getMonthNumber(monthName: string): number {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months.indexOf(monthName) + 1;
}

function getMonthName(monthNumber: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNumber - 1] || 'January';
}
