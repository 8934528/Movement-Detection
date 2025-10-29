import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from './ui/button';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

// Settings stored in localStorage and cookies
interface Settings {
  detectionSensitivity: number;
  gestureThreshold: number;
  frameRate: number;
  showDebugInfo: boolean;
  audioFeedback: boolean;
  highlightDetections: boolean;
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function SettingsModal({ open, onOpenChange, theme, onThemeChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load from localStorage or cookies
    const stored = localStorage.getItem('detectionSettings');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const cookieSettings = getCookie('detectionSettings');
    if (cookieSettings) {
      return JSON.parse(cookieSettings);
    }
    
    return {
      detectionSensitivity: 70,
      gestureThreshold: 60,
      frameRate: 30,
      showDebugInfo: false,
      audioFeedback: true,
      highlightDetections: true,
    };
  });

  useEffect(() => {
    // Save to localStorage and cookies whenever settings change
    localStorage.setItem('detectionSettings', JSON.stringify(settings));
    setCookie('detectionSettings', JSON.stringify(settings));
    
    // Also store in session
    sessionStorage.setItem('detectionSettings', JSON.stringify(settings));
    sessionStorage.setItem('settingsLastModified', new Date().toISOString());
  }, [settings]);

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaults: Settings = {
      detectionSensitivity: 70,
      gestureThreshold: 60,
      frameRate: 30,
      showDebugInfo: false,
      audioFeedback: true,
      highlightDetections: true,
    };
    setSettings(defaults);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure detection parameters and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h4 className="text-sm">Appearance</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="flex-1">
                Theme
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onThemeChange('light')}
                  className="gap-2"
                >
                  <Sun className="w-3 h-3" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onThemeChange('dark')}
                  className="gap-2"
                >
                  <Moon className="w-3 h-3" />
                  Dark
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detection Settings */}
          <div className="space-y-4">
            <h4 className="text-sm">Detection Parameters</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sensitivity">
                  Detection Sensitivity
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings.detectionSensitivity}%
                </span>
              </div>
              <Slider
                id="sensitivity"
                min={10}
                max={100}
                step={5}
                value={[settings.detectionSensitivity]}
                onValueChange={([value]) => handleSettingChange('detectionSensitivity', value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values detect subtle movements
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="threshold">
                  Gesture Threshold
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings.gestureThreshold}%
                </span>
              </div>
              <Slider
                id="threshold"
                min={20}
                max={100}
                step={5}
                value={[settings.gestureThreshold]}
                onValueChange={([value]) => handleSettingChange('gestureThreshold', value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Minimum confidence for gesture recognition
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="framerate">Frame Rate</Label>
              <Select
                value={settings.frameRate.toString()}
                onValueChange={(value) => handleSettingChange('frameRate', parseInt(value))}
              >
                <SelectTrigger id="framerate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 FPS (Low)</SelectItem>
                  <SelectItem value="30">30 FPS (Medium)</SelectItem>
                  <SelectItem value="60">60 FPS (High)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher frame rates use more processing power
              </p>
            </div>
          </div>

          <Separator />

          {/* Display Options */}
          <div className="space-y-4">
            <h4 className="text-sm">Display Options</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug">Show Debug Info</Label>
                <p className="text-xs text-muted-foreground">
                  Display technical detection data
                </p>
              </div>
              <Switch
                id="debug"
                checked={settings.showDebugInfo}
                onCheckedChange={(checked) => handleSettingChange('showDebugInfo', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="highlight">Highlight Detections</Label>
                <p className="text-xs text-muted-foreground">
                  Visual markers on detected gestures
                </p>
              </div>
              <Switch
                id="highlight"
                checked={settings.highlightDetections}
                onCheckedChange={(checked) => handleSettingChange('highlightDetections', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Feedback Options */}
          <div className="space-y-4">
            <h4 className="text-sm">Feedback</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="audio">Audio Feedback</Label>
                <p className="text-xs text-muted-foreground">
                  Play sounds when gestures are detected
                </p>
              </div>
              <Switch
                id="audio"
                checked={settings.audioFeedback}
                onCheckedChange={(checked) => handleSettingChange('audioFeedback', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
