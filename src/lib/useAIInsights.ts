/**
 * React Hook for AI Insights
 * Fetches KPI data and generates insights
 */

import { useEffect, useState } from 'react';
import {
  generateInsights,
  generateSummaryInsight,
  getQuestionResponse,
  Insight,
  KPISnapshot,
} from './aiInsights';
import { supabase } from './supabase';

/**
 * Hook for fetching and generating insights
 */
export function useAIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summaryInsight, setSummaryInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        // Default to current month/year
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Determine which months to query - default to current month
        let monthsToFetch = [currentMonth];
        // const quarterMonthMap: Record<string, number[]> = {
        //   Q1: [1, 2, 3],
        //   Q2: [4, 5, 6],
        //   Q3: [7, 8, 9],
        //   Q4: [10, 11, 12],
        // };

        const queryMonth = monthsToFetch[0];
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;

        // Fetch current month metrics
        const { data: currentData, error: currentError } = await supabase
          .from('kpi_metrics')
          .select(
            `
          kpi_code,
          kpi_catalog:kpi_code(name, department),
          value,
          target,
          year,
          month
        `
          )
          .eq('year', currentYear)
          .eq('month', queryMonth);

        if (currentError) throw currentError;

        // Fetch previous month metrics for MoM comparison
        const { data: previousData, error: previousError } = await supabase
          .from('kpi_metrics')
          .select(
            `
          kpi_code,
          value,
          target,
          year,
          month
        `
          )
          .eq('year', currentYear)
          .eq('month', previousMonth);

        if (previousError) throw previousError;

        // Create previous month lookup
        const previousLookup = new Map<string, any>(
          (previousData || []).map((row: any) => [row.kpi_code, row])
        );

        // Build KPI snapshots
        const snapshots: KPISnapshot[] = (currentData || []).map((row: any) => ({
          kpiCode: row.kpi_code,
          kpiName: row.kpi_catalog?.name || row.kpi_code,
          value: row.value,
          target: row.target,
          previousValue: previousLookup.get(row.kpi_code)?.value,
          department: row.kpi_catalog?.department,
        }));

        // Generate insights
        const generatedInsights = generateInsights(snapshots);
        const summary = generateSummaryInsight(generatedInsights);

        setInsights(generatedInsights);
        setSummaryInsight(summary);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []); // Run once on mount

  return { insights, summaryInsight, loading, error };
}

/**
 * Hook for answering questions about KPIs
 */
export function useAIQuestion(question: string) {
  const [response, setResponse] = useState<{
    answer: string;
    confidence: 'high' | 'medium' | 'low';
    sourcesUsed: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!question) return;

    const fetchAnswer = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Fetch current KPI metrics
        const { data, error: fetchError } = await supabase
          .from('kpi_metrics')
          .select(
            `
          kpi_code,
          kpi_catalog:kpi_code(name, department),
          value,
          target
        `
          )
          .eq('year', currentYear)
          .eq('month', currentMonth);

        if (fetchError) throw fetchError;

        // Build snapshots
        const snapshots: KPISnapshot[] = (data || []).map((row: any) => ({
          kpiCode: row.kpi_code,
          kpiName: row.kpi_catalog?.name || row.kpi_code,
          value: row.value,
          target: row.target,
          department: row.kpi_catalog?.department,
        }));

        // Get response
        const answer = getQuestionResponse(question, snapshots);
        setResponse(answer);
      } catch (err) {
        console.error('Error answering question:', err);
        setError(err instanceof Error ? err.message : 'Failed to answer question');
      } finally {
        setLoading(false);
      }
    };

    fetchAnswer();
  }, [question]);

  return { response, loading, error };
}
