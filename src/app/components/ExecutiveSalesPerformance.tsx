import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, Users, DollarSign, Target, Zap, Map, FileCheck, Briefcase } from 'lucide-react';
import { KPICard } from './ui/KPICard';
import { FilterStatusBadge } from './FilterStatusBadge';
import { DefinitionsSection } from './DefinitionsSection';
import { useKPI } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';

type ViewMode = 'bd-india' | 'bd-mena';

// ============================================================================
// BD - India Data
// ============================================================================
const BD_INDIA_DATA = {
  owner: 'Arjun Mehta',
  quarter: 'Q4',
  heroKPIs: [
    {
      id: 'order-intake',
      title: 'Order Intake',
      actual: 329000,
      target: 750000,
      unit: '$',
      icon: DollarSign,
    },
    {
      id: 'avg-deal-size',
      title: 'Average Deal Size',
      actual: 37000,
      target: 150000,
      unit: '$',
      icon: Target,
    },
    {
      id: 'qualified-pipeline',
      title: 'Qualified Pipeline',
      actual: 1250000,
      target: 4000000,
      unit: '$',
      icon: Zap,
    },
  ],
  marketExpansion: [
    { id: 'active-customers', title: 'Active Customers', actual: 4, target: 8, unit: '' },
    { id: 'repeat-customers', title: '% Repeat Customers', actual: 75, target: 90, unit: '%' },
    { id: 'channel-partners', title: 'Active Channel Partners', actual: 0, target: 3, unit: '' },
    { id: 'revenue-diversity', title: 'Revenue Diversity Index', actual: 0.65, target: 0.85, unit: '' },
  ],
  funnelStages: [
    { id: 'inbound-response', label: 'Inbound Response', value: '2.5 hrs', status: 'on-track' as const, icon: Clock },
    { id: 'mql-to-sql', label: 'MQL to SQL', value: '14 days', status: 'at-risk' as const, icon: TrendingUp },
    { id: 'proposal-to-po', label: 'Proposal to PO', value: '21 days', status: 'off-track' as const, icon: FileCheck },
    { id: 'sales-cycle', label: 'Sales Cycle', value: '3-6 months', status: 'at-risk' as const, icon: Clock },
  ],
  ragStatus: {
    behind: ['Order intake', 'Average deal size', 'Pipeline coverage'],
    atRisk: ['Channel partners', 'Funnel tracking gaps', 'Customer retention'],
    onTrack: ['Active customers', 'Response time', 'Deal quality'],
  },
  insights: [
    'Pipeline coverage is 31% of target - need $2.75M in new opportunities',
    'Average deal size is 75% below target - focus on enterprise-level deals',
    'Channel partner activation is 0/3 - ecosystem partnerships critical',
    'Funnel velocity gaps between proposal and PO conversion',
  ],
};

// ============================================================================
// BD - MENA Data
// ============================================================================
const BD_MENA_DATA = {
  owner: 'Kishore',
  quarter: 'Q4',
  heroKPIs: [
    {
      id: 'qualified-conversations',
      title: 'Qualified Enterprise Conversations',
      actual: 1,
      target: 15,
      unit: '',
      icon: Users,
    },
    {
      id: 'anchor-accounts',
      title: 'Anchor Accounts Identified',
      actual: 0,
      target: 5,
      unit: '',
      icon: Briefcase,
    },
    {
      id: 'prequalified-opportunities',
      title: 'Pre-qualified Opportunities',
      actual: 0,
      target: 3,
      unit: '',
      icon: Target,
    },
  ],
  pillars: [
    {
      title: 'Market Access',
      kpis: [
        { title: 'Qualified Enterprise Conversations', actual: 1, target: 15, unit: '' },
        { title: 'Anchor Accounts Identified', actual: 0, target: 5, unit: '' },
        { title: 'Stakeholder Coverage', actual: 0, target: 3, unit: '' },
      ],
    },
    {
      title: 'Use Case / ICP Validation',
      kpis: [
        { title: 'Validated Use Cases Documented', actual: 0, target: 3, unit: '' },
        { title: 'Customer Readiness Assessments', actual: 0, target: 5, unit: '' },
      ],
    },
    {
      title: 'Deal Pre-Sales Readiness',
      kpis: [
        { title: 'Pre-qualified Opportunities', actual: 0, target: 3, unit: '' },
        { title: 'Technical Feasibility Checkpoints', actual: 0, target: 2, unit: '' },
      ],
    },
  ],
  milestones: [
    { region: 'Saudi & UAE', status: 'completed' as const },
    { region: 'UAE & Oman', status: 'in-progress' as const },
  ],
  ragStatus: {
    behind: ['Enterprise conversations', 'Anchor accounts', 'Pre-qualified opportunities', 'Use case validation', 'Customer readiness'],
    atRisk: ['Stakeholder coverage', 'Technical feasibility'],
    onTrack: ['Local ecosystem mapping (Saudi & UAE)'],
  },
  insights: [
    'Market access gap: 1 of 15 qualified conversations - need strategic outreach',
    'Zero anchor accounts identified - prioritize Fortune 500 target list',
    'Pre-sales readiness not yet built - allocate resources for technical scoping',
    'Ecosystem mapping progressing in GCC - Saudi & UAE foundation complete',
  ],
};

// ============================================================================
// Helper Components
// ============================================================================

interface HeroKPIProps {
  title: string;
  actual: number;
  target: number;
  unit: string;
  icon: React.ElementType;
}

function HeroKPI({ title, actual, target, unit, icon: Icon }: HeroKPIProps) {
  const achievement = (actual / target) * 100;
  const status =
    achievement >= 80 && achievement <= 120
      ? 'on-track'
      : achievement >= 60
        ? 'at-risk'
        : 'off-track';

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${num.toFixed(0)}${unit}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' };
      case 'at-risk':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500' };
      case 'off-track':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' };
    }
  };

  const colors = getStatusColor();

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-5 h-5 text-slate-600" />
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors.text} bg-white/60`}>
          {status === 'on-track' ? '✓ On Track' : status === 'at-risk' ? '⚠ At Risk' : '✗ Behind'}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-3xl font-bold text-slate-900">{formatNumber(actual)}</span>
          <span className="text-sm text-slate-600">vs {formatNumber(target)}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700">Achievement</span>
          <span className={`text-sm font-bold ${colors.text}`}>{achievement.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-slate-600">
        Gap: {formatNumber(target - actual)}
      </div>
    </div>
  );
}

interface CompactKPIProps {
  title: string;
  actual: number;
  target: number;
  unit: string;
}

function CompactKPI({ title, actual, target, unit }: CompactKPIProps) {
  const achievement = (actual / target) * 100;
  const status =
    achievement >= 80 && achievement <= 120
      ? 'on-track'
      : achievement >= 60
        ? 'at-risk'
        : 'off-track';

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k${unit}`;
    return `${num.toFixed(0)}${unit}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' };
      case 'at-risk':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500' };
      case 'off-track':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' };
    }
  };

  const colors = getStatusColor();

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <h4 className="text-xs font-semibold text-slate-900 mb-2 line-clamp-2">{title}</h4>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-lg font-bold text-slate-900">{formatNumber(actual)}</span>
        <span className="text-xs text-slate-600">/{formatNumber(target)}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${Math.min(achievement, 100)}%` }}
        />
      </div>
      <div className="text-xs text-slate-600 mt-1">{achievement.toFixed(0)}%</div>
    </div>
  );
}

interface FunnelStageProps {
  label: string;
  value: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  icon: React.ElementType;
  isLast?: boolean;
}

function FunnelStage({ label, value, status, icon: Icon, isLast }: FunnelStageProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'at-risk':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'off-track':
        return 'bg-red-100 border-red-300 text-red-700';
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className={`${getStatusColor()} border rounded-lg p-3 flex items-center gap-2 flex-1`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-sm font-bold">{value}</p>
        </div>
      </div>
      {!isLast && (
        <div className="flex-shrink-0 text-slate-400 text-lg">→</div>
      )}
    </div>
  );
}

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
      <h4 className="text-sm font-bold text-slate-900 mb-4">Key Insights</h4>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MilestoneChipProps {
  region: string;
  status: 'completed' | 'in-progress';
}

function MilestoneChip({ region, status }: MilestoneChipProps) {
  const colors =
    status === 'completed'
      ? 'bg-green-100 text-green-700 border-green-300'
      : 'bg-yellow-100 text-yellow-700 border-yellow-300';

  const icon = status === 'completed' ? '✓' : '⏳';

  return (
    <span className={`${colors} border rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1`}>
      {icon} {region}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ExecutiveSalesPerformance() {
  const { selectedMonths } = useKPI();
  const { getMonthDisplay } = useDashboardFilter();
  const [viewMode, setViewMode] = useState<ViewMode>('bd-india');
  const currentData = viewMode === 'bd-india' ? BD_INDIA_DATA : BD_MENA_DATA;
  const isBDIndiaView = viewMode === 'bd-india';
  const isBDMenaView = viewMode === 'bd-mena';

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Business Development – {isBDIndiaView ? 'India' : 'MENA Territory'}
            </h1>
            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              Owner: {isBDIndiaView ? 'Arjun Mehta' : 'Kishore'}
            </span>
          </div>
          <p className="text-slate-600 mb-2">
            Territory build-out readiness and market access progression
          </p>
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

      {/* ===== VIEW TOGGLE ===== */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 inline-flex gap-2">
        <button
          onClick={() => setViewMode('bd-india')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            isBDIndiaView
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          BD-India
        </button>
        <button
          onClick={() => setViewMode('bd-mena')}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            isBDMenaView
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          BD - MENA
        </button>
      </div>

      {/* ===== BD-INDIA VIEW ===== */}
      {isBDIndiaView && (
        <>
          {/* HERO KPIs */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Opportunity Summary – {BD_INDIA_DATA.quarter}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BD_INDIA_DATA.heroKPIs.map((kpi) => (
                <HeroKPI
                  key={kpi.id}
                  title={kpi.title}
                  actual={kpi.actual}
                  target={kpi.target}
                  unit={kpi.unit}
                  icon={kpi.icon}
                />
              ))}
            </div>
          </div>

          {/* MARKET EXPANSION */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Market Expansion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BD_INDIA_DATA.marketExpansion.map((kpi) => (
                <CompactKPI
                  key={kpi.id}
                  title={kpi.title}
                  actual={kpi.actual}
                  target={kpi.target}
                  unit={kpi.unit}
                />
              ))}
            </div>
          </div>

          {/* SALES FUNNEL: ICP TO CLOSED */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Sales Funnel: ICP to Closed</h2>
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <div className="flex flex-col items-center space-y-3">
                {/* ICP Stage */}
                <div className="w-full">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg p-6 shadow-lg" style={{maxWidth: '100%'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">ICP</h3>
                        <p className="text-sm opacity-90">45 opportunities</p>
                        <p className="text-sm opacity-90">$2.25M pipeline</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Proposals Stage */}
                <div className="w-full">
                  <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg p-6 shadow-lg" style={{maxWidth: '50%', marginLeft: 'auto', marginRight: 'auto'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Proposals</h3>
                        <p className="text-sm opacity-90">18 opportunities (40%)</p>
                        <p className="text-sm opacity-90">$900k pipeline</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Closed Stage */}
                <div className="w-full">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg p-6 shadow-lg" style={{maxWidth: '30%', marginLeft: 'auto', marginRight: 'auto'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Closed</h3>
                        <p className="text-sm opacity-90">12 opportunities (67%)</p>
                        <p className="text-sm opacity-90">$720k value</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FUNNEL DISCIPLINE*/}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Funnel Discipline</h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex flex-col md:flex-row gap-3">
                {BD_INDIA_DATA.funnelStages.map((stage, idx) => (
                  <FunnelStage
                    key={stage.id}
                    label={stage.label}
                    value={stage.value}
                    status={stage.status}
                    icon={stage.icon}
                    isLast={idx === BD_INDIA_DATA.funnelStages.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RAG STATUS */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Status</h2>
            <RAGBand data={BD_INDIA_DATA.ragStatus} />
          </div>
        </>
      )}

      {/* ===== BD-MENA VIEW ===== */}
      {isBDMenaView && (
        <>
          {/* HERO KPIs */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Opportunity Summary – {BD_MENA_DATA.quarter}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BD_MENA_DATA.heroKPIs.map((kpi) => (
                <HeroKPI
                  key={kpi.id}
                  title={kpi.title}
                  actual={kpi.actual}
                  target={kpi.target}
                  unit={kpi.unit}
                  icon={kpi.icon}
                />
              ))}
            </div>
          </div>

          {/* PILLAR SECTIONS */}
          {BD_MENA_DATA.pillars.map((pillar, idx) => (
            <div key={idx}>
              <h2 className="text-lg font-bold text-slate-900 mb-4">{pillar.title}</h2>

              {pillar.title === 'Deal Pre-Sales Readiness' ? (
                // Special handling for milestones
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pillar.kpis.map((kpi) => (
                      <CompactKPI
                        key={kpi.title}
                        title={kpi.title}
                        actual={kpi.actual}
                        target={kpi.target}
                        unit={kpi.unit}
                      />
                    ))}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Local Ecosystem Mapping</p>
                    <div className="flex flex-wrap gap-2">
                      {BD_MENA_DATA.milestones.map((milestone, midx) => (
                        <MilestoneChip
                          key={midx}
                          region={milestone.region}
                          status={milestone.status}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Standard KPI grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pillar.kpis.map((kpi) => (
                    <CompactKPI
                      key={kpi.title}
                      title={kpi.title}
                      actual={kpi.actual}
                      target={kpi.target}
                      unit={kpi.unit}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* SALES FUNNEL: ICP TO CLOSED */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Sales Funnel: ICP to Closed</h2>
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <div className="flex flex-col items-center space-y-3">
                {/* ICP Stage */}
                <div className="w-full">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg p-6 shadow-lg" style={{maxWidth: '100%'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">ICP</h3>
                        <p className="text-sm opacity-90">32 opportunities</p>
                        <p className="text-sm opacity-90">$1.6M pipeline</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Proposals Stage */}
                <div className="w-full">
                  <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg p-6 shadow-lg" style={{maxWidth: '50%', marginLeft: 'auto', marginRight: 'auto'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Proposals</h3>
                        <p className="text-sm opacity-90">12 opportunities (37.5%)</p>
                        <p className="text-sm opacity-90">$600k pipeline</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Closed Stage */}
                <div className="w-full">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg p-6 shadow-lg" style={{maxWidth: '30%', marginLeft: 'auto', marginRight: 'auto'}}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Closed</h3>
                        <p className="text-sm opacity-90">8 opportunities (67%)</p>
                        <p className="text-sm opacity-90">$480k value</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RAG STATUS */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Status</h2>
            <RAGBand data={BD_MENA_DATA.ragStatus} />
          </div>
        </>
      )}

      {/* Definitions Section - BD definitions for both views */}
      <DefinitionsSection department="bd" />
    </div>
  );
}
