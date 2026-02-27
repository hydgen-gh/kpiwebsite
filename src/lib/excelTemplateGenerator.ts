/**
 * Excel Template Generator for Multi-Department KPI Upload
 * Generates a structured Excel file with separate sheets for each department
 */

import * as XLSX from 'xlsx';

// Column headers for KPI data
const HEADERS = ['kpi_name', 'month', 'target', 'actual', 'category', 'financial_year'];

// Department-specific sample data
const DEPARTMENT_DATA = {
  Product: [
    { kpi_name: 'PEM Stack Units Shipped', month: 'January', target: 150, actual: 140, category: 'Sales Performance', financial_year: 'FY 2025' },
    { kpi_name: 'AEM Stack Units Shipped', month: 'January', target: 80, actual: 75, category: 'Sales Performance', financial_year: 'FY 2025' },
    { kpi_name: 'Product Quality Score', month: 'January', target: 95, actual: 93, category: 'Quality Metrics', financial_year: 'FY 2025' },
    { kpi_name: 'Manufacturing Efficiency', month: 'January', target: 88, actual: 86, category: 'Operational', financial_year: 'FY 2025' },
    { kpi_name: 'Defect Rate (%)', month: 'January', target: 2, actual: 2.5, category: 'Quality Metrics', financial_year: 'FY 2025' },
    { kpi_name: 'On-Time Delivery (%)', month: 'January', target: 98, actual: 97, category: 'Operational', financial_year: 'FY 2025' },
  ],
  Sales: [
    { kpi_name: 'Total Sales Revenue', month: 'January', target: 500000, actual: 480000, category: 'Revenue', financial_year: 'FY 2025' },
    { kpi_name: 'Order Intake', month: 'January', target: 12, actual: 11, category: 'Order Management', financial_year: 'FY 2025' },
    { kpi_name: 'Pipeline Conversion Rate (%)', month: 'January', target: 20, actual: 18, category: 'Conversion', financial_year: 'FY 2025' },
    { kpi_name: 'Active Customers', month: 'January', target: 45, actual: 42, category: 'Customer Management', financial_year: 'FY 2025' },
    { kpi_name: 'Average Deal Size', month: 'January', target: 50000, actual: 48000, category: 'Revenue', financial_year: 'FY 2025' },
    { kpi_name: 'Sales Target Achievement (%)', month: 'January', target: 100, actual: 96, category: 'Performance', financial_year: 'FY 2025' },
  ],
  Marketing: [
    { kpi_name: 'Website Traffic', month: 'January', target: 50000, actual: 48000, category: 'Digital Marketing', financial_year: 'FY 2025' },
    { kpi_name: 'Lead Generation', month: 'January', target: 200, actual: 180, category: 'Lead Acquisition', financial_year: 'FY 2025' },
    { kpi_name: 'Campaign Reach', month: 'January', target: 100000, actual: 95000, category: 'Campaign Performance', financial_year: 'FY 2025' },
    { kpi_name: 'Email Open Rate (%)', month: 'January', target: 35, actual: 32, category: 'Email Marketing', financial_year: 'FY 2025' },
    { kpi_name: 'Cost Per Lead', month: 'January', target: 25, actual: 28, category: 'Cost Efficiency', financial_year: 'FY 2025' },
    { kpi_name: 'Marketing ROI (%)', month: 'January', target: 300, actual: 280, category: 'ROI', financial_year: 'FY 2025' },
  ],
  RnD: [
    { kpi_name: 'R&D Project Completion Rate (%)', month: 'January', target: 80, actual: 75, category: 'Project Management', financial_year: 'FY 2025' },
    { kpi_name: 'Innovation Index', month: 'January', target: 85, actual: 82, category: 'Innovation', financial_year: 'FY 2025' },
    { kpi_name: 'Patent Applications', month: 'January', target: 3, actual: 2, category: 'IP', financial_year: 'FY 2025' },
    { kpi_name: 'Technology Stack Updates', month: 'January', target: 5, actual: 4, category: 'Technology', financial_year: 'FY 2025' },
    { kpi_name: 'Prototype Success Rate (%)', month: 'January', target: 70, actual: 65, category: 'Prototyping', financial_year: 'FY 2025' },
    { kpi_name: 'R&D Efficiency Score', month: 'January', target: 90, actual: 87, category: 'Operational', financial_year: 'FY 2025' },
  ],
  Finance: [
    { kpi_name: 'Monthly Gross Profit Margin (%)', month: 'January', target: 45, actual: 42, category: 'Profitability', financial_year: 'FY 2025' },
    { kpi_name: 'Cash Flow', month: 'January', target: 300000, actual: 280000, category: 'Liquidity', financial_year: 'FY 2025' },
    { kpi_name: 'Accounts Receivable Days', month: 'January', target: 30, actual: 32, category: 'Working Capital', financial_year: 'FY 2025' },
    { kpi_name: 'Operating Expense Ratio (%)', month: 'January', target: 35, actual: 38, category: 'Cost Control', financial_year: 'FY 2025' },
    { kpi_name: 'Total Assets Turnover', month: 'January', target: 1.5, actual: 1.4, category: 'Asset Efficiency', financial_year: 'FY 2025' },
    { kpi_name: 'Debt to Equity Ratio', month: 'January', target: 0.5, actual: 0.55, category: 'Financial Health', financial_year: 'FY 2025' },
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
    month = 'January',
    year = 2025,
    includeInstructions = true,
  } = options;

  const workbook = XLSX.utils.book_new();

  // Add department sheets with sample data
  Object.entries(DEPARTMENT_DATA).forEach(([department, data]) => {
    // Create worksheet with sample data
    const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data.map(row => [
      row.kpi_name,
      row.month,
      row.target,
      row.actual,
      row.category,
      row.financial_year,
    ])]);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // kpi_name
      { wch: 15 }, // month
      { wch: 12 }, // target
      { wch: 12 }, // actual
      { wch: 20 }, // category
      { wch: 15 }, // financial_year
    ];

    // Format header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F1');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2563EB' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }

    // Add alternating row colors for data rows
    const dataRange = XLSX.utils.decode_range(worksheet['!ref'] || `A1:F${data.length + 1}`);
    for (let R = dataRange.s.r + 1; R <= dataRange.e.r; ++R) {
      for (let C = dataRange.s.c; C <= dataRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[address]) continue;
        if (R % 2 === 0) {
          worksheet[address].s = {
            fill: { fgColor: { rgb: 'F0F9FF' }, patternType: 'solid' },
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, department);
  });

  // Add instructions sheet
  if (includeInstructions) {
    const instructionsData = [
      ['KPI Data Upload Instructions', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['File Structure:', '', '', '', '', ''],
      ['• Each department has its own sheet: Product, Sales, Marketing, RnD, Finance', '', '', '', '', ''],
      ['• Fill in the data for your organization', '', '', '', '', ''],
      ['• Required columns: kpi_name, month, target, actual, category, financial_year', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Column Descriptions:', '', '', '', '', ''],
      ['kpi_name', 'Name of the KPI metric (required)', '', '', '', ''],
      ['month', 'Month name (e.g., January, February, etc.)', '', '', '', ''],
      ['target', 'Target value for the metric', '', '', '', ''],
      ['actual', 'Actual achieved value', '', '', '', ''],
      ['category', 'Category/Type of the KPI', '', '', '', ''],
      ['financial_year', 'Financial year (e.g., FY 2025)', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Important Notes:', '', '', '', '', ''],
      ['1. Do not change the column headers', '', '', '', '', ''],
      ['2. Do not rename or delete sheets', '', '', '', '', ''],
      ['3. All numeric values should be numbers, not text', '', '', '', '', ''],
      ['4. Month names should match exactly: January, February, March, etc.', '', '', '', '', ''],
      ['5. Keep the financial_year format consistent (e.g., FY 2025, FY 2026)', '', '', '', '', ''],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 50 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];

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
export function downloadExcelTemplate(month: string = 'January', year: number = 2025): void {
  const buffer = generateExcelTemplate({ month, year });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `KPI-Data-Template-${month}-${year}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
