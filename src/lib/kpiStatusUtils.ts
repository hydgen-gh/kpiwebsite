/**
 * KPI Status Calculation Utilities
 * Provides consistent status determination logic across the dashboard
 */

export type KPIStatus = 'on-track' | 'at-risk' | 'behind';

/**
 * Calculate KPI status based on actual vs monthly target
 * @param actual - Current actual value
 * @param quarterlyTarget - Quarterly target value
 * @returns Status: 'on-track' | 'at-risk' | 'behind'
 */
export function calculateKPIStatus(actual: number, quarterlyTarget: number): KPIStatus {
  const monthlyTarget = quarterlyTarget / 3;
  
  if (actual >= monthlyTarget) {
    return 'on-track';
  } else if (actual >= monthlyTarget * 0.5) {
    return 'at-risk';
  } else {
    return 'behind';
  }
}

/**
 * Get status display properties
 */
export function getStatusDisplay(status: KPIStatus) {
  const displayMap = {
    'on-track': {
      label: 'On Track',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-700',
      indicatorColor: '#10b981',
    },
    'at-risk': {
      label: 'At Risk',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      indicatorColor: '#f59e0b',
    },
    'behind': {
      label: 'Behind',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-100 text-red-700',
      indicatorColor: '#ef4444',
    },
  };
  
  return displayMap[status];
}

/**
 * Calculate monthly target from quarterly target
 */
export function getMonthlyTarget(quarterlyTarget: number): number {
  return quarterlyTarget / 3;
}

/**
 * Calculate achievement percentage
 */
export function calculateAchievement(actual: number, target: number): number {
  if (target === 0) return 0;
  return (actual / target) * 100;
}

/**
 * Format number with appropriate suffix (K, M, etc.)
 */
export function formatMetric(value: number, decimals: number = 1): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(decimals)}k`;
  }
  return `$${value.toFixed(decimals)}`;
}
