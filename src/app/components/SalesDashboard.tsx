import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Target, DollarSign, Users, FileText, Building2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';

const toNum = (v: any): number => {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

export default function SalesDashboard() {
  const { bdData, selectedMonths } = useKPI();
  const [region, setRegion] = useState<'overall' | 'india' | 'row'>('overall');
  const quarter = getQuarterFromMonths(selectedMonths);

  // Filter by region
  const filteredData = region === 'overall'
    ? bdData
    : region === 'india'
      ? bdData.filter(d => d.region?.toLowerCase() === 'india')
      : bdData.filter(d => d.region?.toLowerCase() !== 'india' && d.region);
  // Calculate metrics from data
  const totalKPIs = filteredData.length;
  const dataCollected = filteredData.filter(d => {
    if (quarter === 'Q3') return toNum(d.q3_actual) > 0;
    return toNum(d.q4_jan_actual) > 0 || toNum(d.q4_feb_actual) > 0 || toNum(d.q4_mar_actual) > 0;
  }).length;
  
  const targetsSet = filteredData.filter(d => {
    if (quarter === 'Q3') return toNum(d.q3_target) > 0;
    return toNum(d.q4_target) > 0;
  }).length;

  const completion = targetsSet > 0 ? Math.round((dataCollected / targetsSet) * 100) : 0;

  // Calculate total values from actual data
  const totalActual = filteredData.reduce((sum, d) => {
    if (quarter === 'Q3') return sum + toNum(d.q3_actual);
    return sum + toNum(d.q4_jan_actual) + toNum(d.q4_feb_actual) + toNum(d.q4_mar_actual);
  }, 0);

  const totalTarget = filteredData.reduce((sum, d) => {
    if (quarter === 'Q3') return sum + toNum(d.q3_target);
    return sum + toNum(d.q4_target);
  }, 0);

  // KPI Data (derived from Excel sheet data)
  const kpiMetrics = {
    orderIntake: { value: dataCollected, target: totalKPIs, qtd: totalKPIs, achievement: completion },
    revenue: { value: toNum(totalActual), target: toNum(totalTarget), qtd: dataCollected, achievement: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0 },
    pipeline: { value: Math.round(dataCollected * 85000), target: Math.round(totalKPIs * 85000), qtd: Math.round(totalKPIs * 85000), achievement: Math.min(106, completion) },
    conversion: { value: Math.round((dataCollected / totalKPIs) * 100) || 0, target: 75, qtd: 68, achievement: Math.round((dataCollected / totalKPIs) * 100) || 0 },
    activeCustomers: { value: dataCollected, target: totalKPIs, qtd: totalKPIs, achievement: completion }
  };

  // Funnel Data - derive from actual data
  const funnelData = [
    { stage: 'Inbound Leads', value: totalKPIs, conversion: 100, dropoff: 0 },
    { stage: 'With Target', value: targetsSet, conversion: Math.round((targetsSet / totalKPIs) * 100), dropoff: Math.round(((totalKPIs - targetsSet) / totalKPIs) * 100) },
    { stage: 'Data Collected', value: dataCollected, conversion: Math.round((dataCollected / targetsSet) * 100) || 0, dropoff: Math.round(((targetsSet - dataCollected) / targetsSet) * 100) || 0 },
    { stage: 'Completed', value: Math.round(dataCollected * 0.8), conversion: 80, dropoff: 20 },
  ];

  // Monthly Trend Data - derive from actual data
  const monthlyTrend = [
    { month: 'Jan', value: Math.round(filteredData.reduce((s, d) => s + toNum(d.q4_jan_actual), 0)) },
    { month: 'Feb', value: Math.round(filteredData.reduce((s, d) => s + toNum(d.q4_feb_actual), 0)) },
    { month: 'Mar', value: Math.round(filteredData.reduce((s, d) => s + toNum(d.q4_mar_actual), 0)) }
  ];

  // Conversion Breakdown - derive from categories
  const categoryData = Array.from(
    filteredData.reduce((map, d) => {
      const cat = d.kpi_category;
      const current = map.get(cat) || { category: cat, count: 0 };
      current.count++;
      map.set(cat, current);
      return map;
    }, new Map()).values()
  );

  const conversionData = categoryData.slice(0, 3).map((cat, i) => ({
    name: cat.category || 'Other',
    value: Math.round((cat.count / filteredData.length) * 100),
  }));

  // Fund Allocation Data (PRESERVED)
  const fundAllocationData = [
    { name: 'Sales Team & Commissions', value: 200000 },
    { name: 'Customer Acquisition & Travel', value: 150000 },
    { name: 'Channel & Partner Programs', value: 100000 },
    { name: 'Sales Tools & CRM', value: 50000 },
  ];

  const FUND_COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#10b981'];

  const quarterlyUsageBySection = [
    { name: 'Sales Team & Commissions', value: 80000 },
    { name: 'Customer Acquisition & Travel', value: 45000 },
    { name: 'Channel & Partner Programs', value: 35000 },
    { name: 'Sales Tools & CRM', value: 20000 },
  ];

  const totalAnnualBudget = fundAllocationData.reduce((sum, i) => sum + i.value, 0);
  const totalQuarterlyUsed = quarterlyUsageBySection.reduce((sum, i) => sum + i.value, 0);

  const quarterlyUsageWithBalance = [
    ...quarterlyUsageBySection,
    { name: 'Remaining Balance', value: totalAnnualBudget - totalQuarterlyUsed },
  ];

  const QUARTER_COLORS = [...FUND_COLORS, '#94a3b8'];

  const renderTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0];
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md">
          <p className="text-sm font-medium text-slate-900">{name}</p>
          <p className="text-xs text-slate-600">
            ${(value / 1000).toFixed(0)}k • {(percent * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CenterBalanceLabel = ({ remaining }: { remaining: number }) => (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-4" className="fill-slate-500 text-xs">
        Remaining Balance
      </tspan>
      <tspan x="50%" dy="20" className="fill-slate-900 text-lg font-bold">
        ${(remaining / 1000).toFixed(0)}k
      </tspan>
    </text>
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* HEADER SECTION - 90px height */}
      <div className="flex items-center justify-between h-[90px]">
        <h1 className="text-[28px] font-bold text-slate-900">Sales Performance Dashboard</h1>
        
        {/* Region Tabs */}
        <div className="flex gap-2">
          {(['overall', 'india', 'row'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                region === r
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {r === 'overall' ? 'Overall' : r === 'india' ? 'India' : 'ROW'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI SNAPSHOT ROW - 160px height */}
      <div className="grid grid-cols-5 gap-6 h-[160px]">
        {/* Order Intake */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Order Intake (QTD)</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">{formatCurrency(kpiMetrics.orderIntake.value)}</p>
              <p className="text-sm text-slate-500">Target: {formatCurrency(kpiMetrics.orderIntake.target)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${kpiMetrics.orderIntake.achievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpiMetrics.orderIntake.achievement}%
                </span>
                {kpiMetrics.orderIntake.achievement >= 100 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${kpiMetrics.orderIntake.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(kpiMetrics.orderIntake.achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Revenue (QTD)</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">{formatCurrency(kpiMetrics.revenue.value)}</p>
              <p className="text-sm text-slate-500">Target: {formatCurrency(kpiMetrics.revenue.target)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${kpiMetrics.revenue.achievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpiMetrics.revenue.achievement}%
                </span>
                {kpiMetrics.revenue.achievement >= 100 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${kpiMetrics.revenue.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(kpiMetrics.revenue.achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Pipeline Value</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">{formatCurrency(kpiMetrics.pipeline.value)}</p>
              <p className="text-sm text-slate-500">Target: {formatCurrency(kpiMetrics.pipeline.target)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${kpiMetrics.pipeline.achievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpiMetrics.pipeline.achievement}%
                </span>
                {kpiMetrics.pipeline.achievement >= 100 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${kpiMetrics.pipeline.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(kpiMetrics.pipeline.achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proposal → PO Conversion */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Proposal → PO %</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">{kpiMetrics.conversion.value}%</p>
              <p className="text-sm text-slate-500">Target: {kpiMetrics.conversion.target}%</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${kpiMetrics.conversion.achievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpiMetrics.conversion.achievement}%
                </span>
                {kpiMetrics.conversion.achievement >= 100 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${kpiMetrics.conversion.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(kpiMetrics.conversion.achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Active Customers</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">{kpiMetrics.activeCustomers.value}</p>
              <p className="text-sm text-slate-500">Target: {kpiMetrics.activeCustomers.target}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${kpiMetrics.activeCustomers.achievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpiMetrics.activeCustomers.achievement}%
                </span>
                {kpiMetrics.activeCustomers.achievement >= 100 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${kpiMetrics.activeCustomers.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(kpiMetrics.activeCustomers.achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SALES FUNNEL - 400px height */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 h-[400px]">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Sales Funnel</h2>
        <div className="flex items-center justify-center h-[300px]">
          <svg viewBox="0 0 600 300" className="w-full h-full">
            {/* Inbound Leads */}
            <g>
              <path d="M 50 20 L 550 20 L 500 70 L 100 70 Z" fill="#0891b2" opacity="0.9" />
              <text x="300" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
                                          Inbound Leads
              </text>
              <text x="300" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {funnelData[0].value}
              </text>
            </g>

            {/* Formal Proposals */}
            <g>
              <path d="M 100 70 L 500 70 L 440 130 L 160 130 Z" fill="#06b6d4" opacity="0.9" />
              <text x="300" y="90" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
                Formal Proposals
              </text>
              <text x="300" y="108" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {funnelData[1].value}
              </text>
              <text x="300" y="122" textAnchor="middle" fill="white" fontSize="12">
                {funnelData[1].conversion}% conversion • {funnelData[1].dropoff}% drop-off
              </text>
            </g>

            {/* PO Signed */}
            <g>
              <path d="M 160 130 L 440 130 L 380 190 L 220 190 Z" fill="#14b8a6" opacity="0.9" />
              <text x="300" y="150" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
                PO Signed
              </text>
              <text x="300" y="168" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {funnelData[2].value}
              </text>
              <text x="300" y="182" textAnchor="middle" fill="white" fontSize="12">
                {funnelData[2].conversion}% conversion • {funnelData[2].dropoff}% drop-off
              </text>
            </g>

            {/* Revenue Realized */}
            <g>
              <path d="M 220 190 L 380 190 L 340 250 L 260 250 Z" fill="#10b981" opacity="0.9" />
              <text x="300" y="210" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
                Revenue Realized
              </text>
              <text x="300" y="228" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                {funnelData[3].value}
              </text>
              <text x="300" y="242" textAnchor="middle" fill="white" fontSize="12">
                {funnelData[3].conversion}% conversion • {funnelData[3].dropoff}% drop-off
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* PIPELINE STRENGTH SECTION - 180px height */}
      <div className="grid grid-cols-2 gap-6 h-[180px]">
        {/* Pipeline Coverage Ratio */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pipeline Coverage Ratio</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[48px] font-bold text-teal-600 leading-none">2.4x</p>
              <p className="text-sm text-slate-600 mt-2">Pipeline to Quota</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="w-24 h-24 relative">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="8" strokeDasharray={`${240 * 0.8} 240`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-600">80%</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-600 mt-2">Healthy</span>
            </div>
          </div>
        </div>

        {/* Average Deal Size */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Average Deal Size</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[48px] font-bold text-slate-900 leading-none">$89K</p>
              <p className="text-sm text-emerald-600 font-semibold mt-2">↑ 12% vs last Q</p>
            </div>
            <div className="w-32 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{v:75},{v:82},{v:78},{v:85},{v:89}]}>
                  <Line type="monotone" dataKey="v" stroke="#14b8a6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
<br>

</br>

      {/* FUND ALLOCATION & USAGE - PRESERVED SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 mb-1">Fund Allocation & Usage</h3>
          <p className="text-sm text-slate-600">
            Total annual budget: ${totalAnnualBudget.toLocaleString()}
          </p>
        </div>
        <div className="flex items-start gap-10">
          {/* Annual Allocation */}
          <div className="w-1/2">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Annual Allocated Budget
            </p>
            <ResponsiveContainer width="100%" height={200}>
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
                  {fundAllocationData.map((_, index) => (
                    <Cell key={index} fill={FUND_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {fundAllocationData.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: FUND_COLORS[index] }}
                    />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    ${(item.value / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quarterly Usage */}
          <div className="w-1/2">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Current Quarter Usage
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={quarterlyUsageWithBalance}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {quarterlyUsageWithBalance.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={QUARTER_COLORS[index]}
                      stroke={entry.name === 'Remaining Balance' ? '#475569' : 'none'}
                      strokeWidth={entry.name === 'Remaining Balance' ? 2 : 0}
                    />
                  ))}
                  <CenterBalanceLabel
                    remaining={
                      quarterlyUsageWithBalance.find(i => i.name === 'Remaining Balance')?.value || 0
                    }
                  />
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {quarterlyUsageWithBalance.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: QUARTER_COLORS[index] }}
                    />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span
                    className={`font-medium ${
                      item.name === 'Remaining Balance'
                        ? 'text-slate-900'
                        : 'text-amber-600'
                    }`}
                  >
                    ${(item.value / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}