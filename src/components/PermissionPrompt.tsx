import { Camera, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PermissionPromptProps {
  onRequestPermission: () => void;
  isRequesting: boolean;
}

export function PermissionPrompt({ onRequestPermission, isRequesting }: PermissionPromptProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/90 to-background/90 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <Card className="max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6 bg-card border-2 border-border shadow-xl my-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2>Camera Access Required</h2>
          <p className="text-sm text-muted-foreground">
            This application needs access to your camera to detect body language and gestures in real-time.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <strong>Privacy First:</strong> All processing happens locally in your browser. No video is recorded or transmitted.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <strong>Real-time Detection:</strong> Detects hand waving, speaking, posture, movement, and eye closing.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onRequestPermission} 
            className="w-full gap-2"
            disabled={isRequesting}
          >
            <Camera className="w-4 h-4" />
            {isRequesting ? 'Requesting Access...' : 'Grant Camera Access'}
          </Button>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
              <p className="text-xs">
                <strong>What Happens Next:</strong>
              </p>
            </div>
            <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
              <li>Click &quot;Grant Camera Access&quot; button above</li>
              <li>Your browser will show a permission popup</li>
              <li>Click &quot;Allow&quot; or &quot;Yes&quot; in that popup</li>
              <li>Camera will start and detection begins!</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-accent/20">
              <strong>Note:</strong> If you accidentally click &quot;Block&quot; or &quot;Deny&quot;, you&apos;ll need to manually enable camera access in your browser settings (look for the camera icon in the address bar).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
