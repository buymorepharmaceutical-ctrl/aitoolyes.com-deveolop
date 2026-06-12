'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { Camera, Image as ImageIcon, Download, RefreshCw, Wand2, FileText, Upload, Sparkles, Scissors, Check, Crop } from 'lucide-react';
import Script from 'next/script';

declare let cv: any;

type Point = { x: number, y: number };

export default function CamScanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cvReady, setCvReady] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'original' | 'grayscale' | 'bw'>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isComputingCrop, setIsComputingCrop] = useState(false);
  const [isBgRemoving, setIsBgRemoving] = useState(false);
  
  // Crop state
  const [mode, setMode] = useState<'camera' | 'crop' | 'result'>('camera');
  const [corners, setCorners] = useState<Point[]>([
    { x: 50, y: 50 }, { x: 250, y: 50 }, { x: 250, y: 350 }, { x: 50, y: 350 }
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const src = webcamRef.current.getScreenshot();
      if (src) {
        setImageSrc(src);
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
          setImageSrc(event.target.result);
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
      setImgSize({ width: img.width, height: img.height });
      let defaultCorners = [
        { x: img.width * 0.1, y: img.height * 0.1 },
        { x: img.width * 0.9, y: img.height * 0.1 },
        { x: img.width * 0.9, y: img.height * 0.9 },
        { x: img.width * 0.1, y: img.height * 0.9 }
      ];

      // Give UI time to show "Computing..." before locking thread
      setTimeout(() => {
        if (cvReady && typeof cv !== 'undefined') {
          try {
            const mat = cv.imread(img);
            
            // Downscale for faster and more robust edge detection
            const ratio = img.height / 500.0;
            const downscaled = new cv.Mat();
            cv.resize(mat, downscaled, new cv.Size(Math.round(img.width / ratio), 500));

            const gray = new cv.Mat();
            cv.cvtColor(downscaled, gray, cv.COLOR_RGBA2GRAY, 0);
            
            // Robust Edge Detection Pipeline
            cv.medianBlur(gray, gray, 5);
            cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
            
            // Dilate & Close to connect broken document edges
            const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
            cv.morphologyEx(gray, gray, cv.MORPH_CLOSE, kernel);
            
            // Adaptive Canny Edge Detection
            cv.Canny(gray, gray, 50, 150);
            cv.dilate(gray, gray, kernel, new cv.Point(-1, -1), 1);

            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(gray, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

            let maxArea = 0;
            let bestApprox = new cv.Mat();

            // Find the largest 4-point contour
            for (let i = 0; i < contours.size(); ++i) {
              const cnt = contours.get(i);
              const area = cv.contourArea(cnt);
              if (area > 1000) { // filter small noise
                const peri = cv.arcLength(cnt, true);
                const approx = new cv.Mat();
                // 0.02 is standard for document polygon approximation
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
                // Scale back to original resolution
                pts.push({ 
                  x: bestApprox.data32S[i * 2] * ratio, 
                  y: bestApprox.data32S[i * 2 + 1] * ratio 
                });
              }
              // Sort points to strictly TL, TR, BR, BL order
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

    // Draw Image
    ctx.drawImage(img, 0, 0);

    // Draw Polygon
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0ea5e9';
    ctx.stroke();

    // Draw Corners
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = draggingPoint === i ? '#ffffff' : '#0ea5e9';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (mode === 'crop' && imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => drawCropUi(img, corners);
    }
  }, [corners, draggingPoint, mode]);

  // Touch & Mouse Handlers for Cropping
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

    const hitIndex = corners.findIndex(p => Math.hypot(p.x - x, p.y - y) < 40);
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

  const handlePointerUp = () => {
    setDraggingPoint(null);
  };

  const applyPerspectiveCrop = () => {
    if (!cvReady || typeof cv === 'undefined' || !imageSrc) {
      alert("OpenCV is not ready yet. Please wait a moment.");
      return;
    }
    
    try {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const mat = cv.imread(img);
        
        // Calculate the max width and height for the new flattened image
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
        
        setProcessedImage(dataUrl);
        setMode('result');
        setFilter('original');

        mat.delete(); srcCoords.delete(); dstCoords.delete(); M.delete(); dst.delete();
      };
    } catch (e) {
      console.error("Perspective Transform Error", e);
      alert("Failed to crop. Please try again.");
    }
  };

  const retake = () => {
    setMode('camera');
    setImageSrc(null);
    setProcessedImage(null);
    setFilter('original');
    setOcrText(null);
  };

  const [filteredImage, setFilteredImage] = useState<string | null>(null);

  const applyFilter = (type: 'original' | 'grayscale' | 'bw') => {
    setFilter(type);
    if (type === 'original') {
      setFilteredImage(null);
      return;
    }
    
    if (!processedImage) return;
    setIsProcessing(true);

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
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (type === 'bw') {
          const threshold = 128;
          const v = avg > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = v;
        } else {
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setFilteredImage(canvas.toDataURL('image/jpeg', 0.9));
      setIsProcessing(false);
    };
    img.src = processedImage;
  };

  const extractText = async () => {
    if (!processedImage) return;
    setIsOcrProcessing(true);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(filteredImage || processedImage, 'eng');
      setOcrText(result.data.text);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to extract text.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const exportPdf = () => {
    const finalImage = filteredImage || processedImage;
    if (!finalImage) return;
    
    const img = new Image();
    img.onload = () => {
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'l' : 'p',
        unit: 'px',
        format: [img.width, img.height]
      });
      pdf.addImage(finalImage, 'JPEG', 0, 0, img.width, img.height);
      pdf.save('AI-Scanned-Document.pdf');
    };
    img.src = finalImage;
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] h-full flex flex-col gap-6 p-4 lg:p-8 max-w-5xl mx-auto">
      <Script 
        src="https://docs.opencv.org/4.8.0/opencv.js" 
        strategy="lazyOnload" 
        onLoad={() => setCvReady(true)}
      />

      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Camera className="w-8 h-8 text-primary" />
          Advanced PDF Scanner
        </h1>
        <p className="text-foreground/70 mt-1">Smart edge detection, perspective flattening, OCR, and high-quality PDF export.</p>
        {!cvReady && (
          <div className="text-yellow-600 bg-yellow-100 p-2 rounded mt-2 text-sm">
            Loading AI Vision Engine (OpenCV)... Please wait.
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border border-card-border rounded-2xl bg-white/40 backdrop-blur-md shadow-sm overflow-hidden p-4 relative min-h-[500px]">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {mode === 'camera' && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white/50 w-full relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full object-cover max-h-[60vh]"
                mirrored={false}
              />
              <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg pointer-events-none opacity-50"></div>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Image
              </button>
              <button onClick={capture} className="btn btn-primary flex items-center gap-2">
                <Camera className="w-4 h-4" /> Capture Document
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
                <p className="text-sm text-foreground/70">Scanning for document edges and correcting perspective</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/70 text-center font-medium">Drag the 4 blue corners to align with your document.</p>
                <div className="relative w-full max-w-2xl border-2 border-primary/20 rounded-xl overflow-hidden touch-none" style={{ maxHeight: '60vh' }}>
                  <canvas 
                    ref={cropCanvasRef}
                    className="w-full h-auto object-contain cursor-crosshair touch-none"
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
                  <button onClick={retake} className="btn btn-outline flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Retake
                  </button>
                  <button onClick={applyPerspectiveCrop} disabled={!cvReady} className="btn btn-primary flex items-center gap-2">
                    <Crop className="w-4 h-4" /> Confirm Crop
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {mode === 'result' && processedImage && (
          <div className="w-full h-full flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="relative rounded-xl overflow-hidden shadow-xl border-4 border-white w-full flex justify-center bg-gray-100 p-2 min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={filteredImage || processedImage} className="w-full max-w-md h-auto object-contain shadow-sm" alt="Result" />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {(['original', 'grayscale', 'bw'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => applyFilter(t)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter === t ? 'bg-primary text-white shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {t === 'original' ? 'Original' : t === 'grayscale' ? 'Grayscale' : 'B&W Magic'}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center w-full">
                <button onClick={retake} className="btn btn-outline flex-1 min-w-[120px]">
                  <RefreshCw className="w-4 h-4 mr-2" /> New
                </button>
                <button onClick={extractText} disabled={isOcrProcessing} className="btn btn-secondary flex-1 min-w-[120px]">
                  {isOcrProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Extract OCR
                </button>
                <button onClick={exportPdf} className="btn btn-primary flex-1 min-w-[120px]">
                  <Download className="w-4 h-4 mr-2" /> Save PDF
                </button>
              </div>
            </div>

            {ocrText && (
              <div className="w-full md:w-80 flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Extracted Text</h3>
                <textarea 
                  className="w-full flex-1 min-h-[200px] p-3 rounded-xl border border-input bg-background/50 text-sm"
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
