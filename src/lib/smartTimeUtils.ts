/**
 * Smart Time and Comparison Utilities
 * Provides intelligent time-based comparisons for KPI dashboards
 * Current context: February 2026 (Q4 FY2026)
 */

import { FULL_MONTHS, getQuarterMonthMapForYear, getMonthQuarterMapForYear } from './quarterUtils';

/**
 * Current system date context: February 26, 2026
 */
export const CURRENT_DATE = new Date(2026, 1, 26); // February 26, 2026
export const CURRENT_MONTH = 'February';
export const CURRENT_QUARTER = 'Q4';
export const CURRENT_YEAR = 'FY2026';

/**
 * Get the current month/quarter context for smart filtering
 */
export const getCurrentTimeContext = () => ({
  month: CURRENT_MONTH,
  quarter: CURRENT_QUARTER,
  year: CURRENT_YEAR,
  date: CURRENT_DATE,
  monthIndex: FULL_MONTHS.indexOf(CURRENT_MONTH),
});

/**
 * Get previous month for MoM comparisons
 * Handles year boundary wrapping
 * @param month Full month name (e.g., 'February')
 * @param year Financial year (e.g., 'FY2026')
 * @returns Object with previous month and year
 */
export const getPreviousMonth = (month: string = CURRENT_MONTH, year: string = CURRENT_YEAR) => {
  const monthIndex = FULL_MONTHS.indexOf(month);
  if (monthIndex === -1) return null;

  if (monthIndex === 0) {
    // January -> December of previous fiscal year
    const prevYear = year === 'FY2026' ? 'FY2025' : 'FY2024';
    return { month: 'December', year: prevYear, monthIndex: 11 };
  }

  return { month: FULL_MONTHS[monthIndex - 1], year, monthIndex: monthIndex - 1 };
};

/**
 * Get next month for forward-looking comparisons
 * @param month Full month name
 * @param year Financial year
 * @returns Object with next month and year
 */
export const getNextMonth = (month: string = CURRENT_MONTH, year: string = CURRENT_YEAR) => {
  const monthIndex = FULL_MONTHS.indexOf(month);
  if (monthIndex === -1) return null;

  if (monthIndex === 11) {
    // December -> January of next fiscal year
    const nextYear = year === 'FY2025' ? 'FY2026' : 'FY2027';
    return { month: 'January', year: nextYear, monthIndex: 0 };
  }

  return { month: FULL_MONTHS[monthIndex + 1], year, monthIndex: monthIndex + 1 };
};

/**
 * Get same month from previous year (YoY comparison)
 * @param month Full month name
 * @param year Financial year
 * @returns Object with YoY month and year
 */
export const getYoYMonth = (month: string = CURRENT_MONTH, year: string = CURRENT_YEAR) => {
  const prevYear = year === 'FY2026' ? 'FY2025' : 'FY2024';
  return { month, year: prevYear, monthIndex: FULL_MONTHS.indexOf(month) };
};

/**
 * Analyze selected months to determine comparison mode
 * Returns metadata about the selection for smart display
 */
export interface TimeSelectionContext {
  type: 'single-month' | 'two-months' | 'quarter' | 'custom';
  selectedMonths: string[];
  isCurrent: boolean;
  comparisonMode: 'mom' | 'yoy' | 'quarterly' | 'none';
  label: string;
  momMonths?: { current: string; previous: string };
  yoyMonths?: { current: string; previous: string };
  quarterMonths?: string[];
}

/**
 * Analyze time selection and determine comparison strategy
 * @param selectedMonths Array of selected month names
 * @param year Financial year
 * @returns Analysis object with comparison mode and metadata
 */
export const analyzeTimeSelection = (selectedMonths: string[], year: string = CURRENT_YEAR): TimeSelectionContext => {
  const quarterMap = getQuarterMonthMapForYear(year);
  
  // Check if selection matches a complete quarter
  const matchingQuarters = Object.entries(quarterMap)
    .filter(([_, months]) => 
      months.length === selectedMonths.length && 
      months.every(m => selectedMonths.includes(m))
    )
    .map(([q]) => q);

  const isCurrent = selectedMonths.includes(CURRENT_MONTH);

  // Single month selected
  if (selectedMonths.length === 1) {
    const month = selectedMonths[0];
    const prevMonth = getPreviousMonth(month, year);
    const comparison = month === CURRENT_MONTH || prevMonth?.month === CURRENT_MONTH ? 'mom' : 'none';
    
    return {
      type: 'single-month',
      selectedMonths,
      isCurrent: month === CURRENT_MONTH,
      comparisonMode: comparison as 'mom' | 'yoy' | 'none',
      label: `${month} ${year}`,
      momMonths: prevMonth ? { current: month, previous: prevMonth.month } : undefined,
    };
  }

  // Two months selected
  if (selectedMonths.length === 2) {
    const sorted = [...selectedMonths].sort((a, b) => 
      FULL_MONTHS.indexOf(a) - FULL_MONTHS.indexOf(b)
    );
    const allConsecutive = FULL_MONTHS.indexOf(sorted[1]) === FULL_MONTHS.indexOf(sorted[0]) + 1;
    
    if (allConsecutive) {
      return {
        type: 'two-months',
        selectedMonths,
        isCurrent: selectedMonths.includes(CURRENT_MONTH),
        comparisonMode: 'mom',
        label: `${sorted[0]} - ${sorted[1]} ${year}`,
        momMonths: { current: sorted[1], previous: sorted[0] },
      };
    } else {
      return {
        type: 'custom',
        selectedMonths,
        isCurrent,
        comparisonMode: 'none',
        label: `${sorted[0]} & ${sorted[1]} ${year}`,
      };
    }
  }

  // Three months selected (full quarter)
  if (selectedMonths.length === 3 && matchingQuarters.length > 0) {
    const quarter = matchingQuarters[0];
    return {
      type: 'quarter',
      selectedMonths,
      isCurrent: isCurrent,
      comparisonMode: 'quarterly',
      label: `${quarter} ${year}`,
      quarterMonths: selectedMonths.sort((a, b) =>
        FULL_MONTHS.indexOf(a) - FULL_MONTHS.indexOf(b)
      ),
    };
  }

  // Custom selection
  return {
    type: 'custom',
    selectedMonths,
    isCurrent,
    comparisonMode: 'none',
    label: `${selectedMonths.length} months`,
  };
};

/**
 * Generate display text for current selection with comparison context
 * E.g., "February (vs January)" or "Q4 (current quarter)"
 */
export const getComparisonLabel = (context: TimeSelectionContext): string => {
  switch (context.comparisonMode) {
    case 'mom':
      if (context.momMonths) {
        const curr = context.momMonths.current;
        const prev = context.momMonths.previous;
        return `${curr} (vs ${prev})`;
      }
      return context.label;
    case 'yoy':
      if (context.yoyMonths) {
        return `${context.yoyMonths.current} (vs ${context.yoyMonths.previous} last year)`;
      }
      return context.label;
    case 'quarterly':
      const current = context.isCurrent ? ' (current)' : '';
      return `${context.label}${current}`;
    default:
      return context.label;
  }
};

/**
 * Get comparison period data based on selection
 * Useful for dashboard filtering logic
 */
export interface ComparisonPeriod {
  primary: { months: string[]; year: string; label: string };
  comparison?: { months: string[]; year: string; label: string; type: 'previous-month' | 'previous-year' | 'previous-quarter' };
}

export const getComparisonPeriods = (selectedMonths: string[], year: string = CURRENT_YEAR): ComparisonPeriod => {
  const context = analyzeTimeSelection(selectedMonths, year);

  const primary = {
    months: selectedMonths,
    year,
    label: context.label,
  };

  // Determine comparison period
  let comparison: ComparisonPeriod['comparison'] | undefined;

  if (context.comparisonMode === 'mom' && context.momMonths) {
    const prevMonth = getPreviousMonth(context.momMonths.previous, year);
    if (prevMonth) {
      comparison = {
        months: [prevMonth.month],
        year: prevMonth.year,
        label: `${prevMonth.month}`,
        type: 'previous-month',
      };
    }
  }

  if (context.type === 'quarter') {
    // For quarters, optionally compare to previous quarter
    const quarterMap = getQuarterMonthMapForYear(year);
    const quarters = Object.keys(quarterMap);
    const currentIndex = quarters.indexOf(context.label.split(' ')[0]);
    const prevIndex = (currentIndex - 1 + quarters.length) % quarters.length;
    const prevQuarter = quarters[prevIndex];

    comparison = {
      months: quarterMap[prevQuarter],
      year: prevIndex === 0 && context.label.includes('Q1') ? 
        (year === 'FY2026' ? 'FY2025' : 'FY2024') : year,
      label: prevQuarter,
      type: 'previous-quarter',
    };
  }

  return { primary, comparison };
};

/**
 * Check if selection is a complete quarter
 */
export const isCompleteQuarter = (selectedMonths: string[], year: string = CURRENT_YEAR): boolean => {
  const quarterMap = getQuarterMonthMapForYear(year);
  return Object.values(quarterMap).some(months =>
    months.length === selectedMonths.length && 
    months.every(m => selectedMonths.includes(m))
  );
};

/**
 * Get human-readable metric description based on selection type
 */
export const getMetricDescription = (context: TimeSelectionContext): {
  current: string;
  comparison?: string;
} => {
  const current = context.label;

  switch (context.comparisonMode) {
    case 'mom':
      return {
        current: `${current} (Current)`,
        comparison: context.momMonths ? `${context.momMonths.previous} (Previous)` : undefined,
      };
    case 'quarterly':
      return {
        current: `${current} (Current Quarter)`,
        comparison: 'Previous Quarter', // Can be derived separately
      };
    default:
      return { current };
  }
};

/**
 * Generate comparison percentage change text
 * e.g., "+15% vs Jan" or "↓ 8% from Q3"
 */
export const formatComparisonChange = (current: number, previous: number, type: 'mom' | 'yoy' | 'quarterly' = 'mom'): string => {
  if (!previous) return 'N/A';
  
  const change = ((current - previous) / previous) * 100;
  const symbol = change >= 0 ? '↑' : '↓';
  const abs = Math.abs(change).toFixed(1);
  
  return `${symbol} ${abs}%`;
};

/**
 * Check if we're currently in the month/quarter being displayed
 */
export const isCurrentPeriod = (selectedMonths: string[]): boolean => {
  return selectedMonths.includes(CURRENT_MONTH);
};
