/**
 * OpenRouter LLM Service
 * Provides AI-powered Q&A and insight enhancement
 * 
 * Free tier available at: https://openrouter.ai
 * Models: Mistral, Llama3, GPT-3.5, etc.
 */

import { KPISnapshot } from './aiInsights';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Enhanced insight generation with LLM
 * Takes a KPI snapshot and generates natural language insights
 */
export async function generateInsightWithLLM(
  kpiName: string,
  value: number,
  target: number,
  changePercent: number,
  changeType: 'increase' | 'decrease' | 'stable'
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    return `${kpiName}: ${value} (target: ${target}) - ${changePercent > 0 ? '📈' : '📉'} ${Math.abs(changePercent).toFixed(1)}%`;
  }

  try {
    const prompt = `You are a business intelligence analyst. Provide a 1-sentence insight about this KPI:
    
KPI: ${kpiName}
Current Value: ${value.toLocaleString()}
Target: ${target.toLocaleString()}
Change: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}% (${changeType})

Generate a concise, actionable insight. Be specific about the metric name and impact.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'HYDGEN KPI Dashboard',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    return null;
  }
}

/**
 * Context-aware Q&A with LLM
 * Answers user questions about KPI data
 */
export async function askLLMQuestion(
  question: string,
  kpiSnapshots: KPISnapshot[]
): Promise<{
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sourcesUsed: string[];
}> {
  if (!OPENROUTER_API_KEY) {
    return {
      answer:
        'LLM service not configured. Please set up your OpenRouter API key in .env.local file (VITE_OPENROUTER_API_KEY). See .env.example for instructions.',
      confidence: 'low',
      sourcesUsed: [],
    };
  }

  try {
    // Build context from KPI data
    const kpiContext = kpiSnapshots
      .map(
        (k) =>
          `${k.kpiName}: ${k.value.toLocaleString()} (target: ${k.target.toLocaleString()})`
      )
      .join('\n');

    const systemPrompt = `You are a business intelligence assistant for HYDGEN, a company tracking KPIs across Finance, Sales, Marketing, Product, and R&D departments.

You have access to current KPI data:
${kpiContext}

Answer questions concisely and factually based on the data provided. If data is not available, say so clearly.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'HYDGEN KPI Dashboard',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', response.status, error);

      // Provide helpful error messages based on status codes
      let errorMsg = 'Unable to process your question.';
      if (response.status === 401) {
        errorMsg = 'Authentication failed. Please verify your OpenRouter API key in .env.local';
      } else if (response.status === 429) {
        errorMsg = 'Rate limit reached. Please wait a moment and try again.';
      } else if (response.status === 500) {
        errorMsg = 'OpenRouter service is temporarily unavailable. Please try again later.';
      }

      return {
        answer: errorMsg,
        confidence: 'low',
        sourcesUsed: [],
      };
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '';

    return {
      answer,
      confidence: answer ? 'high' : 'low',
      sourcesUsed: kpiSnapshots.map((k) => k.kpiCode),
    };
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      answer: `Error: ${errorMsg}. Falling back to template answers. Check browser console for details.`,
      confidence: 'low',
      sourcesUsed: [],
    };
  }
}

/**
 * Batch generate insights for multiple KPIs using LLM
 */
export async function generateBatchInsights(
  snapshots: KPISnapshot[]
): Promise<Array<{ kpiCode: string; insight: string }>> {
  const insights = await Promise.all(
    snapshots.map(async (snapshot) => {
      const insight = await generateInsightWithLLM(
        snapshot.kpiName,
        snapshot.value,
        snapshot.target,
        snapshot.previousValue
          ? ((snapshot.value - snapshot.previousValue) / snapshot.previousValue) * 100
          : 0,
        'stable'
      );

      return {
        kpiCode: snapshot.kpiCode,
        insight: insight || `${snapshot.kpiName} is at ${snapshot.value}`,
      };
    })
  );

  return insights;
}

/**
 * Check if LLM service is available
 */
export function isLLMAvailable(): boolean {
  return !!OPENROUTER_API_KEY;
}
