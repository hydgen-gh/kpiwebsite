import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ComparisonResult, getStatusBadgeColor, formatGrowth as formatGrowthUtil } from '../../../lib/comparisonUtils';

interface KPICardProps {
  title: string;
  actual: number;
  target: number;
  achievement: number; // percentage
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: 'up' | 'down' | 'neutral';
  growth?: number; // percentage growth from Q3 to Q4
  difference?: number; // absolute difference
  unit?: string;
}

/**
 * Reusable KPI Card Component
 * Display: KPI Name, Actual, Target, % Achievement, Status
 */
export function KPICard({
  title,
  actual,
  target,
  achievement,
  status,
  trend,
  growth,
  difference,
  unit = '',
}: KPICardProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'on-track':
        return {
          label: 'On Track',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-700',
          icon: CheckCircle2,
        };
      case 'at-risk':
        return {
          label: 'At Risk',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-700',
          icon: AlertTriangle,
        };
      case 'off-track':
        return {
          label: 'Off Track',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-700',
          icon: AlertTriangle,
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${num.toFixed(0)}${unit}`;
  };

  return (
    <div
      className={`rounded-xl border p-5 ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.badgeColor}`}>
          {statusDisplay.label}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Actual */}
        <div className="bg-white/60 rounded-lg p-3">
          <p className="text-xs text-slate-600 font-medium mb-1">Actual</p>
          <p className="text-lg font-bold text-slate-900">
            {formatNumber(actual)}
          </p>
        </div>

        {/* Target */}
        <div className="bg-white/60 rounded-lg p-3">
          <p className="text-xs text-slate-600 font-medium mb-1">Target</p>
          <p className="text-lg font-bold text-slate-900">
            {formatNumber(target)}
          </p>
        </div>
      </div>

      {/* Achievement Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700">Achievement</span>
          <span className={`text-sm font-bold ${statusDisplay.textColor}`}>
            {achievement.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'on-track'
                ? 'bg-green-500'
                : status === 'at-risk'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>

      {/* Growth & Trend (if provided) */}
      {growth !== undefined && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50">
          <div className="flex-1">
            <p className="text-xs text-slate-600 font-medium mb-1">Growth vs Q3</p>
            <p
              className={`text-sm font-bold ${
                trend === 'up'
                  ? 'text-green-600'
                  : trend === 'down'
                  ? 'text-red-600'
                  : 'text-slate-600'
              }`}
            >
              {formatGrowthUtil(growth)}
            </p>
          </div>
          <div className={`${getStatusBadgeColor(status)} mt-4`}>
            {trend === 'up' && <TrendingUp className="w-5 h-5" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
      )}
    </div>
  );
}

interface KPIComparisonCardProps {
  title: string;
  comparison: ComparisonResult;
  unit?: string;
}

/**
 * KPI Comparison Card - Shows Q3 vs Q4 comparison
 */
export function KPIComparisonCard({
  title,
  comparison,
  unit = '',
}: KPIComparisonCardProps) {
  const getStatusDisplay = () => {
    switch (comparison.status) {
      case 'on-track':
        return {
          label: 'On Track',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
        };
      case 'at-risk':
        return {
          label: 'At Risk',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
        };
      case 'off-track':
        return {
          label: 'Off Track',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
        };
      default:
        return {
          label: 'On Track',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${num.toFixed(0)}${unit}`;
  };

  return (
    <div className={`rounded-xl border p-5 ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 flex-1">{title}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.textColor} bg-white/70`}>
          {statusDisplay.label}
        </div>
      </div>

      {/* Q4 Metrics */}
      <div className="mb-4 pb-4 border-b border-slate-200/50">
        <p className="text-xs text-slate-600 font-semibold mb-2">Q4 (Current)</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-slate-600 mb-1">Actual</p>
            <p className="text-base font-bold">{formatNumber(comparison.actual)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Target</p>
            <p className="text-base font-bold">{formatNumber(comparison.target)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Achievement</span>
          <span className="text-sm font-bold">{comparison.achievement.toFixed(1)}%</span>
        </div>
      </div>

      {/* Q3 Comparison */}
      <div className="mb-4 pb-4 border-b border-slate-200/50">
        <p className="text-xs text-slate-600 font-semibold mb-2">Q3 (Baseline)</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-slate-600 mb-1">Actual</p>
            <p className="text-base font-bold">{formatNumber(comparison.q3Actual)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Target</p>
            <p className="text-base font-bold">{formatNumber(comparison.q3Target)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Achievement</span>
          <span className="text-sm font-bold">{comparison.q3Achievement.toFixed(1)}%</span>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 rounded-lg p-3">
          <p className="text-xs text-slate-600 font-medium mb-1">Growth %</p>
          <p
            className={`text-lg font-bold ${
              comparison.trend === 'up'
                ? 'text-green-600'
                : comparison.trend === 'down'
                ? 'text-red-600'
                : 'text-slate-600'
            }`}
          >
            {formatGrowth(comparison.growth)}
          </p>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <p className="text-xs text-slate-600 font-medium mb-1">Difference</p>
          <p
            className={`text-lg font-bold ${
              comparison.trend === 'up'
                ? 'text-green-600'
                : comparison.trend === 'down'
                ? 'text-red-600'
                : 'text-slate-600'
            }`}
          >
            {formatNumber(comparison.difference)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatGrowth(growth: number): string {
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
}
