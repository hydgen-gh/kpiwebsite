# KPI Dashboard Enhancement Implementation Guide

## Overview
This guide shows how to implement the multi-quarter filtering system and KPI card enhancements across all dashboards.

## What's Been Implemented

### 1. ✅ Core Utilities
- **`src/lib/quarterUtils.ts`**: Full month mapping, quarter utilities, financial year display
- **`src/lib/comparisonUtils.ts`**: Q3 vs Q4 comparison logic, status determination
- **`src/lib/dashboardFilterUtils.ts`**: Dashboard filtering hook `useDashboardFilter()`

### 2. ✅ KPI Context Updates
- **`src/app/kpi/KPIContext.tsx`**: 
  - Now tracks `selectedMonths` (full month names: January, February, etc.)
  - Now tracks `selectedQuarters` (Q1, Q2, Q3, Q4)
  - Syncs quarters ↔ months bidirectionally
  - Supports multi-quarter selection

### 3. ✅ Month Selector Enhancement
- **`src/app/components/MonthSelector.tsx`**: 
  - Multi-select quarter toggles
  - Full month name display
  - Quick select/reset buttons
  - Financial year badge
  - Clear visual feedback for selected quarters

### 4. ✅ Reusable Components
- **`src/app/components/ui/KPICard.tsx`**: KPICard and KPIComparisonCard components
- **`src/app/components/KPIDisplaySection.tsx`**: Dashboard section wrapper for KPI displays
- **`src/app/components/UploadKPI.tsx`**: Multi-sheet Excel support (Product, Sales, Marketing, RnD, Finance)

## How to Update Each Dashboard

### Pattern: Basic Dashboard Update

All dashboards should follow this pattern:

```tsx
import { useKPI } from '../kpi/KPIContext';
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { compareQuarters } from '../../lib/comparisonUtils';
import { KPIDisplaySection } from './KPIDisplaySection';

export default function YourDashboard() {
  const { marketingData, selectedMonths } = useKPI();
  const { getMonthDisplay } = useDashboardFilter();

  // Filter data based on selectedMonths
  const filteredData = marketingData.filter(item => {
    return selectedMonths.some(month =>
      month.toLowerCase().includes(item.month?.toLowerCase() || '')
    );
  });

  // Calculate KPIs from filtered data
  const kpis = [
    {
      name: 'Revenue',
      q4Actual: calculateActual(filteredData),
      q4Target: calculateTarget(filteredData),
      q3Actual: calculateQ3Actual(marketingData),
      q3Target: calculateQ3Target(marketingData),
      unit: '$'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with filter display */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Name</h2>
        <div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded">
          Showing: {getMonthDisplay}
        </div>
      </div>

      {/* Use KPI Display Section */}
      <KPIDisplaySection
        title="Key Performance Indicators"
        kpis={kpis}
        showComparison={true} // Set to true for Q3 vs Q4 comparison
      />

      {/* Existing charts and visualizations remain unchanged */}
      {/* ... */}
    </div>
  );
}
```

---

## Dashboard-Specific Implementation Guide

### 1. **Product Dashboard** (`ProductDashboard.tsx`)

**Current State**: Shows theoretical vs achievable metrics for AEM/PEM variants

**Recommended Updates**:
1. Keep existing efficiency/performance charts
2. Add KPI cards for key metrics (Energy Efficiency, Voltage Efficiency, etc.)
3. Add month filter display badge
4. Show comparison if multiple quarters selected

**Key Changes**:
```tsx
// Add these imports
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { KPIDisplaySection } from './KPIDisplaySection';

// In component
const { getMonthDisplay } = useDashboardFilter();

// Add filter display in header
<div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded">
  {getMonthDisplay}
</div>

// Add KPI cards after existing charts
<KPIDisplaySection
  title="Performance Metrics"
  kpis={[...]}
  showComparison={true}
/>
```

---

### 2. **Sales Dashboard** (`SalesDashboard.tsx`)

**Current State**: Shows order intake, revenue, pipeline with regional filters

**Recommended Updates**:
1. Keep existing funnel and regional breakdown
2. Use `selectedMonths` to filter data dynamically
3. Add KPI comparison cards for Q3 vs Q4
4. Show filter status in header
5. Update monthly trend chart to be dynamic

**Key Changes**:
```tsx
// Use the filter hook
const { getMonthDisplay, monthFilter } = useDashboardFilter();

// Filter data reactively
const filteredByMonth = bdData.filter(d => monthFilter(d.month || ''));

// Update funnel size based on filtered data
const funnelData = [
  { stage: 'Leads', value: filteredByMonth.length, conversion: 100 },
  // ... calculate based on filtered data
];

// Add header display
<div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded">
  {getMonthDisplay}
</div>

// Add KPI cards with comparison
<KPIDisplaySection
  title="Sales KPIs"
  kpis={kpiArray}
  showComparison={true}
/>
```

---

### 3. **Marketing Dashboard** (`MarketingDashboard.tsx`)

**Current State**: Shows campaign metrics, engagement, conversions

**Recommended Updates**:
1. Keep existing campaign visualizations
2. Add KPI cards for leads, engagement, conversion rates
3. Show month/quarter filter badge prominently
4. Add Q3 vs Q4 comparison for trends
5. Update monthly trend to be dynamic

**Key Changes**:
```tsx
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { KPIDisplaySection } from './KPIDisplaySection';

const { getMonthDisplay, selectedMonths } = useDashboardFilter();

// Build KPI array from filtered data
const marketingKPIs = [
  {
    name: 'Leads Generated',
    q4Actual: calculateLeads(marketingData, selectedMonths),
    q4Target: 500,
    q3Actual: 450,
    q3Target: 450,
    unit: ''
  },
  {
    name: 'Engagement Rate',
    q4Actual: calculateEngagement(marketingData, selectedMonths),
    q4Target: 5,
    q3Actual: 4.2,
    q3Target: 4.5,
    unit: '%'
  }
];

// Display with comparison
<KPIDisplaySection
  title="Marketing Performance"
  kpis={marketingKPIs}
  showComparison={true}
/>
```

---

### 4. **R&D Dashboard** (`RnD.tsx`)

**Current State**: Shows patents, R&D milestones, timeline

**Recommended Updates**:
1. Keep existing patent and milestone displays
2. Add KPI cards for patent filing, research progress
3. Show month filter context
4. Update progress bars reactively based on selected timeframe

**Key Changes**:
```tsx
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';

const { getMonthDisplay } = useDashboardFilter();

// Add filter display
<div className="text-sm text-slate-600 bg-blue-50 px-3 py-1 rounded">
  {getMonthDisplay}
</div>

// Calculate KPI-based progress
const rndKPIs = [
  {
    name: 'Patents Filed (YTD)',
    q4Actual: actualPatentsThisQuarter,
    q4Target: 2,
    q3Actual: 1,
    q3Target: 1,
    unit: ''
  }
];
```

---

### 5. **Finance Dashboard** (`FinancialData.tsx`)

**Current State**: Budget allocation, fund tracking

**Recommended Updates**:
1. Keep existing budget pie charts
2. Add fund allocation KPI cards
3. Show dynamic budget tracking based on selected timeframe
4. Add comparison view for budget vs actual

**Key Changes**:
```tsx
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';
import { KPIDisplaySection } from './KPIDisplaySection';

const { getMonthDisplay } = useDashboardFilter();

const financeKPIs = [
  {
    name: 'R&D Budget',
    q4Actual: calculateQ4RnDSpent,
    q4Target: 1500000,
    q3Actual: calculateQ3RnDSpent,
    q3Target: 1400000,
    unit: '$'
  }
];

<KPIDisplaySection
  title="Fund Allocation & Tracking"
  kpis={financeKPIs}
  showComparison={true}
/>
```

---

### 6. **Overview Dashboard** (`OverviewDashboard.tsx`)

**Current State**: Company-wide KPI health, goals progress, fund allocation

**Recommended Updates**:
1. Show selected months/quarters prominently
2. Filter goal progress based on selected timeframe
3. Add KPI health breakdown card
4. Update all metrics to be responsive to selected months

**Key Changes**:
```tsx
import { useDashboardFilter } from '../../lib/dashboardFilterUtils';

const { getMonthDisplay, selectedQuarters } = useDashboardFilter();

// Display current filter
<div className="text-center">
  <p className="text-sm text-slate-600">Showing data for: {getMonthDisplay}</p>
</div>

// Update KPI health based on selected quarters
const departmentHealth = calculateHealthByQuarters(selectedQuarters);
```

---

## Implementation Checklist

For each dashboard:

- [ ] Import `useDashboardFilter` hook
- [ ] Import `KPIDisplaySection` component
- [ ] Add filter display badge in header
- [ ] Create KPI array with Q3 and Q4 data
- [ ] Replace hardcoded "Q4" with dynamic month filtering
- [ ] Add KPI cards using `KPIDisplaySection`
- [ ] Update charts/visualizations to use `selectedMonths`
- [ ] Test with multi-quarter selection
- [ ] Test with single quarter selection
- [ ] Verify comparison values display correctly

---

## Testing Guidelines

### Test Case 1: Single Quarter Selection
1. Load dashboard
2. Verify "Q4 selected" badge displays
3. Verify data shows Q4 months (January, February, March)
4. Click Q1 button
5. Verify data updates to Q1 months (April, May, June)

### Test Case 2: Multi-Quarter Selection
1. Load dashboard
2. Click Q4 button (already selected)
3. Click Q1 button (now both selected)
4. Verify "Q4, Q1 selected" badge
5. Verify data includes all 6 months (Jan-Mar, Apr-Jun)
6. Verify KPI cards show combined totals

### Test Case 3: Full Year Selection
1. Click "All" button in month selector
2. Verify "Full Year (FY 2025)" displays
3. Verify data includes all 12 months
4. Verify comparison cards work correctly

---

## Git Workflow

After updating each dashboard:

```bash
git add src/app/components/SalesDashboard.tsx
git commit -m "feat: Add multi-quarter filtering to Sales Dashboard"
git push
```

---

## FAQ

**Q: Why use full month names instead of short names?**
A: Full month names (January vs Jan) are explicit and avoid ambiguity across different months/quarters.

**Q: How do I handle data that doesn't have month info?**
A: Filter out records without month info, or default them to a specific month/quarter.

**Q: Can I show multiple calendars?**
A: Yes, use the `KPIComparisonCard` component which shows Q3 and Q4 side-by-side.

**Q: What if data is stored differently (by quarter instead of month)?**
A: Create a mapping function that converts quarter to months, or add conversion logic in your filter utility.
