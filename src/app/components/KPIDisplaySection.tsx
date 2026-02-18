/**
 * KPI Display Section Component
 * Reusable component for displaying KPI cards with comparison
 * Can be used across all department dashboards
 */

import React from 'react';
import { KPICard, KPIComparisonCard } from './ui/KPICard';
import { compareQuarters } from '../lib/comparisonUtils';

interface KPIData {
  name: string;
  q4Actual: number;
  q4Target: number;
  q3Actual: number;
  q3Target: number;
  unit?: string;
}

interface KPIDisplaySectionProps {
  title: string;
  kpis: KPIData[];
  showComparison?: boolean;
}

/**
 * KPI Display Section - Shows multiple KPIs with optional Q3 vs Q4 comparison
 * 
 * Usage:
 * <KPIDisplaySection
 *   title="Sales KPIs"
 *   kpis={[
 *     { name: 'Revenue', q4Actual: 100000, q4Target: 95000, q3Actual: 85000, q3Target: 80000, unit: '$' }
 *   ]}
 *   showComparison={true}
 * />
 */
export function KPIDisplaySection({
  title,
  kpis,
  showComparison = false,
}: KPIDisplaySectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>

      {!showComparison ? (
        // Simple KPI Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, idx) => {
            const achievement = (kpi.q4Actual / kpi.q4Target) * 100;
            const status =
              achievement >= 80 && achievement <= 120
                ? 'on-track'
                : achievement >= 60
                ? 'at-risk'
                : 'off-track';

            const trend = kpi.q4Actual > kpi.q3Actual ? 'up' : kpi.q4Actual < kpi.q3Actual ? 'down' : 'neutral';
            const growth = ((kpi.q4Actual - kpi.q3Actual) / kpi.q3Actual) * 100;

            return (
              <KPICard
                key={idx}
                title={kpi.name}
                actual={kpi.q4Actual}
                target={kpi.q4Target}
                achievement={achievement}
                status={status}
                trend={trend}
                growth={growth}
                unit={kpi.unit}
              />
            );
          })}
        </div>
      ) : (
        // Comparison Cards (Q3 vs Q4)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi, idx) => {
            const comparison = compareQuarters(
              kpi.q4Actual,
              kpi.q4Target,
              kpi.q3Actual,
              kpi.q3Target
            );

            return (
              <KPIComparisonCard
                key={idx}
                title={kpi.name}
                comparison={comparison}
                unit={kpi.unit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
