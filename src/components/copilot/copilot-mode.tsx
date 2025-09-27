'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Recipe } from '@/lib/types';
import { ChevronLeft, ChevronRight, Mic, X, Play, Pause, RefreshCw, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface CoPilotModeProps {
  recipe: Recipe;
  onExit: () => void;
}

const parseTime = (instruction: string): number | null => {
  const timeRegex = /(\d+)\s*(minutes|minute|min|seconds|second|sec)/i;
  const match = instruction.match(timeRegex);
  if (match) {
    let time = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('m')) {
      time *= 60; // convert minutes to seconds
    }
    return time;
  }
  return null;
};

// Simple Speech Recognition hook
const useSpeechRecognition = (onCommand: (command: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log(`Voice command heard: ${transcript}`);
            onCommand(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };        recognition.onend = () => {
            if (isListening) {
              // Restart listening if it was unintentionally stopped
              recognition.start();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [onCommand]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Could not start speech recognition:", e);
            }
        }
    };
    
    return { isListening, toggleListening, isSupported: !!recognitionRef.current };
};


export default function CoPilotMode({ recipe, onExit }: CoPilotModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Text-to-speech hook
  const { 
    isSupported: ttsSupported, 
    isSpeaking, 
    isPaused: ttsPaused, 
    speak, 
    stop: stopSpeech, 
    toggle: toggleSpeech 
  } = useTextToSpeech({
    rate: 0.9,
    volume: 0.8
  });

  const steps = useMemo(() => {
    return recipe.instructions
      .split('\n')
      .map((s) => s.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }, [recipe.instructions]);

  const stepTime = useMemo(() => parseTime(steps[currentStep] || ''), [steps, currentStep]);

  useEffect(() => {
    setTimer(stepTime);
    setIsTimerRunning(false);
  }, [currentStep, stepTime]);

  useEffect(() => {
    if (isTimerRunning && timer !== null && timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((t) => (t !== null ? t - 1 : null));
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      toast({ title: "Time's up!", description: `The timer for step ${currentStep + 1} has finished.` });
      // Optionally play a sound
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timer, currentStep, toast]);
  
  const handleCommand = (command: string) => {
    if (command.includes('next')) {
      handleNext();
    } else if (command.includes('previous') || command.includes('back')) {
      handlePrevious();
    } else if (command.includes('start timer')) {
      toggleTimer();
    } else if (command.includes('exit') || command.includes('finish')) {
      onExit();
    }
  };

  const { isListening, toggleListening, isSupported } = useSpeechRecognition(handleCommand);

  useEffect(() => {
    // Reset to first step when recipe changes
    setCurrentStep(0);
    
    // Stop any ongoing speech when recipe changes or component unmounts
    return () => {
      stopSpeech();
    };
  }, [recipe, stopSpeech]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(p => p + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(p => p - 1);
    }
  };

  // Function to read the current step aloud
  const readCurrentStep = useCallback(() => {
    const stepText = steps[currentStep];
    if (stepText && ttsSupported) {
      speak(stepText);
    }
  }, [currentStep, steps, ttsSupported, speak]);

  // Handle exit with cleanup
  const handleExit = () => {
    stopSpeech(); // Stop any ongoing speech
    onExit();
  };

  // Auto-read step when it changes (optional - can be enabled/disabled)
  useEffect(() => {
    // Automatically read the step when it changes
    if (ttsSupported && steps[currentStep]) {
      // Stop any ongoing speech first
      stopSpeech();
      
      // Add a delay to allow UI to update and previous speech to fully stop
      const timeoutId = setTimeout(() => {
        readCurrentStep();
      }, 600);
      
      return () => {
        clearTimeout(timeoutId);
        stopSpeech();
      };
    }
  }, [currentStep, steps, ttsSupported, stopSpeech, readCurrentStep]);

  const toggleTimer = () => {
    if (timer !== null) {
      setIsTimerRunning(prev => !prev);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimer(stepTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="flex flex-col h-full items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-3xl flex flex-col h-full sm:max-h-[90vh] shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-headline text-primary">{recipe.recipeName}</CardTitle>
                <CardDescription>Co-Pilot Mode: Step-by-step guidance</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleExit} aria-label="Exit CoPilot Mode">
                <X className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-card/50 rounded-lg relative overflow-hidden m-6 mt-0">
            <div key={currentStep} className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500 w-full">
                <p className="text-2xl md:text-4xl font-semibold">{steps[currentStep]}</p>
                {timer !== null && (
                  <div className="mt-8 space-y-4 animate-in fade-in duration-700">
                    <p className="text-6xl font-bold font-mono tracking-tighter text-primary">{formatTime(timer)}</p>
                    <div className="flex justify-center gap-2">
                       <Button onClick={toggleTimer} size="lg" className="w-32">
                         {isTimerRunning ? <Pause className="mr-2 h-5 w-5"/> : <Play className="mr-2 h-5 w-5" />}
                         {isTimerRunning ? 'Pause' : 'Start'}
                       </Button>
                       <Button onClick={resetTimer} variant="outline" size="lg">
                         <RefreshCw className="mr-2 h-5 w-5" />
                         Reset
                       </Button>
                    </div>
                  </div>
                )}
            </div>
        </CardContent>

        <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-center text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>

            <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="w-full"
                aria-label="Previous Step"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center justify-center gap-2">
                {ttsSupported && (
                  <Button 
                    variant={isSpeaking ? "default" : "ghost"}
                    size="icon" 
                    className={cn(
                      "w-12 h-12 rounded-full text-accent-foreground shadow-lg hover:scale-105 transition-all",
                      isSpeaking ? "bg-secondary animate-pulse" : "bg-accent"
                    )}
                    onClick={isSpeaking ? toggleSpeech : readCurrentStep}
                    aria-label={isSpeaking ? (ttsPaused ? "Resume reading" : "Pause reading") : "Read step aloud"}
                  >
                    {isSpeaking ? (ttsPaused ? <Volume2 className="h-5 w-5"/> : <VolumeX className="h-5 w-5"/>) : <Volume2 className="h-5 w-5"/>}
                  </Button>
                )}
                
                {isSupported && (
                  <Button 
                    variant={isListening ? "default" : "ghost"}
                    size="icon" 
                    className={cn(
                      "w-12 h-12 rounded-full text-accent-foreground shadow-lg hover:scale-105 transition-all",
                      isListening ? "bg-primary animate-pulse" : "bg-accent"
                    )}
                    onClick={toggleListening}
                    aria-label={isListening ? "Stop voice commands" : "Use voice commands"}
                  >
                    {isListening ? <Mic className="h-5 w-5"/> : <MicOff className="h-5 w-5"/>}
                  </Button>
                )}
              </div>

              {currentStep < steps.length - 1 ? (
                 <Button onClick={handleNext} className="w-full" aria-label="Next Step">
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleExit} variant="destructive" className="w-full" aria-label="Finish Cooking">
                    Finish
                    <X className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>
        </div>
      </Card>
    </div>
  );
}

    