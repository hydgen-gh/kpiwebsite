import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lightbulb,
  Target,
  Zap,
  AlertCircle,
  Lock,
  Briefcase,
  Upload as UploadIcon,
} from 'lucide-react';
import { EmptyState } from './EmptyState';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from 'recharts';
import { FilterStatusBadge } from './FilterStatusBadge';
import { DefinitionsSection } from './DefinitionsSection';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { LABELS } from '../../config/labels';

// ============================================================================
// Helper Components (Reused from Sales/Marketing/Finance Dashboards)
// ============================================================================

interface HeroKPIProps {
  title: string;
  actual: string | number;
  target: string | number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'on-track' | 'at-risk' | 'in-progress' | 'blocked' | 'exceeded';
  subtext?: string;
  isNumeric?: boolean;
}

function HeroKPI({
  title,
  actual,
  target,
  unit,
  icon: Icon,
  status,
  subtext,
  isNumeric = true,
}: HeroKPIProps) {
  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    'on-track': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'at-risk': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'blocked': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'in-progress': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    'exceeded': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  };

  const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
    'on-track': { bg: 'bg-green-100', text: 'text-green-800', label: '✓ On Track' },
    'at-risk': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⚠ At Risk' },
    'blocked': { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 Blocked' },
    'in-progress': { bg: 'bg-slate-100', text: 'text-slate-800', label: '⏳ In Progress' },
    'exceeded': { bg: 'bg-blue-100', text: 'text-blue-800', label: '✨ Exceeded' },
  };

  const style = statusStyles[status];
  const badge = statusBadges[status];

  let achievement = 0;
  if (isNumeric && typeof actual === 'number' && typeof target === 'number') {
    achievement = Math.round((actual / target) * 100);
  }

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-lg p-5 flex flex-col justify-between h-full`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-bold text-slate-900">{actual}</span>
            <span className="text-sm text-slate-600">{unit}</span>
          </div>
          {isNumeric && typeof target === 'number' && (
            <p className="text-xs text-slate-600 mt-1">vs {target} {unit}</p>
          )}
        </div>
        <Icon className={`w-5 h-5 ${style.text}`} />
      </div>

      {isNumeric && typeof actual === 'number' && typeof target === 'number' && (
        <div className="space-y-2">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                status === 'on-track'
                  ? 'bg-green-500'
                  : status === 'at-risk'
                    ? 'bg-yellow-500'
                    : status === 'blocked'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(achievement, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-600">{achievement}% achievement</div>
        </div>
      )}

      <div className={`${badge.bg} ${badge.text} text-xs font-semibold px-2 py-1 rounded mt-3 w-fit`}>
        {badge.label}
      </div>

      {subtext && <p className="text-xs text-slate-600 mt-3">{subtext}</p>}
    </div>
  );
}

interface RAGBandProps {
  data: Array<{
    category: string;
    items: Array<{ label: string; status: 'on-track' | 'at-risk' | 'blocked' | 'strategic-gap' }>;
  }>;
}

function RAGBand({ data }: RAGBandProps) {
  const statusClass = (status: string) => {
    const classes: Record<string, string> = {
      'on-track': 'bg-green-100 text-green-800',
      'at-risk': 'bg-yellow-100 text-yellow-800',
      'blocked': 'bg-red-100 text-red-800',
      'strategic-gap': 'bg-indigo-100 text-indigo-800',
    };
    return classes[status] || classes['on-track'];
  };

  const statusIcon = (status: string) => {
    const icons: Record<string, string> = {
      'on-track': '✓',
      'at-risk': '⚠',
      'blocked': '🔴',
      'strategic-gap': '▪',
    };
    return icons[status] || '•';
  };

  return (
    <div className="space-y-4">
      {data.map((group) => (
        <div key={group.category}>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">{group.category}</h4>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item.label}
                className={`${statusClass(item.status)} text-xs font-medium px-3 py-1.5 rounded-full`}
              >
                {statusIcon(item.status)} {item.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface InsightsPanelProps {
  insights: string[];
}

function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => (
        <div key={idx} className="flex gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">{insight}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component: R&D EXECUTION COCKPIT
// ============================================================================

export default function RnD() {
  const { selectedMonths } = useKPI();
  const { getMonthDisplay } = useDashboardFilter();

  // ============================================================================
  // Data: Technology Risk Reduction (Composite KPI) — 3 Subsystems
  // ============================================================================
  const { marketingData, bdData } = useKPI();
  const hasData = marketingData.length > 0 || bdData.length > 0;

  const technologyProgressData = {
    catalyst: { current: hasData ? 10 : 0, target: hasData ? 10 : 0, label: 'Catalyst' },
    membrane: { current: hasData ? 15 : 0, target: hasData ? 30 : 0, label: 'Membrane' },
    mea: { current: hasData ? 30 : 0, target: hasData ? 30 : 0, label: 'MEA' },
  };

  // Composite calculation: average progress toward targets
  const catalystProgress = hasData ? (technologyProgressData.catalyst.current / technologyProgressData.catalyst.target) * 100 : 0;
  const membraneProgress = hasData ? (technologyProgressData.membrane.current / technologyProgressData.membrane.target) * 100 : 0;
  const meaProgress = hasData ? (technologyProgressData.mea.current / technologyProgressData.mea.target) * 100 : 0;
  const riskReductionIndex = hasData ? Math.round((catalystProgress + membraneProgress + meaProgress) / 3) : 0;

  // Risk reduction status
  const getRiskStatus = (): 'on-track' | 'at-risk' | 'blocked' => {
    if (!hasData) return 'on-track';
    if (membraneProgress < 50) return 'at-risk';
    if (membraneProgress === 50 && membraneProgress > 40) return 'at-risk';
    return 'on-track';
  };

  // ============================================================================
  // Data: Patent Families & IP Filings
  // ============================================================================
  const patentData = {
    families: hasData ? 4 : 0,
    familiesTarget: hasData ? 4 : 0,
    filings: hasData ? 9 : 0,
    filingsTarget: hasData ? 13 : 0,
  };

  const filingAchievement = hasData && patentData.filingsTarget > 0 ? (patentData.filings / patentData.filingsTarget) * 100 : 0;

  // ============================================================================
  // Data: Grant Milestone Progress — Tranche 3 (Blocked)
  // ============================================================================
  const grantData = {
    tranche3Progress: hasData ? 0 : 0,
    tranche3Target: hasData ? 100 : 0,
    status: 'blocked' as const,
    reason: hasData ? 'Space constraint' : '-',
  };

  // ============================================================================
  // Data: Technology Subsystem Progress Chart (for full-width bar chart)
  // ============================================================================
  const subsystemProgressChartData = hasData ? [
    {
      name: 'Catalyst',
      current: technologyProgressData.catalyst.current,
      target: technologyProgressData.catalyst.target,
      status: 'on-track' as const,
    },
    {
      name: 'Membrane',
      current: technologyProgressData.membrane.current,
      target: technologyProgressData.membrane.target,
      status: 'at-risk' as const,
    },
    {
      name: 'MEA',
      current: technologyProgressData.mea.current,
      target: technologyProgressData.mea.target,
      status: 'on-track' as const,
    },
  ] : [];

  // ============================================================================
  // Data: Patent Filing Progress — Delta Bar (Q3 → Q4 → Current)
  // ============================================================================
  const patentFilingTrendData = hasData ? [
    { quarter: 'Q3', filings: 13, status: 'historical' },
    { quarter: 'Q4 Target', filings: 13, status: 'planned' },
    { quarter: 'Current', filings: 9, status: 'current', label: 'Drafting in progress' },
  ] : [];

  // ============================================================================
  // Data: New IP Milestone Tracker (Steps: Drafting → Filing → PCT)
  // ============================================================================
  const ipMilestoneSteps = hasData ? [
    { step: 'Drafting', status: 'in-progress' as const },
    { step: 'Filing', status: 'not-started' as const },
    { step: 'PCT', status: 'not-started' as const },
  ] : [];

  // ============================================================================
  // Data: Grant Utilization Timeline (Tranche 2 vs Tranche 3)
  // ============================================================================
  const grantUtilizationData = hasData ? [
    { tranche: 'Tranche 2', progress: 100, status: 'on-track' as const },
    { tranche: 'Tranche 3', progress: 0, status: 'blocked' as const, reason: 'Space constraint' },
  ] : [];

  // ============================================================================
  // Data: Future Programs (Option Value Creation)
  // ============================================================================
  const futurePrograms = hasData ? [
    { name: 'RFC', status: 'active' as const, type: 'MEA development' },
    { name: 'RAFC', status: 'on-hold' as const },
  ] : [];

  const activeProgramsCount = hasData ? futurePrograms.filter((p) => p.status === 'active').length : 0;
  const activeProgramsTarget = hasData ? 2 : 0;

  // ============================================================================
  // Data: RAG Status Band
  // ============================================================================
  const ragStatus = hasData ? [
    {
      category: '🟢 On Track',
      items: [
        { label: 'Catalyst milestone', status: 'on-track' as const },
        { label: 'MEA milestone', status: 'on-track' as const },
        { label: 'Patent families', status: 'on-track' as const },
      ],
    },
    {
      category: '🟡 At Risk',
      items: [
        { label: 'Membrane milestone', status: 'at-risk' as const },
        { label: 'New IP filings', status: 'at-risk' as const },
      ],
    },
    {
      category: '🔴 Blocked',
      items: [{ label: 'Grant Tranche 3 (space)', status: 'blocked' as const }],
    },
    {
      category: '⚪ Strategic Gap',
      items: [{ label: 'Future program expansion', status: 'strategic-gap' as const }],
    },
  ] : [];

  // ============================================================================
  // Data: Key Insights
  // ============================================================================
  const insights = hasData ? [
    'Core stack risk reduction progressing unevenly — Membrane subsystem at 50% of target (15% vs 30%), creating bottleneck.',
    'Strong patent family foundation (4/4 families stable) but filing count below target (9 vs 13 planned). Drafting new applications.',
    'Grant Tranche 3 execution blocked by infrastructure constraint. Space limitation prevents milestone advancement.',
    'Limited future program capacity — Only 1 active program (RFC). Strategic priority: RAFC activation pending infrastructure resolution.',
  ] : [];

  // ============================================================================
  // Derived Metrics
  // ============================================================================
  const technologyRiskIndex = riskReductionIndex;
  const ipStrengthScore = Math.round((patentData.filings / patentData.filingsTarget) * 100);
  const avgMilestoneCompletion = Math.round((riskReductionIndex + ipStrengthScore) / 2);


  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{LABELS.pageTitles.rnd.title}</h1>
          <p className="text-slate-600 text-sm">
            {LABELS.pageTitles.rnd.subtitle}
          </p>
          {selectedMonths.length > 0 && (
            <div className="mt-2 text-xs text-slate-600">
              Viewing: {getMonthDisplay}
            </div>
          )}
        </div>
        <FilterStatusBadge variant="pill" />
      </div>

      {/* ===== HERO ROW: CORE R&D HEALTH ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <HeroKPI
          title="Technology Risk Reduction"
          actual={riskReductionIndex}
          target={100}
          unit="%"
          icon={Zap}
          status={getRiskStatus()}
          subtext="PEM 25kW baseline stack progress based on 3 milestone tracks (Catalyst, Membrane, MEA)"
        />

        <HeroKPI
          title="Active Patent Families"
          actual={`${patentData.families}/${patentData.filings}`}
          target={`${patentData.familiesTarget}/${patentData.filingsTarget}`}
          unit=""
          icon={Lightbulb}
          status={filingAchievement >= 70 ? 'on-track' : 'at-risk'}
          subtext="4 families stable | 9 filings current (target 13)"
          isNumeric={false}
        />

        <HeroKPI
          title="Grant Milestone Progress"
          actual="0%"
          target="100%"
          unit=""
          icon={Lock}
          status="blocked"
          subtext="Tranche 3 blocked by space constraint"
          isNumeric={false}
        />
      </div>

      {/* ===== TECHNOLOGY RISK REDUCTION: SUBSYSTEM PROGRESS ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Technology Subsystem Progress</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          {subsystemProgressChartData.map((item) => {
            const percentage = (item.current / item.target) * 100;
            const statusColor =
              item.status === 'on-track'
                ? 'bg-green-500'
                : item.status === 'at-risk'
                  ? 'bg-yellow-500'
                  : 'bg-red-500';

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">{item.name}</span>
                  <span className="text-xs text-slate-600">
                    {item.current}% / {item.target}% {item.status === 'on-track' ? '✓' : '⚠'}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColor} transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              <strong>Bottleneck Alert:</strong> Membrane subsystem at 50% of target. This directly impacts full stack risk reduction.
            </p>
          </div>
        </div>
      </div>

      {/* ===== IP CREATION SECTION: FILING PROGRESS + MILESTONE TRACKER ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patent Filing Progress */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Patent Filing Progress</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={patentFilingTrendData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="quarter" />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="filings" fill="#3b82f6">
                  {patentFilingTrendData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.status === 'historical' ? '#cbd5e1' : entry.status === 'planned' ? '#bfdbfe' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              <strong>⚠ Filing Drop:</strong> Q3 had 13 filings, current at 9. New applications in drafting phase.
            </div>
          </div>
        </div>

        {/* New IP Filings Milestone Tracker */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">New IP Filings Milestone</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="space-y-3">
              {ipMilestoneSteps.map((milestone, idx) => {
                const statusColor =
                  milestone.status === 'in-progress'
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-slate-50 border-slate-200';

                const statusIcon =
                  milestone.status === 'in-progress'
                    ? '⏳'
                    : '○';

                const statusLabel = milestone.status === 'in-progress' ? 'In Progress' : 'Not Started';

                return (
                  <div key={milestone.step}>
                    <div
                      className={`${statusColor} border rounded-lg p-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{statusIcon}</span>
                        <span className="font-medium text-slate-900">{milestone.step}</span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {statusLabel}
                      </span>
                    </div>
                    {idx < ipMilestoneSteps.length - 1 && (
                      <div className="h-2 w-0.5 bg-slate-200 my-1 ml-4" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
              <strong>Current State:</strong> Drafting in progress. Expected filing: next quarter (pending legal review).
            </div>
          </div>
        </div>
      </div>

      {/* ===== R&D CAPITAL EFFICIENCY: GRANT UTILIZATION ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">R&D {LABELS.sections.capital} - Grant Utilization</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          {grantUtilizationData.map((item) => (
            <div key={item.tranche}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">{item.tranche}</span>
                <span className={`text-xs font-bold ${item.status === 'on-track' ? 'text-green-700' : 'text-red-700'}`}>
                  {item.status === 'on-track' ? '✓ 100% Achieved' : `🔴 ${item.progress}% — ${item.reason}`}
                </span>
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    item.status === 'on-track' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(item.progress, 100)}%` }}
                />
              </div>
            </div>
          ))}

          <div className="pt-3 mt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              <strong>Infrastructure Blocker:</strong> Tranche 3 progress halted due to space constraint. This limits new subsystem testing capacity.
            </p>
          </div>
        </div>
      </div>

      {/* ===== FUTURE OPTION VALUE CREATION: PROGRAMS ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Future Program Portfolio ({activeProgramsCount}/{activeProgramsTarget} {LABELS.sections.performance})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {futurePrograms.map((program) => {
            const statusColor =
              program.status === 'active'
                ? 'bg-green-50 border-green-200'
                : program.status === 'on-hold'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-slate-50 border-slate-200';

            const statusLabel =
              program.status === 'active'
                ? '✓ Active'
                : program.status === 'on-hold'
                  ? '⏸ On Hold'
                  : '○ Not Started';

            return (
              <div key={program.name} className={`${statusColor} border rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{program.name}</h4>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      program.status === 'active'
                        ? 'bg-green-200 text-green-800'
                        : program.status === 'on-hold'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{program.type}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== RAG STATUS BAND ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">R&D {LABELS.sections.kpiHealth}</h2>
        <RAGBand data={ragStatus} />
      </div>

      {/* ===== DERIVED METRICS (FOOTER) ===== */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">Derived Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{technologyRiskIndex}%</p>
            <p className="text-xs text-slate-600">Technology Risk Index</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{ipStrengthScore}%</p>
            <p className="text-xs text-slate-600">IP Strength Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{avgMilestoneCompletion}%</p>
            <p className="text-xs text-slate-600">Avg Milestone Completion</p>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
        R&D metrics updated quarterly. Infrastructure constraints and dependent milestones flagged explicitly. All calculations based on GQR-aligned subsystem targets.
      </div>

      {/* Definitions Section */}
      <DefinitionsSection department="rnd" />
    </div>
  );
}
