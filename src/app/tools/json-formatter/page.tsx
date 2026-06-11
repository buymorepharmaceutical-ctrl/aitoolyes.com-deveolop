'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { Copy, Trash2, FileJson, Check, ArrowRightLeft, Download } from 'lucide-react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [mode, setMode] = useState<'json' | 'typescript' | 'csharp' | 'python'>('json');

  const generateTypeScript = (obj: any, rootName = 'RootObject'): string => {
    if (typeof obj !== 'object' || obj === null) return `export type ${rootName} = ${typeof obj};`;
    if (Array.isArray(obj)) return `export type ${rootName} = any[];`;
    let interfaceStr = `export interface ${rootName} {\n`;
    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;
      if (value === null) type = 'any';
      else if (Array.isArray(value)) type = value.length > 0 ? `${typeof value[0]}[]` : 'any[]';
      else if (typeof value === 'object') type = 'Record<string, any>';
      interfaceStr += `  ${key}: ${type};\n`;
    }
    interfaceStr += `}`;
    return interfaceStr;
  };

  const generateCSharp = (obj: any, rootName = 'RootObject'): string => {
    if (typeof obj !== 'object' || obj === null) return `public class ${rootName} {}`;
    let classStr = `public class ${rootName}\n{\n`;
    for (const [key, value] of Object.entries(obj)) {
      let type = 'object';
      if (typeof value === 'string') type = 'string';
      else if (typeof value === 'number') type = Number.isInteger(value) ? 'int' : 'double';
      else if (typeof value === 'boolean') type = 'bool';
      else if (Array.isArray(value)) type = 'List<object>';
      const propName = key.charAt(0).toUpperCase() + key.slice(1);
      classStr += `    public ${type} ${propName} { get; set; }\n`;
    }
    classStr += `}`;
    return classStr;
  };

  const generatePython = (obj: any, rootName = 'RootObject'): string => {
    if (typeof obj !== 'object' || obj === null) return `from dataclasses import dataclass\n\n@dataclass\nclass ${rootName}:\n    pass`;
    let classStr = `from dataclasses import dataclass\nfrom typing import Any, List, Dict\n\n@dataclass\nclass ${rootName}:\n`;
    let hasProps = false;
    for (const [key, value] of Object.entries(obj)) {
      hasProps = true;
      let type = 'Any';
      if (typeof value === 'string') type = 'str';
      else if (typeof value === 'number') type = Number.isInteger(value) ? 'int' : 'float';
      else if (typeof value === 'boolean') type = 'bool';
      else if (Array.isArray(value)) type = 'List[Any]';
      else if (typeof value === 'object') type = 'Dict[str, Any]';
      // Python safe key
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      classStr += `    ${safeKey}: ${type}\n`;
    }
    if (!hasProps) classStr += `    pass\n`;
    return classStr;
  };

  // Load from local storage on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tryFormat = (val: string, currentMode = mode) => {
    if (!val.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(val);
      if (currentMode === 'json') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else if (currentMode === 'typescript') {
        setOutput(generateTypeScript(parsed));
      } else if (currentMode === 'csharp') {
        setOutput(generateCSharp(parsed));
      } else if (currentMode === 'python') {
        setOutput(generatePython(parsed));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const switchMode = (newMode: 'json' | 'typescript' | 'csharp' | 'python') => {
    setMode(newMode);
    tryFormat(input, newMode);
  };

  useEffect(() => {
    const saved = localStorage.getItem('json-formatter-input');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(saved);
      tryFormat(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleInputChange = (val: string | undefined) => {
    const newVal = val || '';
    setInput(newVal);
    localStorage.setItem('json-formatter-input', newVal);
    tryFormat(newVal);
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      localStorage.setItem('json-formatter-input', minified);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const handleCopy = async (text: string, isRaw: boolean) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    if (isRaw) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else {
      setCopiedFormatted(true);
      setTimeout(() => setCopiedFormatted(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    localStorage.removeItem('json-formatter-input');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-4 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileJson className="w-8 h-8 text-primary" />
            JSON Formatter & Validator
          </h1>
          <p className="text-foreground/70 mt-1">Enterprise-grade editor to format, validate, and minify JSON data.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMinify}
            className="flex items-center gap-2 bg-white/50 border border-card-border px-4 py-2 rounded-lg font-medium hover:bg-white/80 transition-all text-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Minify JSON
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 min-h-0">
        {/* Input Panel */}
        <div className="flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
          <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Raw Input</h2>
            <button 
              onClick={() => handleCopy(input, true)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors font-medium text-foreground/70 hover:text-foreground"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRaw ? 'Copied!' : 'Copy Raw'}
            </button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={input}
              onChange={handleInputChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                formatOnPaste: true,
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
          <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
            <div className="flex bg-black/5 rounded-lg p-1">
              <button onClick={() => switchMode('json')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'json' ? 'bg-white shadow-sm' : 'hover:bg-black/5 text-gray-500'}`}>JSON</button>
              <button onClick={() => switchMode('typescript')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'typescript' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-black/5 text-gray-500'}`}>TypeScript</button>
              <button onClick={() => switchMode('csharp')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'csharp' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-black/5 text-gray-500'}`}>C#</button>
              <button onClick={() => switchMode('python')} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'python' ? 'bg-yellow-500 text-white shadow-sm' : 'hover:bg-black/5 text-gray-500'}`}>Python</button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownload}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors font-medium text-foreground/70 hover:text-foreground"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button 
                onClick={() => handleCopy(output, false)}
                className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-semibold"
              >
                {copiedFormatted ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFormatted ? 'Copied!' : 'Copy Output'}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              defaultLanguage="json"
              language={mode === 'json' ? 'json' : mode === 'csharp' ? 'csharp' : mode}
              value={output}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly: true,
                wordWrap: 'on',
                padding: { top: 16 }
              }}
            />
            {error && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-red-100 text-red-500 font-medium text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  Waiting for valid JSON...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
