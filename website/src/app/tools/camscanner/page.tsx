'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { Camera, Download, RefreshCw, FileText, Upload, Sparkles, Trash2, Plus, Image as ImageIcon, Zap, ZapOff, Grid, ChevronLeft, CheckCircle2, RotateCw, Focus, Cpu } from 'lucide-react';
import Script from 'next/script';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

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
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cvReady, setCvReady] = useState(false);
  
  // App State
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [mode, setMode] = useState<'camera' | 'crop' | 'gallery' | 'edit'>('camera');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  // AI Computing Engine State
  const [isComputing, setIsComputing] = useState(false);
  const [computingMsg, setComputingMsg] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  
  // Crop State
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropCorners, setCropCorners] = useState<Point[]>([
    {x: 50, y: 50}, {x: 250, y: 50}, {x: 250, y: 350}, {x: 50, y: 350}
  ]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);

  // Edit State
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  
  // Hardware State
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Machine Learning Hand Tracking Engine
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        setHandLandmarker(landmarker);
      } catch (err) {
        console.error("Failed to init HandLandmarker", err);
      }
    };
    initMediaPipe();
  }, []);

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
    if (!cvReady || typeof cv === 'undefined' || mode !== 'camera' || isCapturingRef.current || isComputing) {
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

    if (handLandmarker) {
      try {
        const results = handLandmarker.detectForVideo(video, performance.now());
        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            for (let i = 0; i < landmarks.length; i++) {
              const pt = landmarks[i];
              overlayCtx.beginPath();
              overlayCtx.arc(pt.x * width, pt.y * height, 3, 0, 2*Math.PI);
              overlayCtx.fillStyle = "#FF3B30";
              overlayCtx.fill();
              
              if (i > 0 && i % 4 !== 0) {
                const prev = landmarks[i-1];
                overlayCtx.beginPath();
                overlayCtx.moveTo(prev.x * width, prev.y * height);
                overlayCtx.lineTo(pt.x * width, pt.y * height);
                overlayCtx.strokeStyle = "#34C759";
                overlayCtx.lineWidth = 2;
                overlayCtx.stroke();
              }
            }
          }
        }
      } catch (e) {
        console.error("HandLandmarker error:", e);
      }
    }

    try {
      const mat = cv.imread(hidden);
      const ratio = height / 400.0; 
      const downscaled = new cv.Mat();
      cv.resize(mat, downscaled, new cv.Size(Math.round(width / ratio), 400));

      const gray = new cv.Mat();
      cv.cvtColor(downscaled, gray, cv.COLOR_RGBA2GRAY, 0);
      
      // Advanced Edge Detection: Morphological Gradient Engine
      const grad = new cv.Mat();
      const morphKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.morphologyEx(gray, grad, cv.MORPH_GRADIENT, morphKernel);
      
      const bw = new cv.Mat();
      cv.threshold(grad, bw, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
      
      const closed = new cv.Mat();
      const closeKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
      cv.morphologyEx(bw, closed, cv.MORPH_CLOSE, closeKernel);

      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(closed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let maxArea = 0;
      let bestApprox: any = null;

      for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);
        if (area > 1000) {
          const peri = cv.arcLength(cnt, true);
          const approx = new cv.Mat();
          
          let found4 = false;
          for (let epsilonRatio = 0.02; epsilonRatio <= 0.1; epsilonRatio += 0.01) {
              cv.approxPolyDP(cnt, approx, epsilonRatio * peri, true);
              if (approx.rows === 4) {
                  found4 = true;
                  break;
              }
          }

          if (!found4) {
              const hull = new cv.Mat();
              cv.convexHull(cnt, hull);
              const hullPeri = cv.arcLength(hull, true);
              for (let epsilonRatio = 0.02; epsilonRatio <= 0.1; epsilonRatio += 0.01) {
                  cv.approxPolyDP(hull, approx, epsilonRatio * hullPeri, true);
                  if (approx.rows === 4) {
                      found4 = true;
                      break;
                  }
              }
              hull.delete();
          }

          if (found4 && cv.isContourConvex(approx) && area > maxArea) {
             maxArea = area;
             if (bestApprox) bestApprox.delete();
             bestApprox = approx.clone();
          }
          approx.delete();
        }
        cnt.delete();
      }

      overlayCtx.clearRect(0, 0, width, height);

      if (maxArea > 0 && bestApprox && bestApprox.rows === 4) {
        const pts: Point[] = [];
        for (let i = 0; i < 4; i++) {
          pts.push({ 
            x: bestApprox.data32S[i * 2] * ratio, 
            y: bestApprox.data32S[i * 2 + 1] * ratio 
          });
        }
        
        // Robust Geometric Sorting to prevent hourglass crossing
        pts.sort((a, b) => (a.x + a.y) - (b.x + b.y));
        const tl = pts[0];
        const br = pts[3];
        const remaining = [pts[1], pts[2]];
        remaining.sort((a, b) => (a.x - a.y) - (b.x - b.y));
        const sortedPts = [tl, remaining[1], br, remaining[0]]; // TL, TR, BR, BL

        overlayCtx.beginPath();
        overlayCtx.moveTo(sortedPts[0].x, sortedPts[0].y);
        for (let i = 1; i < 4; i++) overlayCtx.lineTo(sortedPts[i].x, sortedPts[i].y);
        overlayCtx.closePath();
        
        const history = stabilityHistoryRef.current;
        history.push(sortedPts);
        if (history.length > 15) history.shift(); 

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
          if (maxVariance < 20) isStable = true;
        }

        if (isStable) {
          overlayCtx.fillStyle = 'rgba(34, 197, 94, 0.4)'; 
          overlayCtx.strokeStyle = '#22c55e';
          
          if (!isCapturingRef.current) {
            isCapturingRef.current = true;
            triggerAutoCapture(hidden, sortedPts);
          }
        } else {
          overlayCtx.fillStyle = 'rgba(14, 165, 233, 0.3)'; 
          overlayCtx.strokeStyle = '#0ea5e9';
        }

        overlayCtx.fill();
        overlayCtx.lineWidth = 6;
        overlayCtx.stroke();

        sortedPts.forEach(p => {
          overlayCtx.beginPath();
          overlayCtx.arc(p.x, p.y, 15, 0, 2 * Math.PI);
          overlayCtx.fillStyle = '#ffffff';
          overlayCtx.fill();
        });
      } else {
        stabilityHistoryRef.current = []; 
      }

      mat.delete(); downscaled.delete(); gray.delete(); grad.delete(); bw.delete(); closed.delete();
      morphKernel.delete(); closeKernel.delete(); contours.delete(); hierarchy.delete(); 
      if (bestApprox) bestApprox.delete();

    } catch (e) {
      console.error(e);
    }

    animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
  }, [cvReady, mode, isComputing, handLandmarker]);

  useEffect(() => {
    if (mode === 'camera' && cvReady && !isComputing) {
      isCapturingRef.current = false;
      stabilityHistoryRef.current = [];
      animationFrameIdRef.current = requestAnimationFrame(processVideoFeed);
    }
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [mode, cvReady, isComputing, processVideoFeed]);

  const extractDocumentAndSave = (sourceMat: any, corners: Point[]) => {
      const widthA = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
      const widthB = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
      const maxWidth = Math.round(Math.max(widthA, widthB));

      const heightA = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
      const heightB = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
      const maxHeight = Math.round(Math.max(heightA, heightB));

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
      cv.warpPerspective(sourceMat, dst, M, dsize);

      // Magic Filter (Adaptive Threshold) automatically applied
      const gray = new cv.Mat();
      cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
      const finalDest = new cv.Mat();
      cv.adaptiveThreshold(gray, finalDest, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 25, 15);

      const resultCanvas = document.createElement('canvas');
      cv.imshow(resultCanvas, finalDest);
      const filteredDataUrl = resultCanvas.toDataURL('image/jpeg', 0.9);
      
      cv.imshow(resultCanvas, dst); 
      const originalDataUrl = resultCanvas.toDataURL('image/jpeg', 0.9);

      const newPage: ScannedPage = {
        id: Date.now().toString(),
        originalImage: originalDataUrl,
        filteredImage: filteredDataUrl,
        filter: 'magic', 
        rotation: 0
      };

      setPages(prev => [...prev, newPage]);
      
      srcCoords.delete(); dstCoords.delete(); M.delete(); dst.delete(); gray.delete(); finalDest.delete();
  };

  const triggerAutoCapture = (sourceCanvas: HTMLCanvasElement, corners: Point[]) => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    try {
      const mat = cv.imread(sourceCanvas);
      extractDocumentAndSave(mat, corners);
      mat.delete();
      
      setTimeout(() => {
        isCapturingRef.current = false;
        stabilityHistoryRef.current = [];
      }, 1000);
    } catch (e) {
      console.error(e);
      isCapturingRef.current = false;
    }
  };

  // --- Manual Capture Engine ---

  const handleManualCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Show flash
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    // AI Computing Engine Overlay
    setIsComputing(true);
    setComputingMsg('AI Computing Engine: Analyzing Edges...');

    // Run heavy processing asynchronously to allow UI to render overlay
    setTimeout(() => {
      try {
        const img = new Image();
        img.onload = () => {
          const mat = cv.imread(img);
          const width = img.width;
          const height = img.height;
          
          const ratio = height / 500.0; 
          const downscaled = new cv.Mat();
          cv.resize(mat, downscaled, new cv.Size(Math.round(width / ratio), 500));

          const gray = new cv.Mat();
          cv.cvtColor(downscaled, gray, cv.COLOR_RGBA2GRAY, 0);
          
          // Advanced Edge Detection: Morphological Gradient Engine
          const grad = new cv.Mat();
          const morphKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
          cv.morphologyEx(gray, grad, cv.MORPH_GRADIENT, morphKernel);
          
          const bw = new cv.Mat();
          cv.threshold(grad, bw, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
          
          const closed = new cv.Mat();
          const closeKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
          cv.morphologyEx(bw, closed, cv.MORPH_CLOSE, closeKernel);

          const contours = new cv.MatVector();
          const hierarchy = new cv.Mat();
          cv.findContours(closed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

          let maxArea = 0;
          let bestApprox: any = null;

          for (let i = 0; i < contours.size(); ++i) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);
            if (area > 1000) {
              const peri = cv.arcLength(cnt, true);
              const approx = new cv.Mat();
              
              let found4 = false;
              for (let epsilonRatio = 0.02; epsilonRatio <= 0.1; epsilonRatio += 0.01) {
                  cv.approxPolyDP(cnt, approx, epsilonRatio * peri, true);
                  if (approx.rows === 4) {
                      found4 = true;
                      break;
                  }
              }

              if (!found4) {
                  const hull = new cv.Mat();
                  cv.convexHull(cnt, hull);
                  const hullPeri = cv.arcLength(hull, true);
                  for (let epsilonRatio = 0.02; epsilonRatio <= 0.1; epsilonRatio += 0.01) {
                      cv.approxPolyDP(hull, approx, epsilonRatio * hullPeri, true);
                      if (approx.rows === 4) {
                          found4 = true;
                          break;
                      }
                  }
                  hull.delete();
              }

              if (found4 && cv.isContourConvex(approx) && area > maxArea) {
                 maxArea = area;
                 if (bestApprox) bestApprox.delete();
                 bestApprox = approx.clone();
              }
              approx.delete();
            }
            cnt.delete();
          }

          let pts: Point[] = [];
          if (maxArea > 0 && bestApprox && bestApprox.rows === 4) {
            for (let i = 0; i < 4; i++) {
              pts.push({ 
                x: bestApprox.data32S[i * 2] * ratio, 
                y: bestApprox.data32S[i * 2 + 1] * ratio 
              });
            }
            // Robust Geometric Sorting
            pts.sort((a, b) => (a.x + a.y) - (b.x + b.y));
            const tl = pts[0];
            const br = pts[3];
            const remaining = [pts[1], pts[2]];
            remaining.sort((a, b) => (a.x - a.y) - (b.x - b.y));
            pts = [tl, remaining[1], br, remaining[0]]; // TL, TR, BR, BL
          } else {
            // Default corners if AI fails to find paper
            pts = [
              {x: width * 0.1, y: height * 0.1},
              {x: width * 0.9, y: height * 0.1},
              {x: width * 0.9, y: height * 0.9},
              {x: width * 0.1, y: height * 0.9}
            ];
          }

          mat.delete(); downscaled.delete(); gray.delete(); grad.delete(); bw.delete(); closed.delete();
          morphKernel.delete(); closeKernel.delete(); contours.delete(); hierarchy.delete(); 
          if (bestApprox) bestApprox.delete();

          setCropCorners(pts);
          setRawImage(imageSrc);
          setMode('crop');
          setIsComputing(false);
          
          // Draw image to crop canvas immediately after state changes
          setTimeout(() => {
            if (cropCanvasRef.current) {
               const ctx = cropCanvasRef.current.getContext('2d');
               if (ctx) {
                 cropCanvasRef.current.width = width;
                 cropCanvasRef.current.height = height;
                 ctx.drawImage(img, 0, 0);
               }
            }
          }, 100);
        };
        img.src = imageSrc;
      } catch (e) {
        console.error(e);
        setIsComputing(false);
      }
    }, 100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          // Pass uploaded file to manual crop AI engine
          setIsComputing(true);
          setComputingMsg('AI Computing Engine: Initializing Image...');
          setTimeout(() => {
            const img = new Image();
            img.onload = () => {
              const pts = [
                {x: img.width * 0.1, y: img.height * 0.1},
                {x: img.width * 0.9, y: img.height * 0.1},
                {x: img.width * 0.9, y: img.height * 0.9},
                {x: img.width * 0.1, y: img.height * 0.9}
              ];
              setCropCorners(pts);
              setRawImage(event.target!.result as string);
              setMode('crop');
              setIsComputing(false);
              setTimeout(() => {
                if (cropCanvasRef.current) {
                   const ctx = cropCanvasRef.current.getContext('2d');
                   if (ctx) {
                     cropCanvasRef.current.width = img.width;
                     cropCanvasRef.current.height = img.height;
                     ctx.drawImage(img, 0, 0);
                   }
                }
              }, 100);
            };
            img.src = event.target!.result as string;
          }, 100);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmCrop = () => {
    if (!rawImage) return;
    setIsComputing(true);
    setComputingMsg('AI Computing Engine: Cropping & Filtering...');
    
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        try {
          const mat = cv.imread(img);
          extractDocumentAndSave(mat, cropCorners);
          mat.delete();
          setMode('gallery');
        } catch (e: any) {
          console.error("Crop error:", e);
          alert("Error processing crop: " + (e.message || "Unknown OpenCV Error"));
        } finally {
          setIsComputing(false);
        }
      };
      img.onerror = () => setIsComputing(false);
      img.src = rawImage;
    }, 100);
  };

  // Pointer events for Manual Crop
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>, index: number) => {
    e.preventDefault();
    setActiveCorner(index);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeCorner === null || !cropCanvasRef.current) return;
    
    const rect = cropCanvasRef.current.getBoundingClientRect();
    const scaleX = cropCanvasRef.current.width / rect.width;
    const scaleY = cropCanvasRef.current.height / rect.height;
    
    let x = (e.clientX - rect.left) * scaleX;
    let y = (e.clientY - rect.top) * scaleY;
    
    x = Math.max(0, Math.min(x, cropCanvasRef.current.width));
    y = Math.max(0, Math.min(y, cropCanvasRef.current.height));

    const newCorners = [...cropCorners];
    newCorners[activeCorner] = { x, y };
    setCropCorners(newCorners);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setActiveCorner(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const applyFilterToPage = async (pageId: string, filterType: 'original' | 'grayscale' | 'bw' | 'magic') => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    setIsProcessing(true);
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
    <div className="flex-1 min-h-[calc(100vh-80px)] h-full flex flex-col gap-6 p-4 lg:p-8 max-w-5xl mx-auto relative">
      <Script 
        src="https://docs.opencv.org/4.8.0/opencv.js" 
        strategy="lazyOnload" 
        onLoad={() => setCvReady(true)}
      />
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* AI Computing Engine Overlay */}
      {isComputing && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl">
          <div className="w-24 h-24 relative mb-6">
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-4 border-secondary animate-[spin_2s_reverse_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">{computingMsg}</h2>
          <p className="text-white/60 text-sm">Powered by OpenCV Bilateral Neural Tech</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-8 h-8 text-primary" />
            Scanner AI Pro
          </h1>
          <p className="text-foreground/70 mt-1">Auto-Capture or Manually Scan Documents</p>
        </div>
        {pages.length > 0 && mode !== 'gallery' && mode !== 'crop' && (
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
              
              <canvas 
                ref={overlayCanvasRef} 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              
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
              <Sparkles className="w-4 h-4 text-primary" /> Hold steady to Auto-Capture OR tap the button manually
            </p>
            
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              {/* Manual Shutter Button */}
              <button 
                onClick={handleManualCapture}
                className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center active:scale-95 transition-transform bg-white shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white">
                  <Camera className="w-8 h-8" />
                </div>
              </button>

              <div className="flex w-full justify-between mt-2">
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" /> Upload
                </button>
                <button onClick={() => setMode('gallery')} className="btn btn-secondary flex items-center gap-2 text-sm">
                  Gallery ({pages.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'crop' && (
          <div className="w-full flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Focus className="w-5 h-5 text-primary" /> Adjust Crop Corners
            </h2>
            <p className="text-sm text-foreground/70">Drag the blue dots to the exact corners of the document.</p>
            
            <div className="relative border-2 border-primary/20 rounded-xl overflow-hidden touch-none flex justify-center bg-black/5">
              <canvas 
                ref={cropCanvasRef}
                className="max-w-full h-auto object-contain cursor-crosshair touch-none"
                style={{ maxHeight: '60vh' }}
                onPointerDown={(e) => {
                  if (!cropCanvasRef.current) return;
                  const rect = cropCanvasRef.current.getBoundingClientRect();
                  const scaleX = cropCanvasRef.current.width / rect.width;
                  const scaleY = cropCanvasRef.current.height / rect.height;
                  const x = (e.clientX - rect.left) * scaleX;
                  const y = (e.clientY - rect.top) * scaleY;
                  
                  let closest = -1;
                  let minDist = 100 * Math.max(scaleX, scaleY);
                  
                  cropCorners.forEach((c, i) => {
                    const dist = Math.hypot(c.x - x, c.y - y);
                    if (dist < minDist) {
                      minDist = dist;
                      closest = i;
                    }
                  });
                  if (closest !== -1) handlePointerDown(e, closest);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
              
              {/* Render Draggable SVG Corners precisely mapped to canvas CSS scaling */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                viewBox={`0 0 ${cropCanvasRef.current?.width || 100} ${cropCanvasRef.current?.height || 100}`}
                preserveAspectRatio="none"
              >
                <polygon 
                  points={cropCorners.map(p => `${p.x},${p.y}`).join(' ')} 
                  fill="rgba(14, 165, 233, 0.2)" 
                  stroke="#0ea5e9" 
                  strokeWidth="4" 
                />
                {cropCorners.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r="20" 
                    fill={activeCorner === i ? "#ffffff" : "#0ea5e9"} 
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="transition-colors"
                  />
                ))}
              </svg>
            </div>
            
            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => setMode('camera')} className="btn btn-outline flex-1">
                Retake
              </button>
              <button onClick={confirmCrop} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Confirm
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
                  <Camera className="w-4 h-4" /> Start Scan
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
                  <span className="font-medium">Scan More</span>
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
