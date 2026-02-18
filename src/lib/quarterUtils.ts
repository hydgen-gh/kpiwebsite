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

// Quarter to Full Month Mapping (FY 2025)
export const QUARTER_MONTH_MAP: Record<string, string[]> = {
  Q4: ['January', 'February', 'March'],     // Q4 2024 -> Jan, Feb, Mar 2025
  Q1: ['April', 'May', 'June'],             // Q1 -> Apr, May, Jun
  Q2: ['July', 'August', 'September'],      // Q2 -> Jul, Aug, Sep
  Q3: ['October', 'November', 'December'],  // Q3 -> Oct, Nov, Dec
};

// Reverse mapping: Month to Quarter
export const MONTH_QUARTER_MAP: Record<string, string> = {};
Object.entries(QUARTER_MONTH_MAP).forEach(([quarter, months]) => {
  months.forEach((month) => {
    MONTH_QUARTER_MAP[month] = quarter;
  });
});

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
 * Get display string for financial year
 * @returns 'FY 2025'
 */
export const getCurrentFinancialYear = (): string => {
  return 'FY 2025';
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
 * Get all possible quarters
 */
export const getAllQuarters = (): string[] => {
  return ['Q4', 'Q1', 'Q2', 'Q3'];
};
