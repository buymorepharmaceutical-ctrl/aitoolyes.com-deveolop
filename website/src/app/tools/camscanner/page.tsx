'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { Camera, Image as ImageIcon, Download, RefreshCw, Wand2, FileText, Upload, Sparkles, Scissors } from 'lucide-react';
import Link from 'next/link';

export default function CamScanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'original' | 'grayscale' | 'bw'>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isBgRemoving, setIsBgRemoving] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc);
      setProcessedImage(imageSrc);
      setFilter('original');
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageSrc(event.target.result);
          setProcessedImage(event.target.result);
          setFilter('original');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImageSrc(null);
    setProcessedImage(null);
    setFilter('original');
    setOcrText(null);
  };

  const extractText = async () => {
    if (!processedImage) return;
    setIsOcrProcessing(true);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(processedImage, 'eng');
      setOcrText(result.data.text);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to extract text. Please try again.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const removeBackground = async () => {
    if (!processedImage) return;
    setIsBgRemoving(true);
    try {
      const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal');
      const blob = await imglyRemoveBackground(processedImage);
      setProcessedImage(URL.createObjectURL(blob));
    } catch (error) {
      console.error('BG Remove Error:', error);
      alert('Failed to remove background using ML model.');
    } finally {
      setIsBgRemoving(false);
    }
  };

  const applyFilter = (type: 'original' | 'grayscale' | 'bw') => {
    setFilter(type);
    if (!imageSrc || !canvasRef.current) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      
      if (type !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance
          const v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          
          if (type === 'grayscale') {
            data[i] = data[i+1] = data[i+2] = v;
          } else if (type === 'bw') {
            // High contrast thresholding for B&W document look
            const threshold = 128;
            const bw = v >= threshold ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = bw;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      
      setProcessedImage(canvas.toDataURL('image/jpeg', 0.9));
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  const downloadPDF = () => {
    if (!processedImage) return;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(processedImage);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(processedImage, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Eloxon-Scanned-Document.pdf');
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = 'Eloxon-Scan.jpg';
    a.click();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] h-full gap-6 p-4 lg:p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Camera className="w-8 h-8 text-primary" />
          Web Cam pdf Scanner
        </h1>
        <p className="text-foreground/70 mt-1">Scan or upload documents directly from your browser, apply B&W filters, and export as PDF.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm overflow-hidden p-4 relative min-h-[500px]">
        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {!imageSrc ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white/50 w-full relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full object-cover"
                mirrored={false}
              />
              <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg pointer-events-none opacity-50"></div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={capture}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl w-full sm:w-auto"
              >
                <Camera className="w-6 h-6" />
                Capture Document
              </button>
              <div className="text-foreground/50 font-medium">OR</div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl w-full sm:w-auto"
              >
                <Upload className="w-6 h-6" />
                Upload from Album
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col md:flex-row gap-8 items-start h-full">
            <div className="flex-1 flex flex-col items-center justify-center w-full bg-black/5 rounded-xl p-4 min-h-[400px]">
              {isProcessing ? (
                <div className="animate-pulse text-primary font-bold">Processing Image...</div>
              ) : (
                <img src={processedImage!} alt="Scanned Document" className="max-h-[60vh] object-contain shadow-2xl rounded" />
              )}
            </div>

            <div className="w-full md:w-80 flex flex-col gap-6 bg-white/80 p-6 rounded-2xl shadow-sm border border-card-border">
              <div>
                <h3 className="font-bold text-lg mb-3">1. Filters</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => applyFilter('original')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm text-left flex items-center gap-2 transition-colors ${filter === 'original' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100 border'}`}
                  >
                    <ImageIcon className="w-4 h-4" /> Original Color
                  </button>
                  <button 
                    onClick={() => applyFilter('grayscale')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm text-left flex items-center gap-2 transition-colors ${filter === 'grayscale' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100 border'}`}
                  >
                    <Wand2 className="w-4 h-4" /> Grayscale (Magic)
                  </button>
                  <button 
                    onClick={() => applyFilter('bw')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm text-left flex items-center gap-2 transition-colors ${filter === 'bw' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100 border'}`}
                  >
                    <FileText className="w-4 h-4" /> Black & White (Text)
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> AI Tools</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={extractText}
                    disabled={isOcrProcessing}
                    className="flex justify-center items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {isOcrProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {isOcrProcessing ? 'Extracting...' : 'AI Extract Text (OCR)'}
                  </button>
                  <button 
                    onClick={removeBackground}
                    disabled={isBgRemoving}
                    className="flex justify-center items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {isBgRemoving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                    {isBgRemoving ? 'Removing BG...' : 'AI Remove Background'}
                  </button>
                </div>
              </div>

              {ocrText && (
                <div className="bg-white/90 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-sm mb-2 text-gray-700 flex justify-between items-center">
                    Extracted Text:
                    <button onClick={() => navigator.clipboard.writeText(ocrText)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Copy</button>
                  </h4>
                  <p className="text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap">{ocrText}</p>
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg mb-3">2. Export</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={downloadPDF}
                    className="flex justify-center items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                  >
                    <Download className="w-5 h-5" /> Download PDF
                  </button>
                  <button 
                    onClick={downloadImage}
                    className="flex justify-center items-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download JPG
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t">
                <button 
                  onClick={retake}
                  className="flex justify-center items-center w-full gap-2 text-rose-500 font-bold hover:underline"
                >
                  <RefreshCw className="w-4 h-4" /> Retake Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
