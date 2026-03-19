import { useKPI } from '@/app/kpi/KPIContext';
import { QUARTER_MONTH_MAP } from './quarterUtils';

/**
 * Hook to access the navbar time filter as a unified interface
 * The navbar filter is the single source of truth for selected period
 * 
 * Returns:
 * - year: Calendar year (number)
 * - quarter: Quarter string (Q1, Q2, Q3, Q4) or null if not in quarter view
 * - month: Month name (string) or null if in quarter/FY view
 * - isQuarterView: true if quarters are selected
 * - isMonthView: true if single month is selected
 * - isFYView: true if full year is selected (all quarters)
 * - monthNames: Array of selected month names
 * - quarterNames: Array of selected quarter names
 */
export function useTimeFilter() {
  const { selectedMonths, selectedQuarters, selectedYear } = useKPI();

  // Extract year number from FY string (e.g., 'FY2026' -> 2026)
  const year = parseInt(selectedYear.replace('FY', '')) || new Date().getFullYear();

  // Determine view type and extract primary filter
  const isMonthView = selectedMonths.length > 0 && selectedQuarters.length === 0;
  const isQuarterView = selectedQuarters.length > 0;
  const isFYView = selectedMonths.length === 0 && selectedQuarters.length === 0;

  // Primary month (first selected if in month view)
  const month = isMonthView ? selectedMonths[0] || null : null;

  // Primary quarter (first selected if in quarter view)
  const quarter = isQuarterView ? selectedQuarters[0] || null : null;

  // For convenience: convert selected quarters to month names
  const monthsForSelectedQuarters: string[] = [];
  selectedQuarters.forEach(q => {
    const quarterMonths = QUARTER_MONTH_MAP[q];
    if (quarterMonths) {
      monthsForSelectedQuarters.push(...quarterMonths);
    }
  });

  return {
    year,
    month, // null unless in single month view
    quarter, // null unless in quarter view
    isMonthView,
    isQuarterView,
    isFYView,
    monthNames: selectedMonths,
    quarterNames: selectedQuarters,
    // For queries: all months to fetch
    monthsToQuery: isMonthView ? selectedMonths : isQuarterView ? monthsForSelectedQuarters : [],
  };
}
