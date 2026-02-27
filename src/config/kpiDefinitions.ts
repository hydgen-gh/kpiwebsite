export interface KPIItem {
  name: string;
  definition: string;
}

export interface CategoryGroup {
  category: string;
  objective: string;
  kpis: KPIItem[];
}

export const KPI_DEFINITIONS = {
  product: {
    pem: {
      '25kw': [
        {
          category: 'Baseline (25kW) stack performance',
          objective: 'Progress across sub-KPIs measuring performance of PEM baseline stack',
          kpis: [
            {
              name: 'Stack efficiency (kWh/kg H₂)',
              definition: 'Electrical energy required to produce one kilogram of hydrogen at stack level.',
            },
            {
              name: 'Voltage efficiency (%)',
              definition: 'Ratio of theoretical minimum voltage to actual operating voltage under nominal conditions.',
            },
            {
              name: 'Degradation rate (% / 1,000h)',
              definition: 'Performance loss measured over operating time under defined test conditions.',
            },
            {
              name: 'Hydrogen purity (post-dryer)',
              definition: 'Hydrogen purity measured downstream of gas drying and conditioning systems.',
            },
            {
              name: 'Operating pressure',
              definition: 'Output pressure maintained without leakage.',
            },
          ],
        },
        {
          category: 'Baseline (25kW) manufacturing performance',
          objective: 'Measure throughput, cost and yield',
          kpis: [
            {
              name: 'Number of commercial systems built',
              definition: 'Count of commercial systems assembled for customer delivery or deployment.',
            },
            {
              name: 'Manufacturing cost ($/kW)',
              definition: 'Fully burdened manufacturing cost per installed kilowatt.',
            },
            {
              name: 'Manufacturing yield',
              definition: 'Percentage of stacks meeting defined performance and quality criteria.',
            },
          ],
        },
        {
          category: '250 kW platform readiness',
          objective: 'Architectural, supply chain and manufacturing readiness',
          kpis: [
            {
              name: 'Stack architecture freeze',
              definition: 'Completion and internal sign-off of full stack architecture.',
            },
            {
              name: 'BOM cost model completeness',
              definition: '% of BOM with validated supplier quotes.',
            },
            {
              name: 'Manufacturing process readiness',
              definition: 'Critical manufacturing steps with SOPs, yields and QC defined.',
            },
          ],
        },
      ],
      '5kw': [
        {
          category: 'Baseline (5kW) stack performance',
          objective: 'Progress across sub-KPIs measuring performance of PEM baseline stack',
          kpis: [
            {
              name: 'Stack efficiency (kWh/kg H₂)',
              definition: 'Electrical energy required to produce one kilogram of hydrogen at stack level.',
            },
            {
              name: 'Voltage efficiency (%)',
              definition: 'Ratio of theoretical minimum voltage to actual operating voltage under nominal conditions.',
            },
            {
              name: 'Degradation rate (% / 1,000h)',
              definition: 'Performance loss measured over operating time under defined test conditions.',
            },
            {
              name: 'Hydrogen purity (post-dryer)',
              definition: 'Hydrogen purity measured downstream of gas drying and conditioning systems.',
            },
            {
              name: 'Operating pressure',
              definition: 'Output pressure maintained without leakage.',
            },
          ],
        },
        {
          category: 'Manufacturing performance',
          objective: 'Measure throughput, cost and yield',
          kpis: [
            {
              name: 'Number of commercial systems built',
              definition: 'Count of commercial systems assembled for customer delivery or deployment.',
            },
            {
              name: 'Manufacturing cost ($/kW)',
              definition: 'Fully burdened manufacturing cost per installed kilowatt.',
            },
            {
              name: 'Manufacturing yield',
              definition: 'Percentage of stacks meeting defined performance and quality criteria.',
            },
          ],
        },
      ],
    },
    aem: {
      '25kw': [
        {
          category: 'Baseline (25kW AEM) stack performance',
          objective: 'Progress across sub-KPIs measuring performance of AEM baseline stack',
          kpis: [
            {
              name: 'Stack efficiency',
              definition: 'Electrical energy per kg hydrogen.',
            },
            {
              name: 'Current density @ nominal',
              definition: 'Achieved operating current density at nominal conditions.',
            },
            {
              name: 'Degradation rate',
              definition: 'Performance loss over time.',
            },
            {
              name: 'Hydrogen purity',
              definition: 'Measured after drying system.',
            },
            {
              name: 'Operating pressure',
              definition: 'Maintained without leakage.',
            },
          ],
        },
        {
          category: 'Manufacturing performance',
          objective: 'Measure throughput, cost and yield',
          kpis: [
            {
              name: 'Manufacturing cost ($/kW)',
              definition: 'Estimated cost at current maturity.',
            },
            {
              name: 'Manufacturing yield',
              definition: 'Stacks meeting performance & quality criteria.',
            },
          ],
        },
      ],
    },
  },

  delivery: {
    default: [
      {
        category: 'Project / system delivery performance',
        objective: 'Measure delivery execution and customer acceptance',
        kpis: [
          {
            name: 'Commercial systems delivered',
            definition: 'Total systems delivered to customers.',
          },
          {
            name: 'On-time delivery vs commitment',
            definition: '% delivered on schedule.',
          },
          {
            name: 'First-time acceptance rate',
            definition: '% accepted without rework.',
          },
          {
            name: 'Order-to-delivery cycle time',
            definition: 'Time from order confirmation to delivery.',
          },
        ],
      },
      {
        category: 'Post-delivery performance',
        objective: 'Measure customer support quality and system reliability',
        kpis: [
          {
            name: 'Post-delivery issues per system',
            definition: 'Customer-reported issues in first 30 days.',
          },
          {
            name: 'Critical customer issues',
            definition: 'Count of high-impact issues.',
          },
          {
            name: 'Mean time to resolution',
            definition: 'Time to fully resolve issues.',
          },
          {
            name: '30-day CSAT / NPS',
            definition: 'Customer satisfaction after 30 days.',
          },
        ],
      },
    ],
  },

  finance: {
    default: [
      {
        category: 'Cash position & runway',
        objective: 'Monitor liquidity and sustainability',
        kpis: [
          {
            name: 'Cash balance',
            definition: 'Total unrestricted cash.',
          },
          {
            name: 'Underlying operating burn',
            definition: 'Recurring operating cash outflow.',
          },
          {
            name: 'Working capital movement',
            definition: 'Cash impact from receivables, payables, inventory.',
          },
          {
            name: 'Runway',
            definition: 'Months of operation at current burn.',
          },
          {
            name: 'Committed non-dilutive funding',
            definition: 'Total grant/subsidy funding awarded.',
          },
        ],
      },
    ],
  },

  marketing: {
    default: [
      {
        category: 'Qualified demand generation',
        objective: 'Generate inbound interest from target accounts',
        kpis: [
          {
            name: 'Qualified inbound inquiries',
            definition: 'ICP-fit inbound with real intent.',
          },
          {
            name: '% inbound from priority ICPs',
            definition: 'Share from defined ICPs.',
          },
          {
            name: '% inbound accepted by Sales',
            definition: 'Formally accepted leads.',
          },
        ],
      },
      {
        category: 'Funnel discipline',
        objective: 'Track lead progression and pipeline quality',
        kpis: [
          {
            name: 'Inbound response time',
            definition: 'Time to Sales action.',
          },
          {
            name: 'MQL → SQL conversion',
            definition: 'Leads progressing to qualified.',
          },
          {
            name: 'Marketing-sourced pipeline',
            definition: 'Pipeline from marketing activity.',
          },
        ],
      },
      {
        category: 'Sales enablement',
        objective: 'Support deal execution with marketing assets',
        kpis: [
          {
            name: '% deals using enablement assets',
            definition: 'Deals supported by marketing content.',
          },
        ],
      },
    ],
  },

  bd: {
    default: [
      {
        category: 'Market access',
        objective: 'Establish visibility and require level conversations in target markets',
        kpis: [
          {
            name: 'Qualified enterprise conversations',
            definition: 'Decision-maker level meetings.',
          },
          {
            name: 'Anchor accounts identified',
            definition: 'Priority accounts with real interest.',
          },
          {
            name: 'Stakeholder coverage',
            definition: 'Technical, commercial & economic buyer engaged.',
          },
        ],
      },
      {
        category: 'Use case validation',
        objective: 'Develop evidence of market demand with specific use cases',
        kpis: [
          {
            name: 'Validated use cases documented',
            definition: 'Region-specific viable use cases.',
          },
          {
            name: 'Customer readiness assessment',
            definition: 'Budget, timing, infra, regulatory fit.',
          },
        ],
      },
      {
        category: 'Deal readiness',
        objective: 'Prepare pipeline for Sales continuity',
        kpis: [
          {
            name: 'Pre-qualified opportunities',
            definition: 'Meet internal qualification.',
          },
          {
            name: 'Technical feasibility checkpoints',
            definition: 'Preliminary engineering validation.',
          },
          {
            name: 'Local ecosystem mapping',
            definition: 'EPCs, regulators, service partners identified.',
          },
        ],
      },
    ],
  },

  sales: {
    default: [
      {
        category: 'Revenue & orders',
        objective: 'Track order intake and deal economics',
        kpis: [
          {
            name: 'Order intake',
            definition: 'Total signed PO value.',
          },
          {
            name: 'Average deal size',
            definition: 'Mean PO value.',
          },
          {
            name: 'Proposal → PO conversion',
            definition: '% proposals converted.',
          },
        ],
      },
      {
        category: 'Market expansion',
        objective: 'Grow customer base and channel reach',
        kpis: [
          {
            name: 'Active customers',
            definition: 'Customers with active engagement.',
          },
          {
            name: '% repeat customers',
            definition: 'Revenue from existing customers.',
          },
          {
            name: 'Active channel partners',
            definition: 'Partners generating qualified opportunities.',
          },
        ],
      },
      {
        category: 'Funnel discipline',
        objective: 'Maintain pipeline quality and sales velocity',
        kpis: [
          {
            name: 'Inbound response time',
            definition: 'Time to Sales action.',
          },
          {
            name: 'MQL → SQL conversion',
            definition: 'Lead progression rate.',
          },
          {
            name: 'Qualified pipeline',
            definition: 'Active, validated opportunities.',
          },
          {
            name: 'Sales cycle duration',
            definition: 'First meeting → signed PO.',
          },
        ],
      },
    ],
  },

  rnd: {
    default: [
      {
        category: 'Technology development',
        objective: 'Progress core technology toward commercialization',
        kpis: [
          {
            name: 'Technology Readiness Level (TRL)',
            definition: 'Current maturity rating of core technology.',
          },
          {
            name: 'Critical milestone completion',
            definition: '% of planned R&D milestones achieved.',
          },
          {
            name: 'Infrastructure capacity utilization',
            definition: '% utilization of test and lab facilities.',
          },
        ],
      },
      {
        category: 'Intellectual property',
        objective: 'Build defensible IP portfolio',
        kpis: [
          {
            name: 'Patent applications filed',
            definition: 'New IP filings in current period.',
          },
          {
            name: 'Patents issued',
            definition: 'Total issued patents.',
          },
          {
            name: 'IP strength score',
            definition: 'Assessment of portfolio breadth and defensibility.',
          },
        ],
      },
    ],
  },
};
