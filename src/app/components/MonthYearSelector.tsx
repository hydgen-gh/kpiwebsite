import React, { useState, useEffect } from 'react';
import { useKPI } from '../kpi/KPIContext';
import { ChevronDown, Calendar } from 'lucide-react';
import { fetchAvailableMonthYears } from '../../lib/kpiAPI';
import { FULL_MONTHS } from '../../lib/quarterUtils';

interface MonthYear {
  month: string;
  year: number;
}

export default function MonthYearSelector() {
  const { selectedMonths, setSelectedMonths, selectedYear, setSelectedYear, reload } = useKPI();
  const [availableMonthYears, setAvailableMonthYears] = useState<MonthYear[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load available month/year combinations from database
  useEffect(() => {
    const loadAvailable = async () => {
      try {
        const monthYears = await fetchAvailableMonthYears();
        setAvailableMonthYears(monthYears);
      } catch (err) {
        console.error('Failed to load available months:', err);
      }
    };
    loadAvailable();
  }, []);

  const currentMonth = selectedMonths[0] || 'February';
  const currentYear = selectedYear === 'FY2026' ? 2026 : 2025;

  // Extract year number from FY string
  const yearNumber = parseInt(selectedYear.replace('FY', '')) || 2026;

  const handleSelectMonth = async (month: string, year: number) => {
    setSelectedMonths([month]);
    setSelectedYear(`FY${year}`);
    setIsOpen(false);
    setIsLoading(true);
    
    // Reload data for selected month/year
    await reload();
    setIsLoading(false);
  };

  // Group by year for display
  const groupedByYear = availableMonthYears.reduce((acc, item) => {
    const year = item.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(item.month);
    return acc;
  }, {} as Record<number, string[]>);

  return (
    <div className="relative inline-block">
      {/* Header Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <Calendar className="w-4 h-4" />
        <span className="font-medium">
          {currentMonth} {yearNumber}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-56">
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(groupedByYear)
              .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
              .map(([year, months]) => (
                <div key={year} className="border-b last:border-b-0">
                  <div className="px-4 py-2 bg-gray-100 sticky top-0 font-semibold text-sm">
                    FY{year}
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {FULL_MONTHS.map((month) => {
                      const isAvailable = months.includes(month);
                      const isSelected = currentMonth === month && yearNumber === Number(year);

                      return (
                        <button
                          key={`${month}-${year}`}
                          onClick={() => isAvailable && handleSelectMonth(month, Number(year))}
                          disabled={!isAvailable}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            isSelected
                              ? 'bg-blue-500 text-white border-blue-600'
                              : isAvailable
                              ? 'bg-white hover:bg-gray-100 border-gray-200'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {month.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
