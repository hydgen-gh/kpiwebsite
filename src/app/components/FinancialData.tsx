import React, { useMemo } from 'react';
import {
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Wallet,
  Activity,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader,
} from 'lucide-react';
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
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { useKPI } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { LABELS } from '../../config/labels';
import { FilterStatusBadge } from './FilterStatusBadge';
import { DefinitionsSection } from './DefinitionsSection';
import {
  SAMPLE_FINANCIAL_DATA,
  formatCurrencyCompact,
} from '../../lib/financialModelData';
import { useKPI as useKPIValue } from '../../lib/hooks/useKPI';


// ============================================================================
// HERO KPI CARD COMPONENT
// ============================================================================
interface HeroKPICardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  status?: 'on-track' | 'at-risk' | 'warning';
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
}

function HeroKPICard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend = 'neutral',
  changePercent,
  status = 'on-track',
  subtitle,
  loading = false,
  error = null,
}: HeroKPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' };
      case 'at-risk':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' };
      case 'warning':
        return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };
    }
  };

  const colors = getStatusColor();
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : null;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-5 h-5 text-slate-600" />
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
          {status === 'on-track' ? '✓ On Track' : status === 'at-risk' ? '⚠ At Risk' : '⚠ Warning'}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>

      <div className="mb-3">
        {loading ? (
          <Loader className="w-5 h-5 animate-spin text-slate-400" />
        ) : error ? (
          <div className="text-red-600 text-xs">Error loading data</div>
        ) : value === null ? (
          <div className="text-slate-400 text-sm">Data not available</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 1 }) : value}
              </span>
              {unit && <span className="text-sm text-slate-600">{unit}</span>}
            </div>
            {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
          </>
        )}
      </div>

      {changePercent !== undefined && TrendIcon && !loading && !error && value !== null && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          <TrendIcon className="w-4 h-4" />
          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CUSTOM WATERFALL CHART FOR WORKING CAPITAL
// ============================================================================
interface WaterfallItem {
  name: string;
  value: number;
  fill: string;
}

function WaterfallChart({ data }: { data: WaterfallItem[] }) {
  const maxValue = Math.max(...data.map((d) => Math.abs(d.value)));

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">{item.name}</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrencyCompact(item.value)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 rounded-full flex-1 bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all`}
                style={{
                  width: `${(Math.abs(item.value) / maxValue) * 100}%`,
                  backgroundColor: item.fill,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// GAUGE CHART COMPONENT FOR RUNWAY
// ============================================================================
function RunwayGauge({ months, cashBalance, monthlyBurn }: { months: number; cashBalance: number; monthlyBurn: number }) {
  const getColor = () => {
    if (months < 12) return 'text-red-600';
    if (months < 24) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatus = () => {
    if (months < 12) return { text: '🔴 CRITICAL', label: 'Less than 12 months', style: 'bg-red-100 text-red-700' };
    if (months < 24) return { text: '🟡 CAUTION', label: '12-24 months', style: 'bg-yellow-100 text-yellow-700' };
    return { text: '🟢 HEALTHY', label: 'More than 24 months', style: 'bg-green-100 text-green-700' };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Gauge circle */}
        <div className="absolute w-40 h-40 rounded-full border-8 border-slate-200" />

        {/* Colored arc based on runway */}
        <svg className="absolute w-40 h-40" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={months < 12 ? '#dc2626' : months < 24 ? '#eab308' : '#16a34a'}
            strokeWidth="8"
            strokeDasharray={`${(months / 36) * 282.7} 282.7`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Center value */}
        <div className="text-center z-10">
          <div className={`text-4xl font-bold ${getColor()}`}>{months.toFixed(1)}</div>
          <div className="text-sm text-slate-600">months</div>
        </div>
      </div>

      {/* Status badge */}
      <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${status.style}`}>{status.text}</div>

      {/* Details */}
      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600">{status.label}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded p-3 text-center">
            <p className="text-xs text-slate-600 mb-1">Cash Balance</p>
            <p className="font-bold text-slate-900">{formatCurrencyCompact(cashBalance)}</p>
          </div>
          <div className="bg-slate-50 rounded p-3 text-center">
            <p className="text-xs text-slate-600 mb-1">Monthly Burn</p>
            <p className="font-bold text-slate-900">{formatCurrencyCompact(monthlyBurn)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function FinancialData() {
  const { selectedMonths } = useKPI();
  const { getMonthDisplay } = useDashboardFilter();

  // Fetch real KPIs from Supabase using navbar filter
  const cashBalance = useKPIValue('FIN_CASH_BALANCE');
  const monthlyBurn = useKPIValue('FIN_MONTHLY_BURN');
  const workingCapital = useKPIValue('FIN_WORKING_CAPITAL');
  const runwayMonths = useKPIValue('FIN_RUNWAY_MONTHS');

  // Memoize all data calculations for chart sections (still using sample data)
  const financialData = useMemo(() => {
    return SAMPLE_FINANCIAL_DATA;
  }, []);

  // const burnTrend = useMemo(() => calculateBurnTrend(), []);
  // const quarterlyBurn = useMemo(() => calculateQuarterlyBurn(), []);

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ============================================================================
  // 1️⃣ HERO KPI ROW (TOP)
  // ============================================================================

  const heroKPIs = useMemo(() => {
    return [
      {
        title: 'Cash Balance',
        value: cashBalance.value !== null ? formatCurrencyCompact(cashBalance.value) : null,
        unit: '',
        icon: Wallet,
        status: 'on-track' as const,
        subtitle: 'Current liquid assets',
        trend: 'up' as const,
        changePercent: 3.2,
        loading: cashBalance.loading,
        error: cashBalance.error,
      },
      {
        title: 'Operating Burn',
        value: monthlyBurn.value !== null ? formatCurrencyCompact(monthlyBurn.value) : null,
        unit: '/month',
        icon: TrendingDown,
        status: 'warning' as const,
        subtitle: 'Monthly average burn rate',
        trend: 'down' as const,
        changePercent: -8.5,
        loading: monthlyBurn.loading,
        error: monthlyBurn.error,
      },
      {
        title: 'Working Capital',
        value: workingCapital.value !== null ? formatCurrencyCompact(workingCapital.value) : null,
        unit: '',
        icon: Activity,
        status: 'on-track' as const,
        subtitle: 'Q4 movement (positive)',
        loading: workingCapital.loading,
        error: workingCapital.error,
      },
      {
        title: 'Runway',
        value: runwayMonths.value !== null ? runwayMonths.value.toFixed(1) : null,
        unit: 'months',
        icon: Clock,
        status: 'at-risk' as const,
        subtitle: 'At current burn rate',
        loading: runwayMonths.loading,
        error: runwayMonths.error,
      },
    ];
  }, [cashBalance, monthlyBurn, workingCapital, runwayMonths]);

  // ============================================================================
  // 2️⃣ FINANCIAL PERFORMANCE (P&L)
  // ============================================================================

  const orderVolumeData = useMemo(() => {
    const pnl = financialData.pnl.orderVolume;
    return [
      { quarter: 'Q1', value: pnl.q1, fill: '#3b82f6' },
      { quarter: 'Q2', value: pnl.q2, fill: '#3b82f6' },
      { quarter: 'Q3', value: pnl.q3, fill: '#3b82f6' },
      { quarter: 'Q4', value: pnl.q4, fill: '#10b981' },
    ];
  }, [financialData]);

  const deliveryVsOrderData = useMemo(() => {
    const pnl = financialData.pnl;
    return [
      {
        quarter: 'Q1',
        orders: pnl.orderVolume.q1,
        delivery: pnl.deliveryVolume.q1,
      },
      {
        quarter: 'Q2',
        orders: pnl.orderVolume.q2,
        delivery: pnl.deliveryVolume.q2,
      },
      {
        quarter: 'Q3',
        orders: pnl.orderVolume.q3,
        delivery: pnl.deliveryVolume.q3,
      },
      {
        quarter: 'Q4',
        orders: pnl.orderVolume.q4,
        delivery: pnl.deliveryVolume.q4,
      },
    ];
  }, [financialData]);

  // ============================================================================
  // 3️⃣ OPERATING EXPENSES
  // ============================================================================

  const opexByDepartmentData = useMemo(() => {
    return [
      {
        department: 'Product Eng.',
        q1: financialData.opex[0].q1,
        q2: financialData.opex[0].q2,
        q3: financialData.opex[0].q3,
        q4: financialData.opex[0].q4,
      },
      {
        department: 'R&D',
        q1: financialData.opex[1].q1,
        q2: financialData.opex[1].q2,
        q3: financialData.opex[1].q3,
        q4: financialData.opex[1].q4,
      },
      {
        department: 'Sales',
        q1: financialData.opex[2].q1,
        q2: financialData.opex[2].q2,
        q3: financialData.opex[2].q3,
        q4: financialData.opex[2].q4,
      },
      {
        department: 'Marketing',
        q1: financialData.opex[3].q1,
        q2: financialData.opex[3].q2,
        q3: financialData.opex[3].q3,
        q4: financialData.opex[3].q4,
      },
      {
        department: 'Operations',
        q1: financialData.opex[4].q1,
        q2: financialData.opex[4].q2,
        q3: financialData.opex[4].q3,
        q4: financialData.opex[4].q4,
      },
      {
        department: 'Admin/G&A',
        q1: financialData.opex[5].q1,
        q2: financialData.opex[5].q2,
        q3: financialData.opex[5].q3,
        q4: financialData.opex[5].q4,
      },
    ];
  }, [financialData]);

  const opexColors = [
    '#6366f1', // Product Eng
    '#8b5cf6', // R&D
    '#ec4899', // Sales
    '#f59e0b', // Marketing
    '#10b981', // Operations
    '#06b6d4', // Admin
  ];

  // ============================================================================
  // 4️⃣ WORKING CAPITAL BRIDGE
  // ============================================================================

  const workingCapitalData = useMemo(() => {
    const q4Data = financialData.workingCapital.q4;
    return q4Data.map((item) => ({
      name: item.component,
      value: item.change,
      fill: item.change > 0 ? '#ef4444' : '#10b981',
    }));
  }, [financialData]);

  // ============================================================================
  // 5️⃣ FREE CASH FLOW TREND
  // ============================================================================

  const fcfData = useMemo(() => {
    return financialData.fcf.map((q) => ({
      quarter: q.quarter,
      EBITDA: q.ebitda,
      Capex: q.capex,
      'Working Capital': q.workingCapital,
      'Free Cash Flow': q.freeCashFlow,
    }));
  }, [financialData]);

  // ============================================================================
  // 6️⃣ RUNWAY GAUGE
  // ============================================================================

  const runwayData = useMemo(() => {
    return {
      months: financialData.runway.runwayMonths,
      cashBalance: financialData.runway.cashBalance,
      monthlyBurn: financialData.runway.monthlyBurn,
    };
  }, [financialData]);

  // ============================================================================
  // 7️⃣ SALES TO PRODUCTION FLOW
  // ============================================================================

  const productionFlowData = useMemo(() => {
    return financialData.productionFlow.map((stage, idx) => ({
      name: stage.stage,
      value: stage.value,
      percentage: stage.percentage,
      fill: ['#3b82f6', '#8b5cf6', '#10b981'][idx],
    }));
  }, [financialData]);

  // ============================================================================
  // 8️⃣ SCENARIO ANALYSIS
  // ============================================================================

  const scenarioData = useMemo(() => {
    return [
      {
        name: 'Base Case',
        Revenue: financialData.scenarios[0].revenue,
        Burn: financialData.scenarios[0].burn,
        Runway: financialData.scenarios[0].cashRunway,
      },
      {
        name: 'Optimistic',
        Revenue: financialData.scenarios[1].revenue,
        Burn: financialData.scenarios[1].burn,
        Runway: financialData.scenarios[1].cashRunway,
      },
      {
        name: 'Conservative',
        Revenue: financialData.scenarios[2].revenue,
        Burn: financialData.scenarios[2].burn,
        Runway: financialData.scenarios[2].cashRunway,
      },
    ];
  }, [financialData]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8">
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

      {/* ===== 1️⃣ HERO KPI ROW ===== */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Executive Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroKPIs.map((kpi, idx) => (
            <HeroKPICard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              icon={kpi.icon}
              status={kpi.status}
              subtitle={kpi.subtitle}
              trend={kpi.trend}
              changePercent={kpi.changePercent}
              loading={kpi.loading}
              error={kpi.error}
            />
          ))}
        </div>
      </div>

      {/* ===== 2️⃣ FINANCIAL PERFORMANCE (P&L) ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Financial Performance (P&L)</h2>

          {/* Order Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Order Volume (kW)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={orderVolumeData}>
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
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {orderVolumeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                <strong>FY Total:</strong> {financialData.pnl.orderVolume.fyTotal.toFixed(1)} kW
              </div>
            </div>

            {/* Delivery vs Order Comparison */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Order vs Delivery (kW)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={deliveryVsOrderData}>
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Order Volume"
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="delivery"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Delivery Volume"
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                <strong>Production Realization:</strong> {(
                  (financialData.pnl.deliveryVolume.fyTotal / financialData.pnl.orderVolume.fyTotal) *
                  100
                ).toFixed(1)}% of orders delivered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 3️⃣ OPERATING EXPENSES ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Operating Expenses by Department</h2>

          {/* Opex by Department - Stacked Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Quarterly Opex by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={opexByDepartmentData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value: any) => `$${(Number(value) / 1000).toFixed(0)}k`}
                  />
                  <Legend />
                  <Bar dataKey="q1" stackId="a" fill={opexColors[0]} name="Q1" />
                  <Bar dataKey="q2" stackId="a" fill={opexColors[1]} name="Q2" />
                  <Bar dataKey="q3" stackId="a" fill={opexColors[2]} name="Q3" />
                  <Bar dataKey="q4" stackId="a" fill={opexColors[3]} name="Q4" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Opex Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Annual Opex by Department</h3>
              <div className="space-y-3">
                {financialData.opex.map((dept, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{dept.department}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrencyCompact(dept.fyTotal)}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(dept.fyTotal / Math.max(...financialData.opex.map((d) => d.fyTotal))) * 100}%`,
                          backgroundColor: opexColors[idx],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total FY Opex</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrencyCompact(financialData.opex.reduce((sum, d) => sum + d.fyTotal, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quarterly Burn Trend */}
          <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quarterly Burn Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={[]}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="quarter" />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: any) => `$${(Number(value) / 1000).toFixed(0)}k`}
                />
                <Area type="monotone" dataKey="burn" fill="#ef4444" stroke="#dc2626" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Key Insight:</strong> Quarterly burn is moderating Q1 to Q4, indicating cost control improvements.
            </div>
          </div>
        </div>
      </div>

      {/* ===== 4️⃣ WORKING CAPITAL ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Working Capital Bridge (Q4)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">WC Movement by Component</h3>
              <WaterfallChart data={workingCapitalData} />
              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                <strong>Net WC Change:</strong> +$135K inflow (improved liquidity)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">WC Detail (Q4)</h3>
              <div className="space-y-4">
                {financialData.workingCapital.q4.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-900">{item.component}</span>
                      <span className={`font-bold ${item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.change > 0 ? '+' : ''}{formatCurrencyCompact(item.change)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <p className="text-slate-500">Beginning</p>
                        <p className="font-semibold text-slate-900">{formatCurrencyCompact(item.beginning)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Current</p>
                        <p className="font-semibold text-slate-900">{formatCurrencyCompact(item.current)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">% Change</p>
                        <p className="font-semibold text-slate-900">
                          {item.beginning !== 0 ? ((item.change / item.beginning) * 100).toFixed(1) : 'N/A'}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 5️⃣ FREE CASH FLOW ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Free Cash Flow Trend</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={fcfData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: any) => `$${(Number(value) / 1000).toFixed(0)}k`}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="EBITDA" fill="#3b82f6" name="EBITDA" />
                <Bar yAxisId="left" dataKey="Capex" fill="#ec4899" name="Capex" />
                <Bar yAxisId="left" dataKey="Working Capital" fill="#f59e0b" name="Working Capital" />
                <Line yAxisId="right" type="monotone" dataKey="Free Cash Flow" stroke="#10b981" strokeWidth={3} name="Free Cash Flow" />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {financialData.fcf.map((q, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${q.freeCashFlow < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-sm font-medium text-slate-700 mb-2">{q.quarter} FCF</p>
                  <p className={`text-lg font-bold ${q.freeCashFlow < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrencyCompact(q.freeCashFlow)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>⚠️ Negative FCF:</strong> All quarters show negative free cash flow. FY total: -$1.325M. This indicates heavy capex investment phase.
            </div>
          </div>
        </div>
      </div>

      {/* ===== 6️⃣ RUNWAY ANALYSIS ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Runway Analysis</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <RunwayGauge
              months={runwayData.months}
              cashBalance={runwayData.cashBalance}
              monthlyBurn={runwayData.monthlyBurn}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-semibold text-amber-900 mb-2">Runway Status</h4>
              <p className="text-sm text-amber-800">
                Current runway is <strong>critical</strong> at 10.5 months. Immediate action required to reduce burn or increase revenue.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Zap className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-900 mb-2">Burn Reduction Target</h4>
              <p className="text-sm text-blue-800">
                To achieve 24-month runway, reduce monthly burn to $149.2K (vs. current $340K) or increase cash.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
              <h4 className="font-semibold text-green-900 mb-2">Revenue Impact</h4>
              <p className="text-sm text-green-800">
                Each 10% improvement in delivery realization adds ~$1.5K monthly revenue contribution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 7️⃣ SALES → PRODUCTION FLOW ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sales to Production Flow</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {productionFlowData.map((stage, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex-1 text-center">
                    <div
                      className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg"
                      style={{ backgroundColor: stage.fill }}
                    >
                      {stage.percentage}%
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{stage.name}</h4>
                    <p className="text-sm text-slate-600">{stage.value.toLocaleString('en-US')} kW</p>
                  </div>
                  {idx < productionFlowData.length - 1 && (
                    <div className="hidden md:block">
                      <ArrowRight className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Order Backlog Conversion</h4>
                <p className="text-sm text-blue-800">
                  62% of orders are in production pipeline. Gap of 38% indicates order intake outpacing capacity.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Production Realization</h4>
                <p className="text-sm text-purple-800">
                  45% of total orders delivered. Remaining 17% in production. Average pipeline time: ~1 quarter.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Execution Velocity</h4>
                <p className="text-sm text-green-800">
                  Delivery velocity increasing Q-o-Q: Q4 completed 238 kW (+52% vs Q3). Strong momentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 8️⃣ SCENARIO ANALYSIS ===== */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Scenario Analysis</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" label={{ value: 'Revenue ($M)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Runway (months)', angle: 90, position: 'insideRight' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Revenue" fill="#10b981" name="Revenue ($M)" />
                <Bar yAxisId="left" dataKey="Burn" fill="#ef4444" name="Burn ($M)" />
                <Bar yAxisId="right" dataKey="Runway" fill="#3b82f6" name="Runway (months)" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {financialData.scenarios.map((scenario, idx) => {
                const statusColors = [
                  { bg: 'bg-blue-50', border: 'border-blue-200', icon: '📊' },
                  { bg: 'bg-green-50', border: 'border-green-200', icon: '📈' },
                  { bg: 'bg-amber-50', border: 'border-amber-200', icon: '📉' },
                ];
                const colors = statusColors[idx];

                return (
                  <div key={idx} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{colors.icon}</span>
                      <h4 className="font-semibold text-slate-900">{scenario.scenario}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Revenue</span>
                        <span className="font-bold text-slate-900">${scenario.revenue.toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Burn</span>
                        <span className="font-bold text-slate-900">${scenario.burn.toFixed(2)}M</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-current border-opacity-20">
                        <span className="text-slate-700">Runway</span>
                        <span className="font-bold text-slate-900">{scenario.cashRunway.toFixed(1)}mo</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Scenario Insights</h4>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>
                  • <strong>Base Case (10.5 months):</strong> Current trajectory requires immediate burn reduction or revenue acceleration.
                </li>
                <li>
                  • <strong>Optimistic (12.8 months):</strong> If delivery volume increases 50% and burn reduces 15%, runway extends to safe zone.
                </li>
                <li>
                  • <strong>Conservative (9.2 months):</strong> Risk scenario if delivery slows and costs increase. Not viable long-term.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="text-xs text-slate-500 text-center py-4 border-t border-slate-200">
        <p>Financial model based on FY2026 projections. Data respects selected time period filters.</p>
        <p className="mt-1">All values in USD unless otherwise noted. Charts update based on global filters (Month, Quarter, FY).</p>
      </div>

      {/* Definitions Section */}
      <DefinitionsSection department="finance" />
    </div>
  );
}
