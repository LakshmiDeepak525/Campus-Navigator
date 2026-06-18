import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import type { AlgoStep, Graph } from '../store/useStore';

interface UseAlgoRunnerOptions {
  endpoint: string;
  extraBody?: Record<string, unknown>;
}

export function useAlgoRunner({ endpoint, extraBody = {} }: UseAlgoRunnerOptions) {
  const graph = useStore(s => s.graph);
  const animationSpeed = useStore(s => s.animationSpeed);
  const setServerOnline = useStore(s => s.setServerOnline);

  const [steps, setSteps] = useState<AlgoStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const runAlgo = useCallback(async (body?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    stopInterval();
    setCurrentStep(0);
    setSteps([]);
    try {
      const res = await axios.post(endpoint, { graph, ...extraBody, ...(body || {}) });
      const data = res.data;
      // Handle MST nested response
      const stepsArr: AlgoStep[] = data.steps || data.kruskal?.steps || [];
      setSteps(stepsArr);
      setServerOnline(true);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e.message || 'Unknown error';
      setError(msg);
      if (!e?.response) setServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, graph, extraBody, setServerOnline]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            stopInterval();
            return prev;
          }
          return prev + 1;
        });
      }, animationSpeed);
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [isPlaying, animationSpeed, steps.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.code === 'ArrowRight') { e.preventDefault(); setCurrentStep(p => Math.min(p + 1, steps.length - 1)); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); setCurrentStep(p => Math.max(p - 1, 0)); }
      if (e.code === 'KeyR') { e.preventDefault(); setCurrentStep(0); setIsPlaying(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [steps.length]);

  const current = steps[currentStep] ?? null;

  return {
    steps,
    currentStep,
    current,
    isPlaying,
    isLoading,
    error,
    runAlgo,
    play:  () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next:  () => { stopInterval(); setIsPlaying(false); setCurrentStep(p => Math.min(p + 1, steps.length - 1)); },
    prev:  () => { stopInterval(); setIsPlaying(false); setCurrentStep(p => Math.max(p - 1, 0)); },
    reset: () => { stopInterval(); setIsPlaying(false); setCurrentStep(0); },
    skipToEnd: () => { stopInterval(); setIsPlaying(false); setCurrentStep(steps.length - 1); },
    jumpToStep: (index: number) => { stopInterval(); setIsPlaying(false); setCurrentStep(Math.max(0, Math.min(index, steps.length - 1))); },
  };
}
