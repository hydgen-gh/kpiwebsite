import React, { useState } from 'react';
import { Activity, Zap, Droplet, Gauge, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Tooltip } from 'recharts';

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


export default function ProductDashboard() {
  const [techType, setTechType] = useState<'AEM' | 'PEM'>('AEM');
  const [aemVariant, setAemVariant] = useState('Mini');
  const [pemVariant, setPemVariant] = useState('5kW');

  // AEM Metrics Data
  const aemMetrics = {
    Mini: {
      energyEfficiency: { theoretical: 39.4, achievable: 46, current: 43.5 },
      voltageEfficiency: { theoretical: 100, achievable: 88, current: 85 },
      hydrogenPurity: { theoretical: 100, achievable: 99.98, current: 99.95 },
      currentDensity: { theoretical: 1.0, achievable: 0.8, current: 0.75 },
      operatingPressure: { theoretical: 30, achievable: 30, current: 5 },
      stackLifetime: { theoretical: 2000, achievable: 1000, current: 420 },
    },
    Macro: {
      energyEfficiency: { theoretical: 39.4, achievable: 48, current: 46.2 },
      voltageEfficiency: { theoretical: 100, achievable: 89, current: 87 },
      hydrogenPurity: { theoretical: 100, achievable: 99.98, current: 99.97 },
      currentDensity: { theoretical: 1.0, achievable: 0.8, current: 0.75 },
      operatingPressure: { theoretical: 30, achievable: 30, current: 5 },
      stackLifetime: { theoretical: 2000, achievable: 1000, current: 420 },
    },
    Mega: {
      energyEfficiency: { theoretical: 39.4, achievable: 50, current: 47.8 },
      voltageEfficiency: { theoretical: 100, achievable: 90, current: 88 },
      hydrogenPurity: { theoretical: 100, achievable: 99.98, current: 99.96 },
      currentDensity: { theoretical: 1.0, achievable: 0.8, current: 0.75 },
      operatingPressure: { theoretical: 30, achievable: 30, current: 5 },
      stackLifetime: { theoretical: 2000, achievable: 1000, current: 420 },
    },
  };

  // PEM Metrics Data
  const pemMetrics = {
  '5kW': {
    energyEfficiency: { theoretical: 39.4, achievable: 52, current: 50.8 },
    voltageEfficiency: { theoretical: 100, achievable: 92, current: 91 },
    hydrogenPurity: { theoretical: 100, achievable: 99.998, current: 99.997 },
    currentDensity: { theoretical: 1.2, achievable: 0.8, current: 0.75 },
    operatingPressure: { theoretical: 30, achievable: 30, current: 5 },
    stackLifetime: { theoretical: 2000, achievable: 1000, current: 420 },
  },

  '25kW': {
    energyEfficiency: { theoretical: 39.4, achievable: 54, current: 52.5 },
    voltageEfficiency: { theoretical: 100, achievable: 94, current: 93 },
    hydrogenPurity: { theoretical: 100, achievable: 99.999, current: 99.998 },
    currentDensity: { theoretical: 1.2, achievable: 0.8, current: 0.75 },
    operatingPressure: { theoretical: 30, achievable: 30, current: 5 },
    stackLifetime: { theoretical: 2000, achievable: 1000, current: 420 },
  },
};


  const currentMetrics =
    techType === 'AEM'
      ? aemMetrics[aemVariant as keyof typeof aemMetrics]
      : pemMetrics[pemVariant as keyof typeof pemMetrics];
  const fundAllocationData = [
  { name: 'R&D Equipment', value: 200000 },
  { name: 'Lab Supplies', value: 150000 },
  { name: 'Testing & Validation', value: 100000 },
  { name: 'Patent Filing', value: 50000 },
];

const FUND_COLORS = ['#14b8a6', '#06b6d4', '#3b82f6', '#10b981'];

// Quarterly usage per section (example values – edit freely)
const quarterlyUsageBySection = [
  { name: 'R&D Equipment', value: 80000 },
  { name: 'Lab Supplies', value: 45000 },
  { name: 'Testing & Validation', value: 35000 },
  { name: 'Patent Filing', value: 20000 },
];

const totalAnnualBudget = fundAllocationData.reduce((sum, i) => sum + i.value, 0);
const totalQuarterlyUsed = quarterlyUsageBySection.reduce((sum, i) => sum + i.value, 0);

const quarterlyUsageWithBalance = [
  ...quarterlyUsageBySection,
  { name: 'Remaining Balance', value: totalAnnualBudget - totalQuarterlyUsed },
];

const QUARTER_COLORS = [...FUND_COLORS, '#94a3b8']; // grey for balance


  // KPI Card (logic-only change)
  const renderMetricCard = (
    metric: { theoretical: number; achievable: number; current: number },
    unit: string,
    label: string,
    icon: React.ReactNode
  ) => {
    const percentage = (metric.current / metric.achievable) * 100;

    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <p className="text-sm font-medium text-slate-700">{label}</p>
        </div>

        <div className="flex items-end gap-3 mb-3">
          <div className="text-3xl font-bold text-teal-600">
            {metric.current}{unit}
          </div>
          <div className="text-sm text-slate-500 pb-1">
            / {metric.achievable}{unit}
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Current vs Target</span>
            <span>
              {metric.theoretical > metric.achievable ? 'Theoretical Max' : 'Theoretical Min'}: {metric.theoretical}{unit}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Development</h2>
        <p className="text-slate-600">Technology performance metrics and milestone tracking</p>
      </div>

      {/* Toggle + Dropdown */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <button onClick={() => setTechType('AEM')} className={`px-6 py-2 rounded-lg font-medium ${techType === 'AEM' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              AEM
            </button>
            <button onClick={() => setTechType('PEM')} className={`px-6 py-2 rounded-lg font-medium ${techType === 'PEM' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              PEM
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <select
              value={techType === 'AEM' ? aemVariant : pemVariant}
              onChange={(e) => techType === 'AEM' ? setAemVariant(e.target.value) : setPemVariant(e.target.value)}
              className="appearance-none w-full border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm"
            >
              {techType === 'AEM'
                ? ['Mini', 'Macro', 'Mega'].map(v => <option key={v}>{v}</option>)
                : ['5kW', '25kW'].map(v => <option key={v}>{v}</option>)
              }
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="grid grid-cols-3 gap-4">
          {renderMetricCard(currentMetrics.energyEfficiency, '', 'Energy Efficiency (kWh/kg H₂)', <Activity className="w-4 h-4 text-teal-600" />)}
          {renderMetricCard(currentMetrics.voltageEfficiency, '%', 'Voltage Efficiency', <Gauge className="w-4 h-4 text-teal-600" />)}
          {renderMetricCard(currentMetrics.hydrogenPurity, '%', 'Hydrogen Purity', <Droplet className="w-4 h-4 text-teal-600" />)}
          {renderMetricCard(currentMetrics.currentDensity, ' A/cm²', 'Current Density @ 1.8V', <Activity className="w-4 h-4 text-teal-600" />)}
          {renderMetricCard(currentMetrics.operatingPressure, ' bar', 'Operating Pressure', <Gauge className="w-4 h-4 text-teal-600" />)}
          {renderMetricCard(currentMetrics.stackLifetime, ' hrs', 'Stack Lifetime', <Clock className="w-4 h-4 text-teal-600" />)}
        </div>
      </div>
{/* Fund Allocation & Usage */}
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
          quarterlyUsageWithBalance.find(i => i.name === 'Remaining Balance')?.value || 0
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
