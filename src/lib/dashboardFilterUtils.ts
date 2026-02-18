/**
 * Dashboard filtering utilities
 * Provide reusable hooks and utilities for filtering data based on selected months/quarters
 */

import { useMemo } from 'react';
import { useKPI } from '../app/kpi/KPIContext';
import { MONTH_QUARTER_MAP } from './quarterUtils';

export interface FilteredMonthData {
  selectedMonths: string[];
  selectedQuarters: string[];
  monthFilter: (dataMonth: string) => boolean;
  quarterFilter: (dataQuarter: string) => boolean;
  getMonthDisplay: string;
}

/**
 * Hook for dashboard filtering
 * Returns utility functions to filter data based on selectedMonths and selectedQuarters
 */
export const useDashboardFilter = (): FilteredMonthData => {
  const { selectedMonths, selectedQuarters } = useKPI();

  return useMemo(() => {
    const monthFilter = (dataMonth: string): boolean => {
      if (selectedMonths.length === 0) return false;
      return selectedMonths.some(
        m => m.toLowerCase() === dataMonth.toLowerCase()
      );
    };

    const quarterFilter = (dataQuarter: string): boolean => {
      if (selectedQuarters.length === 0) return false;
      return selectedQuarters.some(
        q => q.toLowerCase() === dataQuarter.toLowerCase()
      );
    };

    const getMonthDisplay =
      selectedQuarters.length === 4
        ? 'Full Year (FY 2025)'
        : selectedQuarters.length === 1
        ? selectedQuarters[0]
        : `${selectedQuarters.join(', ')}`;

    return {
      selectedMonths,
      selectedQuarters,
      monthFilter,
      quarterFilter,
      getMonthDisplay,
    };
  }, [selectedMonths, selectedQuarters]);
};

/**
 * Convert month value based on quarter filtering
 * Helps normalize different month formats (Jan vs January, etc.)
 */
export const getMonthQuarter = (monthString: string): string | null => {
  return MONTH_QUARTER_MAP[monthString] || null;
};
