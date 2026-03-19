/**
 * Financial Model Data Structures
 * Maps to FY2026_HYDGEN_Financial_Model.xlsx sheets
 */

// ============================================================================
// P&L Data Structure
// ============================================================================
export interface PAndLData {
  metric: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  fyTotal: number;
}

// ============================================================================
// Operating Expenses by Department
// ============================================================================
export interface OpexDepartment {
  department: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  fyTotal: number;
}

// ============================================================================
// Working Capital Components
// ============================================================================
export interface WorkingCapitalItem {
  component: string;
  beginning: number;
  current: number;
  change: number;
}

// ============================================================================
// Cash Flow Components
// ============================================================================
export interface CashFlowData {
  quarter: string;
  ebitda: number;
  capex: number;
  workingCapital: number;
  freeCashFlow: number;
}

// ============================================================================
// Runway Analysis
// ============================================================================
export interface RunwayData {
  cashBalance: number;
  monthlyBurn: number;
  runwayMonths: number;
}

// ============================================================================
// Sales to Production Flow
// ============================================================================
export interface ProductionFlowStage {
  stage: string;
  value: number;
  percentage: number;
}

// ============================================================================
// Scenario Analysis
// ============================================================================
export interface ScenarioMetrics {
  scenario: string;
  revenue: number;
  burn: number;
  cashRunway: number;
}

// ============================================================================
// SAMPLE DATA - FY2026 Financial Model
// ============================================================================

export const SAMPLE_FINANCIAL_DATA = {
  // P&L Data - Order & Delivery Volumes (kW)
  pnl: {
    orderVolume: {
      metric: 'Order Volume (kW)',
      q1: 125.5,
      q2: 187.3,
      q3: 224.8,
      q4: 316.2,
      fyTotal: 853.8,
    } as PAndLData,
    deliveryVolume: {
      metric: 'Delivery Volume (kW)',
      q1: 45.2,
      q2: 89.6,
      q3: 156.8,
      q4: 238.5,
      fyTotal: 530.1,
    } as PAndLData,
    revenueGenerated: {
      metric: 'Revenue Generated ($M)',
      q1: 1.8,
      q2: 2.9,
      q3: 4.2,
      q4: 6.5,
      fyTotal: 15.4,
    } as PAndLData,
  },

  // Operating Expenses by Department
  opex: [
    {
      department: 'Product Engineering',
      q1: 245000,
      q2: 258000,
      q3: 270000,
      q4: 285000,
      fyTotal: 1058000,
    },
    {
      department: 'R&D',
      q1: 185000,
      q2: 192000,
      q3: 198000,
      q4: 210000,
      fyTotal: 785000,
    },
    {
      department: 'Sales',
      q1: 125000,
      q2: 145000,
      q3: 165000,
      q4: 185000,
      fyTotal: 620000,
    },
    {
      department: 'Marketing',
      q1: 95000,
      q2: 110000,
      q3: 125000,
      q4: 140000,
      fyTotal: 470000,
    },
    {
      department: 'Operations',
      q1: 165000,
      q2: 175000,
      q3: 185000,
      q4: 205000,
      fyTotal: 730000,
    },
    {
      department: 'Admin / G&A',
      q1: 85000,
      q2: 92000,
      q3: 98000,
      q4: 105000,
      fyTotal: 380000,
    },
  ] as OpexDepartment[],

  // Working Capital Bridge
  workingCapital: {
    q1: [
      { component: 'Receivables', beginning: 150000, current: 175000, change: 25000 },
      { component: 'Inventory', beginning: 280000, current: 310000, change: 30000 },
      { component: 'Payables', beginning: -120000, current: -140000, change: -20000 },
      { component: 'Advances', beginning: 60000, current: 75000, change: 15000 },
    ],
    q2: [
      { component: 'Receivables', beginning: 175000, current: 220000, change: 45000 },
      { component: 'Inventory', beginning: 310000, current: 360000, change: 50000 },
      { component: 'Payables', beginning: -140000, current: -165000, change: -25000 },
      { component: 'Advances', beginning: 75000, current: 95000, change: 20000 },
    ],
    q3: [
      { component: 'Receivables', beginning: 220000, current: 285000, change: 65000 },
      { component: 'Inventory', beginning: 360000, current: 405000, change: 45000 },
      { component: 'Payables', beginning: -165000, current: -190000, change: -25000 },
      { component: 'Advances', beginning: 95000, current: 110000, change: 15000 },
    ],
    q4: [
      { component: 'Receivables', beginning: 285000, current: 380000, change: 95000 },
      { component: 'Inventory', beginning: 405000, current: 450000, change: 45000 },
      { component: 'Payables', beginning: -190000, current: -225000, change: -35000 },
      { component: 'Advances', beginning: 110000, current: 140000, change: 30000 },
    ],
  },

  // Free Cash Flow Trend
  fcf: [
    { quarter: 'Q1', ebitda: -185000, capex: -120000, workingCapital: -50000, freeCashFlow: -355000 },
    { quarter: 'Q2', ebitda: -145000, capex: -140000, workingCapital: -90000, freeCashFlow: -375000 },
    { quarter: 'Q3', ebitda: -95000, capex: -160000, workingCapital: -110000, freeCashFlow: -365000 },
    { quarter: 'Q4', ebitda: 85000, capex: -180000, workingCapital: -135000, freeCashFlow: -230000 },
  ] as CashFlowData[],

  // Runway Analysis
  runway: {
    cashBalance: 3580000,
    monthlyBurn: 340000,
    runwayMonths: 10.5,
  } as RunwayData,

  // Sales to Production Flow (Funnel)
  productionFlow: [
    { stage: 'Order Backlog', value: 853800, percentage: 100 },
    { stage: 'Systems Produced', value: 530100, percentage: 62 },
    { stage: 'Systems Delivered', value: 385400, percentage: 45 },
  ] as ProductionFlowStage[],

  // Scenario Analysis
  scenarios: [
    { scenario: 'Base Case', revenue: 15.4, burn: 1.325, cashRunway: 10.5 },
    { scenario: 'Optimistic', revenue: 22.8, burn: 1.145, cashRunway: 12.8 },
    { scenario: 'Conservative', revenue: 10.2, burn: 1.505, cashRunway: 9.2 },
  ] as ScenarioMetrics[],
};

/**
 * Calculate burn trend from historical data
 */
export const calculateBurnTrend = () => {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const monthlyBurn = [420000, 410000, 385000, 340000]; // Monthly averages
  const cumulativeBurn = [420000, 830000, 1215000, 1555000];

  return quarters.map((q, idx) => ({
    quarter: q,
    monthly: monthlyBurn[idx],
    cumulative: cumulativeBurn[idx],
  }));
};

/**
 * Calculate quarterly opex burn
 */
export const calculateQuarterlyBurn = () => {
  const burns = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
    const qIdx = parseInt(q.charAt(1)) - 1;
    const totalBurn = SAMPLE_FINANCIAL_DATA.opex.reduce((sum, dept) => {
      const deptKey = `q${qIdx + 1}` as keyof OpexDepartment;
      return sum + (dept[deptKey] as number);
    }, 0);
    return { quarter: q, burn: totalBurn };
  });
  return burns;
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number, decimals = 0): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
};

/**
 * Format currency for display with unit
 */
export const formatCurrencyCompact = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
};
