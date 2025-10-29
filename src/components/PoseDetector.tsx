import { useEffect, useRef, useState } from 'react';

export interface Keypoint {
  name: string;
  x: number;
  y: number;
  score: number;
}

export interface PoseData {
  keypoints: Keypoint[];
  timestamp: number;
}

interface PoseDetectorProps {
  video: HTMLVideoElement | null;
  isActive: boolean;
  onPoseDetected: (pose: PoseData) => void;
}

export function PoseDetector({ video, isActive, onPoseDetected }: PoseDetectorProps) {
  const animationRef = useRef<number>();
  const [modelLoaded, setModelLoaded] = useState(false);
  const previousFrameRef = useRef<ImageData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Simulate model loading
    const timer = setTimeout(() => {
      setModelLoaded(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!video || !isActive || !modelLoaded) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let isDetecting = true;
    canvasRef.current = document.getElementById('pose-canvas') as HTMLCanvasElement;

    const detectPose = async () => {
      if (!isDetecting || !video || !canvasRef.current) return;

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Draw video frame to detect motion
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Detect motion and create keypoints
        const keypoints = detectMotionAndCreateKeypoints(
          currentFrame,
          previousFrameRef.current,
          canvas.width,
          canvas.height
        );

        previousFrameRef.current = currentFrame;

        if (isDetecting) {
          onPoseDetected({
            keypoints,
            timestamp: Date.now()
          });

          // Draw keypoints
          drawKeypoints(keypoints, ctx, canvas.width, canvas.height);
        }
      } catch (error) {
        console.error('Error detecting pose:', error);
      }

      if (isDetecting) {
        animationRef.current = requestAnimationFrame(detectPose);
      }
    };

    detectPose();

    return () => {
      isDetecting = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [video, isActive, modelLoaded, onPoseDetected]);

  const detectMotionAndCreateKeypoints = (
    currentFrame: ImageData,
    previousFrame: ImageData | null,
    width: number,
    height: number
  ): Keypoint[] => {
    const keypoints: Keypoint[] = [];

    // Detect skin-like colors and motion to estimate body parts
    const regions = detectSkinRegions(currentFrame, width, height);
    
    // Create keypoints based on detected regions
    if (regions.topRegion) {
      // Head area
      keypoints.push({
        name: 'nose',
        x: regions.topRegion.x,
        y: regions.topRegion.y,
        score: 0.8
      });
      keypoints.push({
        name: 'left_ear',
        x: regions.topRegion.x - 30,
        y: regions.topRegion.y,
        score: 0.7
      });
      keypoints.push({
        name: 'right_ear',
        x: regions.topRegion.x + 30,
        y: regions.topRegion.y,
        score: 0.7
      });
      // Eyes
      keypoints.push({
        name: 'left_eye',
        x: regions.topRegion.x - 15,
        y: regions.topRegion.y - 5,
        score: 0.75
      });
      keypoints.push({
        name: 'right_eye',
        x: regions.topRegion.x + 15,
        y: regions.topRegion.y - 5,
        score: 0.75
      });
    }

    if (regions.upperRegion) {
      // Shoulders
      keypoints.push({
        name: 'left_shoulder',
        x: regions.upperRegion.x - 60,
        y: regions.upperRegion.y,
        score: 0.8
      });
      keypoints.push({
        name: 'right_shoulder',
        x: regions.upperRegion.x + 60,
        y: regions.upperRegion.y,
        score: 0.8
      });
    }

    if (regions.leftHand) {
      keypoints.push({
        name: 'left_wrist',
        x: regions.leftHand.x,
        y: regions.leftHand.y,
        score: regions.leftHand.confidence
      });
    }

    if (regions.rightHand) {
      keypoints.push({
        name: 'right_wrist',
        x: regions.rightHand.x,
        y: regions.rightHand.y,
        score: regions.rightHand.confidence
      });
    }

    // Lower body keypoints
    if (regions.lowerRegion) {
      keypoints.push({
        name: 'left_hip',
        x: regions.lowerRegion.x - 40,
        y: regions.lowerRegion.y,
        score: regions.lowerRegion.confidence
      });
      keypoints.push({
        name: 'right_hip',
        x: regions.lowerRegion.x + 40,
        y: regions.lowerRegion.y,
        score: regions.lowerRegion.confidence
      });
    }

    if (regions.kneeRegion) {
      keypoints.push({
        name: 'left_knee',
        x: regions.kneeRegion.x - 30,
        y: regions.kneeRegion.y,
        score: regions.kneeRegion.confidence
      });
      keypoints.push({
        name: 'right_knee',
        x: regions.kneeRegion.x + 30,
        y: regions.kneeRegion.y,
        score: regions.kneeRegion.confidence
      });
    }

    return keypoints;
  };

  const detectSkinRegions = (frame: ImageData, width: number, height: number) => {
    const data = frame.data;
    let topY = height;
    let topX = width / 2;
    let skinPixels = 0;

    const handRegions: { x: number; y: number; pixels: number }[] = [];

    // Simple skin detection (very basic, works better in good lighting)
    for (let y = 0; y < height; y += 8) {
      for (let x = 0; x < width; x += 8) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Basic skin tone detection
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15) {
          skinPixels++;
          
          if (y < topY) {
            topY = y;
            topX = x;
          }

          // Detect hand regions (upper areas of the frame)
          if (y < height * 0.6) {
            handRegions.push({ x, y, pixels: 1 });
          }
        }
      }
    }

    // Cluster hand regions
    const leftHand = handRegions.filter(r => r.x < width * 0.4).sort((a, b) => a.y - b.y)[0];
    const rightHand = handRegions.filter(r => r.x > width * 0.6).sort((a, b) => a.y - b.y)[0];

    // Detect lower body regions
    const lowerBodyRegions = handRegions.filter(r => r.y > height * 0.5 && r.y < height * 0.75);
    const lowerRegion = lowerBodyRegions.length > 0 ? 
      { x: width / 2, y: topY + 200, confidence: 0.6 } : null;

    const kneeRegions = handRegions.filter(r => r.y > height * 0.7);
    const kneeRegion = kneeRegions.length > 0 ?
      { x: width / 2, y: topY + 320, confidence: 0.5 } : null;

    return {
      topRegion: skinPixels > 50 ? { x: topX, y: topY } : null,
      upperRegion: skinPixels > 50 ? { x: width / 2, y: topY + 80 } : null,
      leftHand: leftHand ? { ...leftHand, confidence: 0.7 } : null,
      rightHand: rightHand ? { ...rightHand, confidence: 0.7 } : null,
      lowerRegion: lowerRegion,
      kneeRegion: kneeRegion
    };
  };

  const drawKeypoints = (
    keypoints: Keypoint[],
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFB6C1';
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#8B4513';
        ctx.font = '10px sans-serif';
        ctx.fillText(keypoint.name, keypoint.x + 10, keypoint.y - 10);
      }
    });
  };

  return null;
}
