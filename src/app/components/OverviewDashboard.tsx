import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, Zap, AlertTriangle, CheckCircle2, DollarSign, Rocket, MapPin, TrendingDown, Fuel, Lightbulb } from 'lucide-react';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { FilterStatusBadge } from './FilterStatusBadge';

export default function OverviewDashboard() {
  const { selectedMonths } = useKPI();
  const { getMonthDisplay, isCustomMode } = useDashboardFilter();
  const [showLegend, setShowLegend] = useState(true);

  // ========================================================================
  // STRATEGIC OUTCOMES (Enhanced Goal Tracking)
  // ========================================================================
  const strategicOutcomes = [
    { 
      name: '20 MW Semi-Automated Line', 
      current: 65, 
      target: 100, 
      icon: Zap,
      status: 'on-track',
      metric: 'Production readiness %',
      delta: '+8%'
    },
    { 
      name: '250 kW Single Stack', 
      current: 78, 
      target: 100, 
      icon: Target,
      status: 'on-track',
      metric: 'Platform maturity %',
      delta: '+5%'
    },
    { 
      name: '$2.5M Revenue', 
      current: 42, 
      target: 100, 
      icon: DollarSign,
      status: 'at-risk',
      metric: 'Pipeline coverage ratio',
      delta: '-3%'
    },
    { 
      name: 'Market Expansion', 
      current: 55, 
      target: 100, 
      icon: MapPin,
      status: 'in-progress',
      metric: '2 / 5 active regions',
      delta: '+1'
    },
  ];

  // ========================================================================
  // COMPANY PERFORMANCE SNAPSHOT (Hero KPIs)
  // ========================================================================
  const performanceKPIs = [
    {
      title: 'Revenue vs Target',
      value: '$2.1M',
      target: '$2.5M',
      unit: '',
      status: 'at-risk',
      delta: '-16%',
      icon: DollarSign,
    },
    {
      title: 'Cash Runway',
      value: '14',
      target: '18',
      unit: 'months',
      status: 'on-track',
      delta: 'Stable',
      icon: Fuel,
    },
    {
      title: 'Systems Delivered',
      value: '3',
      target: '5',
      unit: 'of Q4 plan',
      status: 'in-progress',
      delta: '+1 pending',
      icon: Rocket,
    },
    {
      title: 'Qualified Pipeline',
      value: '$8.2M',
      target: '$10M',
      unit: 'ARR potential',
      status: 'on-track',
      delta: '+$1.3M MoM',
      icon: Target,
    },
  ];

  // ========================================================================
  // KPI HEALTH DATA (Enhanced with sorting)
  // ========================================================================
  const kpiHealthDataRaw = [
    { department: 'Product', onTrack: 8, atRisk: 2, behind: 1, total: 11 },
    { department: 'Sales', onTrack: 6, atRisk: 3, behind: 1, total: 10 },
    { department: 'Operations', onTrack: 5, atRisk: 2, behind: 1, total: 8 },
    { department: 'Marketing', onTrack: 7, atRisk: 0, behind: 0, total: 7 },
    { department: 'R&D', onTrack: 4, atRisk: 2, behind: 0, total: 6 },
    { department: 'Finance', onTrack: 5, atRisk: 1, behind: 0, total: 6 },
  ];
  
  // Sort by risk (highest risk first)
  const kpiHealthData = [...kpiHealthDataRaw].sort((a, b) => {
    const riskA = (a.behind * 3) + (a.atRisk * 1.5);
    const riskB = (b.behind * 3) + (b.atRisk * 1.5);
    return riskB - riskA;
  });

  const kpiHealthStats = {
    total: kpiHealthData.reduce((sum, d) => sum + d.total, 0),
    onTrack: kpiHealthData.reduce((sum, d) => sum + d.onTrack, 0),
    atRisk: kpiHealthData.reduce((sum, d) => sum + d.atRisk, 0),
    behind: kpiHealthData.reduce((sum, d) => sum + d.behind, 0),
  };

  // ========================================================================
  // CAPITAL DEPLOYMENT (Enhanced)
  // ========================================================================
  const fundAllocationData = [
    { name: 'Assembly Line CAPEX', value: 1500000, percentage: 25 },
    { name: 'Product R&D and Patents', value: 1500000, percentage: 25 },
    { name: 'Sales and Marketing', value: 900000, percentage: 15 },
    { name: 'Product Testing and Certification', value: 600000, percentage: 10 },
    { name: 'G&A', value: 700000, percentage: 11.7 },
    { name: 'Working Capital', value: 800000, percentage: 13.3 },
  ];

  const capitalMetrics = {
    totalBudget: 6000000,
    spent: 4200000,
    remaining: 1800000,
    burnRate: 450000, // per month
    runwayMonths: 14,
  };

  // ========================================================================
  // PRODUCT DATA (Enhanced Goals)
  // ========================================================================

  const COLORS = {
    teal: '#14b8a6',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    slate: '#e2e8f0',
    blue: '#3b82f6',
    emerald: '#10b981',
    red: '#ef4444',
  };

  const FUND_COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const statusColors = {
    'on-track': '#10b981',
    'at-risk': '#f59e0b',
    'blocked': '#ef4444',
    'in-progress': '#3b82f6',
    'exceeded': '#8b5cf6',
  };

  // ========================================================================
  // RENDER FUNCTIONS
  // ========================================================================

  // 1. STRATEGIC OUTCOMES
  const renderStrategicOutcomes = () => (
    <div className="grid grid-cols-4 gap-4">
      {strategicOutcomes.map((outcome, idx) => (
        <div key={idx} className="bg-white rounded-lg p-5 border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3 mb-3">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" 
              style={{ backgroundColor: statusColors[outcome.status as keyof typeof statusColors] + '15' }}
            >
              <outcome.icon className="w-5 h-5" style={{ color: statusColors[outcome.status as keyof typeof statusColors] }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-600">{outcome.name}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-slate-900">{outcome.current}%</span>
              <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: statusColors[outcome.status as keyof typeof statusColors] + '20', color: statusColors[outcome.status as keyof typeof statusColors] }}>
                {outcome.status === 'on-track' ? '✓ On Track' : outcome.status === 'at-risk' ? '⚠ At Risk' : '⏳ In Progress'}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(outcome.current, 100)}%`,
                  backgroundColor: statusColors[outcome.status as keyof typeof statusColors]
                }}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-600 mb-1">{outcome.metric}</p>
            <p className="text-sm font-medium text-slate-900">{outcome.delta}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // 2. COMPANY PERFORMANCE SNAPSHOT
  const renderPerformanceSnapshot = () => (
    <div className="grid grid-cols-4 gap-4">
      {performanceKPIs.map((kpi, idx) => (
        <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: statusColors[kpi.status as keyof typeof statusColors] + '15' }}
            >
              <kpi.icon className="w-4 h-4" style={{ color: statusColors[kpi.status as keyof typeof statusColors] }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Target: {kpi.target} {kpi.unit}</span>
            <span className={`font-semibold ${kpi.status === 'on-track' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {kpi.delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // 3. KPI HEALTH STATUS (Enhanced)
  const renderKPIHealth = () => (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Summary Strip */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900">{kpiHealthStats.total}</p>
          <p className="text-xs text-slate-600">Total KPIs</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-600">{kpiHealthStats.onTrack}</p>
          <p className="text-xs text-slate-600">On Track ✓</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600">{kpiHealthStats.atRisk}</p>
          <p className="text-xs text-slate-600">At Risk ⚠</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600">{kpiHealthStats.behind}</p>
          <p className="text-xs text-slate-600">Behind ✕</p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Department Health (Risk-Sorted)</h3>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={kpiHealthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="department" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey="onTrack" stackId="a" fill={COLORS.emerald} name="On Track" radius={[4, 4, 0, 0]} />
            <Bar dataKey="atRisk" stackId="a" fill={COLORS.amber} name="At Risk" radius={[4, 4, 0, 0]} />
            <Bar dataKey="behind" stackId="a" fill={COLORS.red} name="Behind" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPI Count Labels on Bars */}
      <div className="grid grid-cols-6 gap-2">
        {kpiHealthData.map((dept, idx) => (
          <div key={idx} className="text-center p-2 bg-slate-50 rounded text-xs">
            <p className="font-semibold text-slate-900">{dept.department}</p>
            <p className="text-slate-600">{dept.total} KPIs</p>
          </div>
        ))}
      </div>
    </div>
  );

  // 5. CAPITAL DEPLOYMENT (Enhanced)
  const renderCapitalDeployment = () => (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-6">Capital Efficiency & Deployment</h3>
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Donut Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={fundAllocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {fundAllocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUND_COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {fundAllocationData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: FUND_COLORS[index] }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-bold text-slate-900">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Burn vs Plan + Runway */}
        <div className="space-y-6">
          {/* Burn vs Plan */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">Burn Rate vs Plan</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Monthly Burn</span>
                  <span className="font-bold text-slate-900">${(capitalMetrics.burnRate / 1000000).toFixed(2)}M</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '70%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Budget Utilized</span>
                  <span className="font-bold text-slate-900">{Math.round((capitalMetrics.spent / capitalMetrics.totalBudget) * 100)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500" 
                    style={{ width: `${(capitalMetrics.spent / capitalMetrics.totalBudget) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Runway Gauge */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-900">Liquidity Runway</p>
              <p className="text-2xl font-bold text-emerald-700">{capitalMetrics.runwayMonths}</p>
            </div>
            <p className="text-xs text-slate-600">months at current burn rate</p>
            <div className="h-2 bg-emerald-200 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${Math.min((capitalMetrics.runwayMonths / 24) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Remaining Budget */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Remaining Budget</p>
            <p className="text-2xl font-bold text-slate-900">${(capitalMetrics.remaining / 1000000).toFixed(2)}M</p>
          </div>
        </div>
      </div>
    </div>
  );



  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Company Command Center</h2>
          <p className="text-slate-600">Real-time strategic performance dashboard</p>
          {selectedMonths.length > 0 && (
            <div className="mt-2 text-sm text-slate-600">
              Viewing data for: {getMonthDisplay}
              {isCustomMode && <span className="ml-2 text-purple-600 font-medium">[Custom Selection]</span>}
            </div>
          )}
        </div>
        <FilterStatusBadge variant="pill" />
      </div>

      {/* 1. STRATEGIC OUTCOMES */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600" />
          Strategic Outcomes (12-18 Months)
        </h3>
        {renderStrategicOutcomes()}
      </div>

      {/* 2. COMPANY PERFORMANCE SNAPSHOT */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Company Performance Snapshot
        </h3>
        {renderPerformanceSnapshot()}
      </div>

      {/* 3. KPI HEALTH STATUS */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          KPI Health Status
        </h3>
        {renderKPIHealth()}
      </div>

      {/* 5. CAPITAL DEPLOYMENT */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          Capital Efficiency & Deployment
        </h3>
        {renderCapitalDeployment()}
      </div>

      {/* FOOTER */}
      <div className="border-t border-slate-200 pt-6 text-xs text-slate-500 text-center">
        <p>Last updated: {new Date().toLocaleDateString()} • Next update: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
    </div>
  );
}