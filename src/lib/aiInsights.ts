/**
 * AI Insights Generator - Rule-based Insight Generation
 * Analyzes KPI data to generate automatic insights
 * 
 * Features:
 * - MoM (Month-over-Month) change detection
 * - Target variance analysis
 * - Trend detection (up/down/stable)
 * - Anomaly detection
 * 
 * Uses: Rule-based logic (no external API required)
 */

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info'; // 🔴 🟡 🟢
  icon: string;
  kpiCode?: string;
  value?: number;
  target?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'stable';
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface KPISnapshot {
  kpiCode: string;
  kpiName: string;
  value: number;
  target: number;
  previousValue?: number;
  department?: string;
}

/**
 * Calculate Month-over-Month change
 */
export function calculateMoMChange(current: number, previous: number | undefined): {
  changePercent: number;
  changeAmount: number;
  trend: 'increase' | 'decrease' | 'stable';
} {
  if (!previous || previous === 0) return { changePercent: 0, changeAmount: 0, trend: 'stable' };

  const changeAmount = current - previous;
  const changePercent = (changeAmount / previous) * 100;
  const trend = changePercent > 2 ? 'increase' : changePercent < -2 ? 'decrease' : 'stable';

  return { changePercent, changeAmount, trend };
}

/**
 * Calculate Target Variance
 */
export function calculateTargetVariance(value: number, target: number): {
  variance: number;
  variancePercent: number;
  status: 'on-track' | 'warning' | 'critical';
} {
  const variance = value - target;
  const variancePercent = target > 0 ? (variance / target) * 100 : 0;

  let status: 'on-track' | 'warning' | 'critical' = 'on-track';
  if (variancePercent < -20) status = 'critical';
  else if (variancePercent < -10) status = 'warning';

  return { variance, variancePercent, status };
}

/**
 * Generate insight for a single KPI
 */
export function generateKPIInsight(
  kpiCode: string,
  kpiName: string,
  current: number,
  target: number,
  previous?: number
): Insight | null {
  const insights: Insight[] = [];

  // Check target variance
  const { variancePercent } = calculateTargetVariance(current, target);

  if (variancePercent < -30) {
    insights.push({
      id: `${kpiCode}-target-critical`,
      title: `${kpiName} Critical Gap`,
      description: `${kpiName} is ${Math.abs(variancePercent).toFixed(0)}% below target (${current.toLocaleString()} vs ${target.toLocaleString()})`,
      severity: 'critical',
      icon: '🔴',
      kpiCode,
      value: current,
      target,
      change: variancePercent,
    });
  } else if (variancePercent < -15) {
    insights.push({
      id: `${kpiCode}-target-warning`,
      title: `${kpiName} Below Target`,
      description: `${kpiName} is ${Math.abs(variancePercent).toFixed(1)}% below target`,
      severity: 'warning',
      icon: '🟡',
      kpiCode,
      value: current,
      target,
      change: variancePercent,
    });
  }

  // Check MoM change
  if (previous !== undefined) {
    const { changePercent, changeAmount, trend } = calculateMoMChange(current, previous);

    if (Math.abs(changePercent) > 20) {
      const direction = changePercent > 0 ? 'increased' : 'decreased';
      const severity = changePercent > 30 ? 'warning' : 'info';
      insights.push({
        id: `${kpiCode}-mom`,
        title: `${kpiName} ${direction.charAt(0).toUpperCase() + direction.slice(1)} MoM`,
        description: `${kpiName} ${direction} ${Math.abs(changePercent).toFixed(1)}% month-over-month (${changeAmount.toLocaleString()} change)`,
        severity: severity as 'warning' | 'info',
        icon: changePercent > 0 ? '📈' : '📉',
        kpiCode,
        value: current,
        change: changePercent,
        changeType: trend,
      });
    }
  }

  // Return most severe insight
  return (
    insights.find((i) => i.severity === 'critical') ||
    insights.find((i) => i.severity === 'warning') ||
    insights[0] ||
    null
  );
}

/**
 * Generate all insights from KPI data
 */
export function generateInsights(kpiSnapshots: KPISnapshot[]): Insight[] {
  const insights: Insight[] = [];

  for (const kpi of kpiSnapshots) {
    const insight = generateKPIInsight(
      kpi.kpiCode,
      kpi.kpiName,
      kpi.value,
      kpi.target,
      kpi.previousValue
    );

    if (insight) {
      insights.push(insight);
    }
  }

  // Sort by severity
  return insights.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Generate summary insight (top line)
 */
export function generateSummaryInsight(insights: Insight[]): Insight | null {
  const criticalCount = insights.filter((i) => i.severity === 'critical').length;
  const warningCount = insights.filter((i) => i.severity === 'warning').length;

  if (criticalCount > 0) {
    return {
      id: 'summary-critical',
      title: '🔴 Dashboard Alert',
      description: `${criticalCount} KPI${criticalCount > 1 ? 's' : ''} in critical condition. Immediate action required.`,
      severity: 'critical',
      icon: '🔴',
      metadata: { criticalCount },
    };
  }

  if (warningCount > 0) {
    return {
      id: 'summary-warning',
      title: '🟡 Dashboard Update',
      description: `${warningCount} KPI${warningCount > 1 ? 's' : ''} require attention. Review below.`,
      severity: 'warning',
      icon: '🟡',
      metadata: { warningCount },
    };
  }

  return {
    id: 'summary-good',
    title: '🟢 All Systems Nominal',
    description: 'All tracked KPIs are on track or improving.',
    severity: 'info',
    icon: '🟢',
  };
}

/**
 * Template-based Q&A engine
 * Matches user questions to KPI data
 */
export function getQuestionResponse(
  question: string,
  kpiSnapshots: KPISnapshot[]
): { answer: string; confidence: 'high' | 'medium' | 'low'; sourcesUsed: string[] } {
  const q = question.toLowerCase();
  const sources: string[] = [];

  // Question patterns
  if (q.includes('runway') || q.includes('cash')) {
    const cashKpi = kpiSnapshots.find((k) => k.kpiCode === 'FIN_RUNWAY_MONTHS' || k.kpiCode === 'FIN_CASH_BALANCE');
    if (cashKpi) {
      sources.push(cashKpi.kpiCode);
      return {
        answer: `Current cash runway is ${cashKpi.value} months (target: ${cashKpi.target} months). At current burn rate, you have approximately ${Math.floor(cashKpi.value)} months of operational runway.`,
        confidence: 'high',
        sourcesUsed: sources,
      };
    }
  }

  if (q.includes('burn') || q.includes('spending')) {
    const burnKpi = kpiSnapshots.find((k) => k.kpiCode === 'FIN_MONTHLY_BURN');
    if (burnKpi) {
      sources.push(burnKpi.kpiCode);
      const { variancePercent } = calculateTargetVariance(burnKpi.value, burnKpi.target);
      return {
        answer: `Monthly burn rate is ${(burnKpi.value / 1000).toFixed(1)}K (target: ${(burnKpi.target / 1000).toFixed(1)}K). You are ${variancePercent > 0 ? 'above' : 'below'} target by ${Math.abs(variancePercent).toFixed(0)}%.`,
        confidence: 'high',
        sourcesUsed: sources,
      };
    }
  }

  if (q.includes('pipeline') || q.includes('sales')) {
    const pipelineKpi = kpiSnapshots.find((k) => k.kpiCode === 'SAL_PIPELINE_VALUE');
    if (pipelineKpi) {
      sources.push(pipelineKpi.kpiCode);
      const { variancePercent } = calculateTargetVariance(pipelineKpi.value, pipelineKpi.target);
      return {
        answer: `Sales pipeline is ${(pipelineKpi.value / 1000000).toFixed(1)}M (target: ${(pipelineKpi.target / 1000000).toFixed(1)}M). You are ${variancePercent > 0 ? 'above' : 'below'} target by ${Math.abs(variancePercent).toFixed(0)}%.`,
        confidence: 'high',
        sourcesUsed: sources,
      };
    }
  }

  if (q.includes('marketing') || q.includes('leads')) {
    const leadsKpi = kpiSnapshots.find((k) => k.kpiCode === 'MKT_LEAD_GENERATION');
    if (leadsKpi) {
      sources.push(leadsKpi.kpiCode);
      return {
        answer: `Marketing generated ${leadsKpi.value} leads (target: ${leadsKpi.target}). This is ${leadsKpi.value >= leadsKpi.target ? 'meeting or exceeding' : 'below'} your ${((leadsKpi.value / leadsKpi.target) * 100).toFixed(0)}% of target.`,
        confidence: 'high',
        sourcesUsed: sources,
      };
    }
  }

  if (q.includes('behind') || q.includes('below target')) {
    const belowTarget = kpiSnapshots.filter((k) => k.value < k.target);
    if (belowTarget.length > 0) {
      sources.push(...belowTarget.map((k) => k.kpiCode));
      const list = belowTarget.map((k) => `${k.kpiName} (${((k.value / k.target) * 100).toFixed(0)}% of target)`).join(', ');
      return {
        answer: `The following KPIs are below target: ${list}.`,
        confidence: 'high',
        sourcesUsed: sources,
      };
    }
  }

  if (q.includes('which department') || q.includes('department')) {
    if (kpiSnapshots.length > 0) {
      sources.push(...kpiSnapshots.map((k) => k.kpiCode));
      const departments = [...new Set(kpiSnapshots.map((k) => k.department).filter(Boolean))];
      return {
        answer: `Tracking departments: ${departments.join(', ')}. Overall, ${kpiSnapshots.filter((k) => k.value >= k.target).length} of ${kpiSnapshots.length} KPIs are on track.`,
        confidence: 'medium',
        sourcesUsed: sources,
      };
    }
  }

  // Generic answer
  return {
    answer:
      'I can help you understand your KPIs. Ask me about: runway, burn rate, pipeline, marketing metrics, departments, or which KPIs are behind target.',
    confidence: 'low',
    sourcesUsed: sources,
  };
}

/**
 * Format insight for display
 */
export function formatInsight(insight: Insight): string {
  return `${insight.icon} ${insight.title}\n${insight.description}`;
}
