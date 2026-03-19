/**
 * KPI Code Reference
 * Use these codes with useKPI(code) and useKPITimeSeries(code)
 */

// ============================================================================
// FINANCIAL KPIs
// ============================================================================
export const FINANCE_KPIS = {
  CASH_BALANCE: 'FIN_CASH_BALANCE',
  MONTHLY_BURN: 'FIN_MONTHLY_BURN',
  WORKING_CAPITAL: 'FIN_WORKING_CAPITAL',
  RUNWAY_MONTHS: 'FIN_RUNWAY_MONTHS',
  REV_FORECAST: 'FIN_REV_FORECAST',
  OPEX_BUDGET: 'FIN_OPEX_BUDGET',
  FCF: 'FIN_FCF',
} as const;

// ============================================================================
// SALES & BD KPIs
// ============================================================================
export const SALES_KPIS = {
  ACQ_COST: 'SALES_ACQ_COST',
  LTV: 'SALES_LTV',
  PIPELINE_VALUE: 'SALES_PIPELINE_VALUE',
  CLOSE_RATE: 'SALES_CLOSE_RATE',
} as const;

export const BD_KPIS = {
  ENTERPRISE_CONVERSATIONS: 'BD_ENTERPRISE_CONVERSATIONS',
  PARTNERSHIP_LEADS: 'BD_PARTNERSHIP_LEADS',
  DEMOS_CONDUCTED: 'BD_DEMOS_CONDUCTED',
  DEALS_CLOSED: 'BD_DEALS_CLOSED',
} as const;

// ============================================================================
// MARKETING KPIs
// ============================================================================
export const MARKETING_KPIS = {
  INBOUND_INQUIRIES: 'MKT_INBOUND_INQUIRIES',
  SITE_CONVERSION: 'MKT_SITE_CONVERSION',
  CPL: 'MKT_CPL',
  CONTENT_VIEWS: 'MKT_CONTENT_VIEWS',
  EMAIL_OPEN_RATE: 'MKT_EMAIL_OPEN_RATE',
} as const;

// ============================================================================
// PRODUCT KPIs
// ============================================================================
export const PRODUCT_KPIS = {
  ACTIVE_USERS: 'PDT_ACTIVE_USERS',
  RETENTION: 'PDT_RETENTION',
  NPS: 'PDT_NPS',
  FEATURE_ADOPTION: 'PDT_FEATURE_ADOPTION',
  SESSION_LENGTH: 'PDT_SESSION_LENGTH',
} as const;

// ============================================================================
// R&D / ENGINEERING KPIs
// ============================================================================
export const RND_KPIS = {
  SPRINT_VELOCITY: 'RND_SPRINT_VELOCITY',
  BUG_DENSITY: 'RND_BUG_DENSITY',
  DEPLOYMENT_FREQ: 'RND_DEPLOYMENT_FREQ',
  MEAN_TIME_RECOVERY: 'RND_MTTR',
  CODE_COVERAGE: 'RND_CODE_COVERAGE',
} as const;

// ============================================================================
// OPERATIONS KPIs
// ============================================================================
export const OPS_KPIS = {
  CAPACITY: 'OPS_CAPACITY',
  DEFECT_RATE: 'OPS_DEFECT_RATE',
  LEAD_TIME: 'OPS_LEAD_TIME',
  ON_TIME_DELIVERY: 'OPS_ON_TIME_DELIVERY',
  YIELD: 'OPS_YIELD',
} as const;

// ============================================================================
// STRATEGIC KPIs
// ============================================================================
export const STRATEGIC_KPIS = {
  ARR: 'STRAT_ARR',
  MRR: 'STRAT_MRR',
  CHURN_RATE: 'STRAT_CHURN_RATE',
  CAC_PAYBACK: 'STRAT_CAC_PAYBACK',
  MAGIC_NUMBER: 'STRAT_MAGIC_NUMBER',
} as const;

// ============================================================================
// COMBINED EXPORT
// ============================================================================
export const ALL_KPIS = {
  ...FINANCE_KPIS,
  ...SALES_KPIS,
  ...BD_KPIS,
  ...MARKETING_KPIS,
  ...PRODUCT_KPIS,
  ...RND_KPIS,
  ...OPS_KPIS,
  ...STRATEGIC_KPIS,
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
import { FINANCE_KPIS, MARKETING_KPIS } from '@/config/kpiCodes';
import { useKPI } from '@/lib/hooks/useKPI';

// Single line fetch
const cashBalance = useKPI(FINANCE_KPIS.CASH_BALANCE);
const inquiries = useKPI(MARKETING_KPIS.INBOUND_INQUIRIES);

// Destructure in component
export function FinanceSection() {
  const cash = useKPI(FINANCE_KPIS.CASH_BALANCE);
  const burn = useKPI(FINANCE_KPIS.MONTHLY_BURN);
  const runway = useKPI(FINANCE_KPIS.RUNWAY_MONTHS);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <KPICard title="Cash" value={cash.value} />
       <KPICard title="Burn" value={burn.value} />
      <KPICard title="Runway" value={runway.value} />
    </div>
  );
}
*/
