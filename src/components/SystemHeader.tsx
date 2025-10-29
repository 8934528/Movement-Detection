import { useState } from 'react';
import { Video, VideoOff, Settings, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { SettingsModal } from './SettingsModal';
import { InfoPopover } from './InfoPopover';

interface SystemHeaderProps {
  isActive: boolean;
  onToggleCamera: () => void;
  modelStatus: 'loading' | 'ready' | 'error';
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SystemHeader({ isActive, onToggleCamera, modelStatus, theme, onThemeChange }: SystemHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="bg-card border-b-2 border-secondary">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 sm:p-6 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1>Detect</h1>
            <p className="text-sm text-muted-foreground">
              Real-time gesture and movement analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <Badge 
            variant={modelStatus === 'ready' ? 'default' : modelStatus === 'loading' ? 'secondary' : 'destructive'}
            className={`${modelStatus === 'ready' ? 'bg-accent text-accent-foreground' : ''} whitespace-nowrap`}
          >
            {modelStatus === 'loading' && 'Loading Model...'}
            {modelStatus === 'ready' && 'Model Ready'}
            {modelStatus === 'error' && 'Camera Error'}
          </Badge>

          <Button
            onClick={onToggleCamera}
            variant={isActive ? 'default' : 'outline'}
            className="gap-2 flex-1 sm:flex-initial"
          >
            {isActive ? (
              <>
                <VideoOff className="w-4 h-4" />
                <span className="hidden sm:inline">Stop Camera</span>
                <span className="sm:hidden">Stop</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Start Camera</span>
                <span className="sm:hidden">Start</span>
              </>
            )}
          </Button>

          <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>

          <InfoPopover />
        </div>
      </div>
      
      {modelStatus === 'error' && (
        <div className="px-6 pb-4">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Camera Permission Required:</strong> Click "Start Camera" and allow access when your browser prompts you. 
              If you denied permission, click the camera icon in your browser's address bar to update settings.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <SettingsModal 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </div>
  );
}
