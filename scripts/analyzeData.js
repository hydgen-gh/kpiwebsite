import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory
const dataDir = path.join(__dirname, '../backend/data');

// Parse Excel file
async function analyzeExcelFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const kpis = [];

    for (const sheetName of workbook.SheetNames) {
      if (sheetName === 'Definitions' || sheetName === 'Instructions') {
        console.log(`  ⏭️ Skipping ${sheetName}`);
        continue;
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`  📄 Sheet: "${sheetName}" - ${data.length} rows`);
      
      // Show first row structure
      if (data.length > 0) {
        console.log(`     Columns: ${Object.keys(data[0]).join(', ')}`);
        console.log(`     First row: ${JSON.stringify(data[0]).substring(0, 100)}...`);
      }
    }

  } catch (err) {
    console.error(`Error analyzing ${filePath}:`, err.message);
  }
}

// Main
async function main() {
  try {
    console.log('🔍 Analyzing Excel files in backend/data...\n');

    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.xlsx'))
      .map(f => path.join(dataDir, f));

    if (files.length === 0) {
      console.log('No Excel files found in backend/data');
      return;
    }

    console.log(`Found ${files.length} Excel files\n`);

    for (const file of files) {
      console.log(`📋 ${path.basename(file)}`);
      await analyzeExcelFile(file);
    }

    console.log('\n✅ Analysis complete!');
    console.log('\nTo upload this data:');
    console.log('1. Create a .env.local file with:');
    console.log('   VITE_SUPABASE_URL=your_supabase_url');
    console.log('   VITE_SUPABASE_SERVICE_KEY=your_service_role_key');
    console.log('2. Run: node scripts/uploadBackendData.js');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main().catch(console.error);
