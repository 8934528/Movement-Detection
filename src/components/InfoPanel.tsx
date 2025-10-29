import { Card } from './ui/card';
import { AlertCircle } from 'lucide-react';

export function InfoPanel() {
  return (
    <Card className="p-4 sm:p-6 bg-card border-2 border-secondary shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <AlertCircle className="w-5 h-5 text-primary" />
        </div>
        <h3>System Information</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2 border-b border-border">
          <span className="text-muted-foreground">Technology</span>
          <span className="sm:text-right">Browser Computer Vision</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2 border-b border-border">
          <span className="text-muted-foreground">Detection Model</span>
          <span className="sm:text-right">Real-time Motion Tracking</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2 border-b border-border">
          <span className="text-muted-foreground">Frame Rate</span>
          <span className="sm:text-right">~30 FPS</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2 border-b border-border">
          <span className="text-muted-foreground">Keypoints</span>
          <span className="sm:text-right">17 Body Points</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2">
          <span className="text-muted-foreground">Detections</span>
          <span className="sm:text-right">Gestures, Posture, Movement</span>
        </div>
      </div>
    </Card>
  );
}
