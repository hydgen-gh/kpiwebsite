import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, Zap, AlertTriangle, CheckCircle2, DollarSign, Rocket, MapPin } from 'lucide-react';

export default function OverviewDashboard() {
  // Product Development Progress Data
  const productProgressData = [
    { name: 'Completed', value: 72 },
    { name: 'Remaining', value: 28 },
  ];

  // Marketing Impact Data
  const marketingTrendData = [
    { month: 'Oct', contribution: 850000 },
    { month: 'Nov', contribution: 1200000 },
    { month: 'Dec', contribution: 1650000 },
  ];

  // Company-wide KPI Health
  const kpiHealthData = [
    { department: 'Product', onTrack: 8, atRisk: 2 },
    { department: 'Sales', onTrack: 6, atRisk: 1 },
    { department: 'Marketing', onTrack: 7, atRisk: 0 },
    { department: 'Operations', onTrack: 5, atRisk: 2 },
  ];

  // Fund Allocation Data
  const fundAllocationData = [
    { name: 'Assembly Line CAPEX', value: 1500000, percentage: 25 },
    { name: 'Product R&D and Patents', value: 1500000, percentage: 25 },
    { name: 'Sales and Marketing', value: 900000, percentage: 15 },
    { name: 'Product Testing and Certification', value: 600000, percentage: 10 },
    { name: 'G&A', value: 700000, percentage: 11.7 },
    { name: 'Working Capital', value: 800000, percentage: 13.3 },
  ];

  // 12-18 Month Goals Progress
  const goals = [
    { name: '20 MW Semi-Automated Line', current: 65, target: 100, icon: Zap },
    { name: '250 kW Single Stack', current: 78, target: 100, icon: Target },
    { name: '$2.5M Projected Revenue', current: 42, target: 100, icon: DollarSign },
    { name: 'Expand Market to More Geographies', current: 55, target: 100, icon: MapPin },
  ];

  const COLORS = {
    teal: '#14b8a6',
    cyan: '#06b6d4',
    amber: '#f59e0b',
    slate: '#e2e8f0',
    blue: '#3b82f6',
    emerald: '#10b981',
  };

  const FUND_COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Executive Overview</h2>
        <p className="text-slate-600">Company-wide performance snapshot for Q4 2025</p>
      </div>

      {/* Finance Section */}
      <div className="bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-2xl p-6 border border-teal-200/30">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Current Raise: $4M USD, Pre-Series A Round</h3>
        </div>

        {/* Key Outcomes with Trackers */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-4">Key Outcomes (Next 12–18 Months)</h4>
          <div className="grid grid-cols-2 gap-6">
            {goals.map((goal, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-md border border-slate-100">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <goal.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{goal.name}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-teal-600">{goal.current}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${goal.current}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fund Allocation */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-slate-100">
          <h4 className="text-sm font-medium text-slate-700 mb-4">Fund Allocation</h4>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="45%" height={200}>
              <PieChart>
                <Pie
                  data={fundAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {fundAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FUND_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 text-xs">
              {fundAllocationData.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0 mt-0.5" 
                    style={{ backgroundColor: FUND_COLORS[index] }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Large KPI Cards with Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Product Development Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Product Development</p>
              <p className="text-3xl font-bold text-slate-900">72%</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-teal-600 font-medium">+12% vs Q3</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={productProgressData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                <Cell fill={COLORS.teal} />
                <Cell fill={COLORS.slate} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-500">Milestones Completed</span>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Sales Performance</p>
              <p className="text-3xl font-bold text-slate-900">$4.2M</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-sm text-slate-600">Target: $5.0M</div>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="flex items-center justify-center h-[120px]">
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#salesGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.84} ${2 * Math.PI * 50}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="salesGradient">
                    <stop offset="0%" stopColor={COLORS.cyan} />
                    <stop offset="100%" stopColor={COLORS.blue} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">84%</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-500">84% of Target Achieved</span>
          </div>
        </div>

        {/* Marketing Impact */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Marketing Presence</p>
              <p className="text-3xl font-bold text-slate-900">+165K traffic</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-teal-600 font-medium">+0.45M outreach MoM</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={marketingTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="contribution" stroke={COLORS.teal} strokeWidth={3} dot={{ fill: COLORS.teal, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-500">Customer Reach</span>
          </div>
        </div>
      </div>

      {/* KPI Health Status */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 mb-1">KPI Health Status</h3>
          <p className="text-sm text-slate-600">Department-wise metric tracking</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={kpiHealthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="department" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="onTrack" stackId="a" fill={COLORS.teal} name="On Track" radius={[4, 4, 0, 0]} />
            <Bar dataKey="atRisk" stackId="a" fill={COLORS.amber} name="At Risk" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">26 KPIs</p>
              <p className="text-xs text-slate-500">On Track</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">5 KPIs</p>
              <p className="text-xs text-slate-500">At Risk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}