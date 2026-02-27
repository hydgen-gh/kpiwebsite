import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { KPI_DEFINITIONS } from '../../config/kpiDefinitions';

interface DefinitionsSectionProps {
  department: 'product' | 'delivery' | 'finance' | 'marketing' | 'bd' | 'sales' | 'rnd';
  technology?: 'pem' | 'aem';
  stack?: '5kw' | '25kw' | '250kw';
}

export function DefinitionsSection({ department, technology, stack }: DefinitionsSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Get definitions based on department and optional technology/stack
  let definitions = [];

  if (department === 'product' && technology && stack) {
    const techData = KPI_DEFINITIONS.product[technology];
    if (techData && techData[stack as keyof typeof techData]) {
      definitions = techData[stack as keyof typeof techData] as any[];
    }
  } else if (department in KPI_DEFINITIONS) {
    const deptDef = KPI_DEFINITIONS[department as keyof typeof KPI_DEFINITIONS] as any;
    definitions = deptDef.default || [];
  }

  if (definitions.length === 0) {
    return null;
  }

  const handleToggleCategory = (index: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCategories(newExpanded);
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedCategories(new Set());
      setExpandAll(false);
    } else {
      const allExpanded = new Set(Array.from({ length: definitions.length }, (_, i) => i));
      setExpandedCategories(allExpanded);
      setExpandAll(true);
    }
  };

  return (
    <div className="mt-12">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {/* Header with Expand All button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-xl">📘</span>
            KPI Definitions
          </h2>
          <button
            onClick={handleExpandAll}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            {expandAll ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {/* Definitions accordion */}
        <div className="space-y-3">
          {definitions.map((category: any, categoryIndex: number) => (
            <div key={categoryIndex} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => handleToggleCategory(categoryIndex)}
                className="w-full flex items-start justify-between p-4 hover:bg-slate-50 transition text-left"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{category.category}</h3>
                  <p className="text-sm text-slate-600 mt-1">{category.objective}</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 flex-shrink-0 ml-3 transition-transform ${
                    expandedCategories.has(categoryIndex) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* KPIs list - shown when expanded */}
              {expandedCategories.has(categoryIndex) && (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="space-y-3">
                    {category.kpis.map((kpi: any, kpiIndex: number) => (
                      <div key={kpiIndex} className="pb-3 last:pb-0 last:border-b-0 border-b border-slate-200 last:border-0">
                        <p className="font-medium text-slate-900 text-sm">{kpi.name}</p>
                        <p className="text-sm text-slate-600 mt-1">{kpi.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
