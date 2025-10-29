import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { GestureState } from './GestureAnalyzer';
import { Hand, MessageSquare, Activity, Eye, Users, TrendingUp } from 'lucide-react';

interface StatusPanelProps {
  gestureState: GestureState;
  isDetecting: boolean;
}

export function StatusPanel({ gestureState, isDetecting }: StatusPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 bg-card border-2 border-secondary shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h3 className="flex-1">Detection Status</h3>
          <Badge 
            variant={isDetecting ? "default" : "secondary"} 
            className={`${isDetecting ? 'bg-primary text-primary-foreground' : ''}`}
          >
            {isDetecting ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Hand Waving Detection */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border transition-colors gap-3 ${
            gestureState.isWaving 
              ? 'bg-accent/10 border-accent' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                gestureState.isWaving 
                  ? 'bg-accent/30' 
                  : 'bg-accent/20'
              }`}>
                <Hand className={`w-5 h-5 ${
                  gestureState.isWaving 
                    ? 'text-accent' 
                    : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-foreground">Hand Waving</p>
                <p className="text-sm text-muted-foreground">
                  Position: {gestureState.handPosition}
                </p>
              </div>
            </div>
            <Badge 
              variant={gestureState.isWaving ? "default" : "outline"}
              className={`${gestureState.isWaving ? "bg-accent text-accent-foreground" : ""} whitespace-nowrap`}
            >
              {gestureState.isWaving ? "Detected" : "Not Detected"}
            </Badge>
          </div>

          {/* Speaking Detection */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border transition-colors gap-3 ${
            gestureState.isSpeaking 
              ? 'bg-primary/10 border-primary' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                gestureState.isSpeaking 
                  ? 'bg-primary/30' 
                  : 'bg-accent/20'
              }`}>
                <MessageSquare className={`w-5 h-5 ${
                  gestureState.isSpeaking 
                    ? 'text-primary' 
                    : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-foreground">Speaking</p>
                <p className="text-sm text-muted-foreground">
                  Mouth movement: {gestureState.mouthMovement.toFixed(4)}
                </p>
              </div>
            </div>
            <Badge 
              variant={gestureState.isSpeaking ? "default" : "outline"}
              className={`${gestureState.isSpeaking ? "bg-accent text-accent-foreground" : ""} whitespace-nowrap`}
            >
              {gestureState.isSpeaking ? "Detected" : "Not Detected"}
            </Badge>
          </div>

          {/* Eye Closing Detection */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border transition-colors gap-3 ${
            gestureState.eyesClosed 
              ? 'bg-info/10 border-info' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                gestureState.eyesClosed 
                  ? 'bg-info/30' 
                  : 'bg-accent/20'
              }`}>
                <Eye className={`w-5 h-5 ${
                  gestureState.eyesClosed 
                    ? 'text-info' 
                    : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-foreground">Eyes Closed</p>
                <p className="text-sm text-muted-foreground">
                  Blink detection
                </p>
              </div>
            </div>
            <Badge 
              variant={gestureState.eyesClosed ? "default" : "outline"}
              className={`${gestureState.eyesClosed ? "bg-info text-info-foreground" : ""} whitespace-nowrap`}
            >
              {gestureState.eyesClosed ? "Detected" : "Not Detected"}
            </Badge>
          </div>

          {/* Posture Detection */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border transition-colors gap-3 ${
            gestureState.posture !== 'unknown'
              ? 'bg-success/10 border-success' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                gestureState.posture !== 'unknown'
                  ? 'bg-success/30' 
                  : 'bg-accent/20'
              }`}>
                <Users className={`w-5 h-5 ${
                  gestureState.posture !== 'unknown'
                    ? 'text-success' 
                    : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-foreground">Posture</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {gestureState.posture === 'unknown' ? 'Detecting...' : gestureState.posture}
                </p>
              </div>
            </div>
            <Badge 
              variant={gestureState.posture !== 'unknown' ? "default" : "outline"}
              className={`whitespace-nowrap ${
                gestureState.posture === 'sitting' ? "bg-success text-success-foreground" :
                gestureState.posture === 'standing' ? "bg-warning text-warning-foreground" :
                gestureState.posture === 'moving' ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {gestureState.posture === 'unknown' ? 'Unknown' : gestureState.posture}
            </Badge>
          </div>

          {/* Movement Detection */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border transition-colors gap-3 ${
            gestureState.movementLevel > 50
              ? 'bg-warning/10 border-warning' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                gestureState.movementLevel > 50
                  ? 'bg-warning/30' 
                  : 'bg-accent/20'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  gestureState.movementLevel > 50
                    ? 'text-warning' 
                    : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-foreground">Movement Level</p>
                <p className="text-sm text-muted-foreground">
                  Intensity: {gestureState.movementLevel.toFixed(1)}
                </p>
              </div>
            </div>
            <Badge 
              variant={gestureState.movementLevel > 50 ? "default" : "outline"}
              className={`${gestureState.movementLevel > 50 ? "bg-warning text-warning-foreground" : ""} whitespace-nowrap`}
            >
              {gestureState.movementLevel > 50 ? "Active" : "Stable"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Activity Log */}
      <Card className="p-4 sm:p-6 bg-card border-2 border-secondary">
        <h3 className="mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {gestureState.isWaving && (
            <div className="flex items-center gap-2 p-2 rounded bg-accent/20 border border-accent/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Waving gesture detected</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
          {gestureState.isSpeaking && (
            <div className="flex items-center gap-2 p-2 rounded bg-primary/20 border border-primary/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Speaking detected</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
          {gestureState.eyesClosed && (
            <div className="flex items-center gap-2 p-2 rounded bg-info/20 border border-info/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-info animate-pulse flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Eyes closed detected</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
          {gestureState.posture === 'moving' && (
            <div className="flex items-center gap-2 p-2 rounded bg-warning/20 border border-warning/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Movement detected</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
          {gestureState.posture === 'sitting' && (
            <div className="flex items-center gap-2 p-2 rounded bg-success/20 border border-success/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Sitting posture detected</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
          {gestureState.posture === 'standing' && (
            <div className="flex items-center gap-2 p-2 rounded bg-warning/20 border border-warning/30 text-sm">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse flex-shrink-0"></div>
              <span className="flex-1 min-w-0">Standing posture detected</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
          {!gestureState.isWaving && !gestureState.isSpeaking && !gestureState.eyesClosed && 
           gestureState.posture !== 'moving' && gestureState.posture !== 'sitting' && gestureState.posture !== 'standing' && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
