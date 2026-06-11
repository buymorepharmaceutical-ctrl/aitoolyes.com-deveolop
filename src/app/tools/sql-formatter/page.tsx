'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { format as formatSql } from 'sql-formatter';
import { Database, FileCode2, Copy, Check, Trash2, ArrowRightLeft } from 'lucide-react';

export default function SqlFormatter() {
  const [input, setInput] = useState('SELECT * FROM users left join orders on users.id=orders.user_id WHERE status=\'active\' and age>18 ORDER BY created_at desc LIMIT 10;');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialect, setDialect] = useState('sql'); // default standard SQL
  
  // Format options state
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [indentWidth, setIndentWidth] = useState(2);

  const tryFormat = (val: string, currentDialect: string, kwCase: 'upper' | 'lower' | 'preserve', indent: number) => {
    if (!val.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      const formatted = formatSql(val, {
        language: currentDialect as any,
        keywordCase: kwCase,
        tabWidth: indent,
        linesBetweenQueries: 2,
      });
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid SQL syntax');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sql-formatter-input');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(saved);
      tryFormat(saved, dialect, keywordCase, indentWidth);
    } else {
      tryFormat(input, dialect, keywordCase, indentWidth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    tryFormat(input, dialect, keywordCase, indentWidth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialect, keywordCase, indentWidth]);

  const handleInputChange = (val: string | undefined) => {
    const newVal = val || '';
    setInput(newVal);
    localStorage.setItem('sql-formatter-input', newVal);
    tryFormat(newVal, dialect, keywordCase, indentWidth);
  };

  const minifySql = () => {
    if (!input.trim()) return;
    try {
      // Very basic minification: remove newlines and extra spaces, but formatSql can't natively minify.
      // We do a naive approach for SQL.
      const minified = input
        .replace(/\\n/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
      setInput(minified);
      localStorage.setItem('sql-formatter-input', minified);
      tryFormat(minified, dialect, keywordCase, indentWidth);
    } catch (e) {
      setError('Could not minify.');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    localStorage.removeItem('sql-formatter-input');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-8 h-8 text-primary" />
            SQL Query Formatter
          </h1>
          <p className="text-foreground/70 mt-1">Beautify and validate your SQL queries across multiple database dialects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={minifySql}
            className="flex items-center gap-2 bg-white/50 border border-card-border px-4 py-2 rounded-lg font-medium hover:bg-white/80 transition-all text-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Minify SQL
          </button>
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap gap-4 bg-white/40 border border-card-border p-4 rounded-2xl backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold flex items-center gap-2 text-foreground/70">
            <FileCode2 className="w-4 h-4" /> Dialect
          </label>
          <select 
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="bg-white border border-card-border px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none"
          >
            <option value="sql">Standard SQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="mariadb">MariaDB</option>
            <option value="sqlite">SQLite</option>
            <option value="plsql">PL/SQL</option>
            <option value="tsql">T-SQL</option>
          </select>
        </div>
        
        <div className="w-px h-8 bg-card-border hidden md:block"></div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground/70">Keyword Case</label>
          <select 
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as any)}
            className="bg-white border border-card-border px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none"
          >
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="preserve">Preserve</option>
          </select>
        </div>

        <div className="w-px h-8 bg-card-border hidden md:block"></div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-foreground/70">Indent</label>
          <select 
            value={indentWidth}
            onChange={(e) => setIndentWidth(Number(e.target.value))}
            className="bg-white border border-card-border px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2">
          <span className="font-bold">Parse Error:</span> {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Input Panel */}
        <div className="flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
          <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Raw SQL Input</h2>
          </div>
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={input}
              onChange={handleInputChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm relative">
          <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-primary">Formatted SQL Output</h2>
            <button 
              onClick={handleCopy}
              disabled={!output}
              className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-semibold disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Formatted'}
            </button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={output}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly: true,
                wordWrap: 'off',
                padding: { top: 16 }
              }}
            />
          </div>
          
          {error && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-red-100 text-red-500 font-medium text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Waiting for valid SQL...
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
