'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { Camera, Download, RefreshCw, FileText, Upload, Sparkles, Scissors, Check, Crop, RotateCw, Trash2, Plus, Image as ImageIcon, Zap, ZapOff, Grid, ChevronLeft } from 'lucide-react';
import Script from 'next/script';

declare let cv: any;

type Point = { x: number, y: number };

interface ScannedPage {
  id: string;
  originalImage: string; // The flattened perspective crop
  filteredImage: string; // The filtered version (or original if no filter)
  filter: 'original' | 'grayscale' | 'bw' | 'magic';
  rotation: number; // 0, 90, 180, 270
}

export default function CamScanner() {
  const webcamRef = useRef<Webcam>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cvReady, setCvReady] = useState(false);
  
  // App State
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [mode, setMode] = useState<'camera' | 'crop' | 'gallery' | 'edit'>('camera');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  // Temporary Crop State
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [corners, setCorners] = useState<Point[]>([
    { x: 50, y: 50 }, { x: 250, y: 50 }, { x: 250, y: 350 }, { x: 50, y: 350 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [isComputingCrop, setIsComputingCrop] = useState(false);
  
  // Edit State
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  
  // Hardware State
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Check for torch support when webcam mounts
  const handleUserMedia = useCallback((mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if ((capabilities as any).torch) {
      setHasTorch(true);
    }
  }, []);

  const toggleTorch = async () => {
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchEnabled } as any]
          });
          setTorchEnabled(!torchEnabled);
        } catch (e) {
          console.error("Failed to toggle torch", e);
        }
      }
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const src = webcamRef.current.getScreenshot();
      if (src) {
        setPendingImageSrc(src);
        initCrop(src);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPendingImageSrc(event.target.result);
          initCrop(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const initCrop = (src: string) => {
    setMode('crop');
    setIsComputingCrop(true);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      let defaultCorners = [
        { x: img.width * 0.1, y: img.height * 0.1 },
        { x: img.width * 0.9, y: img.height * 0.1 },
        { x: img.width * 0.9, y: img.height * 0.9 },
        { x: img.width * 0.1, y: img.height * 0.9 }
      ];

      setTimeout(() => {
        if (cvReady && typeof cv !== 'undefined') {
          try {
            const mat = cv.imread(img);
            const ratio = img.height / 500.0;
            const downscaled = new cv.Mat();
            cv.resize(mat, downscaled, new cv.Size(Math.round(img.width / ratio), 500));

            const gray = new cv.Mat();
            cv.cvtColor(downscaled, gray, cv.COLOR_RGBA2GRAY, 0);
            
            cv.medianBlur(gray, gray, 5);
            cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
            
            const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
            cv.morphologyEx(gray, gray, cv.MORPH_CLOSE, kernel);
            
            cv.Canny(gray, gray, 50, 150);
            cv.dilate(gray, gray, kernel, new cv.Point(-1, -1), 1);

            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(gray, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

            let maxArea = 0;
            let bestApprox = new cv.Mat();

            for (let i = 0; i < contours.size(); ++i) {
              const cnt = contours.get(i);
              const area = cv.contourArea(cnt);
              if (area > 1000) {
                const peri = cv.arcLength(cnt, true);
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
                
                if (approx.rows === 4 && area > maxArea) {
                  maxArea = area;
                  approx.copyTo(bestApprox);
                }
                approx.delete();
              }
              cnt.delete();
            }

            if (maxArea > 0 && bestApprox.rows === 4) {
              const pts = [];
              for (let i = 0; i < 4; i++) {
                pts.push({ 
                  x: bestApprox.data32S[i * 2] * ratio, 
                  y: bestApprox.data32S[i * 2 + 1] * ratio 
                });
              }
              pts.sort((a, b) => a.y - b.y);
              const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
              const bottom = pts.slice(2, 4).sort((a, b) => b.x - a.x);
              defaultCorners = [top[0], top[1], bottom[0], bottom[1]];
            }

            mat.delete(); downscaled.delete(); gray.delete(); 
            kernel.delete(); contours.delete(); hierarchy.delete(); bestApprox.delete();
          } catch (e) {
            console.error("OpenCV Auto Crop Failed", e);
          }
        }
        setCorners(defaultCorners);
        setIsComputingCrop(false);
        drawCropUi(img, defaultCorners);
      }, 300);
    };
  };

  const drawCropUi = (img: HTMLImageElement, pts: Point[]) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0ea5e9';
    ctx.stroke();

    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 40, 0, 2 * Math.PI); // Larger touch target
      ctx.fillStyle = draggingPoint === i ? '#ffffff' : '#0ea5e9';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (mode === 'crop' && pendingImageSrc) {
      const img = new Image();
      img.src = pendingImageSrc;
      img.onload = () => drawCropUi(img, corners);
    }
  }, [corners, draggingPoint, mode, pendingImageSrc]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'crop') return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.PointerEvent).clientX;
      clientY = (e as React.PointerEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const hitIndex = corners.findIndex(p => Math.hypot(p.x - x, p.y - y) < 80);
    if (hitIndex !== -1) setDraggingPoint(hitIndex);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (draggingPoint === null || mode !== 'crop') return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;

    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.PointerEvent).clientX;
      clientY = (e as React.PointerEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY));

    const newCorners = [...corners];
    newCorners[draggingPoint] = { x, y };
    setCorners(newCorners);
  };

  const handlePointerUp = () => setDraggingPoint(null);

  const applyPerspectiveCrop = () => {
    if (!cvReady || typeof cv === 'undefined' || !pendingImageSrc) return;
    
    try {
      const img = new Image();
      img.src = pendingImageSrc;
      img.onload = () => {
        const mat = cv.imread(img);
        const widthA = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
        const widthB = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
        const maxWidth = Math.max(widthA, widthB);

        const heightA = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
        const heightB = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
        const maxHeight = Math.max(heightA, heightB);

        const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
          corners[0].x, corners[0].y,
          corners[1].x, corners[1].y,
          corners[2].x, corners[2].y,
          corners[3].x, corners[3].y
        ]);

        const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,
          maxWidth - 1, 0,
          maxWidth - 1, maxHeight - 1,
          0, maxHeight - 1
        ]);

        const M = cv.getPerspectiveTransform(srcCoords, dstCoords);
        const dst = new cv.Mat();
        const dsize = new cv.Size(maxWidth, maxHeight);
        cv.warpPerspective(mat, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        const canvas = document.createElement('canvas');
        cv.imshow(canvas, dst);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        const newPage: ScannedPage = {
          id: Date.now().toString(),
          originalImage: dataUrl,
          filteredImage: dataUrl,
          filter: 'original',
          rotation: 0
        };

        setPages([...pages, newPage]);
        setPendingImageSrc(null);
        setMode('gallery');

        mat.delete(); srcCoords.delete(); dstCoords.delete(); M.delete(); dst.delete();
      };
    } catch (e) {
      console.error("Perspective Transform Error", e);
      alert("Failed to crop. Please try again.");
    }
  };

  const applyFilterToPage = async (pageId: string, filterType: 'original' | 'grayscale' | 'bw' | 'magic') => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    setIsProcessing(true);
    const page = pages[pageIndex];
    
    if (filterType === 'original') {
      const updatedPages = [...pages];
      updatedPages[pageIndex] = { ...page, filter: filterType, filteredImage: page.originalImage };
      setPages(updatedPages);
      setIsProcessing(false);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const avg = (r + g + b) / 3;
        
        if (filterType === 'bw') {
          const threshold = 128;
          const v = avg > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = v;
        } else if (filterType === 'grayscale') {
          data[i] = data[i + 1] = data[i + 2] = avg;
        } else if (filterType === 'magic') {
          // Magic Color: Boost contrast and saturation
          const factor = 259 * (50 + 255) / (255 * (259 - 50));
          data[i] = factor * (r - 128) + 128;
          data[i + 1] = factor * (g - 128) + 128;
          data[i + 2] = factor * (b - 128) + 128;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      
      const updatedPages = [...pages];
      updatedPages[pageIndex] = { 
        ...page, 
        filter: filterType, 
        filteredImage: canvas.toDataURL('image/jpeg', 0.9) 
      };
      setPages(updatedPages);
      setIsProcessing(false);
    };
    img.src = page.originalImage;
  };

  const rotatePage = (pageId: string) => {
    setPages(pages.map(p => {
      if (p.id === pageId) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  };

  const deletePage = (pageId: string) => {
    setPages(pages.filter(p => p.id !== pageId));
    if (activePageId === pageId) {
      setMode('gallery');
      setActivePageId(null);
    }
  };

  const extractTextFromPage = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    
    setIsOcrProcessing(true);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const { data: { text } } = await Tesseract.recognize(
        page.filteredImage,
        'eng',
        { logger: m => console.log(m) }
      );
      setOcrText(text || "No text could be extracted.");
    } catch (e) {
      console.error(e);
      setOcrText("Failed to extract text. Please try again.");
    }
    setIsOcrProcessing(false);
  };

  const exportPdf = () => {
    if (pages.length === 0) return;
    
    const pdf = new jsPDF();
    
    // Process pages sequentially
    let processedCount = 0;
    
    pages.forEach((page, index) => {
      const img = new Image();
      img.onload = () => {
        // Apply rotation to canvas before adding to PDF
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (page.rotation === 90 || page.rotation === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(page.rotation * Math.PI / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
        }
        
        const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        if (index > 0) pdf.addPage();
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const w = canvas.width * ratio;
        const h = canvas.height * ratio;
        const x = (pdfWidth - w) / 2;
        const y = (pdfHeight - h) / 2;
        
        pdf.addImage(rotatedDataUrl, 'JPEG', x, y, w, h);
        
        processedCount++;
        if (processedCount === pages.length) {
          pdf.save('AI-Batch-Scanned-Document.pdf');
        }
      };
      img.src = page.filteredImage;
    });
  };

  const activePage = pages.find(p => p.id === activePageId);

  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] h-full flex flex-col gap-6 p-4 lg:p-8 max-w-5xl mx-auto">
      <Script 
        src="https://docs.opencv.org/4.8.0/opencv.js" 
        strategy="lazyOnload" 
        onLoad={() => setCvReady(true)}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-8 h-8 text-primary" />
            PDF Scanner Pro
          </h1>
          <p className="text-foreground/70 mt-1">Batch scanning, page management, and advanced AI enhancement.</p>
        </div>
        {pages.length > 0 && mode !== 'gallery' && (
          <button onClick={() => setMode('gallery')} className="btn btn-outline flex items-center gap-2">
            <Grid className="w-4 h-4" /> Gallery ({pages.length})
          </button>
        )}
      </div>

      {!cvReady && (
        <div className="text-yellow-600 bg-yellow-100 p-2 rounded text-sm">
          Loading AI Vision Engine (OpenCV)... Please wait.
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm overflow-hidden p-4 relative min-h-[500px]">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {mode === 'camera' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white/50 w-full relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={1}
                forceScreenshotSourceSize={true}
                videoConstraints={{
                  facingMode: "environment",
                  width: { ideal: 4096 },
                  height: { ideal: 2160 }
                }}
                onUserMedia={handleUserMedia}
                className="w-full h-full object-cover max-h-[60vh]"
                mirrored={false}
              />
              <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg pointer-events-none opacity-50"></div>
              
              {hasTorch && (
                <button 
                  onClick={toggleTorch}
                  className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70"
                >
                  {torchEnabled ? <Zap className="w-6 h-6 text-yellow-400" /> : <ZapOff className="w-6 h-6" />}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload
              </button>
              <button onClick={capture} className="btn btn-primary flex items-center gap-2">
                <Camera className="w-4 h-4" /> Capture Page {pages.length + 1}
              </button>
            </div>
          </div>
        )}

        {mode === 'crop' && (
          <div className="w-full h-full flex flex-col items-center gap-4">
            {isComputingCrop ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                <h3 className="text-xl font-bold text-foreground">AI Computing Crop...</h3>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/70 text-center font-medium">Drag corners to align document boundaries.</p>
                <div className="relative border-2 border-primary/20 rounded-xl overflow-hidden touch-none flex justify-center bg-black/5 w-full">
                  <canvas 
                    ref={cropCanvasRef}
                    className="max-w-full h-auto cursor-crosshair touch-none"
                    style={{ maxHeight: '60vh' }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setMode('camera')} className="btn btn-outline flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Retake
                  </button>
                  <button onClick={applyPerspectiveCrop} disabled={!cvReady} className="btn btn-primary flex items-center gap-2">
                    <Crop className="w-4 h-4" /> Confirm & Add Page
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {mode === 'gallery' && (
          <div className="w-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Scanned Pages ({pages.length})</h2>
              <button onClick={exportPdf} disabled={pages.length === 0} className="btn btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" /> Save as PDF
              </button>
            </div>
            
            {pages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-primary/20 rounded-xl">
                <ImageIcon className="w-16 h-16 text-primary/30 mb-4" />
                <p className="text-lg font-medium text-foreground">No pages scanned yet.</p>
                <button onClick={() => setMode('camera')} className="mt-4 btn btn-primary flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Start Scanning
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pages.map((page, index) => (
                  <div key={page.id} className="relative group rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-md bg-white">
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={page.filteredImage} 
                        alt={`Page ${index + 1}`} 
                        className="max-w-full max-h-full object-contain"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button onClick={() => { setActivePageId(page.id); setMode('edit'); }} className="btn btn-primary btn-sm w-3/4">
                        Edit
                      </button>
                      <button onClick={() => deletePage(page.id)} className="btn btn-destructive btn-sm w-3/4 flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setMode('camera')}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-primary transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <span className="font-medium">Add Page</span>
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'edit' && activePage && (
          <div className="w-full flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <button onClick={() => setMode('gallery')} className="btn btn-outline self-start flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back to Gallery
              </button>
              
              <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-white w-full flex justify-center bg-gray-100 p-2 min-h-[400px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activePage.filteredImage} 
                  className="w-full max-w-md h-auto object-contain transition-transform" 
                  style={{ transform: `rotate(${activePage.rotation}deg)` }}
                  alt="Edit Page" 
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => rotatePage(activePage.id)} className="btn btn-outline flex items-center gap-2">
                  <RotateCw className="w-4 h-4" /> Rotate
                </button>
                <button onClick={() => deletePage(activePage.id)} className="btn btn-outline text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {(['original', 'magic', 'grayscale', 'bw'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => applyFilterToPage(activePage.id, t)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activePage.filter === t ? 'bg-primary text-white shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {t === 'original' ? 'Original' : t === 'magic' ? 'Magic Color' : t === 'grayscale' ? 'Grayscale' : 'B&W'}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                <button onClick={() => extractTextFromPage(activePage.id)} disabled={isOcrProcessing} className="btn btn-secondary flex-1 max-w-md">
                  {isOcrProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Extract OCR
                </button>
              </div>
            </div>

            {ocrText && (
              <div className="w-full lg:w-96 flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Extracted Text</h3>
                <textarea 
                  className="w-full flex-1 min-h-[300px] p-3 rounded-xl border border-input bg-background/50 text-sm"
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
