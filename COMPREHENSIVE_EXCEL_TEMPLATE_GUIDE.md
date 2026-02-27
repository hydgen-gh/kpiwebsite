# 📊 Comprehensive Excel Template Guide

## Overview

This guide outlines how to use the **Comprehensive KPI Excel Template** with built-in support for **Month-over-Month (MoM)**, **Quarter-over-Quarter (QoQ)**, and **Year-over-Year (YoY) comparisons**.

The template enables you to track performance trends across multiple time periods in a single structured Excel file, and all data automatically flows into the KPI Dashboard.

---

## 🎯 What's New

### Previous Template
- Single month/period data per row
- No comparison capabilities
- Manual calculation of trends

### New Comprehensive Template ✨
- **Multiple comparison periods** in one row
- **Automatic comparison calculations** (MoM, QoQ, YoY)
- **Hierarchical time tracking** (Current Month → Quarter → Year)
- **Trend analysis** built into the data structure
- **Rich analytics insights** immediately available

---

## 📋 Template Structure

The new template contains **17 columns** organized into logical sections:

### Section 1: KPI Identification (Columns A-B)
| Column | Field | Purpose | Required |
|--------|-------|---------|----------|
| A | **KPI Name** | Name of your metric | ✅ YES |
| B | **Category** | Type/classification (e.g., Sales, Quality, Revenue) | ✅ YES |

**Example:**
- KPI Name: `PEM Stack Units Shipped`
- Category: `Sales Performance`

---

### Section 2: Current Period Data (Columns C-E)
| Column | Field | Purpose | Required |
|--------|-------|---------|----------|
| C | **Current Month** | Month name (e.g., February) | ✅ YES |
| D | **Current Month Target** | Target value for this month | ✅ YES |
| E | **Current Month Actual** | Actually achieved value | ✅ YES |

**Purpose:** This is your primary data point for the current period.

**Example:**
- Current Month: `February`
- Current Month Target: `150` units
- Current Month Actual: `140` units

---

### Section 3: Month-over-Month Comparison (Columns F-H)
| Column | Field | Purpose | Required | Auto-Filled |
|--------|-------|---------|----------|-------------|
| F | **Previous Month** | Name of previous month | ✅ YES | — |
| G | **Previous Month Actual** | Actual from previous month | ✅ YES | — |
| H | **MoM % Change** | Percentage change MoM | ⚠️ Optional | ✨ Auto |

**What it measures:** How your KPI changed from last month to this month.

**Example:**
```
Previous Month: January
Previous Month Actual: 135 units
Current Month Actual: 140 units
MoM % Change: 3.7% (automatically calculated as (140-135)/135 × 100)
```

**Interpretation:**
- **Positive %** = Growth/improvement
- **Negative %** = Decline
- **0%** = No change
- **MoM helps identify:** Short-term trends, monthly volatility, immediate changes

---

### Section 4: Current Quarter Data (Columns I-K)
| Column | Field | Purpose | Required |
|--------|-------|---------|----------|
| I | **Current Quarter** | Quarter designation (Q1, Q2, Q3, Q4) | ✅ YES |
| J | **Current Quarter Target** | Quarterly target | ✅ YES |
| K | **Current Quarter Actual** | Quarterly actual achievement | ✅ YES |

**Purpose:** Track performance at the quarterly level (aggregate or separate metric).

**Example:**
- Current Quarter: `Q4`
- Current Quarter Target: `450` units (3-month total)
- Current Quarter Actual: `418` units

---

### Section 5: Quarter-over-Quarter Comparison (Columns L-N)
| Column | Field | Purpose | Required | Auto-Filled |
|--------|-------|---------|----------|-------------|
| L | **Previous Quarter** | Previous quarter (Q1, Q2, Q3, Q4) | ✅ YES | — |
| M | **Previous Quarter Actual** | Actual from previous quarter | ✅ YES | — |
| N | **QoQ % Change** | Percentage change QoQ | ⚠️ Optional | ✨ Auto |

**What it measures:** How your KPI changed from the previous quarter to this quarter.

**Example:**
```
Previous Quarter: Q3
Previous Quarter Actual: 400 units
Current Quarter Actual: 418 units
QoQ % Change: 4.5% (automatically calculated)
```

**Interpretation:**
- **QoQ helps identify:** Medium-term trends, seasonal patterns, quarterly performance shifts

---

### Section 6: Year-over-Year Comparison (Columns O-P)
| Column | Field | Purpose | Required | Auto-Filled |
|--------|-------|---------|----------|-------------|
| O | **Same Month Prior Year Actual** | Actual from same month last year | ✅ YES | — |
| P | **YoY % Change** | Percentage change YoY | ⚠️ Optional | ✨ Auto |

**What it measures:** How your KPI changed from the same month in the previous year.

**Example:**
```
Same Month Prior Year Actual: 120 units (February 2025)
Current Month Actual: 140 units (February 2026)
YoY % Change: 16.7% (automatically calculated)
```

**Interpretation:**
- **YoY helps identify:** Long-term growth, annual trends, sustained changes, seasonality

---

### Section 7: Reference Data (Column Q)
| Column | Field | Purpose | Required |
|--------|-------|---------|----------|
| Q | **Financial Year** | Year designation (FY 2026, FY 2027) | ✅ YES |

**Purpose:** Organize data by fiscal year for multi-year reporting.

---

## 📝 Filled Example Row

Here's a complete example with all data filled in:

| KPI Name | Category | Current Month | CM Target | CM Actual | Previous Month | PM Actual | MoM % | Current Q | CQ Target | CQ Actual | Previous Q | PQ Actual | QoQ % | Same Month Prior Year | YoY % | Financial Year |
|----------|----------|---------------|-----------|-----------|----------------|-----------|-------|-----------|-----------|-----------|------------|-----------|-------|-----------------------|-------|----------------|
| PEM Stack Units Shipped | Sales Performance | February | 150 | 140 | January | 135 | 3.7 | Q4 | 450 | 418 | Q3 | 400 | 4.5 | 120 | 16.7 | FY 2026 |
| Website Traffic | Digital Marketing | February | 50000 | 48000 | January | 46000 | 4.3 | Q4 | 150000 | 143000 | Q3 | 135000 | 5.9 | 44000 | 9.1 | FY 2026 |
| Operating Expense Ratio | Cost Control | February | 35 | 38 | January | 39 | -2.6 | Q4 | 35 | 37.5 | Q3 | 38 | -1.3 | 40 | -5.0 | FY 2026 |

---

## ✅ How to Fill in the Template

### Step 1: Start with Basic Information
1. Fill in **KPI Name** (Column A)
2. Select **Category** (Column B)
3. Set **Financial Year** (Column Q)

### Step 2: Enter Current Period Data
1. Enter **Current Month** (Column C) - e.g., "February"
2. Enter **Current Month Target** (Column D)
3. Enter **Current Month Actual** (Column E)

### Step 3: Add Comparison Data (at least one required)
Choose which comparisons to track:

**For MoM Tracking:**
- Fill **Previous Month** (Column F)
- Fill **Previous Month Actual** (Column G)
- **MoM % Change** will auto-calculate

**For QoQ Tracking:**
- Fill **Current Quarter** (Column I)
- Fill **Current Quarter Target** (Column J)
- Fill **Current Quarter Actual** (Column K)
- Fill **Previous Quarter** (Column L)
- Fill **Previous Quarter Actual** (Column M)
- **QoQ % Change** will auto-calculate

**For YoY Tracking:**
- Fill **Same Month Prior Year Actual** (Column O)
- **YoY % Change** will auto-calculate

### Step 4: Save and Upload
Once all required fields are filled, save and upload to the dashboard!

---

## 🔢 Understanding the Comparison Percentages

### Month-over-Month (MoM)
**Formula:** `((Current Actual - Previous Actual) / Previous Actual) × 100`

**Example:**
```
January: 135 units
February: 140 units
MoM = ((140 - 135) / 135) × 100 = 3.7%
```

**Meaning:** February achieved 3.7% more than January

---

### Quarter-over-Quarter (QoQ)
**Formula:** `((Current Actual - Previous Actual) / Previous Actual) × 100`

**Example:**
```
Q3: 400 units
Q4: 418 units
QoQ = ((418 - 400) / 400) × 100 = 4.5%
```

**Meaning:** Q4 achieved 4.5% more than Q3

---

### Year-over-Year (YoY)
**Formula:** `((Current Actual - Prior Year Actual) / Prior Year Actual) × 100`

**Example:**
```
February 2025: 120 units
February 2026: 140 units
YoY = ((140 - 120) / 120) × 100 = 16.7%
```

**Meaning:** February 2026 achieved 16.7% more than February 2025

---

## 🚀 Best Practices

### ✅ DO:
1. **Fill in all required columns** (marked with ✅ in column headers)
2. **Use exact month names:** January, February, March, April, May, June, July, August, September, October, November, December
3. **Use quarter format:** Q1, Q2, Q3, Q4
4. **Enter numbers only** in numeric columns (no text like "1.2K")
5. **Use consistent financial year format:** FY 2026, FY 2027
6. **Provide previous period data** for meaningful comparisons
7. **Double-check decimal values** for accuracy
8. **Keep one KPI per row**

### ❌ DON'T:
1. Don't modify column headers or sheet names
2. Don't mix month names (e.g., "Feb" vs "February")
3. Don't leave required fields empty
4. Don't use text for numeric values
5. Don't create extra sheets for KPI data
6. Don't delete the department sheet tabs
7. Don't use formulas in data cells (enter calculated values only)

---

## 📊 Department Sheets

Your Excel file should have **5 department sheets**:

1. **Product** - Product engineering, manufacturing, quality metrics
2. **Sales** - Revenue, pipeline, orders, customer metrics
3. **Marketing** - Lead generation, campaigns, digital metrics
4. **RnD** - Research, innovation, patents, technology metrics
5. **Finance** - Profitability, cash flow, budget, financial ratios

**Each sheet must have the same column structure** and can contain multiple KPIs (one per row).

---

## 📈 Using Comparisons in the Dashboard

Once your data is uploaded, the dashboard automatically:

### ✨ MoM Insights
- Tracks monthly momentum
- Identifies immediate trends
- Highlights rapid changes
- Shows seasonal fluctuations

### ✨ QoQ Insights
- Tracks quarterly performance
- Seasonal adjustments
- Medium-term trends
- Quarter-to-quarter momentum

### ✨ YoY Insights
- Tracks annual growth
- Long-term sustainability
- Year-over-year progress
- Business maturity indicators

---

## 🔍 Common Scenarios

### Scenario 1: Tracking Unit Sales
```
KPI: PEM Stack Units Shipped
Category: Sales Performance

Current Month: February / Target: 150 / Actual: 140
Previous Month: January / Actual: 135 (3.7% MoM growth)
Current Quarter: Q4 / Target: 450 / Actual: 418
Previous Quarter: Q3 / Actual: 400 (4.5% QoQ growth)
Same Month Prior Year: 120 (16.7% YoY growth)
```

**Interpretation:** 
- Growing month-over-month (3.7%)
- Growing quarter-over-quarter (4.5%)
- Strong year-over-year growth (16.7%)
- ✅ Positive trend across all timeframes

---

### Scenario 2: Tracking Operating Expenses (Lower is Better)
```
KPI: Operating Expense Ratio
Category: Cost Control

Current Month: February / Target: 35 / Actual: 38
Previous Month: January / Actual: 39 (-2.6% MoM improvement)
Current Quarter: Q4 / Target: 35 / Actual: 37.5
Previous Quarter: Q3 / Actual: 38 (-1.3% QoQ improvement)
Same Month Prior Year: 40 (-5.0% YoY improvement)
```

**Interpretation:**
- ✅ Improving month-over-month (-2.6%)
- ✅ Improving quarter-over-quarter (-1.3%)
- ✅ Significantly improved year-over-year (-5.0%)

---

### Scenario 3: Tracking Customer Growth
```
KPI: Active Customers
Category: Customer Management

Current Month: February / Target: 100 / Actual: 98
Previous Month: January / Actual: 96 (2.1% MoM growth)
Current Quarter: Q4 / Target: 300 / Actual: 290
Previous Quarter: Q3 / Actual: 280 (3.6% QoQ growth)
Same Month Prior Year: 85 (15.3% YoY growth)
```

**Interpretation:**
- Steady customer growth month-over-month (2.1%)
- Strong quarter-over-quarter growth (3.6%)
- Exceptional year-over-year growth (15.3%)
- ✅ Healthy customer acquisition

---

## 📋 Required vs. Optional Fields

### Required (MUST fill)
- ✅ KPI Name
- ✅ Category
- ✅ Current Month
- ✅ Current Month Target
- ✅ Current Month Actual
- ✅ Financial Year

### Strongly Recommended (for comparison)
- ✅ Previous Month + Previous Month Actual (for MoM)
- ✅ Current Quarter + Previous Quarter + Actual values (for QoQ)
- ✅ Same Month Prior Year Actual (for YoY)

### Auto-Calculated (leave blank if template calculates)
- ⚠️ MoM % Change
- ⚠️ QoQ % Change
- ⚠️ YoY % Change

---

## 🎓 Data Quality Tips

### Accuracy
1. **Verify source data** before entry
2. **Cross-check calculations** if manually adding percentages
3. **Use consistent units** (units, currency, percentage points)
4. **Document any changes** or corrections

### Completeness
1. **Fill comparison data** whenever possible
2. **Include all relevant KPIs** for your department
3. **Update all sheets** even if some are empty (keep empty with headers only)
4. **Maintain historical accuracy** for YoY comparisons

### Consistency
1. **Use same month names** across all rows
2. **Use same category names** across all uploads
3. **Keep financial year format** consistent
4. **Use same unit prefixes** if applicable (FY 2026, not FY26)

---

## 🔗 File Naming Convention

Save your file as:
```
KPI-Data-{Month}-{Year}.xlsx
Example: KPI-Data-February-2026.xlsx
```

This helps organize uploads chronologically.

---

## ❓ FAQ

**Q: Can I manually fill in MoM, QoQ, YoY percentages?**
A: Yes! You can either:
- Leave them blank and let the template auto-calculate, or
- Fill them with your own calculations

**Q: What if I don't have prior period data?**
A: You can still upload the current period data. Comparisons will just be empty for that KPI.

**Q: Can I upload just one department at a time?**
A: Yes! Include empty sheets for other departments, or just include your data sheets. The system is flexible.

**Q: How often should I update?**
A: Recommended monthly (at month-end or start of next month) for MoM tracking, but you can update more frequently.

**Q: Can I track YoY if my company is less than a year old?**
A: Yes, but the YoY comparison will be meaningful only once you have 12+ months of historical data.

**Q: What currencies should I use?**
A: Use actual currency values without "$" symbol. The category (e.g., "Revenue") indicates the unit type.

**Q: Can I edit previous months' data?**
A: Yes! Re-upload with corrected data. The most recent upload will override previous data for the same KPI.

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No department sheets found" | Ensure sheet names are: Product, Sales, Marketing, RnD, Finance |
| "No valid data found" | Check column headers match exactly (case-insensitive acceptable) |
| "Parsing error" | Ensure all numeric values are numbers, not text |
| "Missing required fields" | Fill in: KPI Name, Current Month, Current Month Actual, Category |
| Percentages not calculating | Leave percentage columns blank for auto-calculation |

---

## 📞 Support

For issues or questions about the template:
1. Check this guide's FAQ section
2. Review the "Instructions" sheet in the Excel template
3. Contact your dashboard administrator

---

**Version:** 2.1 (February 2026)
**Last Updated:** 2026-02-27
**Template Format:** Comprehensive with MoM, QoQ, YoY Comparisons
