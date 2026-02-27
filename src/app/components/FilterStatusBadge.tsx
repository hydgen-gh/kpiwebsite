import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';

interface FilterStatusBadgeProps {
  variant?: 'inline' | 'card' | 'pill';
  showIcon?: boolean;
}

/**
 * Filter Status Badge Component
 * Display current filter mode (quarters, custom months, or full year)
 * 
 * Usage:
 * <FilterStatusBadge variant="inline" />
 * <FilterStatusBadge variant="card" showIcon />
 */
export function FilterStatusBadge({
  variant = 'inline',
  showIcon = true,
}: FilterStatusBadgeProps) {
  const { isCustomMode, isFullYear, getMonthDisplay, selectedMonths } = useDashboardFilter();

  if (!getMonthDisplay) return null;

  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
        {showIcon && <Calendar className="w-3 h-3" />}
        {getMonthDisplay}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              {isCustomMode ? (
                <Clock className="w-5 h-5 text-blue-600" />
              ) : (
                <Calendar className="w-5 h-5 text-blue-600" />
              )}
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-600 mb-1">Current Filter</p>
            <p className="text-sm font-bold text-blue-900">{getMonthDisplay}</p>
            {isCustomMode && (
              <p className="text-xs text-blue-700 mt-1">Custom selection: {selectedMonths.length} months</p>
            )}
            {isFullYear && (
              <p className="text-xs text-blue-700 mt-1">All 12 months of FY 2025</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: inline
  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
      {showIcon && <Calendar className="w-3.5 h-3.5" />}
      {getMonthDisplay}
    </div>
  );
}

/**
 * Filter Info Alert Component
 * Shows helpful info about the current filter selection
 */
export function FilterInfoAlert() {
  const { isCustomMode, isFullYear, selectedMonths } = useDashboardFilter();

  if (!selectedMonths.length) return null;

  return (
    <div className="flex items-start gap-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
      <AlertCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-cyan-700">
        {isCustomMode && (
          <>
            <p className="font-medium mb-1">📅 Custom Period Selected</p>
            <p>You've selected {selectedMonths.length} specific months. Dashboards will show data only for these months.</p>
          </>
        )}
        {isFullYear && (
          <>
            <p className="font-medium mb-1">📅 Full Year View</p>
            <p>All 12 months of FY 2025 are included. Viewing data across the entire financial year.</p>
          </>
        )}
      </div>
    </div>
  );
}
