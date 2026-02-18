import React, { useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { DollarSign, Briefcase, Wallet } from 'lucide-react';

/* ---------------- HELPERS ---------------- */

const formatCurrency = (value: number) =>
  `$${(value / 1_000).toFixed(0)}K`;

const formatPercent = (value: number) =>
  `${value.toFixed(1)}%`;

/* ---------------- DATA ---------------- */

const quarterlyDepartmentBudgets = [
  { department: 'R&D', allocated: 100000, actual: 120000 },
  { department: 'Product Development', allocated: 90000, actual: 65000 },
  { department: 'Business Development', allocated: 80000, actual: 60000 },
  { department: 'Sales / Travel', allocated: 70000, actual: 50000 },
  { department: 'Marketing', allocated: 60000, actual: 45000 },
].map(d => ({
  ...d,
  remaining: d.allocated - d.actual,
}));

const personnelSplitData = [
  { department: 'R&D', personnel: 52000, nonPersonnel: 9000 },
  { department: 'Business Development', personnel: 12000, nonPersonnel: 8500 },
  { department: 'Sales / Travel', personnel: 6000, nonPersonnel: 9500 },
  { department: 'Product Development', personnel: 6000, nonPersonnel: 9500 },
  { department: 'Marketing', personnel: 6000, nonPersonnel: 9500 },
];

// QoQ → Budget vs Actual
const qoQData = [
  {
    department: 'R&D',
    prevBudget: 95000,
    prevActual: 90000,
    currBudget: 100000,
    currActual: 120000,
  },
  {
    department: 'Product Development',
    prevBudget: 72000,
    prevActual: 70000,
    currBudget: 90000,
    currActual: 65000,
  },
  {
    department: 'Business Development',
    prevBudget: 68000,
    prevActual: 65000,
    currBudget: 80000,
    currActual: 60000,
  },
  {
    department: 'Sales / Travel',
    prevBudget: 50000,
    prevActual: 48000,
    currBudget: 70000,
    currActual: 50000,
  },
  {
    department: 'Marketing',
    prevBudget: 45000,
    prevActual: 42000,
    currBudget: 60000,
    currActual: 45000,
  },
];

const spendByEntity = [
  { name: 'Hydrogen Nexus Pvt Ltd', value: 52000 },
  { name: 'Hydrogen Innovation Pvt Ltd', value: 48000 },
  { name: 'Hydrogen Innovation PTE Ltd', value: 21000 },
];

const COLORS = {
  teal: '#14b8a6',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  slate: '#64748b',
};

/* ================= DASHBOARD ================= */

export default function FinanceDashboard() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const departmentOptions = [
    'All',
    ...Array.from(new Set(quarterlyDepartmentBudgets.map(d => d.department))),
  ];

  const filteredDepartments =
    selectedDepartment === 'All'
      ? quarterlyDepartmentBudgets
      : quarterlyDepartmentBudgets.filter(d => d.department === selectedDepartment);

  const filteredPersonnel =
    selectedDepartment === 'All'
      ? personnelSplitData
      : personnelSplitData.filter(d => d.department === selectedDepartment);

  const filteredQoQ =
    selectedDepartment === 'All'
      ? qoQData
      : qoQData.filter(d => d.department === selectedDepartment);

  const totalBudget = filteredDepartments.reduce((s, d) => s + d.allocated, 0);
  const totalActual = filteredDepartments.reduce((s, d) => s + d.actual, 0);
  const variance = totalBudget - totalActual;
  const variancePct = totalBudget ? (variance / totalBudget) * 100 : 0;

  const plannedVsActual = [
    {
      name: selectedDepartment === 'All' ? 'Company' : selectedDepartment,
      planned: totalBudget,
      actual: totalActual,
      variance,
      variancePct,
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Quarterly Budget Performance
          </h2>
          <p className="text-sm text-slate-600">
            Budget allocation and utilisation by department
          </p>

          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">
              Department:
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              {departmentOptions.map(dep => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'chart'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'table'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-6">
            <FinanceKPI
              title="Total Budget Allocated (Quarter)"
              value={formatCurrency(totalBudget)}
              icon={<DollarSign className="w-6 h-6 text-teal-600" />}
            />
            <FinanceKPI
              title="Active Departments"
              value={selectedDepartment === 'All' ? quarterlyDepartmentBudgets.length : 1}
              icon={<Briefcase className="w-6 h-6 text-cyan-600" />}
            />
            <FinanceKPI
              title="Approved vs Remaining (Quarter)"
              value={formatCurrency(variance)}
              icon={<Wallet className="w-6 h-6 text-blue-600" />}
            />
          </div>

          {/* CORE */}
          <SectionCard title="Department-wise Quarterly Budget Utilisation">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredDepartments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis tickFormatter={(v) => `$${v / 1_000}K`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="allocated" fill={COLORS.teal} />
                <Bar dataKey="actual" fill={COLORS.cyan} />
                <Bar dataKey="remaining" fill={COLORS.blue} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* PERSONNEL */}
          <SectionCard title="Personnel vs Non-Personnel Spend (Quarter)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filteredPersonnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis tickFormatter={(v) => `$${v / 1_000}K`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="personnel" stackId="a" fill={COLORS.teal} />
                <Bar dataKey="nonPersonnel" stackId="a" fill={COLORS.cyan} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* PLANNED VS ACTUAL */}
          <SectionCard title="Planned vs Actual (Quarter)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={plannedVsActual}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `$${v / 1_000}K`} />
                <Tooltip
                  formatter={(v, n, p) =>
                    n === 'variancePct'
                      ? formatPercent(p.payload.variancePct)
                      : formatCurrency(v as number)
                  }
                />
                <Legend />
                <Bar dataKey="planned" fill={COLORS.teal} />
                <Bar dataKey="actual" fill={COLORS.cyan} />
                <Bar dataKey="variance" fill={COLORS.blue} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-600 mt-2">
              Variance: {formatCurrency(variance)} ({formatPercent(variancePct)})
            </p>
          </SectionCard>

          {/* QoQ */}
          <SectionCard title="Quarter-on-Quarter Budget vs Actual">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredQoQ}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis tickFormatter={(v) => `$${v / 1_000}K`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="prevBudget" fill={COLORS.slate} name="Prev Q Budget" />
                <Bar dataKey="prevActual" fill={COLORS.cyan} name="Prev Q Actual" />
                <Bar dataKey="currBudget" fill={COLORS.teal} name="Curr Q Budget" />
                <Bar dataKey="currActual" fill={COLORS.blue} name="Curr Q Actual" />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* LEGAL ENTITY */}
          <SectionCard title="Spend by Legal Entity (Quarter)">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={spendByEntity} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `$${v / 1_000}K`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Bar dataKey="value" fill={COLORS.teal} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </>
      ) : (
        <FinanceTables data={filteredDepartments} />
      )}
    </div>
  );
}

/* ================= TABLE VIEW ================= */

function FinanceTables({ data }: { data: any[] }) {
  return (
    <TableCard title="Department-wise Quarterly Budget">
      <table className="w-full border">
        <thead>
          <tr>
            <Th>Department</Th>
            <Th>Allocated</Th>
            <Th>Actual</Th>
            <Th>Remaining / Overused</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <Td>{d.department}</Td>
              <Td>{formatCurrency(d.allocated)}</Td>
              <Td>{formatCurrency(d.actual)}</Td>
              <Td className={d.remaining < 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {formatCurrency(d.remaining)}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}

/* ================= UI ================= */

function FinanceKPI({ title, value, icon }: any) {
  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-600">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      {icon}
    </div>
  );
}

function SectionCard({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <h3 className="font-bold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function TableCard({ title, children }: any) {
  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Th({ children }: any) {
  return <th className="border px-2 py-1 text-left bg-slate-100">{children}</th>;
}

function Td({ children, className = '' }: any) {
  return <td className={`border px-2 py-1 ${className}`}>{children}</td>;
}
