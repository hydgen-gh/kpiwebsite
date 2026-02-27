/**
 * Quarter and Month utility functions
 * Maps quarters to full month names for FY 2025 (12.25 format)
 */

// Full month names consistent throughout the app
export const FULL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Short month names for display
export const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Quarter to Full Month Mapping by Financial Year
export const QUARTER_MONTH_MAP_BY_YEAR: Record<string, Record<string, string[]>> = {
  'FY2025': {
    Q4: ['January', 'February', 'March'],     // Q4 2024 -> Jan, Feb, Mar 2025
  },
  'FY2026': {
    Q1: ['April', 'May', 'June'],             // Q1 -> Apr, May, Jun
    Q2: ['July', 'August', 'September'],      // Q2 -> Jul, Aug, Sep
    Q3: ['October', 'November', 'December'],  // Q3 -> Oct, Nov, Dec
    Q4: ['January', 'February', 'March'],     // Q4 -> Jan, Feb, Mar 2026
  },
};

// Default mapping for backward compatibility (FY2026)
export const QUARTER_MONTH_MAP: Record<string, string[]> = QUARTER_MONTH_MAP_BY_YEAR['FY2026'];

// Get quarter-month mapping for a specific year
export const getQuarterMonthMapForYear = (year: string): Record<string, string[]> => {
  return QUARTER_MONTH_MAP_BY_YEAR[year] || QUARTER_MONTH_MAP_BY_YEAR['FY2026'];
};

// Reverse mapping: Month to Quarter
export const MONTH_QUARTER_MAP: Record<string, string> = {};
Object.entries(QUARTER_MONTH_MAP).forEach(([quarter, months]) => {
  months.forEach((month) => {
    MONTH_QUARTER_MAP[month] = quarter;
  });
});

// Get month-quarter mapping for a specific year
export const getMonthQuarterMapForYear = (year: string): Record<string, string> => {
  const mapping: Record<string, string> = {};
  const quarterMonths = getQuarterMonthMapForYear(year);
  Object.entries(quarterMonths).forEach(([quarter, months]) => {
    months.forEach((month) => {
      mapping[month] = quarter;
    });
  });
  return mapping;
};

/**
 * Get quarters for a set of selected months
 * @param selectedMonths Array of full month names
 * @returns Array of quarters that match the selected months
 */
export const getQuartersFromMonths = (selectedMonths: string[]): string[] => {
  const quarters = new Set<string>();
  selectedMonths.forEach((month) => {
    const quarter = MONTH_QUARTER_MAP[month];
    if (quarter) {
      quarters.add(quarter);
    }
  });
  return Array.from(quarters).sort((a, b) => {
    const order = { Q4: 0, Q1: 1, Q2: 2, Q3: 3 };
    return (order[a as keyof typeof order] || 999) - (order[b as keyof typeof order] || 999);
  });
};

/**
 * Get months for a set of quarters
 * @param quarters Array of quarter names (Q1, Q2, Q3, Q4)
 * @returns Union of all months in selected quarters
 */
export const getMonthsFromQuarters = (quarters: string[]): string[] => {
  const months = new Set<string>();
  quarters.forEach((quarter) => {
    const monthList = QUARTER_MONTH_MAP[quarter];
    if (monthList) {
      monthList.forEach((month) => months.add(month));
    }
  });
  return Array.from(months);
};

/**
 * Get available financial years
 * @returns Array of available years
 */
export const getAvailableFinancialYears = (): string[] => {
  return ['FY2025', 'FY2026'];
};

/**
 * Get available quarters for a specific year
 * @param year The financial year (e.g., 'FY2025')
 * @returns Array of available quarters for that year
 */
export const getAvailableQuartersForYear = (year: string): string[] => {
  const mapping = getQuarterMonthMapForYear(year);
  return Object.keys(mapping).sort((a, b) => {
    const order: Record<string, number> = { Q4: 0, Q1: 1, Q2: 2, Q3: 3 };
    return (order[a] || 999) - (order[b] || 999);
  });
};

/**
 * Get display string for financial year
 * @returns 'FY2026' (default current year)
 */
export const getCurrentFinancialYear = (): string => {
  return 'FY2026';
};

/**
 * Check if selected months match a complete quarter
 * @param selectedMonths Array of full month names
 * @param quarter Quarter to check against
 * @returns true if all months of the quarter are selected
 */
export const isQuarterSelected = (selectedMonths: string[], quarter: string): boolean => {
  const quarterMonths = QUARTER_MONTH_MAP[quarter];
  if (!quarterMonths) return false;
  return quarterMonths.every((month) => selectedMonths.includes(month));
};

/**
 * Convert full month name to short month name
 */
export const getShortMonth = (fullMonth: string): string => {
  const index = FULL_MONTHS.indexOf(fullMonth);
  return index >= 0 ? SHORT_MONTHS[index] : fullMonth;
};

/**
 * Convert short month name to full month name
 */
export const getFullMonth = (shortMonth: string): string => {
  const index = SHORT_MONTHS.indexOf(shortMonth);
  return index >= 0 ? FULL_MONTHS[index] : shortMonth;
};

/**
 * Get all possible quarters for current year (FY2026)
 * @deprecated Use getAvailableQuartersForYear instead
 */
export const getAllQuarters = (): string[] => {
  return getAvailableQuartersForYear('FY2026');
};
