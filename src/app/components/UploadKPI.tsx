import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, FileCheck, Download, Calendar, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useKPI } from '../kpi/KPIContext';
import * as XLSX from 'xlsx';

import { downloadExcelTemplate } from '../../lib/excelTemplateGenerator';

const DEPARTMENT_SHEETS = ['Product', 'Sales', 'Marketing', 'RnD', 'Finance'];
// const REQUIRED_COLUMNS = ['KPI Name', 'Category', 'Actual (Q4)'];

interface SheetUploadResult {
  department: string;
  success: boolean;
  recordsUploaded: number;
  error?: string;
}

interface ParsedKPIData {
  department: string;
  kpi_name: string;
  category: string;
  
  // Tracking scorecard format
  sn?: number;
  target_quarter?: number;
  actual_qtd?: number;
  target_q4?: number;
  actual_jan?: number;
  actual_feb?: number;
  actual_mar?: number;
  actual_q4?: number;
  progress?: string; // R (Red), Y (Yellow), G (Green)
  commentary?: string;
  
  // Current period (for backward compatibility)
  current_month?: string;
  current_month_target?: number;
  current_month_actual?: number;
  
  // MoM comparison (for backward compatibility)
  previous_month?: string;
  previous_month_actual?: number;
  mom_pct_change?: number;
  
  // Current quarter (for backward compatibility)
  current_quarter?: string;
  current_quarter_target?: number;
  current_quarter_actual?: number;
  
  // QoQ comparison (for backward compatibility)
  previous_quarter?: string;
  previous_quarter_actual?: number;
  qoq_pct_change?: number;
  
  // YoY comparison (for backward compatibility)
  same_month_prior_year_actual?: number;
  yoy_pct_change?: number;
  
  // Utility fields
  financial_year?: string;
  quarter?: string;
  month?: string;
  target?: number;
  actual?: number;
}

export default function UploadKPI() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadResults, setUploadResults] = useState<SheetUploadResult[]>([]);
  const { reload } = useKPI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Get quarter from month name
   */
  // const getQuarterFromMonth = (month: string): string => {
  //   const fullMonth = FULL_MONTHS.find(m => m.toLowerCase() === month.toLowerCase());
  //   if (!fullMonth) return 'Q4';
  //   
  //   if (['January', 'February', 'March'].includes(fullMonth)) return 'Q4';
  //   if (['April', 'May', 'June'].includes(fullMonth)) return 'Q1';
  //   if (['July', 'August', 'September'].includes(fullMonth)) return 'Q2';
  //   if (['October', 'November', 'December'].includes(fullMonth)) return 'Q3';
  //   return 'Q4';
  // };

  /**
   * Parse Excel file with multiple sheets - NEW FORMAT with comparisons
   */
  const parseExcelFile = (file: File): Promise<Record<string, ParsedKPIData[]>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const result: Record<string, ParsedKPIData[]> = {};

          // Find matching sheets
          const foundSheets = workbook.SheetNames.filter(name =>
            DEPARTMENT_SHEETS.some(dept => name.toLowerCase().includes(dept.toLowerCase()))
          );

          if (foundSheets.length === 0) {
            throw new Error(
              `No department sheets found. Expected sheets named: ${DEPARTMENT_SHEETS.join(', ')}`
            );
          }

          // Parse each sheet
          foundSheets.forEach(sheetName => {
            try {
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);

              // Map department
              const department = DEPARTMENT_SHEETS.find(dept =>
                sheetName.toLowerCase().includes(dept.toLowerCase())
              ) || sheetName;

              // Map data with tracking scorecard structure
              const kpiData: ParsedKPIData[] = jsonData.map((row: any) => {
                // Helper function to normalize column names (handle both cases)
                const getCol = (names: string[]): any => {
                  for (const name of names) {
                    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                      return row[name];
                    }
                  }
                  return undefined;
                };

                // Parse numeric values
                const parseNum = (val: any): number => {
                  if (!val && val !== 0) return 0;
                  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
                  return isNaN(num) ? 0 : num;
                };

                // Extract tracking scorecard columns
                const sn = parseNum(getCol(['S/N', 's/n', 'sn']));
                const kpiName = getCol(['KPI Name', 'kpi_name', 'KPI']) || 'Unknown';
                const category = getCol(['Category', 'category']) || 'Uncategorized';
                const targetQuarter = parseNum(getCol(['Target (Quarter)', 'target_quarter', 'Target (Quarter)']));
                const actualQtd = parseNum(getCol(['Actual (QTD)', 'actual_qtd', 'Actual (QTD)']));
                const targetQ4 = parseNum(getCol(['Target (Q4)', 'target_q4', 'Target (Q4)']));
                const actualJan = parseNum(getCol(['Actual (Jan)', 'actual_jan', 'Actual (Jan)']));
                const actualFeb = parseNum(getCol(['Actual (Feb)', 'actual_feb', 'Actual (Feb)']));
                const actualMar = parseNum(getCol(['Actual (Mar)', 'actual_mar', 'Actual (Mar)']));
                const actualQ4 = parseNum(getCol(['Actual (Q4)', 'actual_q4', 'Actual (Q4)']));
                const progress = getCol(['Progress (R/Y/G)', 'progress', 'Progress (R/Y/G)']) || '';
                const commentary = getCol(['Commentary', 'commentary', 'Commentary']) || '';

                // Build record with tracking format
                const record: ParsedKPIData = {
                  department,
                  kpi_name: kpiName.toString().trim(),
                  category: category.toString().trim(),
                  
                  // Tracking scorecard format
                  sn,
                  target_quarter: targetQuarter,
                  actual_qtd: actualQtd,
                  target_q4: targetQ4,
                  actual_jan: actualJan,
                  actual_feb: actualFeb,
                  actual_mar: actualMar,
                  actual_q4: actualQ4,
                  progress: progress.toString().toUpperCase().trim(),
                  commentary: commentary.toString().trim(),
                  
                  // Backward compatibility: use Q4 as default quarter
                  current_month: 'March', // Last month of Q4
                  current_month_actual: actualQ4,
                  current_month_target: targetQ4,
                  current_quarter: 'Q4',
                  current_quarter_actual: actualQ4,
                  current_quarter_target: targetQ4,
                  
                  // Utility fields
                  financial_year: 'FY 2026',
                  quarter: 'Q4',
                  month: 'March',
                  target: targetQ4,
                  actual: actualQ4,
                };

                return record;
              });

              result[department] = kpiData;
            } catch (sheetError: any) {
              console.error(`Error parsing ${sheetName}:`, sheetError);
            }
          });

          if (Object.keys(result).length === 0) {
            throw new Error('No valid data found in any sheets');
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  /**
   * Upload data to Supabase for each department
   */
  const uploadToSupabase = async (allData: Record<string, ParsedKPIData[]>) => {
    const results: SheetUploadResult[] = [];
    let successCount = 0;

    for (const [department, data] of Object.entries(allData)) {
      try {
        if (data.length === 0) {
          results.push({
            department,
            success: false,
            recordsUploaded: 0,
            error: 'No valid data found',
          });
          continue;
        }

        // Validate required fields (tracking scorecard format)
        const validData = data.filter(item =>
          item.kpi_name && 
          item.category && 
          (item.actual_q4 !== undefined && item.actual_q4 !== null)
        );

        if (validData.length === 0) {
          results.push({
            department,
            success: false,
            recordsUploaded: 0,
            error: 'No records met validation requirements',
          });
          continue;
        }

        // Insert into appropriate table
        const tableName = getTableNameForDepartment(department);
        console.log(`Uploading ${validData.length} records to ${tableName}`);
        
        const { data: _uploadedData, error } = await supabase
          .from(tableName)
          .insert(validData);

        if (error) {
          console.error(`Upload error for ${tableName}:`, error);
          results.push({
            department,
            success: false,
            recordsUploaded: 0,
            error: error.message,
          });
        } else {
          console.log(`Successfully uploaded ${validData.length} records to ${tableName}`);
          results.push({
            department,
            success: true,
            recordsUploaded: validData.length,
          });
          successCount++;
        }
      } catch (error: any) {
        console.error(`Exception uploading ${department}:`, error);
        results.push({
          department,
          success: false,
          recordsUploaded: 0,
          error: error.message || 'Unknown error during upload',
        });
      }
    }

    console.log('Upload results:', results);
    return { results, successCount };
  };

  /**
   * Get Supabase table name for department
   */
  const getTableNameForDepartment = (department: string): string => {
    const mapping: Record<string, string> = {
      Product: 'product_kpis',
      Sales: 'sales_kpis',
      Marketing: 'marketing_kpis',
      RnD: 'rnd_kpis',
      Finance: 'finance_kpis',
    };
    return mapping[department] || `${department.toLowerCase()}_kpis`;
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setStatus('error');
      setMessage('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setUploading(true);
      setStatus('uploading');
      setMessage('Parsing Excel file...');

      const allData = await parseExcelFile(file);
      setMessage('Uploading to database...');

      const { results, successCount } = await uploadToSupabase(allData);
      setUploadResults(results);

      if (successCount === results.length) {
        setStatus('success');
        setMessage(`Successfully uploaded data for ${successCount} department(s)!`);
      } else if (successCount > 0) {
        setStatus('success');
        setMessage(`Successfully uploaded data for ${successCount} out of ${results.length} department(s)`);
      } else {
        setStatus('error');
        setMessage('Failed to upload data for any departments');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload context with timeout
      setMessage('Refreshing dashboard data...');
      try {
        const reloadPromise = reload();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Reload timeout')), 5000)
        );
        await Promise.race([reloadPromise, timeoutPromise]);
      } catch (reloadError) {
        console.error('Reload error:', reloadError);
        // Still show success if upload worked, even if reload fails
        if (successCount === 0) {
          setStatus('error');
          setMessage('Upload succeeded but failed to refresh dashboard');
        }
      }

      // Reset after 8 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setUploadResults([]);
      }, 8000);
    } catch (error: any) {
      console.error('File parse error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to process the file');
      setUploading(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-teal-50', 'border-teal-400');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-teal-50', 'border-teal-400');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-teal-50', 'border-teal-400');
    if (fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload KPI Data</h2>
        <p className="text-slate-600">Upload an Excel file with multiple sheets for all departments</p>
      </div>

      {/* Monthly Upload Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Upload Box */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-200">
          <div className="flex items-start gap-3 mb-2">
            <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Monthly Data Upload</h3>
              <p className="text-xs text-slate-600 mt-1">
                Department heads can upload monthly KPI values separately for January and February, keeping track of individual month performance.
              </p>
            </div>
          </div>
        </div>

        {/* SharePoint Access Box */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-200">
          <div className="flex items-start gap-3 mb-2">
            <Share2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">SharePoint Integration</h3>
              <p className="text-xs text-slate-600 mt-1">
                This dashboard will sync with your SharePoint folder for easy file sharing and version control. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Template Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Need a template?</p>
              <p className="text-sm text-slate-600">Download a pre-formatted Excel file with all department sheets</p>
            </div>
          </div>
          <button
            onClick={() => downloadExcelTemplate('January', 2025)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center transition-all hover:border-teal-400 cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-input"
          />

          <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 mb-2">
                {uploading ? `${status === 'uploading' ? 'Processing' : 'Uploading'}...` : 'Drop your Excel file here'}
              </p>
              <p className="text-sm text-slate-600">
                {uploading ? status === 'uploading' ? message : 'Processing your file' : 'or click to browse (one file with multiple sheets)'}
              </p>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 mt-4">
                <Loader className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-sm text-teal-600 font-medium">{message}</span>
              </div>
            )}
          </label>
        </div>

        {/* Status Messages */}
        {status !== 'idle' && (
          <div className="mt-6 space-y-4">
            {status === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-900">{message}</p>
                  <p className="text-sm text-emerald-700 mt-1">Your dashboards will now display the updated data</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">{message}</p>
                  <p className="text-sm text-red-700 mt-1">Please check your file format and try again</p>
                </div>
              </div>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900 mb-3">Upload Details:</p>
                <div className="space-y-2">
                  {uploadResults.map((result, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      {result.success ? (
                        <>
                          <FileCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-slate-700">
                            <span className="font-medium">{result.department}:</span>{' '}
                            <span className="text-green-700">
                              {result.recordsUploaded} records uploaded
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="text-slate-700">
                            <span className="font-medium">{result.department}:</span>{' '}
                            <span className="text-red-700">{result.error}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Template Info */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-3">📋 File Format Requirements</p>
            <p className="text-sm text-blue-700 mb-3">
              Your Excel file should contain separate sheets for each department:
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DEPARTMENT_SHEETS.map(dept => (
                <div key={dept} className="bg-white px-3 py-2 rounded border border-blue-100 text-xs font-mono text-blue-900">
                  Sheet: "{dept}"
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-700 font-medium mb-2">Each sheet must have these columns:</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'kpi_name', desc: 'Name of the KPI' },
                { name: 'month', desc: 'Full month name (January, etc.)' },
                { name: 'target', desc: 'Target value (number)' },
                { name: 'actual', desc: 'Actual value (number)' },
                { name: 'category', desc: 'KPI category (optional)' },
                { name: 'financial_year', desc: 'e.g., FY 2025 (optional)' },
              ].map(col => (
                <div key={col.name} className="bg-white p-3 rounded border border-blue-100">
                  <p className="text-xs font-mono font-semibold text-slate-700">{col.name}</p>
                  <p className="text-xs text-slate-600 mt-1">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-2">Example Structure</p>
            <p className="text-xs text-green-700 mb-2">
              File: "KPI_Data_2025.xlsx" with sheets: Product, Sales, Marketing, RnD, Finance
            </p>
            <div className="bg-white p-2 rounded border border-green-100 text-xs font-mono text-slate-600 overflow-x-auto">
              <div>| kpi_name | month | target | actual | category |</div>
              <div>| Revenue Growth | January | 100000 | 95000 | General |</div>
              <div>| Customer Engagement | January | 50 | 48 | Marketing |</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}