/**
 * Excel Template Generator for Multi-Department KPI Upload
 * Aligned with actual tracking file structure
 */

import * as XLSX from 'xlsx';

// Column headers matching tracking file format
const HEADERS = [
  'S/N',
  'KPI Name',
  'Category',
  'Target (Quarter)',
  'Actual (QTD)',
  'Target (Q4)',
  'Actual (Jan)',
  'Actual (Feb)',
  'Actual (Mar)',
  'Actual (Q4)',
  'Progress (R/Y/G)',
  'Commentary',
];

// Department-specific sample data matching tracking file format
const DEPARTMENT_DATA = {
  Product: [
    {
      sn: 1,
      kpi_name: 'PEM Stack Units Shipped',
      category: 'Stack Performance',
      target_quarter: 300,
      actual_qtd: 280,
      target_q4: 450,
      actual_jan: 90,
      actual_feb: 140,
      actual_mar: 150,
      actual_q4: 380,
      progress: 'G',
      commentary: 'On track for Q4 deliverables'
    },
    {
      sn: 2,
      kpi_name: 'AEM Stack Units Shipped',
      category: 'Stack Performance',
      target_quarter: 150,
      actual_qtd: 130,
      target_q4: 240,
      actual_jan: 40,
      actual_feb: 75,
      actual_mar: 80,
      actual_q4: 195,
      progress: 'Y',
      commentary: 'Slightly behind, expect catch-up in Mar'
    },
    {
      sn: 3,
      kpi_name: 'Manufacturing Efficiency',
      category: 'Manufacturing Performance',
      target_quarter: 88,
      actual_qtd: 85.5,
      target_q4: 88,
      actual_jan: 84,
      actual_feb: 86,
      actual_mar: 87.5,
      actual_q4: 85.8,
      progress: 'G',
      commentary: 'Good improvement trend'
    },
  ],
  Sales: [
    {
      sn: 1,
      kpi_name: 'Order Intake ($)',
      category: 'Revenue Realisation',
      target_quarter: 1500000,
      actual_qtd: 1425000,
      target_q4: 2250000,
      actual_jan: 400000,
      actual_feb: 480000,
      actual_mar: 545000,
      actual_q4: 1425000,
      progress: 'Y',
      commentary: 'Strong Feb-Mar performance, tracking well'
    },
    {
      sn: 2,
      kpi_name: 'Deal Count',
      category: 'Deal Creation',
      target_quarter: 15,
      actual_qtd: 12,
      target_q4: 22,
      actual_jan: 4,
      actual_feb: 5,
      actual_mar: 7,
      actual_q4: 16,
      progress: 'R',
      commentary: 'Pipeline development proceeding'
    },
  ],
  Marketing: [
    {
      sn: 1,
      kpi_name: 'Marketing Qualified Leads (MQL)',
      category: 'Qualified Inbound',
      target_quarter: 450,
      actual_qtd: 420,
      target_q4: 650,
      actual_jan: 140,
      actual_feb: 145,
      actual_mar: 160,
      actual_q4: 445,
      progress: 'G',
      commentary: 'Exceeding targets with new campaigns'
    },
    {
      sn: 2,
      kpi_name: 'Lead Quality Score',
      category: 'ICP Alignment',
      target_quarter: 74,
      actual_qtd: 72,
      target_q4: 75,
      actual_jan: 70,
      actual_feb: 73,
      actual_mar: 74,
      actual_q4: 72.3,
      progress: 'Y',
      commentary: 'Good quality, improving month-over-month'
    },
  ],
  RnD: [
    {
      sn: 1,
      kpi_name: 'Technology Milestones Achieved',
      category: 'Technology Risk Reduction',
      target_quarter: 6,
      actual_qtd: 5,
      target_q4: 8,
      actual_jan: 2,
      actual_feb: 2,
      actual_mar: 2,
      actual_q4: 6,
      progress: 'G',
      commentary: 'Tracking to completion'
    },
    {
      sn: 2,
      kpi_name: 'Patents Filed',
      category: 'IP Strength',
      target_quarter: 3,
      actual_qtd: 2,
      target_q4: 4,
      actual_jan: 0,
      actual_feb: 2,
      actual_mar: 1,
      actual_q4: 3,
      progress: 'G',
      commentary: 'Strong IP generation'
    },
  ],
  Finance: [
    {
      sn: 1,
      kpi_name: 'Cash Balance ($)',
      category: 'Liquidity Position',
      target_quarter: 5000000,
      actual_qtd: 5200000,
      target_q4: 5500000,
      actual_jan: 5680000,
      actual_feb: 5200000,
      actual_mar: 5100000,
      actual_q4: 5100000,
      progress: 'Y',
      commentary: 'Good cash position, managed burn rate'
    },
    {
      sn: 2,
      kpi_name: 'Underlying Operating Burn ($)',
      category: 'Burn Rate',
      target_quarter: 500000,
      actual_qtd: 520000,
      target_q4: 500000,
      actual_jan: 180000,
      actual_feb: 180000,
      actual_mar: 160000,
      actual_q4: 520000,
      progress: 'Y',
      commentary: 'Within budget, improving efficiency'
    },
    {
      sn: 3,
      kpi_name: 'Runway (months)',
      category: 'Runway',
      target_quarter: 10,
      actual_qtd: 10.8,
      target_q4: 11,
      actual_jan: 10.9,
      actual_feb: 10.8,
      actual_mar: 10.7,
      actual_q4: 10.7,
      progress: 'G',
      commentary: 'Runway extending with improved burn control'
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
    // month = 'February',
    // year = 2026,
    includeInstructions = true,
  } = options;

  const workbook = XLSX.utils.book_new();

  // Add department sheets with sample data
  Object.entries(DEPARTMENT_DATA).forEach(([department, data]) => {
    // Create worksheet with sample data - map to new tracking file format headers
    const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data.map(row => [
      row.sn,
      row.kpi_name,
      row.category,
      row.target_quarter,
      row.actual_qtd,
      row.target_q4,
      row.actual_jan,
      row.actual_feb,
      row.actual_mar,
      row.actual_q4,
      row.progress,
      row.commentary,
    ])]);

    // Set column widths - adjusted for tracking file format
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
