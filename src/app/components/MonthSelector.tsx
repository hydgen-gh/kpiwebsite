import React from 'react';
import { useKPI, getQuarterFromMonths } from '../kpi/KPIContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = {
  'Q4': ['Jan', 'Feb', 'Mar'],
  'Q1': ['Apr', 'May', 'Jun'],
  'Q2': ['Jul', 'Aug', 'Sep'],
  'Q3': ['Oct', 'Nov', 'Dec'],
};

export default function MonthSelector() {
  const { selectedMonths, setSelectedMonths } = useKPI();

  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const setQuarter = (quarter: string) => {
    const months = QUARTERS[quarter as keyof typeof QUARTERS];
    setSelectedMonths(months);
  };

  const detectedQuarter = getQuarterFromMonths(selectedMonths);

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Quarter Quick Buttons */}
      <div className="flex gap-2">
        {Object.keys(QUARTERS).map((q) => (
          <button
            key={q}
            onClick={() => setQuarter(q)}
            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
              detectedQuarter === q
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Month Buttons - condensed */}
      <div className="flex gap-1">
        {MONTHS.map((month) => (
          <button
            key={month}
            onClick={() => toggleMonth(month)}
            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
              selectedMonths.includes(month)
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {month.substring(0, 1)}
          </button>
        ))}
      </div>

      {/* Status Display */}
      {detectedQuarter && (
        <div className="text-xs bg-cyan-100 border border-cyan-300 rounded px-2 py-1 text-cyan-700 font-bold whitespace-nowrap">
          {detectedQuarter}
        </div>
      )}
    </div>
  );
}

