import { useState, useEffect, useRef } from 'react';
import { useTimer } from '../context/TimerContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Square, RotateCcw } from 'lucide-react';

const PHASE_DURATIONS = {
  discovery: 15,
  drilling: 25,
  integration: 10
};

export const PhaseTimer = () => {
  const { captureTime } = useTimer();
  const [phase, setPhase] = useState('discovery');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const phaseDuration = PHASE_DURATIONS[phase] * 60 * 1000; // Convert to ms
  const remainingMs = Math.max(0, phaseDuration - elapsedMs);
  const hasOverrun = elapsedMs > phaseDuration;

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedMs;
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setElapsedMs(elapsed);
      }, 10); // Update every 10ms for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    const minutes = Math.round(elapsedMs / 60000);
    console.log('⏱️ Timer stopped, capturing:', minutes, 'minutes');
    captureTime(minutes);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10); // Show 2 decimal places
    return { minutes, seconds, milliseconds };
  };

  const elapsed = formatTime(elapsedMs);
  const remaining = formatTime(remainingMs);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Phase Selector */}
        <div className="flex gap-2">
          {Object.keys(PHASE_DURATIONS).map(p => (
            <Button
              key={p}
              onClick={() => {
                setPhase(p);
                setElapsedMs(0);
                setIsRunning(false);
              }}
              variant={phase === p ? 'default' : 'outline'}
              size="sm"
              className="flex-1 capitalize"
            >
              {p}
            </Button>
          ))}
        </div>

        {/* Main Timer Display (Counting Up) */}
        <div className="text-center">
          <div className={`font-mono text-5xl font-bold transition-colors ${
            hasOverrun ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          }`}>
            {String(elapsed.minutes).padStart(2, '0')}:
            {String(elapsed.seconds).padStart(2, '0')}.
            <span className="text-3xl">{String(elapsed.milliseconds).padStart(2, '0')}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {hasOverrun ? 'Overtime!' : 'Elapsed Time'}
          </p>
        </div>

        {/* Countdown Timer (Small, Translucent) */}
        <div className="text-center opacity-50">
          <div className={`font-mono text-lg transition-colors ${
            hasOverrun ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {hasOverrun ? '+' : '−'}{String(Math.abs(remaining.minutes)).padStart(2, '0')}:
            {String(Math.abs(remaining.seconds)).padStart(2, '0')}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasOverrun ? 'Over target' : 'Remaining'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-100 ${
              hasOverrun ? 'bg-red-500' : 'bg-primary'
            }`}
            style={{ 
              width: `${Math.min(100, (elapsedMs / phaseDuration) * 100)}%` 
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="flex-1" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive" className="flex-1" size="lg">
              <Square className="h-5 w-5 mr-2" />
              Stop & Capture
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Phase Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-semibold capitalize">{phase} Phase</p>
          <p>Target: {PHASE_DURATIONS[phase]} minutes</p>
        </div>
      </div>
    </Card>
  );
};
