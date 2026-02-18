import React from 'react';
import { useKPI } from '../kpi/KPIContext';
import { QUARTER_MONTH_MAP, getShortMonth, getCurrentFinancialYear, getAllQuarters } from '../../lib/quarterUtils';
import { X } from 'lucide-react';

export default function MonthSelector() {
  const { selectedMonths, selectedQuarters, setSelectedQuarters } = useKPI();

  /**
   * Toggle a quarter ON/OFF
   * Multiple quarters can be selected at once
   */
  const toggleQuarter = (quarter: string) => {
    if (selectedQuarters.includes(quarter)) {
      setSelectedQuarters(selectedQuarters.filter(q => q !== quarter));
    } else {
      setSelectedQuarters([...selectedQuarters, quarter]);
    }
  };

  /**
   * Select all quarters
   */
  const selectAllQuarters = () => {
    setSelectedQuarters(getAllQuarters());
  };

  /**
   * Clear all selections (default to Q4)
   */
  const clearSelection = () => {
    setSelectedQuarters(['Q4']);
  };

  const financialYear = getCurrentFinancialYear();
  const allQuarters = getAllQuarters();

  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      {/* Financial Year Display */}
      <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg whitespace-nowrap">
        {financialYear}
      </div>

      {/* Quarter Multi-Select Buttons */}
      <div className="flex gap-2 items-center">
        {allQuarters.map((quarter) => (
          <button
            key={quarter}
            onClick={() => toggleQuarter(quarter)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
              selectedQuarters.includes(quarter)
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
            title={`${quarter}: ${QUARTER_MONTH_MAP[quarter]?.join(', ')}`}
          >
            {quarter}
          </button>
        ))}
      </div>

      {/* Selected Months Display */}
      {selectedMonths.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Months:</span>
          <div className="flex gap-1 flex-wrap">
            {selectedMonths.map((month) => (
              <div
                key={month}
                className="px-2 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium border border-cyan-300"
              >
                {getShortMonth(month)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        {selectedQuarters.length < allQuarters.length && (
          <button
            onClick={selectAllQuarters}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-medium transition-colors"
            title="Select all quarters"
          >
            All
          </button>
        )}
        {selectedQuarters.length > 1 && (
          <button
            onClick={clearSelection}
            className="text-xs px-2 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 font-medium transition-colors flex items-center gap-1"
            title="Reset to Q4"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Selection Summary */}
      {selectedQuarters.length > 0 && (
        <div className="text-xs text-slate-600 font-medium">
          {selectedQuarters.length === 1 && selectedQuarters.length < 4 && `${selectedQuarters.join(', ')} selected`}
          {selectedQuarters.length > 1 && selectedQuarters.length < 4 && `${selectedQuarters.join(', ')} selected`}
          {selectedQuarters.length === 4 && 'Full year (FY 2025)'}
        </div>
      )}
    </div>
  );
}

