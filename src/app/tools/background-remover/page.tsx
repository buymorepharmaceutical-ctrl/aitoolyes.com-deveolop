'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import GoogleAdPlaceholder from '@/components/GoogleAdPlaceholder';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setResultImage(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      
      const blob = await removeBackground(originalImage, {
        progress: (key, current, total) => {
          console.log(`Downloading model: ${key} - ${current}/${total}`);
        }
      });
      
      const url = URL.createObjectURL(blob);
      setResultImage(url);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'An unexpected error occurred while processing the image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'background-removed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">AI Background Remover</h1>
      <p className="text-foreground/70">Instantly remove the background from any image using powerful local AI vision models.</p>
      
      <GoogleAdPlaceholder slot="bg-rem-top-4455" />

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Left Column: Upload and Original Image */}
        <div className="flex-1 flex flex-col gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-80 border-2 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors relative overflow-hidden bg-white/40"
          >
            {originalImage ? (
              <Image src={originalImage} alt="Original" fill className="object-contain p-4" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center px-4">
                <span className="text-5xl">📸</span>
                <p className="font-semibold text-lg text-foreground/80">Click to upload an image</p>
                <p className="text-sm text-foreground/50">PNG, JPG, JPEG up to 5MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
          </div>

          <button 
            onClick={handleRemoveBackground}
            disabled={loading || !originalImage}
            className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin text-xl">⚙️</span> Processing AI Vision...</>
            ) : (
              'Remove Background'
            )}
          </button>
          
          {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
        </div>

        {/* Right Column: Result Image */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full h-80 rounded-2xl border border-card-border bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2U1ZTVlNSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2U1ZTVlNSIvPgo8L3N2Zz4=')]">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-foreground/70">AI is magic working...</p>
              </div>
            ) : resultImage ? (
              <Image src={resultImage} alt="Result without background" fill className="object-contain p-4 drop-shadow-2xl" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center px-4 opacity-50">
                <span className="text-5xl">✨</span>
                <p className="font-semibold text-lg text-foreground/80">Result will appear here</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleDownload}
            disabled={!resultImage}
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-md flex justify-center items-center gap-2"
          >
            Download Transparent PNG
          </button>
        </div>
      </div>
      
      <GoogleAdPlaceholder slot="bg-rem-btm-6677" />
    </div>
  );
}
