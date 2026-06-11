'use client';
import { useState } from 'react';
import GoogleAdPlaceholder from '@/components/GoogleAdPlaceholder';

export default function AiCopywriter() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCopy = async () => {
    if (!topic) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are an expert marketer and copywriter. Write a high-converting, engaging marketing copy for the topic: "${topic}". The tone of voice MUST be: ${tone}. Include emojis and a clear call to action.`,
          max_tokens: 600
        }),
      });
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate copy');
      }
      
      setOutput(data.output);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'An unexpected error occurred while connecting to Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">AI Marketing Copywriter</h1>
      <p className="text-foreground/70">Powered by Local Gemma 4. Generate high-converting ad copy instantly.</p>
      
      <GoogleAdPlaceholder slot="copy-top-7766" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Product or Topic</label>
            <input 
              className="w-full p-4 rounded-xl bg-white/50 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. A new AI-powered task manager"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Tone of Voice</label>
            <select 
              className="w-full p-4 rounded-xl bg-white/50 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="Professional">Professional</option>
              <option value="Excited">Excited</option>
              <option value="Urgent">Urgent</option>
              <option value="Humorous">Humorous</option>
            </select>
          </div>

          <button 
            onClick={generateCopy}
            disabled={loading || !topic}
            className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin text-xl">⚙️</span> Writing (Gemma 4)...</>
            ) : (
              'Generate Copy'
            )}
          </button>
          {error && <div className="text-red-500 text-sm font-medium mt-1">{error}</div>}
        </div>

        <div className="flex flex-col gap-4">
          <label className="font-semibold">Generated Copy</label>
          <textarea 
            className="w-full h-80 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-100/50 border border-blue-200 focus:outline-none font-medium text-sm resize-none text-blue-900"
            value={output}
            readOnly
            placeholder="Your AI-generated marketing copy will appear here..."
          />
          {output && (
            <button 
              onClick={() => navigator.clipboard.writeText(output)}
              className="bg-white/50 border border-card-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-white/80 transition-all"
            >
              Copy to Clipboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
