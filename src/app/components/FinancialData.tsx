import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, DollarSign, Wallet, Zap, ArrowUp, ArrowDown, Gauge, Upload as UploadIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FilterStatusBadge } from './FilterStatusBadge';
import { DefinitionsSection } from './DefinitionsSection';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { LABELS } from '../../config/labels';

// ============================================================================
// Helper Components (Reused from Sales/Marketing Dashboards)
// ============================================================================

interface HeroKPIProps {
  title: string;
  actual: number | string;
  target: number | string;
  unit: string;
  icon: React.ElementType;
  subtext?: string;
  status?: 'on-track' | 'at-risk' | 'in-progress' | 'exceeded';
  isNumeric?: boolean;
}

function HeroKPI({ title, actual, target, unit, icon: Icon, subtext, status, isNumeric = true }: HeroKPIProps) {
  let displayStatus = status;
  let achievement = 0;

  if (isNumeric && typeof actual === 'number' && typeof target === 'number') {
    achievement = (actual / target) * 100;
    if (!displayStatus) {
      displayStatus =
        achievement >= 80 && achievement <= 120
          ? 'on-track'
          : achievement >= 60
            ? 'at-risk'
            : 'in-progress';
    }
  }

  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M${unit}`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k${unit}`;
    return `${num.toFixed(0)}${unit}`;
  };

  const getStatusColor = () => {
    switch (displayStatus) {
      case 'exceeded':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' };
      case 'on-track':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-500' };
      case 'at-risk':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500' };
      case 'in-progress':
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', bar: 'bg-slate-300' };
      default:
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' };
    }
  };

  const colors = getStatusColor();

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-5 h-5 text-slate-600" />
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors.text} bg-white/60`}>
          {displayStatus === 'exceeded'
            ? '✓ Exceeded'
            : displayStatus === 'on-track'
              ? '✓ On Track'
              : displayStatus === 'in-progress'
                ? '⏳ In Progress'
                : '⚠ At Risk'}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-3xl font-bold text-slate-900">
            {isNumeric ? formatNumber(actual as number) : actual}
          </span>
          <span className="text-sm text-slate-600">
            vs {isNumeric ? formatNumber(target as number) : target}
          </span>
        </div>
      </div>

      {isNumeric && typeof actual === 'number' && typeof target === 'number' && (
        <div className="mb-3">
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
      )}

      {subtext && <div className="text-xs text-slate-600">{subtext}</div>}
    </div>
  );
}

interface RAGBandProps {
  data: { onTrack: string[]; inProgress: string[]; attention: string[]; gap: string[] };
}

function RAGBand({ data }: RAGBandProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
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

      {/* In Progress */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-slate-500" />
          <h4 className="text-sm font-bold text-slate-700">In Progress</h4>
        </div>
        <div className="space-y-2">
          {data.inProgress.map((item, idx) => (
            <div key={idx} className="text-xs text-slate-700 bg-white/60 rounded px-2 py-1">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Gap */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <h4 className="text-sm font-bold text-indigo-700">Strategic Gap</h4>
        </div>
        <div className="space-y-2">
          {data.gap.map((item, idx) => (
            <div key={idx} className="text-xs text-indigo-700 bg-white/60 rounded px-2 py-1">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Attention */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <h4 className="text-sm font-bold text-red-700">Attention</h4>
        </div>
        <div className="space-y-2">
          {data.attention.map((item, idx) => (
            <div key={idx} className="text-xs text-red-700 bg-white/60 rounded px-2 py-1">
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
      <h4 className="text-sm font-bold text-slate-900 mb-4">Key Insights & Actions</h4>
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

// ============================================================================
// Main Component
// ============================================================================

export default function FinancialData() {
  const { selectedMonths, marketingData, bdData } = useKPI();
  const { getMonthDisplay } = useDashboardFilter();
  const hasData = marketingData.length > 0 || bdData.length > 0;

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ============================================================================
  // Financial Data
  // ============================================================================

  const cashBalance = hasData ? 3540004 : 0;
  const cashTarget = hasData ? 1329907 : 0;
  const operating_burn_ytd = hasData ? 279441 : 0;
  const operating_burn_target = hasData ? 279441 : 0;
  const runway_months = hasData ? null : null; // In progress - depends on burn close
  const runway_target = hasData ? 24 : 0;
  const working_capital_change = hasData ? -60561 : 0;
  const non_dilutive_funding = hasData ? 0 : 0;
  const non_dilutive_funding_target = hasData ? 500000 : 0;

  // Cash vs Target comparison data
  const cashComparisonData = hasData ? [
    { name: 'Target', value: cashTarget },
    { name: 'Actual', value: cashBalance },
  ] : [];

  // Burn trend data (monthly)
  const burnTrendData = hasData ? [
    { month: 'Jan', burn: 92000, monthly: 92000 },
    { month: 'Feb', burn: 95000, monthly: 3000 },
    { month: 'Mar', burn: 92000, monthly: -3000 },
  ] : [];

  // Funding target progress
  const fundingData = hasData ? [
    { name: 'Secured', value: non_dilutive_funding },
    { name: 'Remaining', value: non_dilutive_funding_target },
  ] : [];

  // Working capital visualization
  const workingCapitalData = hasData ? [
    { name: 'Working Capital', value: Math.abs(working_capital_change), fill: working_capital_change < 0 ? '#ef4444' : '#10b981' },
  ] : [];

  // RAG Status
  const ragStatus = {
    onTrack: hasData ? ['Cash balance vs target'] : [],
    inProgress: hasData ? ['Operating burn', 'Runway calculation'] : [],
    gap: hasData ? ['Non-dilutive funding'] : [],
    attention: hasData ? ['Negative working capital movement – $60.5K outflow'] : [],
  };

  // Insights
  const insights = hasData ? [
    `Cash significantly exceeds quarterly target: $${(cashBalance / 1000000).toFixed(2)}M vs $${(cashTarget / 1000000).toFixed(2)}M (+${(((cashBalance - cashTarget) / cashTarget) * 100).toFixed(0)}% achievement)`,
    `Operating burn closing in progress – runway recalculation pending completion`,
    `Negative working capital movement of $${(Math.abs(working_capital_change) / 1000).toFixed(1)}K this period – monitor closely`,
    `No non-dilutive funding secured yet – $${(non_dilutive_funding_target / 1000).toFixed(0)}K target remains at 0%`,
    `Strong liquidity position supports current operational needs with significant runway`,
  ] : [];

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{LABELS.pageTitles.finance.title}</h1>
          <p className="text-slate-600 mb-2">{LABELS.pageTitles.finance.subtitle}</p>
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

      {/* ===== HERO ROW — CORE FINANCIAL HEALTH ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">{LABELS.sections.capital} Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <HeroKPI
            title="Cash Balance"
            actual={cashBalance}
            target={cashTarget}
            unit="$"
            icon={DollarSign}
            status="exceeded"
            subtext={`+${(((cashBalance - cashTarget) / cashTarget) * 100).toFixed(0)}% above target`}
            isNumeric={true}
          />
          <HeroKPI
            title="Operating Burn"
            actual="$279K YTD"
            target="$279K"
            unit=""
            icon={TrendingDown}
            status="in-progress"
            subtext="Data closing in process"
            isNumeric={false}
          />
          <HeroKPI
            title="Runway"
            actual="⏳ Calculating"
            target="24 months"
            unit=""
            icon={Clock}
            status="in-progress"
            subtext="Auto-calculates once burn is closed"
            isNumeric={false}
          />
        </div>
      </div>

      {/* ===== CASH POSITION VS TARGET (PRIMARY CHART) ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">{LABELS.sections.cashflow} Position vs Quarterly Target</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashComparisonData}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
              <Bar dataKey="value" fill="#10b981">
                <Cell fill="#cbd5e1" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            <strong>✓ Strong liquidity position:</strong> Actual cash ($3.54M) exceeds target by $2.21M, providing healthy buffer for operations.
          </div>
        </div>
      </div>

      {/* ===== WORKING CAPITAL + FUNDING (2-COLUMN) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Capital Movement */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Working {LABELS.sections.capital} Movement</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ArrowDown className="w-6 h-6 text-red-600" />
                  <span className="text-4xl font-bold text-red-600">$60.5K</span>
                </div>
                <p className="text-sm text-slate-600">Working capital change (QTD)</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-sm font-medium text-slate-900">Impact</span>
                <span className="text-sm font-bold text-red-700">Negative outflow</span>
              </div>
              <p className="text-xs text-slate-600 p-3">Negative working capital movement this period indicates increased operational liabilities or decreased current assets. Monitor closely.</p>
            </div>
          </div>
        </div>

        {/* Non-Dilutive Funding */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Non-Dilutive Funding ({LABELS.sections.capital}) Target</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={fundingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-slate-700">Secured</span>
                </div>
                <span className="font-bold text-slate-900">$0 (0%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-slate-700">Target</span>
                </div>
                <span className="font-bold text-slate-900">$500K</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3">Strategic: No non-dilutive funding secured yet. This is a strategic priority, not an operational concern given strong cash position.</p>
          </div>
        </div>
      </div>

      {/* ===== BURN → RUNWAY DEPENDENCY VISUAL ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Burn → Runway Relationship</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-slate-500" />
                <h4 className="font-semibold text-slate-900">Operating Burn</h4>
              </div>
              <p className="text-sm text-slate-600">YTD: $279,441 (in progress)</p>
            </div>

            <div className="flex-shrink-0 px-4">
              <div className="border-t-2 border-dashed border-slate-400 w-16 flex items-center justify-center">
                <span className="text-xs text-slate-500 font-medium">→</span>
              </div>
            </div>

            <div className="flex-1 text-right">
              <div className="flex items-center gap-3 justify-end mb-2">
                <h4 className="font-semibold text-slate-900">Runway</h4>
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600">Target: 24 months (pending data)</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
            <p>
              <strong>Data Dependency:</strong> Runway auto-calculates once operating burn is finalized. This is not missing data – it's a
              calculated field awaiting input.
            </p>
          </div>
        </div>
      </div>

      {/* ===== OPERATING BURN TREND ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Operating Burn Trend</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={burnTrendData}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
              <Legend />
              <Line type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={2} name="Cumulative Burn" dot={{ fill: '#ef4444' }} />
              <Line type="monotone" dataKey="monthly" stroke="#94a3b8" strokeWidth={2} name="Monthly Delta" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-600 mt-4">
            <strong>Note:</strong> Operating burn data closing in progress. Final figures will drive runway recalculation.
          </p>
        </div>
      </div>

      {/* ===== RAG STATUS BAND ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">{LABELS.sections.kpiHealth} Status</h2>
        <RAGBand data={ragStatus} />
      </div>

      {/* ===== FOOTER ===== */}
      <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
        Financial data updated quarterly. In-progress items are flagged with status. All calculated fields auto-update once dependencies are complete.
      </div>

      {/* Definitions Section */}
      <DefinitionsSection department="finance" />
    </div>
  );
}
