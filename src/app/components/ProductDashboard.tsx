import React, { useState, useMemo } from 'react';
import {
  Activity,
  Zap,
  Droplet,
  Gauge,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from 'recharts';
import { useKPI } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { FilterStatusBadge } from './FilterStatusBadge';
import { DefinitionsSection } from './DefinitionsSection';

// ============================================================================
// HELPER: Hero KPI Component (Reused from other dashboards)
// ============================================================================
interface HeroKPIProps {
  title: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'on-track' | 'at-risk' | 'blocked' | 'in-progress' | 'exceeded';
  subtext?: string;
}

function HeroKPI({ title, value, target, unit = '', icon: Icon, status, subtext }: HeroKPIProps) {
  const statusStyles: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    'on-track': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
    'at-risk': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
    'blocked': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
    'in-progress': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-800' },
    'exceeded': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  };

  const badges: Record<string, string> = {
    'on-track': '✓ On Track',
    'at-risk': '⚠ At Risk',
    'blocked': '🔴 Blocked',
    'in-progress': '⏳ In Progress',
    'exceeded': '✨ Exceeded',
  };

  const style = statusStyles[status];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{title}</p>
        <Icon className={`w-5 h-5 ${style.text}`} />
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-600">{unit}</span>}
      </div>
      {target && <p className="text-xs text-slate-600 mb-3">vs {target} {unit}</p>}
      <div className={`${style.badge} text-xs font-semibold px-2 py-1 rounded w-fit`}>
        {badges[status]}
      </div>
      {subtext && <p className="text-xs text-slate-600 mt-2">{subtext}</p>}
    </div>
  );
}

// ============================================================================
// HELPER: RAG Band (Reused from other dashboards)
// ============================================================================
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

  return (
    <div className="space-y-3">
      {data.map((group) => (
        <div key={group.category}>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">{group.category}</h4>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item.label}
                className={`${statusClass(item.status)} text-xs font-medium px-3 py-1.5 rounded-full`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// HELPER: Tooltip
// ============================================================================
const renderTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md">
        <p className="text-sm font-medium text-slate-900">{item.name || item.payload?.name}</p>
        <p className="text-xs text-slate-600">
          {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ProductDashboard() {
  const { selectedMonths } = useKPI();
  const { getMonthDisplay, isCustomMode } = useDashboardFilter();
  const [primaryView, setPrimaryView] = useState<'PEM' | 'AEM'>('PEM');
  const [secondaryView, setSecondaryView] = useState<'performance' | 'delivery'>('performance');
  const [pemStackSize, setPemStackSize] = useState<'5kW' | '25kW' | '250kW'>('25kW');
  const [aemStackSize, setAemStackSize] = useState<'5kW' | '25kW'>('5kW');

  // ========================================================================
  // 🔵 PEM DATA BY STACK SIZE
  // ========================================================================

  // PEM 5kW - Development/Validation System
  const pem5kwData = {
    stackEfficiency: { current: 38, target: 45, unit: 'kWh/kg' },
    voltageEfficiency: { current: 88, target: 92, unit: '%' },
    degradation: { current: 0.2, target: 0.8, unit: '%', status: 'on-track' as const, subtext: '50 hrs test' },
    hydrogenPurity: { current: 99.99, target: 99.98, unit: '%', status: 'on-track' as const },
    operatingPressure: 'Not monitored at this scale',
    manufacturingNote: 'Pilot build state',
    performanceRadarData: [
      { metric: 'Efficiency', target: 45, actual: 38 },
      { metric: 'Voltage Eff.', target: 92, actual: 88 },
      { metric: 'Degradation', target: 0.8, actual: 0.2 },
      { metric: 'Purity', target: 99.98, actual: 99.99 },
    ],
  };

  // PEM 25kW - Primary Execution (Commercial Scale)
  const pem25kwData = {
    stackEfficiency: { current: 42, target: 48, unit: 'kWh/kg' },
    degradation: { current: 0, target: 0.5, unit: '%', status: 'on-track' as const },
    hydrogenPurity: { current: 99.999, target: 99.99, unit: '%', status: 'exceeded' as const },
    operatingPressure: { current: 15, target: 10, unit: 'bar', status: 'on-track' as const },
    performanceRadarData: [
      { metric: 'Efficiency', target: 48, actual: 42 },
      { metric: 'Voltage Eff.', target: 95, actual: 91 },
      { metric: 'Degradation', target: 0.5, actual: 0 },
      { metric: 'Purity', target: 99.99, actual: 99.999 },
      { metric: 'Pressure', target: 10, actual: 15 },
    ],
    manufacturingRamp: { built: 5, target: 11 },
    manufacturingYield: 100,
    costPerKw: 'Tracking in progress',
    deliveryTrendData: [
      { month: 'Jan', target: 1, actual: 0 },
      { month: 'Feb', target: 1, actual: 1 },
      { month: 'Mar', target: 2, actual: 2 },
      { month: 'Apr', target: 2, actual: 1 },
    ],
  };

  // PEM 250kW - Planned Platform (No Performance Data)
  const pem250kwData = {
    platformStatus: 'Planned / In Development',
    platformReadiness: [
      { name: 'Architecture freeze', progress: 100, status: 'on-track' as const },
      { name: 'BOM cost model', progress: 70, status: 'at-risk' as const },
      { name: 'Manufacturing process readiness', progress: 40, status: 'at-risk' as const },
    ],
  };

  // Dynamic PEM data based on stack size
  const getCurrentPemData = () => {
    if (pemStackSize === '5kW') return pem5kwData;
    if (pemStackSize === '250kW') return pem250kwData;
    return pem25kwData;
  };

  const pemData = getCurrentPemData();

  const pemRag = pemStackSize === '250kW' ? [] : [
    {
      category: '🟢 On Track',
      items: [
        { label: 'Degradation', status: 'on-track' as const },
        { label: 'Purity', status: 'on-track' as const },
        { label: pemStackSize === '5kW' ? 'Test establishment' : 'Architecture freeze', status: 'on-track' as const },
        { label: 'Manufacturing yield', status: 'on-track' as const },
      ],
    },
    {
      category: '🟡 At Risk',
      items: [
        { label: 'Efficiency gap', status: 'at-risk' as const },
        { label: pemStackSize === '5kW' ? 'Baseline collection' : 'BOM readiness', status: 'at-risk' as const },
      ],
    },
    {
      category: '⚪ Not Active',
      items: [{ label: pemStackSize === '5kW' ? 'Scale metrics not monitored' : 'Cost tracking update', status: 'blocked' as const }],
    },
  ];

  // ========================================================================
  // 🟣 AEM DATA BY STACK SIZE
  // ========================================================================

  // AEM 5kW - Technology Feasibility
  const aem5kwData = {
    stackEfficiency: { current: 65.75, target: 60, unit: 'kWh/kg', status: 'blocked' as const },
    currentDensity: { current: 0.7, target: 0.8, unit: 'A/cm²', status: 'at-risk' as const },
    operatingPressure: { current: 1, target: 5, unit: 'bar', status: 'blocked' as const },
    costPerKw: { current: 1126, target: 1000, unit: '$' },
    baselineTracker: [
      { name: 'Degradation protocol', status: 'not-established' as const },
      { name: 'Purity baseline', status: 'not-established' as const },
      { name: 'Yield baseline', status: 'not-established' as const },
    ],
  };

  // AEM 25kW - Scale-up Readiness
  const aem25kwData = {
    stackEfficiency: { current: 62, target: 55, unit: 'kWh/kg', status: 'blocked' as const },
    currentDensity: { current: 0.75, target: 0.9, unit: 'A/cm²', status: 'at-risk' as const },
    operatingPressure: { current: 3, target: 8, unit: 'bar', status: 'blocked' as const },
    costPerKw: { current: 950, target: 750, unit: '$' },
    performanceRadarData: [
      { metric: 'Efficiency', target: 55, actual: 62 },
      { metric: 'Current Dens.', target: 0.9, actual: 0.75 },
      { metric: 'Pressure', target: 8, actual: 3 },
    ],
  };

  const getCurrentAemData = () => {
    return aemStackSize === '5kW' ? aem5kwData : aem25kwData;
  };

  const aemData = getCurrentAemData();

  const aemRag = [
    {
      category: '🔴 Blocked',
      items: [
        { label: 'Efficiency above threshold', status: 'blocked' as const },
        { label: aemStackSize === '5kW' ? 'Operating pressure gap' : 'Pressure scale-up gap', status: 'blocked' as const },
        { label: 'Current density gap', status: 'blocked' as const },
      ],
    },
    {
      category: '🟡 At Risk',
      items: [{ label: 'Cost reduction path', status: 'at-risk' as const }],
    },
    {
      category: aemStackSize === '5kW' ? '⚪ Not Established' : '⚪ Scaling Challenge',
      items: [
        { label: aemStackSize === '5kW' ? 'Performance baselines' : 'Feasibility validation', status: 'strategic-gap' as const },
      ],
    },
  ];

  // ========================================================================
  // 🟠 DELIVERY & CUSTOMER OPS DATA
  // ========================================================================
  const deliveryData = {
    systemsDelivered: { current: 1, target: 11, status: 'in-progress' as const },
    onTimeDelivery: { current: 0, target: 90, status: 'blocked' as const },
    firstTimeAcceptance: { current: 100, target: 100, status: 'on-track' as const },
    cycleTime: { current: 60, target: 75, status: 'on-track' as const },
    issuesPerSystem: 1,
    criticalIssues: 1,
    mttr: { current: 3, target: 5, unit: 'days', status: 'on-track' as const },
    csat: 'Measurement not started',
    deliveryTrendData: [
      { month: 'Nov', target: 0, actual: 0 },
      { month: 'Dec', target: 1, actual: 0 },
      { month: 'Jan', target: 1, actual: 1 },
      { month: 'Feb', target: 1, actual: 0 },
      { month: 'Mar', target: 2, actual: 1 },
    ],
  };

  const deliveryRag = [
    {
      category: '🔴 Critical',
      items: [
        { label: 'On-time delivery (0%)', status: 'blocked' as const },
        { label: 'Critical issues present', status: 'blocked' as const },
      ],
    },
    {
      category: '🟡 Watch',
      items: [{ label: 'Delivery volume ramping', status: 'at-risk' as const }],
    },
    {
      category: '🟢 On Track',
      items: [
        { label: 'First-time acceptance', status: 'on-track' as const },
        { label: 'Cycle time improving', status: 'on-track' as const },
        { label: 'MTTR vs benchmark', status: 'on-track' as const },
      ],
    },
    {
      category: '⚪ Not Tracked',
      items: [{ label: 'CSAT (FY27 target)', status: 'strategic-gap' as const }],
    },
  ];

  // ========================================================================
  // RENDER PEM VIEW (handles 5kW, 25kW, 250kW stack sizes)
  // ========================================================================
  const renderPEMView = () => {
    if (pemStackSize === '250kW') {
      const pem250 = pem250kwData;
      // 250kW Platform Readiness Roadmap View
      return (
        <div className="space-y-6">
          {/* Platform Status Hero */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">250 kW Platform — Program Status</h3>
                <p className="text-slate-600">Planned next-generation scale with architecture & roadmap tracking</p>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-4 py-2 rounded-full">
                📋 Planned / In Development
              </div>
            </div>
          </div>

          {/* Platform Readiness Roadmap */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Development Roadmap</h3>
            <div className="space-y-4">
              {pem250.platformReadiness.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{item.name}</span>
                    <span className={`text-xs font-bold ${item.status === 'on-track' ? 'text-green-700' : 'text-yellow-700'}`}>
                      {item.progress}% {item.status === 'on-track' ? '✓' : '⚠'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.status === 'on-track' ? 'bg-blue-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-6 pt-6 border-t border-slate-200">
              💡 No performance data yet. This is a future product roadmap. Performance metrics will appear when development progresses to prototype testing.
            </p>
          </div>

          {/* Platform Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-3">Next Phase: Architecture Finalization</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Thermal management strategy</li>
                <li>✓ Stack scaling validation</li>
                <li>⏳ Supply chain mapping</li>
                <li>⏳ Manufacturing process design</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-3">Program Timeline</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Architecture Freeze: Q2 2026</li>
                <li>BOM Modeling: Q3 2026</li>
                <li>Prototype Build: Q4 2026</li>
                <li>Field Trial: Q1 2027</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // PEM 5kW or 25kW - Performance Data View
    const pemPerf = pemData as typeof pem5kwData | typeof pem25kwData;
    return (
      <div className="space-y-6">
        {/* Stack Size Context Label */}
        {pemStackSize === '5kW' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start justify-between">
            <div>
              <p className="font-medium text-yellow-900">🧪 Development & Validation System</p>
              <p className="text-sm text-yellow-800">Test conditions and baseline establishment phase</p>
            </div>
          </div>
        )}

        {/* Hero Row */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${pemStackSize === '5kW' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
          {typeof pemPerf.stackEfficiency === 'object' && 'current' in pemPerf.stackEfficiency ? (
            <>
              <HeroKPI
                title="Stack Efficiency"
                value={(pemPerf.stackEfficiency as any).current}
                target={(pemPerf.stackEfficiency as any).target}
                unit={(pemPerf.stackEfficiency as any).unit}
                icon={Zap}
                status={pemStackSize === '5kW' ? 'in-progress' : 'at-risk'}
                subtext={pemStackSize === '5kW' ? 'Baseline phase' : 'Trend: Jan → Feb stable'}
              />
              {pemStackSize === '25kW' && (
                <>
                  <HeroKPI
                    title="Degradation"
                    value={(pemPerf.degradation as any).current}
                    target={(pemPerf.degradation as any).target}
                    unit={(pemPerf.degradation as any).unit}
                    icon={TrendingDown}
                    status={(pemPerf.degradation as any).status}
                    subtext="300 hrs test duration"
                  />
                  <HeroKPI
                    title="Hydrogen Purity"
                    value="99.999%"
                    target="99.990%"
                    unit=""
                    icon={Droplet}
                    status="exceeded"
                    subtext="Exceeds spec"
                  />
                  <HeroKPI
                    title="Operating Pressure"
                    value={(pemPerf.operatingPressure as any).current}
                    target={(pemPerf.operatingPressure as any).target}
                    unit={(pemPerf.operatingPressure as any).unit}
                    icon={Gauge}
                    status="on-track"
                    subtext="Milestone achieved"
                  />
                </>
              )}
              {pemStackSize === '5kW' && (
                <>
                  <HeroKPI
                    title="Voltage Efficiency"
                    value="88%"
                    target="92%"
                    unit=""
                    icon={Activity}
                    status="in-progress"
                    subtext="Test baseline"
                  />
                  <HeroKPI
                    title="Hydrogen Purity"
                    value="99.99%"
                    target="99.98%"
                    unit=""
                    icon={Droplet}
                    status="on-track"
                    subtext="50 hrs test"
                  />
                </>
              )}
            </>
          ) : null}
        </div>

        {/* Performance Radar - Full Width (only for 5kW and 25kW) */}
        {'performanceRadarData' in pemPerf && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance vs Target</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(pemPerf.performanceRadarData as any)}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="metric" />
                <YAxis />
                <RechartsTooltip content={renderTooltip} />
                <Legend />
                <Bar dataKey="target" fill="#cbd5e1" name="Target" />
                <Bar dataKey="actual" fill={pemStackSize === '5kW' ? '#f59e0b' : '#10b981'} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Manufacturing & Metrics (25kW only) */}
        {pemStackSize === '25kW' && 'manufacturingRamp' in pemPerf && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Commercial Systems Built</h3>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-slate-900">{(pemPerf.manufacturingRamp as any).built}/{(pemPerf.manufacturingRamp as any).target}</div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${((pemPerf.manufacturingRamp as any).built / (pemPerf.manufacturingRamp as any).target) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">Production ramp progress</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Manufacturing Yield</h3>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-700">{(pemPerf.manufacturingYield as any)}%</div>
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded w-fit">
                  ✓ Quality Badge
                </div>
                <p className="text-xs text-slate-600">All units passed QC</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Cost per kW</h3>
              <div className="space-y-3">
                <div className="text-xl font-bold text-slate-600">{(pemPerf.costPerKw as any)}</div>
                <div className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded">
                  ⏳ Data collection ongoing
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pilot Build State (5kW) */}
        {pemStackSize === '5kW' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-bold text-amber-900 mb-3">Pilot Build State</h3>
            <p className="text-sm text-amber-800 mb-3">Scale-dependent metrics not monitored at this size:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white rounded p-3 border border-amber-100">
                <p className="text-xs text-slate-600">Commercial manufacturing scale</p>
                <p className="text-sm font-medium text-slate-900">Not tracked</p>
              </div>
              <div className="bg-white rounded p-3 border border-amber-100">
                <p className="text-xs text-slate-600">Production cycle time</p>
                <p className="text-sm font-medium text-slate-900">N/A</p>
              </div>
              <div className="bg-white rounded p-3 border border-amber-100">
                <p className="text-xs text-slate-600">Ramp readiness</p>
                <p className="text-sm font-medium text-slate-900">Planning phase</p>
              </div>
            </div>
          </div>
        )}

        {/* RAG Band */}
        {pemRag.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {pemStackSize === '5kW' ? '5 kW' : pemStackSize === '25kW' ? '25 kW' : '250 kW'} - Health Status
            </h3>
            <RAGBand data={pemRag} />
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // RENDER AEM VIEW (handles 5kW and 25kW stack sizes)
  // ========================================================================
  const renderAEMView = () => {
    return (
      <div className="space-y-6">
        {/* Stack Size Context Label */}
        {aemStackSize === '5kW' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start justify-between">
            <div>
              <p className="font-medium text-purple-900">🧬 Technology Feasibility Stage</p>
              <p className="text-sm text-purple-800">Baseline establishment for scale-up validation</p>
            </div>
          </div>
        )}
        {aemStackSize === '25kW' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start justify-between">
            <div>
              <p className="font-medium text-indigo-900">📈 Scale-up Readiness Phase</p>
              <p className="text-sm text-indigo-800">Feasibility validation at commercial scale</p>
            </div>
          </div>
        )}

        {/* Hero Row - Same 3 KPIs for both scales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HeroKPI
            title="Stack Efficiency"
            value={aemStackSize === '5kW' ? 65.75 : 68.5}
            target={aemStackSize === '5kW' ? 60 : 65}
            unit="%"
            icon={Zap}
            status={aemStackSize === '5kW' ? 'exceeded' : 'on-track'}
            subtext={aemStackSize === '5kW' ? 'Lab baseline' : 'Scale validation'}
          />
          <HeroKPI
            title="Density"
            value={aemStackSize === '5kW' ? 0.7 : 0.82}
            target={aemStackSize === '5kW' ? 0.8 : 0.85}
            unit="kg/L"
            icon={Gauge}
            status={aemStackSize === '5kW' ? 'at-risk' : 'on-track'}
            subtext={aemStackSize === '5kW' ? 'Needs improvement' : 'Acceptable range'}
          />
          <HeroKPI
            title="Pressure"
            value={aemStackSize === '5kW' ? 1 : 6}
            target={aemStackSize === '5kW' ? 5 : 8}
            unit="bar"
            icon={AlertTriangle}
            status="blocked"
            subtext={aemStackSize === '5kW' ? 'Major constraint' : 'Under monitoring'}
          />
        </div>

        {/* AEM 5kW - Baseline Tracker View */}
        {aemStackSize === '5kW' && (
          <>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Baseline Tracker - Parameters Not Established</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aemStackSize === '5kW' && Array.isArray((aemData as typeof aem5kwData).baselineTracker) ? (
                  (aemData as typeof aem5kwData).baselineTracker.map((item, idx) => (
                    <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <span className="text-purple-600 text-lg">📋</span>
                      </div>
                      <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded w-fit">
                        Not Established
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
              <p className="text-xs text-slate-600 mt-6 pt-6 border-t border-slate-200">
                💡 Technology maturation requires more cycles. These parameters will be established once 100+ operating hours are logged.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Lab-Scale Cost Reference</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-blue-900">$1,126</span>
                <span className="text-sm text-blue-700">per kW (reference only)</span>
              </div>
              <p className="text-sm text-blue-800">
                This is a lab-scale prototype cost. Production pricing will differ significantly once scale-up is validated.
              </p>
            </div>
          </>
        )}

        {/* AEM 25kW - Performance & Cost Scale-up View */}
        {aemStackSize === '25kW' && (
          <>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Radar - Scale-up Readiness</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aemStackSize === '25kW' && 'performanceRadarData' in aemData ? (aemData as typeof aem25kwData).performanceRadarData : []}>
                  <CartesianGrid stroke="#f1f5f9" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <RechartsTooltip content={renderTooltip} />
                  <Legend />
                  <Bar dataKey="target" fill="#cbd5e1" name="5kW Target" />
                  <Bar dataKey="actual" fill="#a855f7" name="25kW Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">Cost Reduction Pathway</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-xs text-indigo-700 mb-1">5kW Lab-Scale</p>
                  <p className="text-2xl font-bold text-indigo-900">$950/kW</p>
                </div>
                <div className="flex items-center justify-center h-1 flex-1 bg-gradient-to-r from-indigo-300 to-indigo-600 rounded">
                  <div className="-mx-2 bg-white px-2 py-1 rounded text-xs font-semibold text-indigo-700">21% ↓</div>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-indigo-700 mb-1">25kW Production Target</p>
                  <p className="text-2xl font-bold text-indigo-900">$750/kW</p>
                </div>
              </div>
              <p className="text-sm text-indigo-800">
                Reduction driven by: refined assembly process (-$120), bulk membrane sourcing (-$55), optimized BOP design (-$25).
              </p>
            </div>
          </>
        )}

        {/* RAG Band */}
        {aemRag.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {aemStackSize === '5kW' ? 'AEM 5 kW' : 'AEM 25 kW'} - Health Status
            </h3>
            <RAGBand data={aemRag} />
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // RENDER DELIVERY VIEW
  // ========================================================================
  const renderDeliveryView = () => (
    <div className="space-y-6">
      {/* Hero Row - Delivery Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroKPI
          title="Systems Delivered"
          value={`${deliveryData.systemsDelivered.current}/${deliveryData.systemsDelivered.target}`}
          unit=""
          icon={CheckCircle}
          status={deliveryData.systemsDelivered.status}
          subtext="Ramp starting"
        />
        <HeroKPI
          title="On-Time Delivery"
          value={deliveryData.onTimeDelivery.current}
          target={deliveryData.onTimeDelivery.target}
          unit="%"
          icon={AlertTriangle}
          status={deliveryData.onTimeDelivery.status}
          subtext="Critical KPI"
        />
        <HeroKPI
          title="First-Time Acceptance"
          value={deliveryData.firstTimeAcceptance.current}
          target={deliveryData.firstTimeAcceptance.target}
          unit="%"
          icon={CheckCircle2}
          status={deliveryData.firstTimeAcceptance.status}
          subtext="Quality baseline"
        />
        <HeroKPI
          title="Order → Delivery Cycle"
          value={deliveryData.cycleTime.current}
          target={deliveryData.cycleTime.target}
          unit="days"
          icon={Clock}
          status={deliveryData.cycleTime.status}
          subtext="Improving trend"
        />
      </div>

      {/* Delivery Trend - Full Width */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Delivery Performance Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={deliveryData.deliveryTrendData}>
            <CartesianGrid stroke="#f1f5f9" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip content={renderTooltip} />
            <Legend />
            <Bar dataKey="target" fill="#cbd5e1" name="Target" />
            <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Post-Delivery Reliability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Issues per System</h3>
          <div className="text-4xl font-bold text-red-600 mb-2">{deliveryData.issuesPerSystem}</div>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
            <strong>Issue Alert:</strong> 1 defect per system average
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Critical Issues</h3>
          <div className="text-4xl font-bold text-orange-600 mb-2">{deliveryData.criticalIssues}</div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
            <strong>Watch:</strong> 1 critical issue requiring tracking
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">MTTR vs Benchmark</h3>
          <div className="text-4xl font-bold text-green-600 mb-2">{deliveryData.mttr.current} days</div>
          <div className="text-xs text-slate-600 mb-2">vs {deliveryData.mttr.target} day benchmark</div>
          <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded w-fit">
            ✓ Improving
          </div>
        </div>
      </div>

      {/* Customer Experience Block */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Experience</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700">
            <strong>CSAT Score:</strong> Measurement not started
          </p>
          <p className="text-xs text-slate-600 mt-2">FY27 Target: CSAT ≥ 8.5/10</p>
        </div>
      </div>

      {/* RAG Band */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Delivery Health Status</h3>
        <RAGBand data={deliveryRag} />
      </div>
    </div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Scale-Up Control Tower</h2>
          <p className="text-slate-600">Stack performance, manufacturing readiness, platform development & delivery execution</p>
          {selectedMonths.length > 0 && (
            <div className="mt-2 text-sm text-slate-600">
              Viewing: {getMonthDisplay}
              {isCustomMode && <span className="ml-2 text-purple-600 font-medium">[Custom]</span>}
            </div>
          )}
        </div>
        <FilterStatusBadge variant="pill" />
      </div>

      {/* Primary Toggle: PEM | AEM | Delivery & Customer Ops */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Level 1: Technology */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Technology:</span>
            <button
              onClick={() => setPrimaryView('PEM')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                primaryView === 'PEM'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              PEM (TRL 8)
            </button>
            <button
              onClick={() => setPrimaryView('AEM')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                primaryView === 'AEM'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              AEM (TRL 6)
            </button>
          </div>

          {/* Level 2: Stack Size (Contextual) */}
          {primaryView !== 'PEM' || secondaryView === 'performance' ? (
            <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
              <span className="text-sm font-medium text-slate-600">Stack Size:</span>
              {primaryView === 'PEM' ? (
                <>
                  <button
                    onClick={() => setPemStackSize('5kW')}
                    className={`px-3 py-2 rounded font-medium text-xs transition-all ${
                      pemStackSize === '5kW'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    5 kW
                  </button>
                  <button
                    onClick={() => setPemStackSize('25kW')}
                    className={`px-3 py-2 rounded font-medium text-xs transition-all ${
                      pemStackSize === '25kW'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    25 kW
                  </button>
                  <button
                    onClick={() => setPemStackSize('250kW')}
                    className={`px-3 py-2 rounded font-medium text-xs transition-all ${
                      pemStackSize === '250kW'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    250 kW
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAemStackSize('5kW')}
                    className={`px-3 py-2 rounded font-medium text-xs transition-all ${
                      aemStackSize === '5kW'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    5 kW
                  </button>
                  <button
                    onClick={() => setAemStackSize('25kW')}
                    className={`px-3 py-2 rounded font-medium text-xs transition-all ${
                      aemStackSize === '25kW'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    25 kW
                  </button>
                </>
              )}
            </div>
          ) : null}

          {/* Level 1: Secondary View (Performance vs Delivery) */}
          <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
            <span className="text-sm font-medium text-slate-600">View:</span>
            <button
              onClick={() => setSecondaryView('performance')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                secondaryView === 'performance'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Performance
            </button>
            {primaryView === 'PEM' && (
              <button
                onClick={() => setSecondaryView('delivery')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  secondaryView === 'delivery'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Delivery & Ops
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Rendering */}
      {primaryView === 'PEM' ? (
        secondaryView === 'performance' ? (
          renderPEMView()
        ) : (
          renderDeliveryView()
        )
      ) : (
        renderAEMView()
      )}

      {/* Definitions Section */}
      {secondaryView === 'delivery' ? (
        <DefinitionsSection department="delivery" />
      ) : (
        <DefinitionsSection
          department="product"
          technology={primaryView.toLowerCase() as 'pem' | 'aem'}
          stack={(primaryView === 'PEM' ? pemStackSize : aemStackSize).toLowerCase() as '5kw' | '25kw' | '250kw'}
        />
      )}
    </div>
  );
}
