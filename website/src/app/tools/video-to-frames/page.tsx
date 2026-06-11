'use client';
import { useState, useRef } from 'react';
import { Video, UploadCloud, FileArchive, Loader2, Settings } from 'lucide-react';

export default function VideoToFrames() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a valid video file (MP4, MKV, AVI).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid video file (MP4, MKV, AVI).');
      }
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fps', fps);

    try {
      // The Next.js rewrite in next.config.ts routes this to the Python backend
      const response = await fetch('/api/video/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract frames. Ensure the Python backend is running.');
      }

      // Handle the ZIP file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_frames_${fps}fps.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 drop-shadow-sm flex justify-center items-center gap-3">
          <Video className="w-10 h-10 text-red-600" />
          Video to Pictures
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium">
          Extract high-quality images from any MP4 video using hardware-accelerated FFmpeg.
        </p>
      </div>

      <div className="glass-panel p-8">
        {/* Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-red-300 bg-red-50/50 rounded-2xl p-12 text-center cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all flex flex-col items-center justify-center group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/*" 
            className="hidden" 
          />
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10 text-red-500" />
          </div>
          {file ? (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">{file.name}</h3>
              <p className="text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">Drag & Drop your video here</h3>
              <p className="text-gray-500">or click to browse from your computer</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Settings */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Settings className="w-4 h-4" /> Extraction Rate (FPS)
            </label>
            <select 
              value={fps}
              onChange={(e) => setFps(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 bg-white/50 backdrop-blur-sm transition-all"
            >
              <option value="1">1 picture per second</option>
              <option value="2">2 pictures per second</option>
              <option value="5">5 pictures per second</option>
              <option value="1/2">1 picture every 2 seconds</option>
              <option value="1/5">1 picture every 5 seconds</option>
              <option value="1/10">1 picture every 10 seconds</option>
            </select>
          </div>
          
          <button
            onClick={handleExtract}
            disabled={!file || isLoading}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Video...
              </>
            ) : (
              <>
                <FileArchive className="w-5 h-5" />
                Extract as ZIP
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">How it works:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Your video is securely processed locally on the server using hardware-accelerated FFmpeg.</li>
            <li>All pictures are extracted in high resolution and bundled into a ZIP file.</li>
            <li>No data is sent to external clouds, ensuring 100% privacy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
