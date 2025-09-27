'use client';

import { useEffect, useRef, useState } from 'react';

interface UseTextToSpeechOptions {
  rate?: number; // Speed of speech (0.1 to 10)
  pitch?: number; // Pitch of speech (0 to 2)
  volume?: number; // Volume (0 to 1)
  voice?: string; // Voice name
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if running in browser and if speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
      };

      // Load voices immediately and also when they change
      loadVoices();
      if (synthRef.current) {
        synthRef.current.addEventListener('voiceschanged', loadVoices);
      }

      return () => {
        if (synthRef.current) {
          synthRef.current.removeEventListener('voiceschanged', loadVoices);
        }
      };
    }
  }, []);

  const speak = (text: string) => {
    if (!synthRef.current || !text.trim()) return;

    // Cancel any ongoing speech first
    synthRef.current.cancel();
    
    // Small delay to ensure cancellation is processed
    setTimeout(() => {
      if (!synthRef.current) return;
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      
      // Set voice if specified
      if (options.voice) {
        const selectedVoice = voices.find(voice => 
          voice.name === options.voice || voice.name.includes(options.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        // Only log errors that aren't interruptions
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      
      try {
        synthRef.current.speak(utterance);
      } catch (error) {
        console.error('Failed to speak:', error);
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      }
    }, 100);
  };

  const pause = () => {
    if (synthRef.current && isSpeaking && !isPaused) {
      try {
        synthRef.current.pause();
      } catch (error) {
        console.error('Failed to pause speech:', error);
      }
    }
  };

  const resume = () => {
    if (synthRef.current && isSpeaking && isPaused) {
      try {
        synthRef.current.resume();
      } catch (error) {
        console.error('Failed to resume speech:', error);
      }
    }
  };

  const stop = () => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (error) {
        // Silently handle cancellation errors
      }
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  };

  const toggle = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    }
  };

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    pause,
    resume,
    stop,
    toggle
  };
}