/**
 * CENTRALIZED LABEL CONFIGURATION
 * Single source of truth for all dashboard terminology
 * 
 * Purpose: Ensure consistency across all pages and components
 * Rule: All hardcoded text must come from this file
 */

export const LABELS = {
  // ============================================================================
  // DEPARTMENT NAMES (Used in navigation, page titles)
  // ============================================================================
  departments: {
    executive: "Executive Overview",
    sales: "Sales",
    bd: "Business Development",
    marketing: "Marketing",
    product: "Product Engineering",
    rnd: "Research & Development",
    delivery: "Delivery & Customer Operations",
    finance: "Finance",
  },

  // ============================================================================
  // SECTION HEADERS (Consistent subsection titles across all dashboards)
  // ============================================================================
  sections: {
    performance: "Performance",
    manufacturing: "Manufacturing",
    platformReadiness: "Platform Readiness",
    deliveryPerformance: "Delivery Performance",
    postDelivery: "Post-Delivery Performance",
    demandGeneration: "Demand Generation",
    funnelHealth: "Funnel Health",
    marketAccess: "Market Access",
    useCaseValidation: "Use-Case Validation",
    dealReadiness: "Deal Readiness",
    revenue: "Revenue & Orders",
    marketExpansion: "Market Expansion",
    capital: "Capital & Runway",
    cashflow: "Cash Flow",
    kpiHealth: "KPI Health",
    strategicOutcomes: "Strategic Outcomes",
    definitions: "KPI Definitions",
  },

  // ============================================================================
  // KPI GROUP TITLES (Objective-based, no platform details in title)
  // ============================================================================
  kpiGroups: {
    // Product Engineering
    stackPerformance: "Stack Performance",
    manufacturingPerformance: "Manufacturing Performance",
    deliveryExecution: "Delivery Execution",
    
    // Sales & BD
    pipelineHealth: "Pipeline Health",
    dealCreation: "Deal Creation",
    revenueRealization: "Revenue Realisation",
    
    // Marketing
    qualifiedInbound: "Qualified Inbound",
    funnelMetrics: "Funnel Metrics",
    icpAlignment: "ICP Alignment",
    
    // R&D
    technologyRiskReduction: "Technology Risk Reduction",
    ipStrength: "IP Strength",
    grantUtilization: "Grant Utilization",
    futurePrograms: "Future Programs",
    
    // Finance
    liquidityPosition: "Liquidity Position",
    burnRate: "Burn Rate",
    runway: "Runway",
    workingCapital: "Working Capital",
  },

  // ============================================================================
  // TOGGLE/PLATFORM LABELS (Technology stack naming)
  // ============================================================================
  toggles: {
    pem: "PEM",
    aem: "AEM",
    stack5: "5 kW Stack",
    stack25: "25 kW Stack",
    stack250: "250 kW Platform",
    platformReadiness: "Platform Readiness",
    performance: "Performance",
    delivery: "Delivery & Customer Ops",
  },

  // ============================================================================
  // STATUS LABELS (Consistent status messaging)
  // ============================================================================
  statuses: {
    onTrack: "On Track",
    atRisk: "At Risk",
    behind: "Behind",
    blocked: "Blocked",
    planned: "Planned",
    inProgress: "In Progress",
    notStarted: "Not Started",
    exceeded: "Exceeded",
  },

  // ============================================================================
  // PAGE TITLES & SUBTITLES (Full page header information)
  // ============================================================================
  pageTitles: {
    executive: {
      title: "Executive Overview",
      subtitle: "Real-time strategic performance dashboard",
    },
    sales: {
      title: "Sales",
      subtitle: "Revenue Realisation & Pipeline Visibility",
    },
    bd: {
      title: "Business Development",
      subtitle: "Market Access & Deal Creation",
    },
    marketing: {
      title: "Marketing",
      subtitle: "Demand Generation & Funnel Quality",
    },
    product: {
      title: "Product Engineering",
      subtitle: "Stack Performance & Scale-Up Readiness",
    },
    rnd: {
      title: "Research & Development",
      subtitle: "Technology Risk Reduction & IP Moat Strength",
    },
    delivery: {
      title: "Delivery & Customer Operations",
      subtitle: "System Delivery & Customer Experience",
    },
    finance: {
      title: "Finance",
      subtitle: "Liquidity, Burn & Runway",
    },
  },

  // ============================================================================
  // COMMON KPI CARD TITLES (No verbs, no brackets, no units)
  // ============================================================================
  kpiTitles: {
    // Stack Performance
    stackEfficiency: "Stack Efficiency",
    voltageEfficiency: "Voltage Efficiency",
    degradation: "Degradation",
    hydrogenPurity: "Hydrogen Purity",
    operatingPressure: "Operating Pressure",
    
    // Manufacturing
    manufacturingYield: "Manufacturing Yield",
    costPerUnit: "Cost Per Unit",
    manufacturingRamp: "Manufacturing Ramp",
    
    // Delivery
    systemsDelivered: "Systems Delivered",
    customerSatisfaction: "Customer Satisfaction",
    onTimeDelivery: "On-Time Delivery",
    
    // Sales & Revenue
    revenue: "Revenue",
    pipelineValue: "Pipeline Value",
    conversionRate: "Conversion Rate",
    dealSize: "Deal Size",
    
    // Marketing
    qualifiedLeads: "Qualified Leads",
    mqlToSql: "MQL→SQL Conversion",
    leadQuality: "Lead Quality",
    icpPercentage: "ICP Percentage",
    
    // Financial
    cashPosition: "Cash Position",
    monthlyBurn: "Monthly Burn",
    runway: "Runway",
    workingCapital: "Working Capital",
    
    // R&D
    patentFamilies: "Patent Families",
    filings: "Filings",
    technologyRiskIndex: "Technology Risk Index",
    ipStrengthScore: "IP Strength Score",
  },

  // ============================================================================
  // METRIC UNITS & SUFFIXES
  // ============================================================================
  units: {
    percentage: "%",
    months: "months",
    currency: "$",
    kwhPerKg: "kWh/kg",
    bar: "bar",
    percentage_h2: "%",
  },

  // ============================================================================
  // COMMON MESSAGES & LABELS
  // ============================================================================
  messages: {
    noDataYet: "No Data Yet",
    uploadPrompt: "Upload your Excel file with KPI data to see the dashboard.",
    viewing: "Viewing",
    data: "data",
    upload: "Upload",
  },
};

// ============================================================================
// HELPER FUNCTION: Get page title by department key
// ============================================================================
export const getPageTitle = (department: keyof typeof LABELS.pageTitles) => {
  return LABELS.pageTitles[department];
};

// ============================================================================
// HELPER FUNCTION: Get status color
// ============================================================================
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "On Track": "#10b981",
    "At Risk": "#f59e0b",
    "Behind": "#ef4444",
    "Blocked": "#ef4444",
    "Planned": "#8b5cf6",
    "In Progress": "#3b82f6",
    "Not Started": "#94a3b8",
    "Exceeded": "#8b5cf6",
  };
  return colors[status] || "#e2e8f0";
};
