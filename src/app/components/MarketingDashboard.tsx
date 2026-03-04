import React, { useMemo } from 'react';
import { Target } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { FilterStatusBadge } from './FilterStatusBadge';
import { DefinitionsSection } from './DefinitionsSection';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { LABELS } from '../../config/labels';

// ============================================================================
// Helper Components
// ============================================================================

interface RAGBandProps {
  data: { behind: string[]; atRisk: string[]; onTrack: string[] };
}

function RAGBand({ data }: RAGBandProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Behind */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <h4 className="text-sm font-bold text-red-700">Behind</h4>
        </div>
        <div className="space-y-2">
          {data.behind.map((item, idx) => (
            <div key={idx} className="text-xs text-red-700 bg-white/60 rounded px-2 py-1">
              {item}
            </div>
          ))}
          {data.behind.length === 0 && <p className="text-xs text-red-700 opacity-60">None</p>}
        </div>
      </div>

      {/* At Risk */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <h4 className="text-sm font-bold text-yellow-700">At Risk</h4>
        </div>
        <div className="space-y-2">
          {data.atRisk.map((item, idx) => (
            <div key={idx} className="text-xs text-yellow-700 bg-white/60 rounded px-2 py-1">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* On Track */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <h4 className="text-sm font-bold text-green-700">On Track</h4>
        </div>
        <div className="space-y-2">
          {data.onTrack.map((item, idx) => (
            <div key={idx} className="text-xs text-green-700 bg-white/60 rounded px-2 py-1">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface InsightsPanelProps {
  insights: string[];
}

function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
      <h4 className="text-sm font-bold text-slate-900 mb-4">Key Metrics</h4>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="text-slate-600 flex-shrink-0 mt-0.5">•</span>
            <p className="text-sm text-slate-700">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MarketingDashboard() {
  const { comprehensiveKPIData, selectedMonths } = useKPI();
  const { getMonthDisplay } = useDashboardFilter();
  const quarter = getQuarterFromMonths(selectedMonths);
  
  // Filter Marketing KPIs from comprehensive data
  const marketingKPIs = comprehensiveKPIData.filter((kpi) => kpi.department === 'Marketing');
  const hasData = marketingKPIs.length > 0;

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
    
  // Helper to get KPI value
  const getKPIValue = (name: string): number => {
    const kpi = marketingKPIs.find((k) => k.kpi_name === name);
    return kpi?.current_month_actual || 0;
  };

  const getKPITarget = (name: string): number => {
    const kpi = marketingKPIs.find((k) => k.kpi_name === name);
    return kpi?.current_month_target || 0;
  };

  // Data Calculations
  // ============================================================================

  const qualifiedInbounds = getKPIValue('Qualified Inbound Inquiries');
  const qualifiedInboundsTarget = getKPITarget('Qualified Inbound Inquiries');
  const icpPercentage = getKPIValue('Inbound from Priority ICP');
  const pipelineContribution = getKPIValue('Marketing-Sourced Pipeline');

  // RAG Status calculation
  const ragStatus = {
    behind: [
      hasData && qualifiedInbounds < qualifiedInboundsTarget * 0.6 ? 'Inbound volume below 60% of target' : null,
    ].filter(Boolean) as string[],
    atRisk: hasData ? [
      'ICP alignment needs improvement',
      'Pipeline conversion tracking',
    ] : [],
    onTrack: hasData ? [
      'Qualified inquiry volume tracked',
      'Marketing pipeline identified',
    ] : [],
  };

  // Insights
  const insights = hasData ? [
    `Qualified Inbound Inquiries: ${qualifiedInbounds.toFixed(0)} vs target ${qualifiedInboundsTarget.toFixed(0)}`,
    `ICP Focus: ${icpPercentage.toFixed(0)} from priority accounts`,
    `Marketing-sourced pipeline: $${(pipelineContribution / 1000000).toFixed(2)}M`,
  ] : [];

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{LABELS.pageTitles.marketing.title}</h1>
          <p className="text-slate-600 mb-2">{LABELS.pageTitles.marketing.subtitle}</p>
          {selectedMonths.length > 0 && (
            <p className="text-sm text-slate-600">
              Viewing data for: <span className="font-medium">{getMonthDisplay}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col lg:items-end gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-600 mb-1">Last updated</p>
            <p className="text-sm font-medium text-slate-900">{timestamp}</p>
          </div>
          <FilterStatusBadge variant="pill" />
        </div>
      </div>

      {!hasData ? (
        <EmptyState message="No marketing KPI data available for the selected period" />
      ) : (
        <>
          {/* ===== HERO KPI CARDS ===== */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">{LABELS.sections.demandGeneration}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Qualified Inbound Inquiries</h3>
                <p className="text-4xl font-bold text-slate-900 mb-2">{qualifiedInbounds.toFixed(0)}</p>
                <p className="text-sm text-slate-600">Target: {qualifiedInboundsTarget.toFixed(0)}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Inbound from Priority ICP</h3>
                <p className="text-4xl font-bold text-slate-900 mb-2">{icpPercentage.toFixed(0)}</p>
                <p className="text-sm text-slate-600">Inquiries from target accounts</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Marketing Pipeline</h3>
                <p className="text-4xl font-bold text-slate-900 mb-2">${pipelineContribution.toFixed(1)}M</p>
                <p className="text-sm text-slate-600">Sourced from inbound</p>
              </div>
            </div>
          </div>

          {/* ===== INSIGHTS ===== */}
          <InsightsPanel insights={insights} />

          {/* ===== RAG STATUS ===== */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status Overview</h2>
            <RAGBand data={ragStatus} />
          </div>
        </>
      )}

      {/* ===== FOOTER ===== */}
      <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
        Displays marketing KPI data from Supabase
      </div>

      {/* Definitions Section */}
      <DefinitionsSection department="marketing" />
    </div>
  );
}