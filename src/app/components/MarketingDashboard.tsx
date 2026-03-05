import React, { useMemo } from 'react';
import { Target, Zap, Link2 } from 'lucide-react';
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

          {/* ===== API INTEGRATIONS ===== */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-cyan-600" />
              Analytics API Integrations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Google Analytics */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Google Analytics 4</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Ready</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Website traffic, user behavior, and conversion funnel data
                </p>
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div>✓ Page views</div>
                  <div>✓ User sessions</div>
                  <div>✓ Conversion rates</div>
                </div>
                <button className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition">
                  Connect API
                </button>
              </div>

              {/* HubSpot */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">HubSpot CRM</h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Ready</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Lead data, company information, and contact interactions
                </p>
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div>✓ Lead scoring</div>
                  <div>✓ Conversion pipeline</div>
                  <div>✓ Deal tracking</div>
                </div>
                <button className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition">
                  Connect API
                </button>
              </div>

              {/* LinkedIn Analytics */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">LinkedIn Analytics</h3>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">Ready</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  LinkedIn campaign performance and audience engagement metrics
                </p>
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div>✓ Campaign metrics</div>
                  <div>✓ Engagement data</div>
                  <div>✓ Lead gen forms</div>
                </div>
                <button className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition">
                  Connect API
                </button>
              </div>
            </div>

            {/* Integration Status */}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-slate-900">Auto-Population Ready</p>
                  <p className="text-xs text-slate-600">Once APIs are connected, inbound leads will auto-populate daily without manual updates</p>
                </div>
              </div>
            </div>
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