/**
 * Dashboard filtering utilities
 * Provide reusable hooks and utilities for filtering data based on selected months/quarters
 */

import { useMemo } from 'react';
import { useKPI } from '../app/kpi/KPIContext';
import { MONTH_QUARTER_MAP } from './quarterUtils';
import { getComparisonLabel, isCurrentPeriod, CURRENT_MONTH } from './smartTimeUtils';

export interface FilteredMonthData {
  selectedMonths: string[];
  selectedQuarters: string[];
  selectedYear: string;
  isCustomMode: boolean; // true if user selected individual months (not full quarters)
  isFullYear: boolean; // true if all 12 months selected
  monthFilter: (dataMonth: string) => boolean;
  quarterFilter: (dataQuarter: string) => boolean;
  getMonthDisplay: string;
}

/**
 * Hook for dashboard filtering
 * Returns utility functions to filter data based on selectedMonths and selectedQuarters
 * 
 * isCustomMode = true when user picks individual months
 * isCustomMode = false when user picks quarters
 */
export const useDashboardFilter = (): FilteredMonthData => {
  const { selectedMonths, selectedQuarters, selectedYear, timeContext } = useKPI();

  return useMemo(() => {
    // Custom mode = months selected but no quarters (user clicked on individual months)
    const isCustomMode = selectedMonths.length > 0 && selectedQuarters.length === 0;
    
    // Full year = all 12 months selected
    const isFullYear = selectedMonths.length === 12;

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

    let displayText = '';
    // Use smart comparison label if current month is selected
    if (isCurrentPeriod(selectedMonths)) {
      displayText = getComparisonLabel(timeContext);
    } else if (isFullYear) {
      displayText = `Full Year (${selectedYear})`;
    } else if (isCustomMode) {
      displayText = `${selectedMonths.length} month${selectedMonths.length !== 1 ? 's' : ''} (Custom)`;
    } else if (selectedQuarters.length > 0) {
      displayText = `${selectedQuarters.join(', ')} (${selectedYear})`;
    }

    return {
      selectedMonths,
      selectedQuarters,
      selectedYear,
      isCustomMode,
      isFullYear,
      monthFilter,
      quarterFilter,
      getMonthDisplay: displayText,
    };
  }, [selectedMonths, selectedQuarters, selectedYear, timeContext]);
};

/**
 * Convert month value based on quarter filtering
 * Helps normalize different month formats (Jan vs January, etc.)
 */
export const getMonthQuarter = (monthString: string): string | null => {
  return MONTH_QUARTER_MAP[monthString] || null;
};

/**
 * Format display for selected months
 * Shows short names: "Jan, Feb, Mar"
 */
export const formatSelectedMonths = (months: string[]): string => {
  if (months.length === 0) return 'No months';
  if (months.length === 1) return months[0].substring(0, 3);
  if (months.length === 12) return 'Full Year';
  // Show first 3 months, then "..."
  return months.slice(0, 3).map(m => m.substring(0, 3)).join(', ') + (months.length > 3 ? '...' : '');
};
