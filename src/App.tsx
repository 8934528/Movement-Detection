import { useState, useCallback } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { PoseDetector, PoseData } from './components/PoseDetector';
import { GestureAnalyzer, GestureState } from './components/GestureAnalyzer';
import { StatusPanel } from './components/StatusPanel';
import { SystemHeader } from './components/SystemHeader';
import { InfoPanel } from './components/InfoPanel';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    isWaving: false,
    isSpeaking: false,
    handPosition: 'neutral',
    mouthMovement: 0,
    eyesClosed: false,
    posture: 'unknown',
    movementLevel: 0
  });
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const handleVideoReady = useCallback((videoElement: HTMLVideoElement) => {
    setVideo(videoElement);
    setModelStatus('ready');
    toast.success('Camera initialized successfully');
  }, []);

  const handlePoseDetected = useCallback((pose: PoseData) => {
    setPoseData(pose);
  }, []);

  const handleGestureDetected = useCallback((gesture: GestureState) => {
    setGestureState(gesture);
  }, []);

  const handleCameraError = useCallback((error: string) => {
    setModelStatus('error');
    toast.error('Camera Error', {
      description: error,
      duration: 5000,
    });
  }, []);

  const handleToggleCamera = () => {
    if (!isActive) {
      setModelStatus('loading');
    } else {
      setVideo(null);
      setModelStatus('loading');
    }
    setIsActive(!isActive);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10">
      <Toaster />
      
      <SystemHeader 
        isActive={isActive}
        onToggleCamera={handleToggleCamera}
        modelStatus={modelStatus}
        theme={theme}
        onThemeChange={setTheme}
      />

      <div className="container mx-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Camera Feed */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="aspect-video">
              <CameraFeed 
                onVideoReady={handleVideoReady}
                isActive={isActive}
                onError={handleCameraError}
              />
            </div>

            <InfoPanel />
          </div>

          {/* Status Panel */}
          <div className="lg:col-span-1">
            <StatusPanel 
              gestureState={gestureState}
              isDetecting={isActive}
            />
          </div>
        </div>
      </div>

      {/* Pose Detector (invisible component) */}
      <PoseDetector 
        video={video}
        isActive={isActive}
        onPoseDetected={handlePoseDetected}
      />

      {/* Gesture Analyzer (invisible component) */}
      <GestureAnalyzer 
        poseData={poseData}
        onGestureDetected={handleGestureDetected}
      />
    </div>
  );
}
