import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Data directory
const dataDir = path.join(__dirname, '../backend/data');

// KPI department mapping
const departmentMapping = {
  'Product': 'product_kpis',
  'Finance': 'finance_kpis',
  'Marketing': 'marketing_kpis',
  'BD': 'sales_kpis', // Business Development maps to Sales
  'R&D': 'rnd_kpis',
  'Product and Operations': 'product_kpis',
};

// Parse month name to get quarter
const getQuarter = (month) => {
  const monthNum = new Date(`${month} 1, 2025`).getMonth() + 1;
  if (monthNum <= 3) return 'Q4';
  if (monthNum <= 6) return 'Q1';
  if (monthNum <= 9) return 'Q2';
  return 'Q3';
};

// Parse Excel file
async function parseExcelFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const kpis = [];

    for (const sheetName of workbook.SheetNames) {
      if (sheetName === 'Definitions' || sheetName === 'Instructions') continue;
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Determine department from filename or sheet name
      const filename = path.basename(filePath);
      let department = 'product'; // default
      
      if (filename.includes('Finance')) department = 'Finance';
      else if (filename.includes('Marketing')) department = 'Marketing';
      else if (filename.includes('R&D')) department = 'RnD';
      else if (filename.includes('BD')) department = 'sales'; // BD maps to sales
      else if (filename.includes('Product')) department = 'Product';

      console.log(`📄 Processing ${filename} - Sheet: ${sheetName} - Dept: ${department}`);

      // Parse rows
      for (const row of data) {
        if (!row['KPI Name'] || row['KPI Name'].toString().toLowerCase() === 'kpi name') continue;

        // Extract values - handle multiple possible column names
        const kpiName = row['KPI Name'] || row['kpi_name'] || '';
        const category = row['Category'] || row['category'] || '';
        const sn = row['SN'] || row['Serial Number'];
        const targetQuarter = parseFloat(row['Target (Quarter)'] || row['target_quarter'] || 0) || null;
        const actualQTD = parseFloat(row['Actual (Q4)'] || row['Actual (QTD)'] || row['actual_qtd'] || 0) || null;
        const targetQ4 = parseFloat(row['Target (Q4)'] || row['target_q4'] || 0) || null;
        const actualJan = parseFloat(row['Actual (Jan)'] || row['actual_jan'] || 0) || null;
        const actualFeb = parseFloat(row['Actual (Feb)'] || row['actual_feb'] || 0) || null;
        const actualMar = parseFloat(row['Actual (Mar)'] || row['actual_mar'] || 0) || null;
        const progress = row['Progress'] || row['status'] || '';
        const commentary = row['Commentary'] || row['comments'] || '';

        // Only add if we have at least a KPI name and some data
        if (kpiName && (actualQTD || targetQuarter || category)) {
          kpis.push({
            department,
            kpi_name: kpiName.toString().trim(),
            category: category.toString().trim(),
            sn: sn ? parseInt(sn) : null,
            target_quarter: targetQuarter,
            actual_qtd: actualQTD,
            target_q4: targetQ4,
            actual_jan: actualJan,
            actual_feb: actualFeb,
            actual_mar: actualMar,
            actual_q4: actualQTD || null,
            progress: progress.toString().trim(),
            commentary: commentary.toString().trim(),
            financial_year: 'FY 2025',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    return kpis;
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, err.message);
    return [];
  }
}

// Upload to Supabase
async function uploadKPIs(kpis) {
  if (kpis.length === 0) {
    console.log('No KPIs to upload');
    return;
  }

  // Group by department
  const byDept = {};
  for (const kpi of kpis) {
    if (!byDept[kpi.department]) byDept[kpi.department] = [];
    byDept[kpi.department].push(kpi);
  }

  // Upload each department
  for (const [dept, items] of Object.entries(byDept)) {
    const tableName = departmentMapping[dept] || `${dept.toLowerCase()}_kpis`;
    
    console.log(`\n📤 Uploading ${items.length} items to ${tableName}...`);

    // Clear existing data for this department
    try {
      await supabase.from(tableName).delete().eq('financial_year', 'FY 2025');
      console.log(`✓ Cleared existing FY 2025 data from ${tableName}`);
    } catch (err) {
      console.warn(`⚠️ Could not clear table: ${err.message}`);
    }

    // Batch insert (Supabase limits to 1000 per request)
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const { error } = await supabase.from(tableName).insert(batch);

      if (error) {
        console.error(`❌ Error uploading batch to ${tableName}:`, error);
      } else {
        console.log(`✓ Uploaded ${batch.length} items to ${tableName}`);
      }
    }
  }

  console.log('\n✅ Upload complete!');
}

// Main
async function main() {
  try {
    console.log('🚀 Starting data upload from backend/data files...\n');

    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.xlsx'))
      .map(f => path.join(dataDir, f));

    if (files.length === 0) {
      console.log('No Excel files found in backend/data');
      return;
    }

    console.log(`Found ${files.length} Excel files\n`);

    let allKPIs = [];
    for (const file of files) {
      console.log(`Processing: ${path.basename(file)}`);
      const kpis = await parseExcelFile(file);
      allKPIs = allKPIs.concat(kpis);
      console.log(`  → Parsed ${kpis.length} KPIs`);
    }

    console.log(`\n📊 Total KPIs parsed: ${allKPIs.length}\n`);

    // Upload to Supabase
    await uploadKPIs(allKPIs);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main().catch(console.error);
