/**
 * Excel Template Generator for Multi-Department KPI Upload
 * Generates a comprehensive Excel file with MoM, QoQ, and YoY comparison support
 */

import * as XLSX from 'xlsx';

// Enhanced column headers with comparison support
const HEADERS = [
  // KPI Identification
  'KPI Name',
  'Category',
  
  // Current Period (Current Month)
  'Current Month',
  'Current Month Target',
  'Current Month Actual',
  
  // Month-over-Month Comparison
  'Previous Month',
  'Previous Month Actual',
  'MoM % Change',
  
  // Current Quarter Data
  'Current Quarter',
  'Current Quarter Target',
  'Current Quarter Actual',
  
  // Quarter-over-Quarter Comparison
  'Previous Quarter',
  'Previous Quarter Actual',
  'QoQ % Change',
  
  // Year-over-Year Comparison
  'Same Month Prior Year Actual',
  'YoY % Change',
  
  // Financial Year
  'Financial Year',
];

// Department-specific sample data with full comparison structure
const DEPARTMENT_DATA = {
  Product: [
    {
      kpi_name: 'PEM Stack Units Shipped',
      category: 'Sales Performance',
      current_month: 'February',
      current_month_target: 150,
      current_month_actual: 140,
      previous_month: 'January',
      previous_month_actual: 135,
      mom_pct_change: 3.7,
      current_quarter: 'Q4',
      current_quarter_target: 450,
      current_quarter_actual: 418,
      previous_quarter: 'Q3',
      previous_quarter_actual: 400,
      qoq_pct_change: 4.5,
      same_month_prior_year_actual: 120,
      yoy_pct_change: 16.7,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'AEM Stack Units Shipped',
      category: 'Sales Performance',
      current_month: 'February',
      current_month_target: 80,
      current_month_actual: 75,
      previous_month: 'January',
      previous_month_actual: 72,
      mom_pct_change: 4.2,
      current_quarter: 'Q4',
      current_quarter_target: 240,
      current_quarter_actual: 225,
      previous_quarter: 'Q3',
      previous_quarter_actual: 210,
      qoq_pct_change: 7.1,
      same_month_prior_year_actual: 65,
      yoy_pct_change: 15.4,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Product Quality Score',
      category: 'Quality Metrics',
      current_month: 'February',
      current_month_target: 95,
      current_month_actual: 93,
      previous_month: 'January',
      previous_month_actual: 92,
      mom_pct_change: 1.1,
      current_quarter: 'Q4',
      current_quarter_target: 95,
      current_quarter_actual: 92.8,
      previous_quarter: 'Q3',
      previous_quarter_actual: 91.5,
      qoq_pct_change: 1.4,
      same_month_prior_year_actual: 91,
      yoy_pct_change: 2.2,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Manufacturing Efficiency',
      category: 'Operational',
      current_month: 'February',
      current_month_target: 88,
      current_month_actual: 86,
      previous_month: 'January',
      previous_month_actual: 85,
      mom_pct_change: 1.2,
      current_quarter: 'Q4',
      current_quarter_target: 88,
      current_quarter_actual: 85.5,
      previous_quarter: 'Q3',
      previous_quarter_actual: 84,
      qoq_pct_change: 1.8,
      same_month_prior_year_actual: 82,
      yoy_pct_change: 4.9,
      financial_year: 'FY 2026'
    },
  ],
  Sales: [
    {
      kpi_name: 'Total Sales Revenue',
      category: 'Revenue',
      current_month: 'February',
      current_month_target: 500000,
      current_month_actual: 480000,
      previous_month: 'January',
      previous_month_actual: 465000,
      mom_pct_change: 3.2,
      current_quarter: 'Q4',
      current_quarter_target: 1500000,
      current_quarter_actual: 1425000,
      previous_quarter: 'Q3',
      previous_quarter_actual: 1380000,
      qoq_pct_change: 3.3,
      same_month_prior_year_actual: 440000,
      yoy_pct_change: 9.1,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Order Intake',
      category: 'Order Management',
      current_month: 'February',
      current_month_target: 12,
      current_month_actual: 11,
      previous_month: 'January',
      previous_month_actual: 10,
      mom_pct_change: 10.0,
      current_quarter: 'Q4',
      current_quarter_target: 36,
      current_quarter_actual: 32,
      previous_quarter: 'Q3',
      previous_quarter_actual: 30,
      qoq_pct_change: 6.7,
      same_month_prior_year_actual: 10,
      yoy_pct_change: 10.0,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Pipeline Conversion Rate',
      category: 'Conversion',
      current_month: 'February',
      current_month_target: 20,
      current_month_actual: 18,
      previous_month: 'January',
      previous_month_actual: 17,
      mom_pct_change: 5.9,
      current_quarter: 'Q4',
      current_quarter_target: 20,
      current_quarter_actual: 18.5,
      previous_quarter: 'Q3',
      previous_quarter_actual: 17,
      qoq_pct_change: 8.8,
      same_month_prior_year_actual: 16,
      yoy_pct_change: 12.5,
      financial_year: 'FY 2026'
    },
  ],
  Marketing: [
    {
      kpi_name: 'Website Traffic',
      category: 'Digital Marketing',
      current_month: 'February',
      current_month_target: 50000,
      current_month_actual: 48000,
      previous_month: 'January',
      previous_month_actual: 46000,
      mom_pct_change: 4.3,
      current_quarter: 'Q4',
      current_quarter_target: 150000,
      current_quarter_actual: 143000,
      previous_quarter: 'Q3',
      previous_quarter_actual: 135000,
      qoq_pct_change: 5.9,
      same_month_prior_year_actual: 44000,
      yoy_pct_change: 9.1,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Lead Generation',
      category: 'Lead Acquisition',
      current_month: 'February',
      current_month_target: 200,
      current_month_actual: 180,
      previous_month: 'January',
      previous_month_actual: 175,
      mom_pct_change: 2.9,
      current_quarter: 'Q4',
      current_quarter_target: 600,
      current_quarter_actual: 540,
      previous_quarter: 'Q3',
      previous_quarter_actual: 510,
      qoq_pct_change: 5.9,
      same_month_prior_year_actual: 165,
      yoy_pct_change: 9.1,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Campaign Reach',
      category: 'Campaign Performance',
      current_month: 'February',
      current_month_target: 100000,
      current_month_actual: 95000,
      previous_month: 'January',
      previous_month_actual: 92000,
      mom_pct_change: 3.3,
      current_quarter: 'Q4',
      current_quarter_target: 300000,
      current_quarter_actual: 285000,
      previous_quarter: 'Q3',
      previous_quarter_actual: 270000,
      qoq_pct_change: 5.6,
      same_month_prior_year_actual: 88000,
      yoy_pct_change: 7.95,
      financial_year: 'FY 2026'
    },
  ],
  RnD: [
    {
      kpi_name: 'Project Completion Rate',
      category: 'Project Management',
      current_month: 'February',
      current_month_target: 80,
      current_month_actual: 75,
      previous_month: 'January',
      previous_month_actual: 72,
      mom_pct_change: 4.2,
      current_quarter: 'Q4',
      current_quarter_target: 80,
      current_quarter_actual: 74,
      previous_quarter: 'Q3',
      previous_quarter_actual: 70,
      qoq_pct_change: 5.7,
      same_month_prior_year_actual: 68,
      yoy_pct_change: 10.3,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Innovation Index',
      category: 'Innovation',
      current_month: 'February',
      current_month_target: 85,
      current_month_actual: 82,
      previous_month: 'January',
      previous_month_actual: 80,
      mom_pct_change: 2.5,
      current_quarter: 'Q4',
      current_quarter_target: 85,
      current_quarter_actual: 81,
      previous_quarter: 'Q3',
      previous_quarter_actual: 78,
      qoq_pct_change: 3.8,
      same_month_prior_year_actual: 79,
      yoy_pct_change: 3.8,
      financial_year: 'FY 2026'
    },
  ],
  Finance: [
    {
      kpi_name: 'Monthly Gross Profit Margin',
      category: 'Profitability',
      current_month: 'February',
      current_month_target: 45,
      current_month_actual: 42,
      previous_month: 'January',
      previous_month_actual: 41,
      mom_pct_change: 2.4,
      current_quarter: 'Q4',
      current_quarter_target: 45,
      current_quarter_actual: 42.8,
      previous_quarter: 'Q3',
      previous_quarter_actual: 41.5,
      qoq_pct_change: 3.1,
      same_month_prior_year_actual: 39,
      yoy_pct_change: 7.7,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Cash Flow',
      category: 'Liquidity',
      current_month: 'February',
      current_month_target: 300000,
      current_month_actual: 280000,
      previous_month: 'January',
      previous_month_actual: 275000,
      mom_pct_change: 1.8,
      current_quarter: 'Q4',
      current_quarter_target: 900000,
      current_quarter_actual: 840000,
      previous_quarter: 'Q3',
      previous_quarter_actual: 810000,
      qoq_pct_change: 3.7,
      same_month_prior_year_actual: 260000,
      yoy_pct_change: 7.7,
      financial_year: 'FY 2026'
    },
    {
      kpi_name: 'Operating Expense Ratio',
      category: 'Cost Control',
      current_month: 'February',
      current_month_target: 35,
      current_month_actual: 38,
      previous_month: 'January',
      previous_month_actual: 39,
      mom_pct_change: -2.6,
      current_quarter: 'Q4',
      current_quarter_target: 35,
      current_quarter_actual: 37.5,
      previous_quarter: 'Q3',
      previous_quarter_actual: 38,
      qoq_pct_change: -1.3,
      same_month_prior_year_actual: 40,
      yoy_pct_change: -5.0,
      financial_year: 'FY 2026'
    },
  ],
};

interface TemplateOptions {
  month?: string;
  year?: number;
  includeInstructions?: boolean;
}

/**
 * Generate a multi-sheet Excel template for KPI data upload
 * @param options Configuration options for the template
 * @returns ArrayBuffer containing the Excel file
 */
export function generateExcelTemplate(options: TemplateOptions = {}): ArrayBuffer {
  const {
    month = 'February',
    year = 2026,
    includeInstructions = true,
  } = options;

  const workbook = XLSX.utils.book_new();

  // Add department sheets with sample data
  Object.entries(DEPARTMENT_DATA).forEach(([department, data]) => {
    // Create worksheet with sample data - map to new headers
    const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data.map(row => [
      row.kpi_name,
      row.category,
      row.current_month,
      row.current_month_target,
      row.current_month_actual,
      row.previous_month,
      row.previous_month_actual,
      row.mom_pct_change,
      row.current_quarter,
      row.current_quarter_target,
      row.current_quarter_actual,
      row.previous_quarter,
      row.previous_quarter_actual,
      row.qoq_pct_change,
      row.same_month_prior_year_actual,
      row.yoy_pct_change,
      row.financial_year,
    ])]);

    // Set column widths - adjusted for new columns
    worksheet['!cols'] = [
      { wch: 35 }, // KPI Name
      { wch: 25 }, // Category
      { wch: 15 }, // Current Month
      { wch: 18 }, // Current Month Target
      { wch: 18 }, // Current Month Actual
      { wch: 15 }, // Previous Month
      { wch: 18 }, // Previous Month Actual
      { wch: 15 }, // MoM % Change
      { wch: 15 }, // Current Quarter
      { wch: 18 }, // Current Quarter Target
      { wch: 18 }, // Current Quarter Actual
      { wch: 15 }, // Previous Quarter
      { wch: 18 }, // Previous Quarter Actual
      { wch: 15 }, // QoQ % Change
      { wch: 25 }, // Same Month Prior Year Actual
      { wch: 15 }, // YoY % Change
      { wch: 18 }, // Financial Year
    ];

    // Format header row with better styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Q1');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, size: 11 },
        fill: { fgColor: { rgb: '1F2937' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      };
    }

    // Add alternating row colors and borders for data rows
    const dataRange = XLSX.utils.decode_range(worksheet['!ref'] || `A1:Q${data.length + 1}`);
    for (let R = dataRange.s.r + 1; R <= dataRange.e.r; ++R) {
      for (let C = dataRange.s.c; C <= dataRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[address]) continue;
        
        // Alternate row colors
        const bgColor = R % 2 === 0 ? 'F9FAFB' : 'FFFFFF';
        
        // Number formatting for numeric columns
        let numFormat = undefined;
        if (C >= 3 && C <= 7) { // Numeric data columns
          numFormat = '#,##0.0';
        } else if (C === 7 || C === 13 || C === 15) { // Percentage columns
          numFormat = '0.0"%"';
        }
        
        worksheet[address].s = {
          fill: { fgColor: { rgb: bgColor }, patternType: 'solid' },
          border: {
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          },
          alignment: { horizontal: 'left', vertical: 'center' },
          numFmt: numFormat,
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, department);
  });

  // Add instructions sheet
  if (includeInstructions) {
    const instructionsData = [
      ['KPI Data Upload Instructions - Comprehensive Template', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['📋 TEMPLATE OVERVIEW', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['This enhanced template enables Month-over-Month (MoM), Quarter-over-Quarter (QoQ), and Year-over-Year (YoY) comparisons.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['🎯 COLUMN DEFINITIONS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Column', 'Description', 'Required', 'Example', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['KPI Name', 'The name/title of your KPI metric', 'YES', 'PEM Stack Units Shipped', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Category', 'Category or type of the KPI (e.g., Sales, Quality, Revenue)', 'YES', 'Sales Performance', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Current Month', 'Current month name', 'YES', 'February', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Current Month Target', 'Target value for current month', 'YES', '150', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Current Month Actual', 'Actual achieved value for current month', 'YES', '140', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Previous Month', 'Previous month name (for MoM comparison)', 'YES', 'January', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Previous Month Actual', 'Actual value from previous month', 'YES', '135', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['MoM % Change', 'Month-over-Month percentage change (calculated)', 'AUTO', '3.7 (for 3.7% growth)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Current Quarter', 'Current quarter designation', 'YES', 'Q4', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Current Quarter Target', 'Target value for current quarter', 'YES', '450', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Current Quarter Actual', 'Actual achieved value for current quarter', 'YES', '418', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Previous Quarter', 'Previous quarter name (for QoQ comparison)', 'YES', 'Q3', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Previous Quarter Actual', 'Actual value from previous quarter', 'YES', '400', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['QoQ % Change', 'Quarter-over-Quarter percentage change (calculated)', 'AUTO', '4.5 (for 4.5% growth)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Same Month Prior Year Actual', 'Actual value from same month in previous year', 'YES', '120', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['YoY % Change', 'Year-over-Year percentage change (calculated)', 'AUTO', '16.7 (for 16.7% growth)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Financial Year', 'Financial year designation', 'YES', 'FY 2026', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['✅ BEST PRACTICES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['1. Fill in ALL required columns (marked with YES)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['2. Use exact month names: January, February, March, April, May, June, July, August, September, October, November, December', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['3. Use quarter format: Q1, Q2, Q3, Q4', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['4. All numeric values should be numbers, not text', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['5. Percentage changes can be auto-calculated or filled manually (leave blank to auto-calculate)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['6. Keep the financial_year format consistent (e.g., FY 2025, FY 2026)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['7. Do not rename or delete sheets', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['8. Do not modify column headers', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['📊 COMPARISON INSIGHTS', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• MoM Comparison: Compare current month actual vs previous month actual to track short-term trends', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• QoQ Comparison: Compare current quarter actual vs previous quarter actual to track medium-term trends', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• YoY Comparison: Compare current month actual vs same month prior year to track annual growth and seasonality', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['🚀 FILE STRUCTURE', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Your Excel file should contain separate sheets for each department:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• Product', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• Sales', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• Marketing', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• RnD', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['• Finance', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [
      { wch: 35 }, // Column 1
      { wch: 50 }, // Column 2
      { wch: 12 }, // Column 3
      { wch: 35 }, // Column 4
      ...Array(13).fill({ wch: 12 }), // Remaining columns
    ];

    // Format title
    if (instructionsSheet['A1']) {
      instructionsSheet['A1'].s = {
        font: { bold: true, size: 14, color: { rgb: '1F2937' } },
        alignment: { horizontal: 'left', vertical: 'center' },
      };
    }

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
  }

  // Generate file and write to buffer
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return buffer as ArrayBuffer;
}

/**
 * Trigger a download of the Excel template
 * @param month Month for the template (default: current month)
 * @param year Year for the template (default: current year)
 */
export function downloadExcelTemplate(month: string = 'February', year: number = 2026): void {
  const buffer = generateExcelTemplate({ month, year });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `KPI-Data-Template-Comprehensive-${month}-${year}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
