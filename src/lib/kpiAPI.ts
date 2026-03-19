import { supabase } from './supabase';

export interface KPI {
  id?: string;
  department: string;
  kpi_name: string;
  category: string;
  month?: string;
  year?: number;
  sub_department?: string;
  sn?: number;
  target_quarter?: number;
  actual_qtd?: number;
  target_q4?: number;
  actual_jan?: number;
  actual_feb?: number;
  actual_mar?: number;
  actual_q4?: number;
  progress?: string;
  commentary?: string;
  financial_year?: string;
  current_month?: string;
  current_month_target?: number;
  current_month_actual?: number;
  previous_month?: string;
  previous_month_actual?: number;
  mom_pct_change?: number;
  current_quarter?: string;
  current_quarter_target?: number;
  current_quarter_actual?: number;
  previous_quarter?: string;
  previous_quarter_actual?: number;
  qoq_pct_change?: number;
  same_month_prior_year_actual?: number;
  yoy_pct_change?: number;
  created_at?: string;
  updated_at?: string;
}

const TABLES = {
  product: 'product_kpis',
  sales: 'sales_kpis',
  marketing: 'marketing_kpis',
  rnd: 'rnd_kpis',
  finance: 'finance_kpis',
};

// Fetch KPIs by month and year
export async function fetchKPIsByMonthYear(
  month: string,
  year: number,
  department?: keyof typeof TABLES
): Promise<KPI[]> {
  try {
    const allKPIs: KPI[] = [];
    const depts = department ? [department] : (Object.keys(TABLES) as Array<keyof typeof TABLES>);

    for (const dept of depts) {
      const tableName = TABLES[dept];
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .order('kpi_name', { ascending: true });

      if (error) {
        continue;
      }

      if (data) {
        allKPIs.push(...data);
      }
    }

    return allKPIs;
  } catch (err) {
    console.error(`Exception fetching KPIs:`, err);
    return [];
  }
}

// Fetch KPIs for a specific department, month and year
export async function fetchDepartmentKPIsByMonthYear(
  department: keyof typeof TABLES,
  month: string,
  year: number
): Promise<KPI[]> {
  try {
    const tableName = TABLES[department];
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .order('kpi_name', { ascending: true });

    if (error) {
      console.error(`Error fetching ${department}:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`Exception:`, err);
    return [];
  }
}

// Fetch available months and years
export async function fetchAvailableMonthYears(): Promise<{ month: string; year: number }[]> {
  try {
    const monthYears = new Set<string>();

    for (const [, tableName] of Object.entries(TABLES)) {
      const { data, error } = await supabase
        .from(tableName)
        .select('month,year')
        .not('month', 'is', null)
        .not('year', 'is', null);

      if (!error && data) {
        data.forEach((row: any) => {
          if (row.month && row.year) {
            monthYears.add(`${row.month}|${row.year}`);
          }
        });
      }
    }

    const result: { month: string; year: number }[] = [];
    monthYears.forEach(str => {
      const [month, year] = str.split('|');
      result.push({ month, year: parseInt(year) });
    });

    return result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

// Fetch all KPIs for a department
export async function fetchDepartmentKPIs(department: keyof typeof TABLES): Promise<KPI[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES[department])
      .select('*')
      .order('kpi_name', { ascending: true });

    if (error) {
      console.error(`Error fetching ${department}:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`Exception:`, err);
    return [];
  }
}

// Fetch all KPIs across all departments
export async function fetchAllKPIs(): Promise<Record<string, KPI[]>> {
  const result: Record<string, KPI[]> = {};

  for (const [key] of Object.entries(TABLES)) {
    result[key] = await fetchDepartmentKPIs(key as keyof typeof TABLES);
  }

  return result;
}

// Search KPIs
export async function searchKPIs(query: string): Promise<KPI[]> {
  const results: KPI[] = [];

  for (const [, tableName] of Object.entries(TABLES)) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .or(
          `kpi_name.ilike.%${query}%,category.ilike.%${query}%`
        );

      if (!error && data) {
        results.push(...data);
      }
    } catch (err) {
      console.error(`Error searching in ${tableName}:`, err);
    }
  }

  return results;
}

// Get KPI by ID
export async function getKPIById(
  id: string,
  department: keyof typeof TABLES
): Promise<KPI | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES[department])
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching KPI:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Exception:`, err);
    return null;
  }
}

// Upsert KPI
export async function upsertKPI(
  kpi: KPI,
  department: keyof typeof TABLES
): Promise<KPI | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES[department])
      .upsert([{ ...kpi, updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error(`Error upserting KPI:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Exception:`, err);
    return null;
  }
}

// Delete KPI
export async function deleteKPI(id: string, department: keyof typeof TABLES): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES[department])
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting KPI:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Exception:`, err);
    return false;
  }
}

// Batch upload KPIs
export async function batchUploadKPIs(
  kpis: KPI[],
  department: keyof typeof TABLES
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLES[department])
      .insert(kpis);

    if (error) {
      console.error(`Error uploading KPIs:`, error);
      return false;
    }

    console.log(`✓ Uploaded ${kpis.length} KPIs`);
    return true;
  } catch (err) {
    console.error(`Exception:`, err);
    return false;
  }
}
