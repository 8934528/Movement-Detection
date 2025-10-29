import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { PermissionPrompt } from './PermissionPrompt';

interface CameraFeedProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isActive: boolean;
  onError?: (error: string) => void;
}

export function CameraFeed({ onVideoReady, isActive, onError }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequestedOnce, setHasRequestedOnce] = useState(false);

  useEffect(() => {
    // Reset states when camera is turned off
    if (!isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setShowPermissionPrompt(false);
      setCameraError(null);
      setIsRequesting(false);
      return;
    }

    // Check if mediaDevices is supported
    if (isActive && (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)) {
      const errorMsg = 'Camera access is not supported in this browser. Please use a modern browser with HTTPS.';
      setCameraError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Show permission prompt when camera is activated for the first time
    if (isActive && !hasRequestedOnce) {
      setShowPermissionPrompt(true);
      return;
    }

    // If already requested once and isActive is true, try to start camera
    if (isActive && hasRequestedOnce && !streamRef.current) {
      startCameraStream();
    }
  }, [isActive, hasRequestedOnce]);

  const startCameraStream = async () => {
    setCameraError(null);
    setIsRequesting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            onVideoReady(videoRef.current);
            setShowPermissionPrompt(false);
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      let errorMsg = 'Unable to access camera';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMsg = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'No camera found. Please connect a camera device.';
        } else if (error.name === 'NotReadableError') {
          errorMsg = 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMsg = 'Camera does not support the requested settings.';
        } else if (error.name === 'SecurityError') {
          errorMsg = 'Camera access blocked. Please ensure you are using HTTPS and have granted permissions.';
        }
      }
      
      setCameraError(errorMsg);
      onError?.(errorMsg);
      setShowPermissionPrompt(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRequestPermission = () => {
    setHasRequestedOnce(true);
    startCameraStream();
  };

  const handleRetry = () => {
    setCameraError(null);
    setHasRequestedOnce(false);
    setShowPermissionPrompt(true);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border-2 border-secondary min-h-[240px] sm:min-h-[320px]">
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
      />
      <canvas
        id="pose-canvas"
        className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
      />
      
      {/* Permission Prompt Overlay */}
      {showPermissionPrompt && (
        <PermissionPrompt 
          onRequestPermission={handleRequestPermission}
          isRequesting={isRequesting}
        />
      )}
      
      {/* Camera Off State */}
      {!isActive && !cameraError && !showPermissionPrompt && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-3 sm:gap-4 p-4">
          <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">Camera is off</p>
          <p className="text-sm text-muted-foreground text-center">Click &quot;Start Camera&quot; to begin detection</p>
        </div>
      )}
      
      {/* Error State */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-3 sm:gap-4 p-3 sm:p-6 overflow-y-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
          </div>
          <div className="text-center max-w-md w-full">
            <h3 className="mb-2">Camera Access Error</h3>
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">{cameraError}</p>
            <div className="space-y-2 text-xs text-muted-foreground text-left bg-card/80 p-3 sm:p-4 rounded-lg border border-border">
              <p><strong>To enable camera access:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Look for the camera icon in your browser&apos;s address bar</li>
                <li>Click it and select &quot;Allow&quot; for this site</li>
                <li>Click &quot;Retry&quot; below after granting permission</li>
                <li>If the issue persists, try refreshing the page</li>
              </ol>
              <p className="mt-3"><strong>Common Issues:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Camera might be in use by another application</li>
                <li>Browser might need HTTPS for camera access</li>
                <li>Camera permissions might be blocked in browser settings</li>
              </ul>
            </div>
          </div>
          <Button onClick={handleRetry} variant="default" className="flex-shrink-0">
            <Camera className="w-4 h-4 mr-2" />
            Retry Camera Access
          </Button>
        </div>
      )}
    </div>
  );
}
