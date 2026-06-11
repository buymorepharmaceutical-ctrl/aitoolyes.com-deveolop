'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { Code2, ArrowRight, Loader2, Copy, Check, Sparkles } from 'lucide-react';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL'
];

export default function CodeTranslator() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [sourceLang, setSourceLang] = useState('Python');
  const [targetLang, setTargetLang] = useState('JavaScript');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('code-translator-input');
    if (saved) setInputCode(saved);
  }, []);

  const handleTranslate = async () => {
    if (!inputCode.trim()) {
      setError('Please enter some code to translate.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputCode('');

    try {
      const prompt = `You are an expert programmer. Translate the following ${sourceLang} code into highly optimized and idiomatic ${targetLang} code. Return ONLY the translated code, without any markdown formatting or explanations.\n\nCode to translate:\n${inputCode}`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: 2000 })
      });

      if (!res.ok) throw new Error('Failed to translate code.');
      
      const data = await res.json();
      
      // Remove backticks if Gemma includes them
      let cleanedCode = data.response.replace(/^```[a-z]*\n/g, '').replace(/```$/g, '').trim();
      setOutputCode(cleanedCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputCode(outputCode);
    setOutputCode('');
  };

  // Convert language names to monaco-compatible names
  const getMonacoLang = (lang: string) => {
    const map: Record<string, string> = {
      'C++': 'cpp',
      'C#': 'csharp'
    };
    return map[lang] || lang.toLowerCase();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm flex justify-center items-center gap-3">
          <Code2 className="w-10 h-10 text-blue-600" />
          AI Code Translator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium">
          Instantly convert code between programming languages using Gemma 4.
        </p>
      </div>

      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Language</label>
            <select 
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-all"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          
          <button 
            onClick={swapLanguages}
            className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors mt-6"
            title="Swap Languages"
          >
            <ArrowRight className="w-5 h-5 hidden md:block" />
            <ArrowRight className="w-5 h-5 block md:hidden rotate-90" />
          </button>

          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Language</label>
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm transition-all"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
          {/* Input Editor */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/50 flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center font-medium text-sm text-gray-600">
              Input: {sourceLang}
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage={getMonacoLang(sourceLang)}
                language={getMonacoLang(sourceLang)}
                theme="vs-light"
                value={inputCode}
                onChange={(val) => {
                  setInputCode(val || '');
                  localStorage.setItem('code-translator-input', val || '');
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 }
                }}
              />
            </div>
          </div>

          {/* Output Editor */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/50 flex flex-col relative group">
            <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center font-medium text-sm text-gray-600">
              Output: {targetLang}
              <button
                onClick={handleCopy}
                disabled={!outputCode}
                className="text-gray-500 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage={getMonacoLang(targetLang)}
                language={getMonacoLang(targetLang)}
                theme="vs-light"
                value={outputCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 }
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                  <span className="text-indigo-900 font-medium">Translating Code...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputCode.trim()}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? 'Translating...' : `Translate to ${targetLang}`}
          </button>
        </div>
      </div>
    </div>
  );
}
