'use client';
import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodeGenerator() {
  const [value, setValue] = useState('https://eloxon.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">QR Code Generator</h1>
      <p className="text-foreground/70">Generate, customize, and download QR codes instantly.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Text or URL</label>
            <textarea 
              className="w-full h-32 p-3 rounded-lg border border-card-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter text or URL here..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Size (px): {size}</label>
            <input 
              type="range" min="128" max="512" step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="accent-primary"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-medium text-sm">Foreground Color</label>
              <input 
                type="color" 
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-10 cursor-pointer rounded bg-transparent border-0"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-medium text-sm">Background Color</label>
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 cursor-pointer rounded bg-transparent border-0"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 glass-panel p-6">
          <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border border-card-border flex items-center justify-center min-h-[300px] w-full">
            {value ? (
              <QRCodeCanvas 
                value={value} 
                size={size} 
                bgColor={bgColor} 
                fgColor={fgColor} 
                level="H"
                includeMargin={true}
              />
            ) : (
              <p className="text-foreground/50">Enter text to generate</p>
            )}
          </div>
          <button 
            onClick={downloadQR}
            disabled={!value}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
