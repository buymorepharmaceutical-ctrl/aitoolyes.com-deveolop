'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { Camera, Download, RefreshCw, FileText, Upload, Sparkles, Trash2, Plus, Image as ImageIcon, Zap, ZapOff, Grid, ChevronLeft, CheckCircle2, RotateCw } from 'lucide-react';
import Script from 'next/script';

declare let cv: any;

type Point = { x: number, y: number };

interface ScannedPage {
  id: string;
  originalImage: string; // The flattened perspective crop
  filteredImage: string; // The filtered version
  filter: 'original' | 'grayscale' | 'bw' | 'magic';
  rotation: number;
}

export default function CamScanner() {
  const webcamRef = useRef<Webcam>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cvReady, setCvReady] = useState(false);
  
  // App State
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [mode, setMode] = useState<'camera' | 'gallery' | 'edit'>('camera');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  // Flash effect state
  const [showFlash, setShowFlash] = useState(false);
  
  // Edit State
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  
  // Hardware State
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Auto-Capture Stabilization State
  const stabilityHistoryRef = useRef<Point[][]>([]);
  const isCapturingRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number>(0);

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

  // --- Real-time Auto-Capture Engine ---

  const processVideoFeed = useCallback(() => {
    if (!cvReady || typeof cv === 'undefined' || mode !== 'camera' || isCapturingRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
      return;
    }

    const video = webcamRef.current?.video;
    const overlay = overlayCanvasRef.current;
    const hidden = hiddenCanvasRef.current;

    if (!video || !overlay || !hidden || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
      return;
    }

    // Throttle to ~15 FPS to save battery
    const now = performance.now();
    if (now - lastProcessTimeRef.current < 66) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
      return;
    }
    lastProcessTimeRef.current = now;

    // Set canvas dimensions to match video internal resolution
    const width = video.videoWidth;
    const height = video.videoHeight;
    hidden.width = width;
    hidden.height = height;
    overlay.width = width;
    overlay.height = height;

    const ctx = hidden.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlay.getContext('2d');
    if (!ctx || !overlayCtx) return;

    ctx.drawImage(video, 0, 0, width, height);

    try {
      const mat = cv.imread(hidden);
      const ratio = height / 400.0; // aggressive downscale for real-time
      const downscaled = new cv.Mat();
      cv.resize(mat, downscaled, new cv.Size(Math.round(width / ratio), 400));

      const gray = new cv.Mat();
      cv.cvtColor(downscaled, gray, cv.COLOR_RGBA2GRAY, 0);
      cv.medianBlur(gray, gray, 5);
      cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
      
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.morphologyEx(gray, gray, cv.MORPH_CLOSE, kernel);
      
      cv.Canny(gray, gray, 40, 120);
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
          cv.approxPolyDP(cnt, approx, 0.03 * peri, true);
          
          if (approx.rows === 4 && area > maxArea) {
            maxArea = area;
            approx.copyTo(bestApprox);
          }
          approx.delete();
        }
        cnt.delete();
      }

      overlayCtx.clearRect(0, 0, width, height);

      if (maxArea > 0 && bestApprox.rows === 4) {
        const pts: Point[] = [];
        for (let i = 0; i < 4; i++) {
          pts.push({ 
            x: bestApprox.data32S[i * 2] * ratio, 
            y: bestApprox.data32S[i * 2 + 1] * ratio 
          });
        }
        
        // Sort points
        pts.sort((a, b) => a.y - b.y);
        const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
        const bottom = pts.slice(2, 4).sort((a, b) => b.x - a.x);
        const sortedPts = [top[0], top[1], bottom[1], bottom[0]]; // TL, TR, BR, BL

        // Draw animated polygon
        overlayCtx.beginPath();
        overlayCtx.moveTo(sortedPts[0].x, sortedPts[0].y);
        for (let i = 1; i < 4; i++) overlayCtx.lineTo(sortedPts[i].x, sortedPts[i].y);
        overlayCtx.closePath();
        
        // Evaluate stability for Auto-Capture
        const history = stabilityHistoryRef.current;
        history.push(sortedPts);
        if (history.length > 15) history.shift(); // Keep last 15 frames (~1 second)

        let isStable = false;
        if (history.length === 15) {
          let maxVariance = 0;
          for (let corner = 0; corner < 4; corner++) {
            const xs = history.map(h => h[corner].x);
            const ys = history.map(h => h[corner].y);
            const dx = Math.max(...xs) - Math.min(...xs);
            const dy = Math.max(...ys) - Math.min(...ys);
            maxVariance = Math.max(maxVariance, dx, dy);
          }
          
          // If points haven't moved more than 20px over the last 15 frames -> Stable
          if (maxVariance < 20) {
            isStable = true;
          }
        }

        if (isStable) {
          overlayCtx.fillStyle = 'rgba(34, 197, 94, 0.4)'; // Green when locked
          overlayCtx.strokeStyle = '#22c55e';
          
          // TRIGGER AUTO CAPTURE!
          if (!isCapturingRef.current) {
            isCapturingRef.current = true;
            triggerAutoCapture(hidden, sortedPts);
          }
        } else {
          overlayCtx.fillStyle = 'rgba(14, 165, 233, 0.3)'; // Blue when searching
          overlayCtx.strokeStyle = '#0ea5e9';
        }

        overlayCtx.fill();
        overlayCtx.lineWidth = 6;
        overlayCtx.stroke();

        // Draw corner dots
        sortedPts.forEach(p => {
          overlayCtx.beginPath();
          overlayCtx.arc(p.x, p.y, 15, 0, 2 * Math.PI);
          overlayCtx.fillStyle = '#ffffff';
          overlayCtx.fill();
        });
      } else {
        stabilityHistoryRef.current = []; // reset if lost
      }

      mat.delete(); downscaled.delete(); gray.delete(); 
      kernel.delete(); contours.delete(); hierarchy.delete(); bestApprox.delete();

    } catch (e) {
      console.error(e);
    }

    animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
  }, [cvReady, mode]);

  useEffect(() => {
    if (mode === 'camera' && cvReady) {
      isCapturingRef.current = false;
      stabilityHistoryRef.current = [];
      animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
    }
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [mode, cvReady, processVideoFeed]);

  const triggerAutoCapture = (sourceCanvas: HTMLCanvasElement, corners: Point[]) => {
    // 1. Show flash animation
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    // 2. Do perspective transform instantly
    try {
      const mat = cv.imread(sourceCanvas);
      
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

      // Apply Magic Filter (Adaptive Threshold) automatically to make text pop!
      const gray = new cv.Mat();
      cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
      const finalDest = new cv.Mat();
      // blockSize=25, C=15 gives excellent document binarization
      cv.adaptiveThreshold(gray, finalDest, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 25, 15);

      const resultCanvas = document.createElement('canvas');
      cv.imshow(resultCanvas, finalDest);
      const filteredDataUrl = resultCanvas.toDataURL('image/jpeg', 0.9);
      
      cv.imshow(resultCanvas, dst); // Get original color version too
      const originalDataUrl = resultCanvas.toDataURL('image/jpeg', 0.9);

      const newPage: ScannedPage = {
        id: Date.now().toString(),
        originalImage: originalDataUrl,
        filteredImage: filteredDataUrl,
        filter: 'magic', // default to magic OCR-ready filter
        rotation: 0
      };

      setPages(prev => [...prev, newPage]);
      
      mat.delete(); srcCoords.delete(); dstCoords.delete(); M.delete(); dst.delete(); gray.delete(); finalDest.delete();
      
      // Allow another capture after 1 second
      setTimeout(() => {
        isCapturingRef.current = false;
        stabilityHistoryRef.current = [];
      }, 1000);

    } catch (e) {
      console.error(e);
      isCapturingRef.current = false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          // Manual upload bypasses auto-crop for now
          const newPage: ScannedPage = {
            id: Date.now().toString(),
            originalImage: event.target.result,
            filteredImage: event.target.result,
            filter: 'original',
            rotation: 0
          };
          setPages([...pages, newPage]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilterToPage = async (pageId: string, filterType: 'original' | 'grayscale' | 'bw' | 'magic') => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    setIsProcessing(true);
    // Let UI render the processing state
    await new Promise(r => setTimeout(r, 50)); 
    
    const page = pages[pageIndex];
    
    if (filterType === 'original') {
      const updatedPages = [...pages];
      updatedPages[pageIndex] = { ...page, filter: filterType, filteredImage: page.originalImage };
      setPages(updatedPages);
      setIsProcessing(false);
      return;
    }

    try {
      const img = new Image();
      img.src = page.originalImage;
      await new Promise(r => img.onload = r);
      
      const mat = cv.imread(img);
      const dst = new cv.Mat();

      if (filterType === 'grayscale') {
        cv.cvtColor(mat, dst, cv.COLOR_RGBA2GRAY, 0);
      } else if (filterType === 'bw') {
        cv.cvtColor(mat, dst, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(dst, dst, 128, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
      } else if (filterType === 'magic') {
        cv.cvtColor(mat, dst, cv.COLOR_RGBA2GRAY, 0);
        cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 25, 15);
      }

      const canvas = document.createElement('canvas');
      cv.imshow(canvas, dst);
      const filteredImage = canvas.toDataURL('image/jpeg', 0.9);
      
      const updatedPages = [...pages];
      updatedPages[pageIndex] = { ...page, filter: filterType, filteredImage };
      setPages(updatedPages);
      
      mat.delete(); dst.delete();
    } catch(e) {
      console.error(e);
    }
    
    setIsProcessing(false);
  };

  const rotatePage = (pageId: string) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
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
      // Because we used Adaptive Thresholding for 'magic' filter, 
      // the image is purely crisp black and white, making Tesseract exceptionally accurate!
      const imgToRead = page.filter === 'magic' || page.filter === 'bw' ? page.filteredImage : page.originalImage;
      
      const { data: { text } } = await Tesseract.recognize(
        imgToRead,
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
    let processedCount = 0;
    
    pages.forEach((page, index) => {
      const img = new Image();
      img.onload = () => {
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
          pdf.save('AI-Auto-Scanned-Document.pdf');
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
      {/* Hidden canvas for OpenCV processing */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-8 h-8 text-primary" />
            Scanner AI - Auto Capture
          </h1>
          <p className="text-foreground/70 mt-1">Point your camera at a document. Hold steady to auto-capture.</p>
        </div>
        {pages.length > 0 && mode !== 'gallery' && (
          <button onClick={() => setMode('gallery')} className="btn btn-outline flex items-center gap-2 relative">
            <Grid className="w-4 h-4" /> Gallery
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {pages.length}
            </span>
          </button>
        )}
      </div>

      {!cvReady && (
        <div className="text-yellow-600 bg-yellow-100 p-2 rounded text-sm">
          Loading Local AI Vision Engine (OpenCV)... Please wait.
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm overflow-hidden p-4 relative min-h-[500px]">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {mode === 'camera' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="rounded-xl overflow-hidden shadow-xl border-4 border-white w-full relative bg-black">
              {/* White flash animation overlay */}
              <div 
                className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150 ${showFlash ? 'opacity-100' : 'opacity-0'}`} 
              />
              
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                forceScreenshotSourceSize={true}
                videoConstraints={{
                  facingMode: "environment",
                  width: { ideal: 4096 },
                  height: { ideal: 2160 }
                }}
                onUserMedia={handleUserMedia}
                className="w-full h-full object-cover max-h-[60vh] opacity-90"
                mirrored={false}
              />
              
              {/* Overlay canvas for the live blue tracking box */}
              <canvas 
                ref={overlayCanvasRef} 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              
              {/* Central scanning reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {hasTorch && (
                <button 
                  onClick={toggleTorch}
                  className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 z-10"
                >
                  {torchEnabled ? <Zap className="w-6 h-6 text-yellow-400" /> : <ZapOff className="w-6 h-6" />}
                </button>
              )}
            </div>
            
            <p className="text-sm text-foreground/70 text-center flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Auto-Capture is active. Hold steady over a document.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Manually
              </button>
              <button onClick={() => setMode('gallery')} className="btn btn-secondary flex items-center gap-2">
                View Scans ({pages.length})
              </button>
            </div>
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
                  <Camera className="w-4 h-4" /> Start Auto-Scan
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
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" /> {index + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button onClick={() => { setActivePageId(page.id); setMode('edit'); }} className="btn btn-primary btn-sm w-3/4">
                        Edit & OCR
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
                  <span className="font-medium">Auto-Scan More</span>
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
                {isProcessing && (
                  <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                )}
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
                {(['original', 'magic', 'bw', 'grayscale'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => applyFilterToPage(activePage.id, t)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activePage.filter === t ? 'bg-primary text-white shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {t === 'original' ? 'Original' : t === 'magic' ? 'Magic OCR (Auto)' : t === 'bw' ? 'B&W Basic' : 'Grayscale'}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                <button onClick={() => extractTextFromPage(activePage.id)} disabled={isOcrProcessing} className="btn btn-secondary flex-1 max-w-md">
                  {isOcrProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Extract Perfect OCR
                </button>
              </div>
            </div>

            {ocrText && (
              <div className="w-full lg:w-96 flex flex-col gap-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Extracted Text
                </h3>
                <textarea 
                  className="w-full flex-1 min-h-[300px] p-3 rounded-xl border border-input bg-background/50 text-sm focus:ring-primary focus:border-primary"
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
