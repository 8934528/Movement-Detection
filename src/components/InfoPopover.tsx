import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Info, Camera, Activity, Zap, Shield } from 'lucide-react';
import { Separator } from './ui/separator';

export function InfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 max-h-[80vh] overflow-y-auto" align="end" side="bottom">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">About Detect</h4>
            <p className="text-sm text-muted-foreground">
              Real-time body language and gesture detection system powered by computer vision.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Privacy First</p>
                <p className="text-xs text-muted-foreground">
                  All processing happens in your browser. No data is sent to servers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Real-time Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Detects gestures and movements as they happen with low latency.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Native Performance</p>
                <p className="text-xs text-muted-foreground">
                  Uses browser-native computer vision for efficient processing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Secure & Local</p>
                <p className="text-xs text-muted-foreground">
                  Camera feed never leaves your device. Complete control over your data.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground">
              <strong>Supported Detections:</strong> Hand waving, speaking, eye closing, posture (sitting/standing), and movement tracking.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
