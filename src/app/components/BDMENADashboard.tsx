import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useKPI } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { FilterStatusBadge } from './FilterStatusBadge';
import { LABELS } from '../../config/labels';

const toNum = (v: any): number => {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

export default function BDMENADashboard() {
  const { bdData, selectedMonths } = useKPI();
  const { getMonthDisplay, isCustomMode } = useDashboardFilter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Filter for MENA region data
  const menaData = bdData.filter(d => {
    const region = d.region?.toLowerCase();
    return region && ['mena', 'saudi', 'uae', 'oman', 'emirates', 'middle east', 'north africa'].includes(region) ||
           (region?.includes('saudi') || region?.includes('uae') || region?.includes('oman'));
  });

  const totalKPIs = menaData.length;
  const dataCollected = menaData.filter(d => toNum(d.q4_jan_actual) > 0 || toNum(d.q4_feb_actual) > 0 || toNum(d.q4_mar_actual) > 0).length;
  const targetsSet = menaData.filter(d => toNum(d.q4_target) > 0).length;
  const completion = targetsSet > 0 ? Math.round((dataCollected / targetsSet) * 100) : 0;

  const totalActual = menaData.reduce((sum, d) => sum + toNum(d.q4_jan_actual) + toNum(d.q4_feb_actual) + toNum(d.q4_mar_actual), 0);
  const totalTarget = menaData.reduce((sum, d) => sum + toNum(d.q4_target), 0);

  // BD Funnel Data for MENA
  const bdFunnelData = [
    { stage: 'Qualified Enterprise Conversations', actual: 2, target: 20, status: 'in-progress' },
    { stage: 'Anchor Accounts Identified', actual: 1, target: 7, status: 'in-progress' },
    { stage: 'Stakeholder Coverage', actual: 1, target: 4, status: 'in-progress' },
    { stage: 'Pre-qualified Opportunities', actual: 0, target: 4, status: 'blocked' },
  ];

  // Calculate BD conversion metrics
  const bdConversionMetrics = [
    {
      label: 'Conversations → Anchor',
      conversion: bdFunnelData[1].actual > 0 ? Math.round((bdFunnelData[1].actual / bdFunnelData[0].actual) * 100) : 0,
      status: bdFunnelData[0].actual > 0 ? (bdFunnelData[1].actual / bdFunnelData[0].actual >= 0.33 ? 'on-track' : bdFunnelData[1].actual > 0 ? 'in-progress' : 'blocked') : 'blocked',
    },
    {
      label: 'Anchor → Opportunity',
      conversion: bdFunnelData[2].actual > 0 ? Math.round((bdFunnelData[2].actual / bdFunnelData[1].actual) * 100) : 0,
      status: bdFunnelData[1].actual > 0 ? (bdFunnelData[2].actual / bdFunnelData[1].actual >= 0.6 ? 'on-track' : bdFunnelData[2].actual > 0 ? 'in-progress' : 'blocked') : 'blocked',
    },
    {
      label: 'Opportunity Readiness',
      conversion: bdFunnelData[3].actual > 0 ? Math.round((bdFunnelData[3].actual / bdFunnelData[2].actual) * 100) : 0,
      status: bdFunnelData[2].actual > 0 ? (bdFunnelData[3].actual / bdFunnelData[2].actual >= 1 ? 'on-track' : 'in-progress') : 'blocked',
    },
  ];

  // Territory Build Coverage Data for MENA
  const territoryBuildData = [
    { metric: 'Saudi Arabia', actual: 5, target: 5, status: 'on-track' },
    { metric: 'UAE', actual: 4, target: 5, status: 'in-progress' },
    { metric: 'Oman', actual: 2, target: 3, status: 'in-progress' },
    { metric: 'Ecosystem Coverage', actual: 2, target: 4, status: 'blocked' },
  ];

  // Pipeline Build Progression
  const pipelineProgressionData = [
    { month: 'Jan', conversations: 1, opportunities: 0 },
    { month: 'Feb', conversations: 2, opportunities: 0 },
  ];

  const statusColors = {
    'on-track': '#10b981',
    'at-risk': '#f59e0b',
    'blocked': '#ef4444',
    'in-progress': '#3b82f6',
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const renderBDFunnel = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">BD Funnel: MENA Account Development Pipeline</h2>
      <div className="space-y-4">
        {bdFunnelData.map((stage, idx) => {
          const conversionRate = idx > 0 ? Math.round((stage.actual / bdFunnelData[idx - 1].actual) * 100) : 100;
          const statusColor = stage.actual === 0 ? '#ef4444' : stage.actual < stage.target * 0.5 ? '#f59e0b' : '#10b981';
          const maxWidth = 500;
          const stageWidth = (stage.actual / Math.max(...bdFunnelData.map(s => s.target))) * maxWidth;
          
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{stage.stage}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{stage.actual} / {stage.target}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    stage.actual === 0 ? 'bg-red-100 text-red-700' :
                    stage.actual < stage.target * 0.5 ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {stage.actual === 0 ? 'No data' : stage.actual < stage.target ? `${Math.round((stage.actual / stage.target) * 100)}%` : 'Target'}
                  </span>
                  {idx > 0 && <span className="text-xs text-slate-600">{conversionRate}% conv.</span>}
                </div>
              </div>
              <div className="h-8 bg-slate-100 rounded-lg overflow-hidden border-2" style={{ borderColor: stage.actual === 0 ? '#ef4444' : statusColor }}>
                <div 
                  className="h-full rounded-md transition-all"
                  style={{ 
                    width: `${Math.max((stageWidth / maxWidth) * 100, 5)}%`,
                    backgroundColor: stage.actual === 0 ? 'rgba(239, 68, 68, 0.3)' : statusColor,
                    opacity: stage.actual === 0 ? 0.4 : 1
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderConversionMetrics = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Conversion Metrics</h3>
      <div className="grid grid-cols-3 gap-4">
        {bdConversionMetrics.map((metric, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-3">{metric.label}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{metric.conversion}%</p>
              </div>
              <div className="w-16 h-12 rounded-lg border-2" style={{ borderColor: statusColors[metric.status as keyof typeof statusColors] }}>
                <div 
                  className="h-full rounded-md"
                  style={{ 
                    width: `${Math.min(metric.conversion, 100)}%`,
                    backgroundColor: statusColors[metric.status as keyof typeof statusColors]
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPipelineProgression = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Pipeline Build Progression (Velocity)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={pipelineProgressionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="conversations" fill="#06b6d4" name="Enterprise Conversations Created" radius={[4, 4, 0, 0]} />
          <Bar dataKey="opportunities" fill="#10b981" name="Pre-qualified Opportunities Created" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTerritoryBuildCoverage = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Territory/Country Build Coverage (Maturity)</h3>
      <div className="space-y-4">
        {territoryBuildData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-900">{item.metric}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                item.actual === 0 ? 'bg-red-100 text-red-700' :
                item.actual < item.target * 0.5 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {item.actual}/{item.target}
              </span>
            </div>
            <div className="h-6 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              <div 
                className="h-full rounded-md"
                style={{ 
                  width: `${Math.round((item.actual / item.target) * 100)}%`,
                  backgroundColor: item.actual === 0 ? '#ef4444' : item.actual < item.target * 0.5 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBDInsights = () => {
    const insights = [];
    
    if (bdFunnelData[0].actual < bdFunnelData[0].target * 0.5) {
      insights.push({
        icon: AlertCircle,
        title: 'Pipeline creation in progress',
        text: 'MENA region showing early momentum',
        sentiment: 'positive',
      });
    }
    
    if (bdFunnelData[1].actual > 0) {
      insights.push({
        icon: CheckCircle,
        title: 'Anchor account identification',
        text: 'Successfully initiated in MENA',
        sentiment: 'positive',
      });
    }
    
    if (territoryBuildData.some(t => t.status === 'on-track')) {
      insights.push({
        icon: CheckCircle,
        title: 'Saudi Arabia leadership',
        text: 'Territory maturity on track',
        sentiment: 'positive',
      });
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">BD Key Insights & Next Steps (MENA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                insight.sentiment === 'positive' 
                  ? 'bg-emerald-50 border-emerald-400' 
                  : 'bg-amber-50 border-amber-400'
              }`}>
                <div className="flex gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    insight.sentiment === 'positive' ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <p className={`font-semibold text-sm ${
                      insight.sentiment === 'positive' ? 'text-emerald-900' : 'text-amber-900'
                    }`}>
                      {insight.title}
                    </p>
                    <p className={`text-xs mt-1 ${
                      insight.sentiment === 'positive' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {insight.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{LABELS.pageTitles.bd.title} - MENA Region</h1>
          <p className="text-slate-600">{LABELS.pageTitles.bd.subtitle}</p>
        </div>
        <FilterStatusBadge variant="pill" />
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
          <p className="text-xs text-teal-700 font-medium mb-1">Total KPIs</p>
          <p className="text-2xl font-bold text-teal-900">{totalKPIs}</p>
          <p className="text-xs text-teal-600 mt-2">{dataCollected} with data</p>
        </div>
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
          <p className="text-xs text-sky-700 font-medium mb-1">Targets Set</p>
          <p className="text-2xl font-bold text-sky-900">{targetsSet}</p>
          <p className="text-xs text-sky-600 mt-2">{completion}% completion</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-xs text-emerald-700 font-medium mb-1">Total Actual</p>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(totalActual)}</p>
          <p className="text-xs text-emerald-600 mt-2">vs Target</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <p className="text-xs text-amber-700 font-medium mb-1">Achievement</p>
          <p className="text-2xl font-bold text-amber-900">{totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0}%</p>
          <p className="text-xs text-amber-600 mt-2">of target</p>
        </div>
      </div>

      {/* BD Funnel */}
      {renderBDFunnel()}

      {/* Conversion Metrics */}
      {renderConversionMetrics()}

      {/* Pipeline Progression */}
      {renderPipelineProgression()}

      {/* Territory Build Coverage */}
      {renderTerritoryBuildCoverage()}

      {/* BD Insights */}
      {renderBDInsights()}

      {/* Regional Notes */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Region Focus: MENA (Middle East & North Africa)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-semibold text-slate-900 mb-2">Saudi Arabia</p>
            <p className="text-sm text-slate-600">Primary market focus with established presence</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-semibold text-slate-900 mb-2">UAE</p>
            <p className="text-sm text-slate-600">Growth region with expansion opportunities</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <p className="font-semibold text-slate-900 mb-2">Oman</p>
            <p className="text-sm text-slate-600">Emerging market for account development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
