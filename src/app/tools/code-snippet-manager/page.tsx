'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { Code2, Plus, Trash2, Save, Search, Hash, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  lastModified: number;
}

export default function CodeSnippetManager() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Load snippets on mount
  useEffect(() => {
    let sId = localStorage.getItem('ai_session_id');
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem('ai_session_id', sId);
    }
    setSessionId(sId);
    
    const fetchSnippets = async () => {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('session_id', sId)
        .order('last_modified', { ascending: false });
        
      if (data && data.length > 0) {
        const formattedData = data.map(d => ({
          ...d,
          lastModified: new Date(d.last_modified).getTime()
        }));
        setSnippets(formattedData);
        setActiveId(formattedData[0].id);
      }
    };
    fetchSnippets();
  }, []);

  const activeSnippet = snippets.find(s => s.id === activeId);

  const createNewSnippet = async () => {
    const newId = crypto.randomUUID();
    const newSnippet: Snippet = {
      id: newId,
      title: 'Untitled Snippet',
      code: '// Type your code here...',
      language: 'javascript',
      tags: [],
      lastModified: Date.now()
    };
    
    setSnippets([newSnippet, ...snippets]);
    setActiveId(newId);
    
    await supabase.from('code_snippets').insert({
      id: newId,
      session_id: sessionId,
      title: newSnippet.title,
      code: newSnippet.code,
      language: newSnippet.language,
      tags: newSnippet.tags,
      last_modified: new Date(newSnippet.lastModified).toISOString()
    });
  };

  const updateActiveSnippet = async (updates: Partial<Snippet>) => {
    if (!activeId) return;
    
    const existingIndex = snippets.findIndex(s => s.id === activeId);
    if (existingIndex === -1) return;

    const updatedSnippet = { ...snippets[existingIndex], ...updates, lastModified: Date.now() };
    const newSnippets = [...snippets];
    newSnippets[existingIndex] = updatedSnippet;
    
    setSnippets(newSnippets);
    
    await supabase.from('code_snippets')
      .update({
        title: updatedSnippet.title,
        code: updatedSnippet.code,
        language: updatedSnippet.language,
        tags: updatedSnippet.tags,
        last_modified: new Date(updatedSnippet.lastModified).toISOString()
      })
      .eq('id', activeId);
  };

  const deleteSnippet = async (id: string) => {
    const newSnippets = snippets.filter(s => s.id !== id);
    setSnippets(newSnippets);
    if (activeId === id) {
      setActiveId(newSnippets.length > 0 ? newSnippets[0].id : null);
    }
    await supabase.from('code_snippets').delete().eq('id', id);
  };

  const handleCopy = async () => {
    if (!activeSnippet) return;
    await navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-4 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Code2 className="w-8 h-8 text-primary" />
          Code Snippet Manager
        </h1>
        <p className="text-foreground/70 mt-1">Save, organize, and quickly retrieve your most used code blocks.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 mt-4">
        
        {/* Left Sidebar: Snippet List */}
        <div className="lg:col-span-1 flex flex-col gap-4 border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm p-4 overflow-hidden">
          <button 
            onClick={createNewSnippet}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Snippet
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search by title or tag..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-card-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>

          <div className="flex-1 overflow-auto flex flex-col gap-2 pr-2">
            {filteredSnippets.length === 0 ? (
              <div className="text-center text-sm text-foreground/50 py-8">No snippets found.</div>
            ) : (
              filteredSnippets.map(snippet => (
                <div 
                  key={snippet.id}
                  onClick={() => setActiveId(snippet.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${activeId === snippet.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-card-border bg-white/60 hover:border-primary/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm truncate pr-2">{snippet.title}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSnippet(snippet.id); }}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{snippet.language}</span>
                    {snippet.tags.length > 0 && (
                      <span className="flex items-center gap-0.5 text-primary">
                        <Hash className="w-3 h-3" />
                        {snippet.tags[0]} {snippet.tags.length > 1 && `+${snippet.tags.length - 1}`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Editor */}
        <div className="lg:col-span-3 flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
          {!activeSnippet ? (
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/50">
              <Code2 className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a snippet from the sidebar or create a new one.</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="bg-white/60 border-b border-card-border px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <input 
                  type="text" 
                  value={activeSnippet.title}
                  onChange={(e) => updateActiveSnippet({ title: e.target.value })}
                  placeholder="Snippet Title"
                  className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 flex-1 truncate"
                />
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select 
                    value={activeSnippet.language}
                    onChange={(e) => updateActiveSnippet({ language: e.target.value })}
                    className="px-3 py-1.5 bg-white border border-card-border rounded-lg text-sm focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="json">JSON</option>
                    <option value="sql">SQL</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="csharp">C#</option>
                  </select>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-semibold text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Tags Input */}
              <div className="bg-white/40 border-b border-card-border px-6 py-2 flex items-center gap-2 overflow-x-auto">
                <Hash className="w-4 h-4 text-foreground/40 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Add tags separated by commas (e.g. react, hooks, fetch)..."
                  value={activeSnippet.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                    updateActiveSnippet({ tags });
                  }}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-foreground/80 font-medium min-w-[200px]"
                />
              </div>

              {/* Code Editor */}
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={activeSnippet.language}
                  value={activeSnippet.code}
                  onChange={(val) => updateActiveSnippet({ code: val || '' })}
                  theme="vs-light"
                  options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                />
              </div>
              <div className="bg-white/80 border-t border-card-border px-4 py-2 text-xs text-foreground/50 flex justify-between">
                <span>Changes saved locally automatically.</span>
                <span>Last updated: {new Date(activeSnippet.lastModified).toLocaleTimeString()}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
