/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Download, Settings2, FileUp, MoveHorizontal } from 'lucide-react';

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [compressedSrc, setCompressedSrc] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState('image/webp');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setOriginalSrc(src);
      compressImage(src, quality, format);
      setSliderPos(50);
    };
    reader.readAsDataURL(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
  };

  const compressImage = (src: string, q: number, type: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL(type, q);
      setCompressedSrc(dataUrl);
      
      const base64str = dataUrl.split(',')[1];
      const decoded = atob(base64str);
      setCompressedSize(decoded.length);
    };
    img.src = src;
  };

  useEffect(() => {
    if (originalSrc) compressImage(originalSrc, quality, format);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, format]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Slider Mouse/Touch Events
  const handleMove = (clientX: number) => {
    if (!isDraggingSlider || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onUp = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingSlider]);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-primary" />
            Image Compressor
          </h1>
          <p className="text-foreground/70 mt-1">Enterprise-grade visual compression to reduce image file sizes without losing noticeable quality.</p>
        </div>
        
        {originalSrc && compressedSrc && (
          <a 
            href={compressedSrc} 
            download={`compressed_\${originalFile?.name.split('.')[0]}.\${format.split('/')[1]}`}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all"
          >
            <Download className="w-4 h-4" />
            Download Compressed
          </a>
        )}
      </div>

      {!originalSrc ? (
        // Upload State
        <div 
          className={`flex flex-col items-center justify-center gap-4 p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer min-h-[400px] \${isDraggingFile ? 'border-primary bg-primary/5' : 'border-card-border bg-white/40 hover:bg-white/60'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <FileUp className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Drag & Drop an image here</h3>
          <p className="text-foreground/60 text-center max-w-sm">Supports JPEG, PNG, WEBP. Files are processed locally in your browser.</p>
          <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={onFileInput} />
          <button className="mt-4 px-6 py-2.5 bg-white text-foreground font-semibold rounded-lg shadow-sm border border-card-border hover:bg-gray-50">
            Browse Files
          </button>
        </div>
      ) : (
        // Editor State
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-card-border shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-card-border pb-4">
                <Settings2 className="w-5 h-5 text-primary" />
                <h2 className="font-bold">Settings</h2>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-2 flex justify-between">
                  <span>Quality</span>
                  <span className="text-primary">{Math.round(quality * 100)}%</span>
                </label>
                <input 
                  type="range" min="0.1" max="1" step="0.05" 
                  value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Output Format</label>
                <select 
                  value={format} onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-card-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="image/webp">WebP (Recommended)</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>

              <button 
                onClick={() => setOriginalSrc(null)}
                className="w-full py-2 border border-card-border rounded-lg font-medium hover:bg-white/50 text-sm mt-4"
              >
                Upload New Image
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-card-border shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground/70">Original Size</span>
                <span className="font-mono font-semibold">{originalFile ? formatBytes(originalFile.size) : '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary">New Size</span>
                <span className="font-mono font-bold text-primary">{formatBytes(compressedSize)}</span>
              </div>
              <div className="h-px w-full bg-card-border"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Reduction</span>
                <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded text-sm">
                  {originalFile ? `-\${Math.round((1 - compressedSize / originalFile.size) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Slider */}
          <div className="lg:col-span-3 flex flex-col border border-card-border rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md shadow-sm h-[600px] relative">
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Original
            </div>
            <div className="absolute top-4 right-4 z-20 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Compressed
            </div>

            <div 
              ref={sliderContainerRef}
              className="relative w-full h-full cursor-col-resize select-none overflow-hidden"
              onMouseDown={(e) => { setIsDraggingSlider(true); handleMove(e.clientX); }}
              onTouchStart={(e) => { setIsDraggingSlider(true); handleMove(e.touches[0].clientX); }}
            >
              {/* Background: Compressed Image */}
              {compressedSrc && (
                <img 
                  src={compressedSrc} 
                  alt="Compressed" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}
              
              {/* Foreground: Original Image (Clipped) */}
              {originalSrc && (
                <div 
                  className="absolute inset-0 w-full h-full"
                  style={{ clipPath: `inset(0 \${100 - sliderPos}% 0 0)` }}
                >
                  <img 
                    src={originalSrc} 
                    alt="Original" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center group"
                style={{ left: `\${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MoveHorizontal className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
