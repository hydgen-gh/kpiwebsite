-- ============================================================================
-- MIGRATION: Drop and Recreate KPI Tables with Clean Schema
-- Description: Drops existing KPI tables and recreates them with separate
-- month and year columns for cleaner temporal queries
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (in reverse order of dependencies)
-- ============================================================================
DROP TABLE IF EXISTS finance_kpis CASCADE;
DROP TABLE IF EXISTS rnd_kpis CASCADE;
DROP TABLE IF EXISTS marketing_kpis CASCADE;
DROP TABLE IF EXISTS sales_kpis CASCADE;
DROP TABLE IF EXISTS product_kpis CASCADE;

-- ============================================================================
-- PRODUCT KPI TABLE
-- ============================================================================
CREATE TABLE product_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL DEFAULT 'Product',
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Temporal Dimensions
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Current Period Data
  current_month_target NUMERIC,
  current_month_actual NUMERIC,
  
  -- MoM Comparison
  previous_month TEXT,
  previous_month_actual NUMERIC,
  mom_pct_change NUMERIC,
  
  -- Quarter Data
  current_quarter TEXT,
  current_quarter_target NUMERIC,
  current_quarter_actual NUMERIC,
  
  -- QoQ Comparison
  previous_quarter TEXT,
  previous_quarter_actual NUMERIC,
  qoq_pct_change NUMERIC,
  
  -- YoY Comparison
  same_month_prior_year_actual NUMERIC,
  yoy_pct_change NUMERIC,
  
  -- Tracking Scorecard Format
  sn INTEGER,
  target_quarter NUMERIC,
  actual_qtd NUMERIC,
  target_q4 NUMERIC,
  actual_jan NUMERIC,
  actual_feb NUMERIC,
  actual_mar NUMERIC,
  actual_q4 NUMERIC,
  progress TEXT,
  commentary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT product_kpis_valid_month CHECK (month IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  )),
  CONSTRAINT product_kpis_valid_year CHECK (year >= 2020 AND year <= 2100)
);

CREATE INDEX idx_product_kpis_month ON product_kpis(month);
CREATE INDEX idx_product_kpis_year ON product_kpis(year);
CREATE INDEX idx_product_kpis_month_year ON product_kpis(month, year);
CREATE INDEX idx_product_kpis_category ON product_kpis(category);
CREATE INDEX idx_product_kpis_kpi_name ON product_kpis(kpi_name);

-- ============================================================================
-- SALES KPI TABLE
-- ============================================================================
CREATE TABLE sales_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL DEFAULT 'Sales',
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Temporal Dimensions
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Current Period Data
  current_month_target NUMERIC,
  current_month_actual NUMERIC,
  
  -- MoM Comparison
  previous_month TEXT,
  previous_month_actual NUMERIC,
  mom_pct_change NUMERIC,
  
  -- Quarter Data
  current_quarter TEXT,
  current_quarter_target NUMERIC,
  current_quarter_actual NUMERIC,
  
  -- QoQ Comparison
  previous_quarter TEXT,
  previous_quarter_actual NUMERIC,
  qoq_pct_change NUMERIC,
  
  -- YoY Comparison
  same_month_prior_year_actual NUMERIC,
  yoy_pct_change NUMERIC,
  
  -- Tracking Scorecard Format
  sn INTEGER,
  target_quarter NUMERIC,
  actual_qtd NUMERIC,
  target_q4 NUMERIC,
  actual_jan NUMERIC,
  actual_feb NUMERIC,
  actual_mar NUMERIC,
  actual_q4 NUMERIC,
  progress TEXT,
  commentary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT sales_kpis_valid_month CHECK (month IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  )),
  CONSTRAINT sales_kpis_valid_year CHECK (year >= 2020 AND year <= 2100)
);

CREATE INDEX idx_sales_kpis_month ON sales_kpis(month);
CREATE INDEX idx_sales_kpis_year ON sales_kpis(year);
CREATE INDEX idx_sales_kpis_month_year ON sales_kpis(month, year);
CREATE INDEX idx_sales_kpis_category ON sales_kpis(category);
CREATE INDEX idx_sales_kpis_kpi_name ON sales_kpis(kpi_name);

-- ============================================================================
-- MARKETING KPI TABLE
-- ============================================================================
CREATE TABLE marketing_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL DEFAULT 'Marketing',
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Temporal Dimensions
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Current Period Data
  current_month_target NUMERIC,
  current_month_actual NUMERIC,
  
  -- MoM Comparison
  previous_month TEXT,
  previous_month_actual NUMERIC,
  mom_pct_change NUMERIC,
  
  -- Quarter Data
  current_quarter TEXT,
  current_quarter_target NUMERIC,
  current_quarter_actual NUMERIC,
  
  -- QoQ Comparison
  previous_quarter TEXT,
  previous_quarter_actual NUMERIC,
  qoq_pct_change NUMERIC,
  
  -- YoY Comparison
  same_month_prior_year_actual NUMERIC,
  yoy_pct_change NUMERIC,
  
  -- Tracking Scorecard Format
  sn INTEGER,
  target_quarter NUMERIC,
  actual_qtd NUMERIC,
  target_q4 NUMERIC,
  actual_jan NUMERIC,
  actual_feb NUMERIC,
  actual_mar NUMERIC,
  actual_q4 NUMERIC,
  progress TEXT,
  commentary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT marketing_kpis_valid_month CHECK (month IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  )),
  CONSTRAINT marketing_kpis_valid_year CHECK (year >= 2020 AND year <= 2100)
);

CREATE INDEX idx_marketing_kpis_month ON marketing_kpis(month);
CREATE INDEX idx_marketing_kpis_year ON marketing_kpis(year);
CREATE INDEX idx_marketing_kpis_month_year ON marketing_kpis(month, year);
CREATE INDEX idx_marketing_kpis_category ON marketing_kpis(category);
CREATE INDEX idx_marketing_kpis_kpi_name ON marketing_kpis(kpi_name);

-- ============================================================================
-- RnD / R&D KPI TABLE
-- ============================================================================
CREATE TABLE rnd_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL DEFAULT 'RnD',
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Temporal Dimensions
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Current Period Data
  current_month_target NUMERIC,
  current_month_actual NUMERIC,
  
  -- MoM Comparison
  previous_month TEXT,
  previous_month_actual NUMERIC,
  mom_pct_change NUMERIC,
  
  -- Quarter Data
  current_quarter TEXT,
  current_quarter_target NUMERIC,
  current_quarter_actual NUMERIC,
  
  -- QoQ Comparison
  previous_quarter TEXT,
  previous_quarter_actual NUMERIC,
  qoq_pct_change NUMERIC,
  
  -- YoY Comparison
  same_month_prior_year_actual NUMERIC,
  yoy_pct_change NUMERIC,
  
  -- Tracking Scorecard Format
  sn INTEGER,
  target_quarter NUMERIC,
  actual_qtd NUMERIC,
  target_q4 NUMERIC,
  actual_jan NUMERIC,
  actual_feb NUMERIC,
  actual_mar NUMERIC,
  actual_q4 NUMERIC,
  progress TEXT,
  commentary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT rnd_kpis_valid_month CHECK (month IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  )),
  CONSTRAINT rnd_kpis_valid_year CHECK (year >= 2020 AND year <= 2100)
);

CREATE INDEX idx_rnd_kpis_month ON rnd_kpis(month);
CREATE INDEX idx_rnd_kpis_year ON rnd_kpis(year);
CREATE INDEX idx_rnd_kpis_month_year ON rnd_kpis(month, year);
CREATE INDEX idx_rnd_kpis_category ON rnd_kpis(category);
CREATE INDEX idx_rnd_kpis_kpi_name ON rnd_kpis(kpi_name);

-- ============================================================================
-- FINANCE KPI TABLE
-- ============================================================================
CREATE TABLE finance_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department TEXT NOT NULL DEFAULT 'Finance',
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Temporal Dimensions
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  
  -- Current Period Data
  current_month_target NUMERIC,
  current_month_actual NUMERIC,
  
  -- MoM Comparison
  previous_month TEXT,
  previous_month_actual NUMERIC,
  mom_pct_change NUMERIC,
  
  -- Quarter Data
  current_quarter TEXT,
  current_quarter_target NUMERIC,
  current_quarter_actual NUMERIC,
  
  -- QoQ Comparison
  previous_quarter TEXT,
  previous_quarter_actual NUMERIC,
  qoq_pct_change NUMERIC,
  
  -- YoY Comparison
  same_month_prior_year_actual NUMERIC,
  yoy_pct_change NUMERIC,
  
  -- Tracking Scorecard Format
  sn INTEGER,
  target_quarter NUMERIC,
  actual_qtd NUMERIC,
  target_q4 NUMERIC,
  actual_jan NUMERIC,
  actual_feb NUMERIC,
  actual_mar NUMERIC,
  actual_q4 NUMERIC,
  progress TEXT,
  commentary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT finance_kpis_valid_month CHECK (month IN (
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  )),
  CONSTRAINT finance_kpis_valid_year CHECK (year >= 2020 AND year <= 2100)
);

CREATE INDEX idx_finance_kpis_month ON finance_kpis(month);
CREATE INDEX idx_finance_kpis_year ON finance_kpis(year);
CREATE INDEX idx_finance_kpis_month_year ON finance_kpis(month, year);
CREATE INDEX idx_finance_kpis_category ON finance_kpis(category);
CREATE INDEX idx_finance_kpis_kpi_name ON finance_kpis(kpi_name);

-- ============================================================================
-- PRODUCT KPIs - JANUARY & FEBRUARY 2026
-- ============================================================================

-- PRODUCT ENGINEERING - PEM Stack Performance (25kW)
INSERT INTO product_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Product', 'Stack Efficiency', 'PEM Stack Performance', 'January', 2026, NULL, NULL),
  ('Product', 'Voltage Efficiency', 'PEM Stack Performance', 'January', 2026, 100, 100),
  ('Product', 'Degradation Rate', 'PEM Stack Performance', 'January', 2026, 0, 0),
  ('Product', 'Hydrogen Purity', 'PEM Stack Performance', 'January', 2026, NULL, 99.9990),
  ('Product', 'Operating Pressure', 'PEM Stack Performance', 'January', 2026, NULL, 10),
  ('Product', 'Stack Efficiency', 'PEM Stack Performance', 'February', 2026, 48, 42),
  ('Product', 'Voltage Efficiency', 'PEM Stack Performance', 'February', 2026, 100, 100),
  ('Product', 'Degradation Rate', 'PEM Stack Performance', 'February', 2026, 0, 0),
  ('Product', 'Hydrogen Purity', 'PEM Stack Performance', 'February', 2026, NULL, 99.999),
  ('Product', 'Operating Pressure', 'PEM Stack Performance', 'February', 2026, NULL, 15);

-- PRODUCT ENGINEERING - MANUFACTURING
INSERT INTO product_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Product', 'Commercial Systems Built', 'Manufacturing', 'January', 2026, NULL, 2),
  ('Product', 'Manufacturing Yield', 'Manufacturing', 'January', 2026, 100, 100),
  ('Product', 'Commercial Systems Built', 'Manufacturing', 'February', 2026, 10, 5),
  ('Product', 'Manufacturing Yield', 'Manufacturing', 'February', 2026, 100, 100);

-- PRODUCT - 250kW PLATFORM
INSERT INTO product_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Product', 'Stack Architecture Freeze', '250kW Platform', 'January', 2026, 100, 100),
  ('Product', 'BOM Cost Model Completeness', '250kW Platform', 'January', 2026, 70, 50),
  ('Product', 'Manufacturing Process Readiness', '250kW Platform', 'January', 2026, NULL, 25),
  ('Product', 'Stack Architecture Freeze', '250kW Platform', 'February', 2026, 100, 100),
  ('Product', 'BOM Cost Model Completeness', '250kW Platform', 'February', 2026, 70, 70),
  ('Product', 'Manufacturing Process Readiness', '250kW Platform', 'February', 2026, NULL, 40);

-- AEM STACK
INSERT INTO product_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Product', 'Stack Efficiency', 'AEM Stack', 'January', 2026, NULL, 65.75),
  ('Product', 'Current Density', 'AEM Stack', 'January', 2026, NULL, 0.7),
  ('Product', 'Operating Pressure', 'AEM Stack', 'January', 2026, NULL, 1),
  ('Product', 'Manufacturing Cost', 'AEM Stack', 'January', 2026, NULL, 1126),
  ('Product', 'Stack Efficiency', 'AEM Stack', 'February', 2026, NULL, 65.75),
  ('Product', 'Current Density', 'AEM Stack', 'February', 2026, NULL, 0.7),
  ('Product', 'Operating Pressure', 'AEM Stack', 'February', 2026, NULL, 1),
  ('Product', 'Manufacturing Cost', 'AEM Stack', 'February', 2026, NULL, 1126);

-- ============================================================================
-- SALES KPIs - JANUARY & FEBRUARY 2026 (DELIVERY & CUSTOMER OPERATIONS)
-- ============================================================================

INSERT INTO sales_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Sales', 'Commercial Systems Delivered', 'Delivery & Customer Operations', 'January', 2026, 11, 1),
  ('Sales', 'On-time Delivery', 'Delivery & Customer Operations', 'January', 2026, 100, 25),
  ('Sales', 'First-time Acceptance', 'Delivery & Customer Operations', 'January', 2026, 100, 100),
  ('Sales', 'Order-to-Delivery Cycle', 'Delivery & Customer Operations', 'January', 2026, NULL, 60),
  ('Sales', 'Post-delivery Issues per System', 'Delivery & Customer Operations', 'January', 2026, 0, 1),
  ('Sales', 'Critical Customer Issues', 'Delivery & Customer Operations', 'January', 2026, 0, 1),
  ('Sales', 'Commercial Systems Delivered', 'Delivery & Customer Operations', 'February', 2026, 11, 1),
  ('Sales', 'On-time Delivery', 'Delivery & Customer Operations', 'February', 2026, 100, 0),
  ('Sales', 'First-time Acceptance', 'Delivery & Customer Operations', 'February', 2026, 100, 100),
  ('Sales', 'Order-to-Delivery Cycle', 'Delivery & Customer Operations', 'February', 2026, NULL, 60),
  ('Sales', 'Post-delivery Issues per System', 'Delivery & Customer Operations', 'February', 2026, 0, 1),
  ('Sales', 'Critical Customer Issues', 'Delivery & Customer Operations', 'February', 2026, 0, 1);

-- ============================================================================
-- MARKETING KPIs - JANUARY & FEBRUARY 2026
-- ============================================================================

INSERT INTO marketing_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Marketing', 'Qualified Inbound Inquiries', 'Demand Generation', 'January', 2026, 50, 11),
  ('Marketing', 'Inbound from Priority ICP', 'Demand Generation', 'January', 2026, NULL, 0),
  ('Marketing', 'Inbound Accepted by Sales', 'Sales Alignment', 'January', 2026, NULL, 4),
  ('Marketing', 'MQL → SQL Conversion', 'Sales Efficiency', 'January', 2026, NULL, 0),
  ('Marketing', 'Qualified Inbound Inquiries', 'Demand Generation', 'February', 2026, 50, 7),
  ('Marketing', 'Inbound from Priority ICP', 'Demand Generation', 'February', 2026, NULL, 20),
  ('Marketing', 'Inbound Accepted by Sales', 'Sales Alignment', 'February', 2026, NULL, 0),
  ('Marketing', 'MQL → SQL Conversion', 'Sales Efficiency', 'February', 2026, NULL, 0),
  ('Marketing', 'Marketing-Sourced Pipeline', 'Revenue Attribution', 'February', 2026, NULL, 1370000);

-- ============================================================================
-- FINANCE KPIs - JANUARY & FEBRUARY 2026
-- ============================================================================

INSERT INTO finance_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('Finance', 'Cash Balance', 'Liquidity', 'January', 2026, NULL, 3540004),
  ('Finance', 'Working Capital Movement', 'Capital Management', 'January', 2026, NULL, -60561),
  ('Finance', 'Monthly Burn Rate', 'Cost Management', 'January', 2026, 450000, 420000),
  ('Finance', 'Revenue Recognition', 'Revenue', 'January', 2026, 500000, 320000),
  ('Finance', 'Cash Balance', 'Liquidity', 'February', 2026, NULL, 3580000),
  ('Finance', 'Working Capital Movement', 'Capital Management', 'February', 2026, NULL, 40000),
  ('Finance', 'Monthly Burn Rate', 'Cost Management', 'February', 2026, 450000, 410000),
  ('Finance', 'Revenue Recognition', 'Revenue', 'February', 2026, 500000, 280000);

-- ============================================================================
-- RnD KPIs - JANUARY & FEBRUARY 2026
-- ============================================================================

INSERT INTO rnd_kpis (
  department, kpi_name, category, month, year,
  current_month_target, current_month_actual
) VALUES
  ('RnD', 'Catalyst Milestone Progress', 'Research', 'January', 2026, 30, 10),
  ('RnD', 'Membrane Milestone Progress', 'Research', 'January', 2026, 30, 15),
  ('RnD', 'MEA Milestone Progress', 'Research', 'January', 2026, 40, 30),
  ('RnD', 'Patent Families Filed', 'IP', 'January', 2026, 5, 4),
  ('RnD', 'Catalyst Milestone Progress', 'Research', 'February', 2026, 30, 18),
  ('RnD', 'Membrane Milestone Progress', 'Research', 'February', 2026, 30, 22),
  ('RnD', 'MEA Milestone Progress', 'Research', 'February', 2026, 40, 35),
  ('RnD', 'Patent Families Filed', 'IP', 'February', 2026, 5, 4);
