import React, { useState } from 'react';
import { useKPI } from '../kpi/KPIContext';
import { QUARTER_MONTH_MAP, FULL_MONTHS, getShortMonth, getCurrentFinancialYear, getAllQuarters, getAvailableFinancialYears, getAvailableQuartersForYear, getQuarterMonthMapForYear } from '../../lib/quarterUtils';
import { CURRENT_MONTH, getComparisonLabel } from '../../lib/smartTimeUtils';
import { ChevronDown, X } from 'lucide-react';

export default function MonthSelector() {
  const { selectedMonths, selectedQuarters, selectedYear, setSelectedMonths, setSelectedQuarters, setSelectedYear, timeContext, isQuarterView } = useKPI();
  const [showMonthPicker, setShowMonthPicker] = useState(false);

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
   * Toggle individual month selection
   * Overrides quarter selection
   */
  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  /**
   * Check if user is in "custom month" mode (not full quarters)
   */
  const isCustomMode = selectedMonths.length > 0 && selectedQuarters.length === 0;

  /**
   * Select all months
   */
  const selectAllMonths = () => {
    setSelectedMonths([...FULL_MONTHS]);
    setSelectedQuarters([]);
  };

  /**
   * Select all quarters for current year
   */
  const selectAllQuarters = () => {
    const availableQuarters = getAvailableQuartersForYear(selectedYear);
    setSelectedQuarters(availableQuarters);
    setSelectedMonths([]);
  };

  /**
   * Clear all selections (default to current month)
   */
  const clearSelection = () => {
    setSelectedMonths([CURRENT_MONTH]);
    setSelectedQuarters([]);
  };

  const financialYear = selectedYear;
  const allQuarters = getAvailableQuartersForYear(selectedYear);
  const availableYears = getAvailableFinancialYears();

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Current Month/Period Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 shadow-sm">
        <span className="text-xs font-semibold text-emerald-900">
          {getComparisonLabel(timeContext)}
        </span>
        {timeContext.isCurrent && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
            Current
          </span>
        )}
        {isQuarterView && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">
            Quarterly
          </span>
        )}
      </div>

      {/* Year Selector Dropdown */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="appearance-none px-3 py-1.5 rounded-lg font-semibold text-xs bg-white text-slate-600 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer pr-6 transition-all"
          title="Select financial year"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none text-slate-600" />
      </div>



      {/* Quarter Quick-Select Buttons */}
      <div className="flex gap-2 items-center">
        {allQuarters.map((quarter) => (
          <button
            key={quarter}
            onClick={() => {
              toggleQuarter(quarter);
              setSelectedMonths([]); // Clear custom month selection when clicking quarter
            }}
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

      {/* Month Picker Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowMonthPicker(!showMonthPicker)}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center gap-1 ${
            isCustomMode
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }`}
          title="Pick individual months"
        >
          Months
          <ChevronDown className={`w-3 h-3 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50 min-w-max">
            {/* Get available months for the selected year */}
            {(() => {
              const yearMap = getQuarterMonthMapForYear(selectedYear);
              const availableMonths = new Set<string>();
              Object.values(yearMap).forEach(months => {
                months.forEach(month => availableMonths.add(month));
              });
              return (
                <>
                  {/* Month Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {FULL_MONTHS.map((month) => {
                      const isAvailable = availableMonths.has(month);
                      return (
                        <button
                          key={month}
                          onClick={() => {
                            if (isAvailable) {
                              toggleMonth(month);
                              setSelectedQuarters([]); // Clear quarter selection when picking month
                            }
                          }}
                          className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                            !isAvailable
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                              : selectedMonths.includes(month)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title={isAvailable ? month : `${month} (Not available in ${selectedYear})`}
                          disabled={!isAvailable}
                        >
                          {getShortMonth(month)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Select Actions */}
                  <div className="flex gap-2 border-t border-slate-200 pt-3 flex-wrap justify-center">
                    <button
                      onClick={selectAllMonths}
                      className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-medium"
                    >
                      All Months
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMonths([]);
                        setShowMonthPicker(false);
                      }}
                      className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Selected Items Display */}
      {selectedMonths.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Selected:</span>
          <div className="flex gap-1 flex-wrap max-w-xs">
            {selectedMonths.map((month) => (
              <div
                key={month}
                className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium border border-purple-300 flex items-center gap-1"
              >
                {getShortMonth(month)}
                <button
                  onClick={() => toggleMonth(month)}
                  className="hover:text-purple-900 transition-colors"
                  title={`Remove ${month}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedQuarters.length > 0 && selectedMonths.length === 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Selected:</span>
          <div className="flex gap-1 flex-wrap">
            {selectedQuarters.map((quarter) => (
              <div
                key={quarter}
                className="px-2 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium border border-cyan-300 flex items-center gap-1"
              >
                {quarter}
                <button
                  onClick={() => toggleQuarter(quarter)}
                  className="hover:text-cyan-900 transition-colors"
                  title={`Remove ${quarter}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        {selectedQuarters.length < allQuarters.length && selectedMonths.length === 0 && (
          <button
            onClick={selectAllQuarters}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-medium transition-colors"
            title="Select all quarters"
          >
            All Quarters
          </button>
        )}
        {(selectedQuarters.length > 0 || selectedMonths.length > 0) && (
          <button
            onClick={clearSelection}
            className="text-xs px-2 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 font-medium transition-colors flex items-center gap-1"
            title={`Reset to ${CURRENT_MONTH}`}
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Selection Summary */}
      {(selectedQuarters.length > 0 || selectedMonths.length > 0) && (
        <div className="text-xs text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {selectedMonths.length > 0
            ? `${selectedMonths.length} month${selectedMonths.length !== 1 ? 's' : ''}`
            : selectedQuarters.length === 4
            ? 'Full year (FY 2025)'
            : `${selectedQuarters.join(', ')}`}
        </div>
      )}
    </div>
  );
}

