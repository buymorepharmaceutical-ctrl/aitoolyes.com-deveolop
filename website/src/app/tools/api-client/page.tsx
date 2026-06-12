'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { Send, Globe, Plus, Trash2, Code2, Copy, Check, Clock, Terminal } from 'lucide-react';

interface Header {
  key: string;
  value: string;
}

export default function ApiClient() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Accept', value: 'application/json' }]);
  const [body, setBody] = useState('{\n  "key": "value"\n}');
  const [response, setResponse] = useState<{ status: number; time: number; data: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'graphql' | 'history'>('headers');
  const [graphqlQuery, setGraphqlQuery] = useState('query {\n  \n}');
  const [history, setHistory] = useState<{method: string, url: string, time: number}[]>([]);
  const [curlCopied, setCurlCopied] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('api-client-url');
    if (savedUrl) setUrl(savedUrl);
    const savedHistory = localStorage.getItem('api-client-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    localStorage.setItem('api-client-url', e.target.value);
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = val;
    setHeaders(newHeaders);
  };
  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const fetchHeaders: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          fetchHeaders[h.key.trim()] = h.value.trim();
        }
      });

      const options: RequestInit = {
        method,
        headers: fetchHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (activeTab === 'graphql') {
          options.body = JSON.stringify({ query: graphqlQuery });
          fetchHeaders['Content-Type'] = 'application/json';
        } else {
          options.body = body;
          if (!fetchHeaders['Content-Type']) {
            fetchHeaders['Content-Type'] = 'application/json';
          }
        }
      }

      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type');
      let dataStr = '';
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        dataStr = JSON.stringify(json, null, 2);
      } else {
        dataStr = await res.text();
      }

      const endTime = performance.now();
      const rTime = Math.round(endTime - startTime);
      setResponse({
        status: res.status,
        time: rTime,
        data: dataStr
      });
      
      const newHistory = [{method, url, time: rTime}, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('api-client-history', JSON.stringify(newHistory));
    } catch (err) {
      setResponse({
        status: 0,
        time: Math.round(performance.now() - startTime),
        data: JSON.stringify({ error: err instanceof Error ? err.message : 'Network request failed. CORS issue?' }, null, 2)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (response?.data) {
      await navigator.clipboard.writeText(response.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateCurl = async () => {
    let curl = `curl -X ${method} '${url}' \\\n`;
    headers.forEach(h => {
      if (h.key.trim() && h.value.trim()) {
        curl += `  -H '${h.key.trim()}: ${h.value.trim()}' \\\n`;
      }
    });
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (activeTab === 'graphql') {
        curl += `  -H 'Content-Type: application/json' \\\n`;
        curl += `  -d '${JSON.stringify({query: graphqlQuery})}'`;
      } else {
        curl += `  -d '${body.replace(/'/g, "'\\''")}'`;
      }
    }
    curl = curl.replace(/ \\\n$/, '');
    await navigator.clipboard.writeText(curl);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] h-full gap-4 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Globe className="w-8 h-8 text-primary" />
          API Request Client
        </h1>
        <p className="text-foreground/70 mt-1">Test REST APIs directly from your browser. Great for debugging endpoints.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 mt-4">
        
        {/* Left Side: Request Setup */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 p-2 bg-white/40 backdrop-blur-md rounded-2xl border border-card-border shadow-sm">
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="px-4 py-3 bg-white border border-card-border rounded-xl font-bold focus:outline-none text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input 
              type="text" 
              value={url}
              onChange={handleUrlChange}
              placeholder="https://api.example.com/v1/users"
              className="flex-1 px-4 py-3 bg-white border border-card-border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
            <button 
              onClick={generateCurl}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all border border-gray-300"
              title="Copy cURL Command"
            >
              {curlCopied ? <Check className="w-4 h-4 text-green-600" /> : <Terminal className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1 flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
            <div className="bg-white/60 border-b border-card-border px-2 py-2 flex gap-2">
              <button 
                onClick={() => setActiveTab('headers')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors \${activeTab === 'headers' ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-white/50'}`}
              >
                Headers ({headers.length})
              </button>
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <button 
                  onClick={() => setActiveTab('body')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors \${activeTab === 'body' ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-white/50'}`}
                >
                  Body (JSON)
                </button>
              )}
              {['POST'].includes(method) && (
                <button 
                  onClick={() => setActiveTab('graphql')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'graphql' ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-white/50'}`}
                >
                  GraphQL
                </button>
              )}
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-auto ${activeTab === 'history' ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-white/50'}`}
              >
                History
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {activeTab === 'headers' && (
                <div className="p-4 flex flex-col gap-3">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text" 
                        value={h.key} 
                        onChange={(e) => updateHeader(i, 'key', e.target.value)} 
                        placeholder="Key" 
                        className="flex-1 px-3 py-2 bg-white/60 border border-card-border rounded-lg text-sm font-mono focus:outline-none" 
                      />
                      <input 
                        type="text" 
                        value={h.value} 
                        onChange={(e) => updateHeader(i, 'value', e.target.value)} 
                        placeholder="Value" 
                        className="flex-[2] px-3 py-2 bg-white/60 border border-card-border rounded-lg text-sm font-mono focus:outline-none" 
                      />
                      <button 
                        onClick={() => removeHeader(i)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addHeader}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary mt-2 hover:bg-primary/5 w-fit px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Header
                  </button>
                </div>
              )}
              {activeTab === 'body' && ['POST', 'PUT', 'PATCH'].includes(method) && (
                <div className="h-full">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={body}
                    onChange={(val) => setBody(val || '')}
                    theme="vs-light"
                    options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', padding: { top: 16 } }}
                  />
                </div>
              )}
              {activeTab === 'graphql' && ['POST'].includes(method) && (
                <div className="h-full">
                  <Editor
                    height="100%"
                    defaultLanguage="graphql"
                    value={graphqlQuery}
                    onChange={(val) => setGraphqlQuery(val || '')}
                    theme="vs-light"
                    options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', padding: { top: 16 } }}
                  />
                </div>
              )}
              {activeTab === 'history' && (
                <div className="p-4 flex flex-col gap-2">
                  {history.length === 0 ? (
                    <div className="text-sm text-foreground/50 text-center py-8">No request history yet.</div>
                  ) : (
                    history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/60 border border-card-border rounded-xl text-sm">
                        <div className="flex items-center gap-3 truncate">
                          <span className="font-bold text-xs bg-gray-200 px-2 py-1 rounded">{h.method}</span>
                          <span className="font-mono truncate">{h.url}</span>
                        </div>
                        <span className="text-foreground/50 font-mono text-xs">{h.time}ms</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Response Viewer */}
        <div className="flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
          <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-green-600" />
              Response Data
            </h2>
            <div className="flex items-center gap-4">
              {response && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={`px-2 py-1 rounded font-bold \${response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Status: {response.status}
                  </span>
                  <span className="text-foreground/70">Time: <span className="font-bold">{response.time}ms</span></span>
                </div>
              )}
              <button 
                onClick={handleCopy}
                disabled={!response?.data}
                className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-semibold disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Data'}
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            {!response && !loading && (
              <div className="absolute inset-0 flex items-center justify-center text-foreground/40 text-sm font-medium">
                Send a request to see the response here.
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {response && (
              <Editor
                height="100%"
                defaultLanguage="json"
                value={response.data}
                theme="vs-light"
                options={{ minimap: { enabled: false }, readOnly: true, fontSize: 13, wordWrap: 'on', padding: { top: 16 } }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
