import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useKPI } from '../kpi/KPIContext';
import * as XLSX from 'xlsx';

interface BDData {
  quarter: string;
  section: string;
  region: string;
  metric: string;
  value: number;
}

export default function UploadKPI() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { reload } = useKPI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExcelFile = (file: File): Promise<BDData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Read from BD_Dashboard sheet
          const sheetName = 'BD_Dashboard';
          if (!workbook.SheetNames.includes(sheetName)) {
            throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Map Excel data to BDData format
          const bdData: BDData[] = jsonData.map((row: any) => {
            // accept month/period/date/quarter columns
            const period = (row.month || row.Month || row.period || row.Period || row.date || row.Date || row.quarter || row.Quarter || '').toString();
            return {
              quarter: period.trim(),
              section: (row.section || row.Section || '').toLowerCase().trim(),
              region: (row.region || row.Region || '').toLowerCase().trim(),
              metric: (row.metric || row.Metric || '').toLowerCase().trim(),
              value: parseFloat(row.value || row.Value || 0),
            };
          });
          
          resolve(bdData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  const uploadToSupabase = async (bdData: BDData[]) => {
    try {
      setUploading(true);
      setStatus('idle');

      // Insert new data into bd_dashboard_data table
      const { error: insertError } = await supabase
        .from('bd_dashboard_data')
        .insert(bdData);

      if (insertError) throw insertError;

      setStatus('success');
      const samplePeriod = bdData[0]?.quarter || '';
      setMessage(`Successfully uploaded ${bdData.length} BD Dashboard records${samplePeriod ? ' for ' + samplePeriod : ''}!`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to upload BD Dashboard data');
    } finally {
      setUploading(false);
    }
  };

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
      setStatus('idle');
      const bdData = await parseExcelFile(file);
      
      if (bdData.length === 0) {
        setStatus('error');
        setMessage('No valid data found in the file');
        setUploading(false);
        return;
      }

      // Validate data
      const validData = bdData.filter(item => item.section && item.region && item.metric && !isNaN(item.value));
      if (validData.length === 0) {
        setStatus('error');
        setMessage('No valid BD records found. Please ensure columns: section, region, metric, value');
        setUploading(false);
        return;
      }

      await uploadToSupabase(validData);
      // reload context so dashboards reflect uploaded months
      try { await reload(); } catch (e) { /* ignore */ }
    } catch (error: any) {
      console.error('File parse error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to process the file');
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
                {uploading ? 'Uploading...' : 'Drop your Excel file here'}
              </p>
              <p className="text-sm text-slate-600">
                or click to browse
              </p>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 mt-4">
                <Loader className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-sm text-teal-600 font-medium">Processing...</span>
              </div>
            )}
          </label>
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className="mt-6">
            {status === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-900">{message}</p>
                  <p className="text-sm text-emerald-700 mt-1">Your dashboards will now display the updated data</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">{message}</p>
                  <p className="text-sm text-red-700 mt-1">Please check your file format and try again</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Template Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">📋 Required File Format</p>
          <p className="text-sm text-blue-700 mb-3">Your Excel file should have sheets named according to the departments with these columns:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-blue-100">
              <p className="text-xs font-mono text-slate-600">section</p>
              <p className="text-xs text-slate-500 mt-1">kpi, funnel, market, deal_size, pipeline_health, technology, sectors</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-100">
              <p className="text-xs font-mono text-slate-600">region</p>
              <p className="text-xs text-slate-500 mt-1">india, row, overall</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-100">
              <p className="text-xs font-mono text-slate-600">metric</p>
              <p className="text-xs text-slate-500 mt-1">e.g., bookings, revenue, leads, proposal</p>
            </div>
            <div className="bg-white p-3 rounded border border-blue-100">
              <p className="text-xs font-mono text-slate-600">value</p>
              <p className="text-xs text-slate-500 mt-1">numeric value</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}