'use client';
import { useState, useRef, useEffect } from 'react';
import { FileUp, Download, Copy, RefreshCw, FileText, Check } from 'lucide-react';

export default function Base64Encoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processText = (val: string) => {
    if (!val) {
      setOutput('');
      setError('');
      return;
    }
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        let cleanVal = val;
        if (val.includes('base64,')) {
          cleanVal = val.split('base64,')[1];
        }
        setOutput(decodeURIComponent(escape(atob(cleanVal))));
      }
      setError('');
    } catch {
      setError('Invalid input. Make sure it is valid Base64.');
      setOutput('');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('base64-input');
    const savedMode = localStorage.getItem('base64-mode') as 'encode' | 'decode';
    if (savedMode) setMode(savedMode);
    if (saved) setInput(saved);
  }, []);

  useEffect(() => {
    processText(input);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setFileName(null);
    setFileMime(null);
    localStorage.setItem('base64-input', val);
    processText(val);
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    localStorage.setItem('base64-mode', newMode);
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setFileMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setInput(result); // Data URL for encoding, raw text for decoding
      if (mode === 'encode') {
        // reader.readAsDataURL gives data:MIME;base64,...
        const b64 = result.split('base64,')[1];
        setOutput(b64);
      } else {
        processText(result);
      }
      setError('');
    };
    if (mode === 'encode') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadResult = () => {
    if (!output) return;
    
    if (mode === 'decode') {
      // Decode back to file if possible
      try {
        const isDataUrlPattern = input.startsWith('data:') && input.includes('base64,');
        let mime = fileMime || 'text/plain';
        let b64Data = input;

        if (isDataUrlPattern) {
          const parts = input.split(';');
          mime = parts[0].split(':')[1];
          b64Data = parts[1].split(',')[1];
        }

        const byteCharacters = atob(b64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName ? `decoded_\${fileName}` : `decoded_file.\${mime.split('/')[1] || 'txt'}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        // Fallback to text download
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded.txt';
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      // Downloading the Base64 text
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName ? `\${fileName}.b64.txt` : 'encoded_base64.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-8 h-8 text-primary" />
            Base64 Encoder / Decoder
          </h1>
          <p className="text-foreground/70 mt-1">Enterprise tool to encode files/text to Base64 or decode back to original format.</p>
        </div>
        
        <div className="flex gap-2 bg-white/40 p-1 rounded-xl border border-card-border backdrop-blur-md">
          <button 
            onClick={() => handleModeChange('encode')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all \${mode === 'encode' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/70 hover:bg-white/50'}`}
          >
            Encode
          </button>
          <button 
            onClick={() => handleModeChange('decode')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all \${mode === 'decode' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/70 hover:bg-white/50'}`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Area */}
        <div 
          className={`flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all \${isDragging ? 'border-primary bg-primary/5' : 'border-card-border bg-white/40 backdrop-blur-md'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex items-center justify-between">
            <label className="font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Input {mode === 'encode' ? 'Text or File' : 'Base64'}
            </label>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              <FileUp className="w-3.5 h-3.5" />
              Upload File
            </button>
          </div>
          
          <textarea 
            className="w-full h-[400px] p-4 rounded-xl bg-white/50 border border-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none break-all shadow-inner"
            value={input}
            onChange={handleInputChange}
            placeholder={mode === 'encode' ? 'Type text or drag & drop a file to encode...' : 'Paste Base64 string or drop a .txt file...'}
          />
          {fileName && (
            <div className="text-xs text-foreground/60 px-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Loaded file: <strong>{fileName}</strong>
            </div>
          )}
        </div>

        {/* Output Area */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl border border-card-border bg-white/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-green-600" />
              Output {mode === 'encode' ? 'Base64' : 'Text / File'}
            </label>
            <div className="flex items-center gap-2">
              <button 
                onClick={downloadResult}
                className="text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-black/5 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                disabled={!output}
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button 
                onClick={copyToClipboard}
                className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                disabled={!output}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          
          <textarea 
            className={`w-full h-[400px] p-4 rounded-xl bg-white/70 border focus:outline-none font-mono text-sm resize-none break-all shadow-inner \${error ? 'border-red-400 text-red-600 bg-red-50/50' : 'border-white'}`}
            value={error ? error : output}
            readOnly
            placeholder="Result will appear here..."
          />
        </div>

      </div>
    </div>
  );
}
