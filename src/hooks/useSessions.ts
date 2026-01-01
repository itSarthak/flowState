import { useState, useEffect } from 'react';
import { FlowSession, CurrentSession } from '../types';
import { storageService } from '../services/storageService';
import { dbService } from '../services/dbService';

export const useSessions = () => {
  const [sessions, setSessions] = useState<FlowSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [notificationInterval, setNotificationInterval] = useState(60);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      // 1. Load Meta from LocalStorage (fast)
      const meta = storageService.loadMeta();
      if (meta) {
        if (meta.currentSession) setCurrentSession(meta.currentSession);
        if (meta.notificationInterval) setNotificationInterval(meta.notificationInterval);
      }

      // 2. Load Sessions from IndexedDB, fallback to LS
      try {
        const dbSessions = await dbService.getAll();
        if (dbSessions && dbSessions.length > 0) {
          // Sort by endTime descending (latest first)
          setSessions(dbSessions.sort((a, b) => b.endTime - a.endTime));
        } else {
          const fallback = storageService.loadSessionsFallback();
          setSessions(fallback);
        }
      } catch (e) {
        console.error("DB load failed, using fallback", e);
        const fallback = storageService.loadSessionsFallback();
        setSessions(fallback);
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Save Meta on change
  useEffect(() => {
    if (!isLoaded) return;
    storageService.saveMeta({ currentSession, notificationInterval });
  }, [currentSession, notificationInterval, isLoaded]);

  // Save Sessions on change
  useEffect(() => {
    if (!isLoaded) return;
    
    // Async save to DB
    dbService.saveAll(sessions).catch(e => console.error("DB save failed", e));
    
    // Sync fallback save to LS
    storageService.saveSessionsFallback(sessions);
  }, [sessions, isLoaded]);

  const handleStartFlow = (goal: string) => {
    setCurrentSession({
      goal,
      startTime: Date.now()
    });
  };

  const handleCompleteSession = (data: Omit<FlowSession, 'id' | 'goal' | 'startTime' | 'endTime' | 'leadTimeMinutes'>) => {
    if (!currentSession) return;

    const endTime = Date.now();
    const durationMs = endTime - currentSession.startTime;
    const durationMin = Math.round(durationMs / 60000);

    const newSession: FlowSession = {
      ...data,
      id: crypto.randomUUID(),
      goal: currentSession.goal,
      startTime: currentSession.startTime,
      endTime: endTime,
      leadTimeMinutes: durationMin,
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(null);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return {
    sessions,
    currentSession,
    setCurrentSession,
    notificationInterval,
    setNotificationInterval,
    handleStartFlow,
    handleCompleteSession,
    handleDeleteSession
  };
};
