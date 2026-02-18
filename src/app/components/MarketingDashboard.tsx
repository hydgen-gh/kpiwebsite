import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Globe,
  Newspaper,
  Calendar,
} from 'lucide-react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';

const toNum = (v: any): number => {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

export default function MarketingDashboard() {
  const { marketingData, selectedMonths } = useKPI();
  const quarter = getQuarterFromMonths(selectedMonths);

  // Use all marketing data
  const filteredData = marketingData;
  

  /* ================= KPI DATA ================= */

 const CenterBalanceLabel = ({ remaining }: { remaining: number }) => (
  <text
    x="50%"
    y="50%"
    textAnchor="middle"
    dominantBaseline="middle"
  >
    <tspan
      x="50%"
      dy="-4"
      className="fill-slate-500 text-xs"
    >
      Remaining Balance
    </tspan>
    <tspan
      x="50%"
      dy="20"
      className="fill-slate-900 text-lg font-bold"
    >
      ${(remaining / 1000).toFixed(0)}k
    </tspan>
  </text>
);

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

  // Calculate total actual values from data
  const totalActual = filteredData.reduce((sum, d) => {
    if (quarter === 'Q3') return sum + toNum(d.q3_actual);
    return sum + toNum(d.q4_jan_actual) + toNum(d.q4_feb_actual) + toNum(d.q4_mar_actual);
  }, 0);

  const totalTarget = filteredData.reduce((sum, d) => {
    if (quarter === 'Q3') return sum + toNum(d.q3_target);
    return sum + toNum(d.q4_target);
  }, 0);

  const kpiMetrics = {
    qualifiedLeads: { value: toNum(totalActual), target: toNum(totalTarget), achievement: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0 },
    icpFit: { value: dataCollected, target: totalKPIs, achievement: totalKPIs > 0 ? Math.round((dataCollected / totalKPIs) * 100) : 0 },
    mqlSql: { value: Math.round(completion * 0.8), target: 80, achievement: completion },
    acceptanceRate: { value: Math.round(completion * 0.7), target: 70, achievement: completion },
    responseTime: { value: Math.round(completion * 0.6), target: 60, achievement: completion },
  };

  /* ================= TRAFFIC DATA ================= */

  // Build trend data from actual KPI data
  const trendData = filteredData.map((d, idx) => ({
    name: d.kpi_name.substring(0, 20),
    actual: quarter === 'Q3' ? toNum(d.q3_actual) : (toNum(d.q4_jan_actual) + toNum(d.q4_feb_actual) + toNum(d.q4_mar_actual)),
    target: quarter === 'Q3' ? toNum(d.q3_target) : toNum(d.q4_target),
  }));

  const categoryBreakdown = Array.from(
    filteredData.reduce((map, d) => {
      const cat = d.kpi_category;
      const actual = quarter === 'Q3' ? toNum(d.q3_actual) : (toNum(d.q4_jan_actual) + toNum(d.q4_feb_actual) + toNum(d.q4_mar_actual));
      const current = map.get(cat) || { category: cat, value: 0 };
      current.value += actual;
      map.set(cat, current);
      return map;
    }, new Map()).values()
  );

  const trafficData = trendData.slice(0, 6).map((d, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i % 6],
    visitors: toNum(d.actual),
  }));

  const monthlyTrend = trendData.slice(0, 3).map(d => ({
    month: d.name.substring(0, 3),
    value: toNum(d.actual),
  }));

  const conversionData = categoryBreakdown.slice(0, 4).map((cat, i) => ({
    name: ['Awareness', 'Interest', 'Consideration', 'Decision'][i],
    value: Math.round((toNum(cat.value) / totalActual) * 100) || 0,
  }));

  const leadSourcesData = categoryBreakdown.map((cat) => ({
    source: cat.category || 'Other',
    mqls: toNum(cat.value),
  })).slice(0, 5);

  const mediaMentionsRegion = [
    { region: 'India', mentions: Math.round(toNum(totalActual) * 0.4) },
    { region: 'Europe', mentions: Math.round(toNum(totalActual) * 0.3) },
    { region: 'North America', mentions: Math.round(toNum(totalActual) * 0.2) },
    { region: 'APAC', mentions: Math.round(toNum(totalActual) * 0.1) },
  ];

  const events = [
    { name: 'Campaign 1', date: 'In Progress', type: 'Active', impact: 'high' as const },
    { name: 'Campaign 2', date: 'In Progress', type: 'Active', impact: 'high' as const },
    { name: 'Campaign 3', date: 'In Progress', type: 'Active', impact: 'high' as const },
    { name: 'Campaign 4', date: 'In Progress', type: 'Active', impact: 'medium' as const },
  ];

  /* ================= BUDGET DATA ================= */

  const fundAllocationData = categoryBreakdown.map(cat => ({
    name: cat.category || 'Other',
    value: toNum(cat.value) * 2.5,
  }));

  const quarterlyUsage = categoryBreakdown.map(cat => ({
    name: cat.category || 'Other',
    value: toNum(cat.value),
  }));

  const totalAnnualBudget = fundAllocationData.reduce((s, i) => s + i.value, 0);
  const totalQuarterlyUsed = quarterlyUsage.reduce((s, i) => s + i.value, 0);

  const quarterlyUsageWithBalance = [
    ...quarterlyUsage,
    { name: 'Remaining Balance', value: totalAnnualBudget - totalQuarterlyUsed },
  ];
  const renderTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
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

  const FUND_COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#10b981'];
  const QUARTER_COLORS = [...FUND_COLORS, '#94a3b8'];

  /* ================= UI ================= */

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between h-[90px]">
        <h1 className="text-[28px] font-bold text-slate-900">
          Marketing Performance Dashboard
        </h1>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-5 gap-6">
        {Object.entries(kpiMetrics).map(([key, metric]) => (
          <div key={key} className="bg-white rounded-2xl shadow-lg border p-5">
            <p className="text-xs text-slate-500 capitalize mb-1">{key}</p>
            <p className="text-3xl font-bold text-slate-900">{metric.value}{key !== 'qualifiedLeads' ? '%' : ''}</p>
            <p className="text-sm text-slate-500">Target: {metric.target}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-semibold ${metric.achievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {metric.achievement}%
              </span>
              {metric.achievement >= 100 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div className="mt-2 h-1 bg-slate-200 rounded-full">
              <div
                className="h-full bg-teal-500"
                style={{ width: `${Math.min(metric.achievement, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* TRAFFIC + LEAD SOURCES */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <h3 className="font-bold mb-4">Website Traffic Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trafficData}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#14b8a6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <h3 className="font-bold mb-4">Lead Sources Contribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leadSourcesData}>
              <CartesianGrid stroke="#f1f5f9" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mqls">
                {leadSourcesData.map((_, i) => (
                  <Cell key={i} fill={FUND_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MONTHLY + CONVERSION */}
      <div className="grid grid-cols-[60%_40%] gap-6">
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <h3 className="font-bold mb-4">Qualified Inbound – Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0891b2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <h3 className="font-bold mb-4">Conversion Efficiency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EVENTS */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <h3 className="font-bold mb-6">Event Participation & Brand Presence</h3>
        <div className="grid grid-cols-4 gap-4">
          {events.map((event, index) => (
            <div key={index} className="p-4 rounded-xl border bg-slate-50">
              <Calendar className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="font-medium text-sm mb-1">{event.name}</h4>
              <p className="text-xs text-slate-600">{event.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FUND ALLOCATION & USAGE */}
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

      {/* Legend */}
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

            {/* Center Highlight */}
            <CenterBalanceLabel
              remaining={
                quarterlyUsageWithBalance.find(
                  (i) => i.name === 'Remaining Balance'
                )?.value || 0
              }
            />
          </Pie>

          <Tooltip content={renderTooltip} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
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