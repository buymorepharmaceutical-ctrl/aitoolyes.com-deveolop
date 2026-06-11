'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { ShieldCheck, ShieldAlert, Key, Clock, Copy, Check } from 'lucide-react';

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('jwt-decoder-input');
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(saved);
    }
  }, []);

  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setToken(e.target.value);
    localStorage.setItem('jwt-decoder-input', e.target.value);
  };

  const decoded = useMemo(() => {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format. Must contain 3 parts separated by dots.');
      
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];
      
      // Parse timestamps
      let expiresAt = null;
      let issuedAt = null;
      let isExpired = false;
      let timeRemaining = '';

      if (payload.exp) {
        expiresAt = new Date(payload.exp * 1000);
        isExpired = expiresAt < new Date();
        const diff = Math.abs(expiresAt.getTime() - new Date().getTime());
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        timeRemaining = isExpired 
          ? `Expired ${days}d ${hours}h ${minutes}m ago` 
          : `Expires in ${days}d ${hours}h ${minutes}m`;
      }

      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000);
      }

      return { header, payload, signature, valid: true, error: null, expiresAt, issuedAt, isExpired, timeRemaining };
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : 'Invalid Token' };
    }
  }, [token]);

  const copyText = async (text: string, type: 'header' | 'payload') => {
    await navigator.clipboard.writeText(text);
    if (type === 'header') {
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Key className="w-8 h-8 text-primary" />
          Advanced JWT Decoder
        </h1>
        <p className="text-foreground/70 mt-1">Decode, inspect, and analyze JSON Web Tokens securely in your browser.</p>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left Side: Input & Status */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col flex-1 border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
            <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm">Encoded JWT Token</h2>
            </div>
            <textarea 
              className="flex-1 w-full p-6 bg-transparent focus:outline-none font-mono text-sm resize-none break-all"
              value={token}
              onChange={handleTokenChange}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          {/* Validation Status Block */}
          {decoded?.valid ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 text-green-700 font-semibold mb-4">
                <ShieldCheck className="w-6 h-6" />
                Valid JWT Structure
              </div>
              
              <div className="space-y-3">
                {decoded.expiresAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-800/70 flex items-center gap-2"><Clock className="w-4 h-4"/> Expiration (exp)</span>
                    <span className={`font-mono font-bold \${decoded.isExpired ? 'text-red-600' : 'text-green-700'}`}>
                      {decoded.expiresAt.toLocaleString()} ({decoded.timeRemaining})
                    </span>
                  </div>
                )}
                {decoded.issuedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-800/70 flex items-center gap-2"><Clock className="w-4 h-4"/> Issued At (iat)</span>
                    <span className="font-mono text-green-700">{decoded.issuedAt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-800/70">Signature Validation</span>
                  <span className="text-green-800 font-mono text-xs max-w-[200px] truncate bg-green-100 px-2 py-1 rounded">
                    {decoded.signature}
                  </span>
                </div>
                <div className="mt-4 text-xs text-green-800/60 bg-green-100 p-2 rounded">
                  <strong>Note:</strong> Signature verification against a secret key must be done on your backend. We only decode the structure.
                </div>
              </div>
            </div>
          ) : decoded?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 text-red-600 font-semibold">
                <ShieldAlert className="w-6 h-6" />
                {decoded.error}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Side: Decoded output (Monaco Editors) */}
        <div className="flex flex-col gap-6">
          
          {/* Header Editor */}
          <div className="flex flex-col h-1/3 border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
            <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-pink-600">HEADER: Algorithm & Token Type</h2>
              <button 
                onClick={() => copyText(JSON.stringify(decoded?.header, null, 2), 'header')}
                className="text-xs flex items-center gap-1.5 hover:bg-black/5 px-2 py-1 rounded transition-colors"
                disabled={!decoded?.header}
              >
                {copiedHeader ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex-1 min-h-[100px]">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={decoded?.header ? JSON.stringify(decoded.header, null, 2) : ''}
                theme="vs-light"
                options={{ minimap: { enabled: false }, readOnly: true, wordWrap: 'on', padding: { top: 12 }, fontSize: 13 }}
              />
            </div>
          </div>
          
          {/* Payload Editor */}
          <div className="flex flex-col flex-1 border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm">
            <div className="bg-white/60 border-b border-card-border px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-blue-600">PAYLOAD: Data</h2>
              <button 
                onClick={() => copyText(JSON.stringify(decoded?.payload, null, 2), 'payload')}
                className="text-xs flex items-center gap-1.5 hover:bg-black/5 px-2 py-1 rounded transition-colors"
                disabled={!decoded?.payload}
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex-1 min-h-[200px]">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={decoded?.payload ? JSON.stringify(decoded.payload, null, 2) : ''}
                theme="vs-light"
                options={{ minimap: { enabled: false }, readOnly: true, wordWrap: 'on', padding: { top: 12 }, fontSize: 13 }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
