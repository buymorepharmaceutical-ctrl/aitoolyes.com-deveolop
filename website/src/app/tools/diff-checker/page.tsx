'use client';
import { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { FileDiff, SplitSquareHorizontal, FileCode2 } from 'lucide-react';

export default function DiffChecker() {
  const [original, setOriginal] = useState('// Original Code\\nfunction helloWorld() {\\n  console.log("Hello, World!");\\n  return true;\\n}');
  const [modified, setModified] = useState('// Modified Code\\nfunction helloWorld() {\\n  console.log("Hello, Enterprise!");\\n  const x = 42;\\n  return true;\\n}');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    const savedOrg = localStorage.getItem('diff-original');
    const savedMod = localStorage.getItem('diff-modified');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedOrg) setOriginal(savedOrg);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedMod) setModified(savedMod);
  }, []);

  const handleOriginalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginal(e.target.value);
    localStorage.setItem('diff-original', e.target.value);
  };

  const handleModifiedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setModified(e.target.value);
    localStorage.setItem('diff-modified', e.target.value);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileDiff className="w-8 h-8 text-primary" />
            Code Diff Checker
          </h1>
          <p className="text-foreground/70 mt-1">Compare two text files or code blocks side-by-side to easily spot differences.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 border border-card-border p-1.5 rounded-xl backdrop-blur-md">
          <div className="px-3 py-1.5 text-sm font-semibold flex items-center gap-2">
            <FileCode2 className="w-4 h-4" /> Language
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-card-border px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="javascript">JavaScript / TS</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="plaintext">Plain Text</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Hidden textareas for easy pasting when Monaco hasn't mounted or for manual input if preferred */}
        <div className="grid grid-cols-2 gap-4 h-32 shrink-0">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm flex items-center justify-between">
              <span className="text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded">Original (Deleted)</span>
            </label>
            <textarea 
              value={original}
              onChange={handleOriginalChange}
              className="flex-1 w-full bg-white/50 border border-card-border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 font-mono text-xs resize-none"
              placeholder="Paste original text here..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm flex items-center justify-between">
              <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">Modified (Added)</span>
            </label>
            <textarea 
              value={modified}
              onChange={handleModifiedChange}
              className="flex-1 w-full bg-white/50 border border-card-border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-xs resize-none"
              placeholder="Paste modified text here..."
            />
          </div>
        </div>

        {/* Monaco Diff Editor */}
        <div className="flex-1 border border-card-border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px]">
          <div className="bg-gray-50 border-b border-card-border px-4 py-2 flex items-center gap-2">
            <SplitSquareHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Visual Diff Output</span>
          </div>
          <div className="flex-1">
            <DiffEditor
              height="100%"
              language={language}
              original={original}
              modified={modified}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                readOnly: true,
                renderSideBySide: true,
                fontSize: 14,
                wordWrap: 'off',
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
