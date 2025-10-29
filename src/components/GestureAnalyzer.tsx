import { useEffect, useRef } from 'react';
import { PoseData } from './PoseDetector';

export interface GestureState {
  isWaving: boolean;
  isSpeaking: boolean;
  handPosition: 'up' | 'down' | 'neutral';
  mouthMovement: number;
  eyesClosed: boolean;
  posture: 'sitting' | 'standing' | 'moving' | 'unknown';
  movementLevel: number;
}

interface GestureAnalyzerProps {
  poseData: PoseData | null;
  onGestureDetected: (gesture: GestureState) => void;
}

export function GestureAnalyzer({ poseData, onGestureDetected }: GestureAnalyzerProps) {
  const handHistoryRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const mouthHistoryRef = useRef<number[]>([]);
  const bodyPositionHistoryRef = useRef<{ centerY: number; timestamp: number }[]>([]);
  const eyeHistoryRef = useRef<number[]>([]);
  const gestureStateRef = useRef<GestureState>({
    isWaving: false,
    isSpeaking: false,
    handPosition: 'neutral',
    mouthMovement: 0,
    eyesClosed: false,
    posture: 'unknown',
    movementLevel: 0
  });

  useEffect(() => {
    if (!poseData) return;

    const { keypoints } = poseData;
    
    // Find key points
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const nose = keypoints.find(kp => kp.name === 'nose');
    const leftEar = keypoints.find(kp => kp.name === 'left_ear');
    const rightEar = keypoints.find(kp => kp.name === 'right_ear');
    const leftEye = keypoints.find(kp => kp.name === 'left_eye');
    const rightEye = keypoints.find(kp => kp.name === 'right_eye');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
    const rightKnee = keypoints.find(kp => kp.name === 'right_knee');

    let newGestureState = { ...gestureStateRef.current };

    // Detect hand waving
    const activeWrist = (leftWrist?.score || 0) > (rightWrist?.score || 0) ? leftWrist : rightWrist;
    const activeShoulder = (leftWrist?.score || 0) > (rightWrist?.score || 0) ? leftShoulder : rightShoulder;

    if (activeWrist && activeWrist.score && activeWrist.score > 0.3 && activeShoulder && activeShoulder.score && activeShoulder.score > 0.3) {
      // Check if hand is up
      const handIsUp = activeWrist.y < activeShoulder.y;
      newGestureState.handPosition = handIsUp ? 'up' : 'down';

      // Track hand movement for waving detection
      if (handIsUp) {
        handHistoryRef.current.push({
          x: activeWrist.x,
          y: activeWrist.y,
          timestamp: poseData.timestamp
        });

        // Keep only last 30 frames (about 1 second at 30fps)
        if (handHistoryRef.current.length > 30) {
          handHistoryRef.current.shift();
        }

        // Detect waving pattern (horizontal movement)
        const isWaving = detectWavingPattern(handHistoryRef.current);
        newGestureState.isWaving = isWaving;
      } else {
        handHistoryRef.current = [];
        newGestureState.isWaving = false;
      }
    } else {
      newGestureState.handPosition = 'neutral';
      newGestureState.isWaving = false;
      handHistoryRef.current = [];
    }

    // Detect mouth movement (speaking)
    if (nose && leftEar && rightEar && nose.score && nose.score > 0.3 && leftEar.score && leftEar.score > 0.3 && rightEar.score && rightEar.score > 0.3) {
      const earDistance = Math.abs(leftEar.x - rightEar.x);
      const mouthOpenness = calculateMouthMovement(nose, leftEar, rightEar);
      
      mouthHistoryRef.current.push(mouthOpenness);
      
      if (mouthHistoryRef.current.length > 20) {
        mouthHistoryRef.current.shift();
      }

      const mouthVariance = calculateVariance(mouthHistoryRef.current);
      newGestureState.isSpeaking = mouthVariance > 0.0001;
      newGestureState.mouthMovement = mouthVariance;
    } else {
      newGestureState.isSpeaking = false;
      newGestureState.mouthMovement = 0;
      mouthHistoryRef.current = [];
    }

    // Detect eye closing
    if (leftEye && rightEye && leftEye.score && leftEye.score > 0.3 && rightEye.score && rightEye.score > 0.3 && nose && nose.score && nose.score > 0.3) {
      const eyeDistance = Math.abs(leftEye.y - rightEye.y);
      const headHeight = nose.y;
      
      // Normalize eye distance relative to face size
      const normalizedEyeDistance = eyeDistance / (headHeight || 1);
      
      eyeHistoryRef.current.push(normalizedEyeDistance);
      
      if (eyeHistoryRef.current.length > 10) {
        eyeHistoryRef.current.shift();
      }

      // Eyes are considered closed if normalized distance is very small
      const avgEyeDistance = eyeHistoryRef.current.reduce((a, b) => a + b, 0) / eyeHistoryRef.current.length;
      newGestureState.eyesClosed = avgEyeDistance < 0.02;
    } else {
      newGestureState.eyesClosed = false;
      eyeHistoryRef.current = [];
    }

    // Detect posture (sitting/standing) and movement
    if (leftShoulder && rightShoulder && leftHip && rightHip && 
        leftShoulder.score && leftShoulder.score > 0.3 && 
        rightShoulder.score && rightShoulder.score > 0.3 &&
        leftHip.score && leftHip.score > 0.3 &&
        rightHip.score && rightHip.score > 0.3) {
      
      const shoulderCenter = {
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      const hipCenter = {
        y: (leftHip.y + rightHip.y) / 2
      };
      
      // Calculate torso length
      const torsoLength = Math.abs(hipCenter.y - shoulderCenter.y);
      
      // Track body position for movement detection
      const bodyCenter = (shoulderCenter.y + hipCenter.y) / 2;
      bodyPositionHistoryRef.current.push({
        centerY: bodyCenter,
        timestamp: poseData.timestamp
      });

      if (bodyPositionHistoryRef.current.length > 20) {
        bodyPositionHistoryRef.current.shift();
      }

      // Calculate movement level
      if (bodyPositionHistoryRef.current.length >= 10) {
        const positions = bodyPositionHistoryRef.current.map(p => p.centerY);
        const movementVariance = calculateVariance(positions);
        newGestureState.movementLevel = movementVariance;

        // Determine if moving
        const isMoving = movementVariance > 50;

        if (isMoving) {
          newGestureState.posture = 'moving';
        } else {
          // Determine sitting vs standing based on body proportions
          // When sitting, the visible torso appears longer relative to total body
          // and hips are typically in the lower portion of the frame
          
          const kneeVisible = (leftKnee && leftKnee.score && leftKnee.score > 0.2) || 
                             (rightKnee && rightKnee.score && rightKnee.score > 0.2);
          
          if (kneeVisible && leftKnee && rightKnee) {
            const kneeCenter = {
              y: ((leftKnee.y || 0) + (rightKnee.y || 0)) / 2
            };
            
            const legLength = Math.abs(kneeCenter.y - hipCenter.y);
            const totalHeight = Math.abs(kneeCenter.y - shoulderCenter.y);
            
            // When standing, legs are visible and proportional
            // When sitting, legs are compressed or less visible
            if (legLength > torsoLength * 0.8 && totalHeight > torsoLength * 1.5) {
              newGestureState.posture = 'standing';
            } else {
              newGestureState.posture = 'sitting';
            }
          } else {
            // If knees not visible, likely sitting (lower body out of frame)
            // or upper body shot only
            newGestureState.posture = hipCenter.y > 300 ? 'sitting' : 'unknown';
          }
        }
      } else {
        newGestureState.posture = 'unknown';
        newGestureState.movementLevel = 0;
      }
    } else {
      newGestureState.posture = 'unknown';
      newGestureState.movementLevel = 0;
      bodyPositionHistoryRef.current = [];
    }

    gestureStateRef.current = newGestureState;
    onGestureDetected(newGestureState);
  }, [poseData]);

  const detectWavingPattern = (history: { x: number; y: number; timestamp: number }[]): boolean => {
    if (history.length < 15) return false;

    let directionChanges = 0;
    let lastDirection = 0;

    for (let i = 1; i < history.length; i++) {
      const deltaX = history[i].x - history[i - 1].x;
      
      if (Math.abs(deltaX) > 5) {
        const currentDirection = deltaX > 0 ? 1 : -1;
        
        if (lastDirection !== 0 && currentDirection !== lastDirection) {
          directionChanges++;
        }
        
        lastDirection = currentDirection;
      }
    }

    return directionChanges >= 3;
  };

  const calculateMouthMovement = (
    nose: any,
    leftEar: any,
    rightEar: any
  ): number => {
    const headHeight = Math.abs(nose.y - (leftEar.y + rightEar.y) / 2);
    return headHeight;
  };

  const calculateVariance = (values: number[]): number => {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  };

  return null;
}
