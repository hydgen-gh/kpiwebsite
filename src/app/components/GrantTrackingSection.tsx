import React, { useState } from 'react';
import { Award, TrendingUp, CheckCircle2, AlertTriangle, Clock, Briefcase } from 'lucide-react';

interface Grant {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'paused';
  completionPercentage: number;
  amount: number;
  deadline?: string;
  milestones: {
    completed: number;
    total: number;
  };
  category: 'grant' | 'accelerator' | 'competition';
}

interface GrantTrackingSectionProps {
  grants?: Grant[];
  onUpdateGrant?: (grantId: string, updates: Partial<Grant>) => void;
}

/**
 * Grant Tracking Section Component
 * Tracks grants, accelerator programs, and competition milestones with completion tracking
 */
export function GrantTrackingSection({ grants = [], onUpdateGrant }: GrantTrackingSectionProps) {
  const [expandedGrant, setExpandedGrant] = useState<string | null>(null);

  // Placeholder grants - will be replaced with actual backend data
  const mockGrants: Grant[] = grants.length > 0 ? grants : [
    {
      id: 'grant-001',
      name: 'SBIR Phase II - Fuel Cell Systems',
      status: 'active',
      completionPercentage: 65,
      amount: 750000,
      deadline: '2026-12-31',
      milestones: { completed: 13, total: 24 },
      category: 'grant',
    },
    {
      id: 'grant-002',
      name: 'Clean Energy Innovation Grant',
      status: 'active',
      completionPercentage: 42,
      amount: 500000,
      deadline: '2026-09-30',
      milestones: { completed: 8, total: 18 },
      category: 'grant',
    },
    {
      id: 'accel-001',
      name: 'ClimateX Accelerator Program',
      status: 'active',
      completionPercentage: 75,
      amount: 250000,
      deadline: '2026-06-30',
      milestones: { completed: 9, total: 12 },
      category: 'accelerator',
    },
    {
      id: 'comp-001',
      name: 'Global Clean Tech Competition',
      status: 'pending',
      completionPercentage: 25,
      amount: 100000,
      deadline: '2026-04-15',
      milestones: { completed: 2, total: 8 },
      category: 'competition',
    },
  ];

  const getStatusColor = (status: Grant['status']) => {
    const statusMap = {
      'active': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Active' },
      'pending': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Pending' },
      'completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' },
      'paused': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Paused' },
    };
    return statusMap[status];
  };

  const getCategoryLabel = (category: Grant['category']) => {
    const categoryMap = {
      'grant': 'Grant',
      'accelerator': 'Accelerator',
      'competition': 'Competition',
    };
    return categoryMap[category];
  };

  const getCategoryIcon = (category: Grant['category']) => {
    const iconMap = {
      'grant': Award,
      'accelerator': TrendingUp,
      'competition': Briefcase,
    };
    return iconMap[category];
  };

  const groupedGrants = {
    grants: mockGrants.filter(g => g.category === 'grant'),
    accelerators: mockGrants.filter(g => g.category === 'accelerator'),
    competitions: mockGrants.filter(g => g.category === 'competition'),
  };

  const renderGrantCard = (grant: Grant) => {
    const statusColor = getStatusColor(grant.status);
    const CategoryIcon = getCategoryIcon(grant.category);
    const isExpanded = expandedGrant === grant.id;

    return (
      <div
        key={grant.id}
        className={`${statusColor.bg} border ${statusColor.border} rounded-lg p-4 cursor-pointer transition-all hover:shadow-md`}
        onClick={() => setExpandedGrant(isExpanded ? null : grant.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColor.bg} border ${statusColor.border}`}>
              <CategoryIcon className={`w-4 h-4 ${statusColor.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{grant.name}</h4>
              <p className={`text-xs ${statusColor.text} font-medium`}>{statusColor.label}</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-white/60 rounded font-medium text-slate-700">
            {getCategoryLabel(grant.category)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-600">Completion</span>
            <span className={`text-sm font-bold ${statusColor.text}`}>{grant.completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                grant.status === 'completed' ? 'bg-emerald-500' :
                grant.status === 'active' ? 'bg-green-500' :
                grant.status === 'pending' ? 'bg-blue-500' :
                'bg-amber-500'
              }`}
              style={{ width: `${grant.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-600">Funding</p>
            <p className="font-bold text-slate-900">${(grant.amount / 1000).toFixed(0)}k</p>
          </div>
          <div>
            <p className="text-slate-600">Milestones</p>
            <p className="font-bold text-slate-900">{grant.milestones.completed}/{grant.milestones.total}</p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-3">
            {grant.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <div className="text-xs">
                  <p className="text-slate-600">Deadline</p>
                  <p className="font-semibold text-slate-900">{new Date(grant.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-600 mb-2">Milestone Progress</p>
              <div className="space-y-1">
                {Array.from({ length: grant.milestones.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full ${i < grant.milestones.completed ? 'bg-green-500' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Total Grants</p>
          <p className="text-2xl font-bold text-slate-900">{mockGrants.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active & Pending</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Total Funding</p>
          <p className="text-2xl font-bold text-slate-900">${(mockGrants.reduce((sum, g) => sum + g.amount, 0) / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-500 mt-1">Value</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Avg Completion</p>
          <p className="text-2xl font-bold text-slate-900">{Math.round(mockGrants.reduce((sum, g) => sum + g.completionPercentage, 0) / mockGrants.length)}%</p>
          <p className="text-xs text-slate-500 mt-1">Across All</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
          <p className="text-xs text-slate-600 font-medium mb-1">Milestones</p>
          <p className="text-2xl font-bold text-slate-900">
            {mockGrants.reduce((sum, g) => sum + g.milestones.completed, 0)}/{mockGrants.reduce((sum, g) => sum + g.milestones.total, 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
      </div>

      {/* Grants Section */}
      {groupedGrants.grants.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            Grants ({groupedGrants.grants.length})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {groupedGrants.grants.map(grant => renderGrantCard(grant))}
          </div>
        </div>
      )}

      {/* Accelerator Programs Section */}
      {groupedGrants.accelerators.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            Accelerator Programs ({groupedGrants.accelerators.length})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {groupedGrants.accelerators.map(grant => renderGrantCard(grant))}
          </div>
        </div>
      )}

      {/* Competitions Section */}
      {groupedGrants.competitions.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            Competitions ({groupedGrants.competitions.length})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {groupedGrants.competitions.map(grant => renderGrantCard(grant))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GrantTrackingSection;
