
import React, { useRef, useState, useEffect } from 'react';

interface ImageCaptureProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        setError("无法访问摄像头，请检查权限。");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in">
      <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-full border-4 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] bg-black">
        {error ? (
          <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
            {error}
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
        )}
        
        {/* Scanning Animation */}
        {!error && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-1 bg-amber-500/50 absolute top-0 animate-[scan_3s_infinite_linear]" />
            <div className="absolute inset-0 border-[20px] border-black/40 rounded-full" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
      `}</style>

      <div className="text-center">
        <h3 className="text-2xl font-cursive text-amber-200">灵境相法</h3>
        <p className="text-slate-500 text-sm mt-2">请正对面屏，心怀虔诚，采集瞬时气色</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-4 w-full max-w-sm">
        <button 
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all"
        >
          取消
        </button>
        <button 
          onClick={handleCapture}
          disabled={!!error}
          className="flex-[2] py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          即刻显圣
        </button>
      </div>
    </div>
  );
};
