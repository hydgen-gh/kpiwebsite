import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, FileCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useKPI } from '../kpi/KPIContext';
import * as XLSX from 'xlsx';
import { FULL_MONTHS } from '../../lib/quarterUtils';

const DEPARTMENT_SHEETS = ['Product', 'Sales', 'Marketing', 'RnD', 'Finance'];
const REQUIRED_COLUMNS = ['kpi_name', 'month', 'target', 'actual'];

interface SheetUploadResult {
  department: string;
  success: boolean;
  recordsUploaded: number;
  error?: string;
}

interface ParsedKPIData {
  department: string;
  kpi_name: string;
  month: string;
  quarter: string;
  financial_year: string;
  target: number;
  actual: number;
  category: string;
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
  const getQuarterFromMonth = (month: string): string => {
    const fullMonth = FULL_MONTHS.find(m => m.toLowerCase() === month.toLowerCase());
    if (!fullMonth) return 'Q4';
    
    if (['January', 'February', 'March'].includes(fullMonth)) return 'Q4';
    if (['April', 'May', 'June'].includes(fullMonth)) return 'Q1';
    if (['July', 'August', 'September'].includes(fullMonth)) return 'Q2';
    if (['October', 'November', 'December'].includes(fullMonth)) return 'Q3';
    return 'Q4';
  };

  /**
   * Parse Excel file with multiple sheets
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

              // Map data
              const kpiData: ParsedKPIData[] = jsonData.map((row: any) => {
                const month = (row.month || row.Month || '').toString().trim();
                const fullMonth = FULL_MONTHS.find(m => m.toLowerCase() === month.toLowerCase()) || month;

                return {
                  department,
                  kpi_name: (row.kpi_name || row['KPI Name'] || row.kpi || '').toString().trim(),
                  month: fullMonth,
                  quarter: getQuarterFromMonth(month),
                  financial_year: (row.financial_year || row['Financial Year'] || 'FY 2025').toString().trim(),
                  target: parseFloat(row.target || row.Target || 0),
                  actual: parseFloat(row.actual || row.Actual || 0),
                  category: (row.category || row.Category || 'General').toString().trim(),
                };
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

        // Validate required fields
        const validData = data.filter(item =>
          item.kpi_name && item.month && !isNaN(item.target) && !isNaN(item.actual)
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
        const { error } = await supabase
          .from(tableName)
          .insert(validData);

        if (error) {
          results.push({
            department,
            success: false,
            recordsUploaded: 0,
            error: error.message,
          });
        } else {
          results.push({
            department,
            success: true,
            recordsUploaded: validData.length,
          });
          successCount++;
        }
      } catch (error: any) {
        results.push({
          department,
          success: false,
          recordsUploaded: 0,
          error: error.message,
        });
      }
    }

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

      // Reload context
      try {
        await reload();
      } catch (e) {
        console.error('Reload error:', e);
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
    const file = e.dataTransfer.files[0];
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
            <p className="text-sm font-medium text-green-900 mb-2">✓ Example Structure</p>
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