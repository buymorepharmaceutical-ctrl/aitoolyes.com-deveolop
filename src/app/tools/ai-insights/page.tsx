'use client';
import { useState } from 'react';
import GoogleAdPlaceholder from '@/components/GoogleAdPlaceholder';

export default function AiInsights() {
  const [data, setData] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    if (!data) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are a Senior Data Analyst. Analyze the following raw JSON/CSV data and provide a concise, human-readable business insight report. Include trends, warnings, and actionable recommendations. Data:\n\n${data}`,
          max_tokens: 700
        }),
      });
      
      const responseData = await res.json();
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to generate insights');
      }
      
      setOutput(responseData.output);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'An unexpected error occurred while connecting to Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">AI Dashboard Data Insights</h1>
      <p className="text-foreground/70">Powered by Local Gemma 4. Paste raw JSON or CSV data to generate a human-readable business report.</p>
      
      <GoogleAdPlaceholder slot="insight-top-3344" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <label className="font-semibold">Raw Data (JSON/CSV)</label>
          <textarea 
            className="w-full h-80 p-4 rounded-xl bg-white/50 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono resize-none"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='{"revenue": 50000, "users": 1200, "churn": "2.5%"}'
          />

          <button 
            onClick={generateInsights}
            disabled={loading || !data}
            className="mt-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin text-xl">⚙️</span> Analyzing (Gemma 4)...</>
            ) : (
              'Generate Report'
            )}
          </button>
          {error && <div className="text-red-500 text-sm font-medium mt-1">{error}</div>}
        </div>

        <div className="flex flex-col gap-4">
          <label className="font-semibold">AI Business Report</label>
          <textarea 
            className="w-full h-80 p-6 rounded-xl bg-gradient-to-br from-purple-50/80 to-pink-100/50 border border-purple-200 focus:outline-none font-medium text-sm resize-none text-purple-900 leading-relaxed"
            value={output}
            readOnly
            placeholder="Your AI-generated data insights will appear here..."
          />
          {output && (
            <button 
              onClick={() => navigator.clipboard.writeText(output)}
              className="bg-white/50 border border-card-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-white/80 transition-all"
            >
              Copy Report
            </button>
          )}
        </div>
      </div>
      
      <GoogleAdPlaceholder slot="insight-btm-5566" />
    </div>
  );
}
