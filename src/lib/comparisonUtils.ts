/**
 * Comparison utilities for Q3 vs Q4 analysis
 */

export interface ComparisonResult {
  actual: number;
  target: number;
  achievement: number; // percentage
  q3Actual: number;
  q3Target: number;
  q3Achievement: number;
  growth: number; // percentage growth from Q3 to Q4
  difference: number; // absolute difference
  trend: 'up' | 'down' | 'neutral';
  status: 'on-track' | 'at-risk' | 'off-track';
}

/**
 * Calculate comparison metrics between Q3 and Q4
 * @param q4Actual Current Q4 actual value
 * @param q4Target Current Q4 target value
 * @param q3Actual Q3 actual baseline
 * @param q3Target Q3 target baseline
 * @returns Comparison result with growth metrics
 */
export const compareQuarters = (
  q4Actual: number,
  q4Target: number,
  q3Actual: number,
  q3Target: number
): ComparisonResult => {
  // Basic values
  const q4Achievement = q4Target > 0 ? (q4Actual / q4Target) * 100 : 0;
  const q3Achievement = q3Target > 0 ? (q3Actual / q3Target) * 100 : 0;

  // Calculate growth
  const growth = q3Actual > 0 ? ((q4Actual - q3Actual) / q3Actual) * 100 : 0;
  const difference = q4Actual - q3Actual;

  // Determine trend
  const trend: 'up' | 'down' | 'neutral' =
    growth > 5 ? 'up' : growth < -5 ? 'down' : 'neutral';

  // Determine status (on-track: 80-120%, at-risk: 60-80%, off-track: <60%)
  let status: 'on-track' | 'at-risk' | 'off-track';
  if (q4Achievement >= 80 && q4Achievement <= 120) {
    status = 'on-track';
  } else if (q4Achievement >= 60 && q4Achievement < 80) {
    status = 'at-risk';
  } else {
    status = 'off-track';
  }

  return {
    actual: q4Actual,
    target: q4Target,
    achievement: q4Achievement,
    q3Actual,
    q3Target,
    q3Achievement,
    growth,
    difference,
    trend,
    status,
  };
};

/**
 * Get status color for UI rendering
 */
export const getStatusColor = (status: 'on-track' | 'at-risk' | 'off-track'): string => {
  switch (status) {
    case 'on-track':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'at-risk':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'off-track':
      return 'bg-red-50 border-red-200 text-red-900';
  }
};

/**
 * Get status badge color for icons
 */
export const getStatusBadgeColor = (status: 'on-track' | 'at-risk' | 'off-track'): string => {
  switch (status) {
    case 'on-track':
      return 'text-green-600';
    case 'at-risk':
      return 'text-yellow-600';
    case 'off-track':
      return 'text-red-600';
  }
};

/**
 * Format growth percentage for display
 */
export const formatGrowth = (growth: number): string => {
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};
