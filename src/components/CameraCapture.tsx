import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, capturedImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const retakePhoto = () => {
    startCamera();
    onCapture('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Camera className="w-5 h-5 mr-2 text-blue-600" />
        Live Selfie Capture
      </h3>
      
      <div className="relative">
        {!capturedImage ? (
          <div className="space-y-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 
                         disabled:bg-gray-400 transition-colors duration-200 font-medium"
            >
              {isStreaming ? 'Capture Selfie' : 'Starting Camera...'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <img 
              src={capturedImage} 
              alt="Captured selfie"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={retakePhoto}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 
                         transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Photo
            </button>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;