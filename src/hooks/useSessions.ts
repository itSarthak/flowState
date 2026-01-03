import { useState, useEffect } from 'react';
import { FlowSession, CurrentSession, FlowScore, Bottlenecks, Tag } from '../types';
import { storageService } from '../services/storageService';
import { dbService } from '../services/dbService';

export const useSessions = () => {
  const [sessions, setSessions] = useState<FlowSession[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
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
      
      // 3. Load Tags
      const storedTags = localStorage.getItem('flow_tags');
      if (storedTags) {
        try {
          setTags(JSON.parse(storedTags));
        } catch (e) {
          console.error("Failed to parse tags", e);
        }
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

  // Save Sessions and Tags on change
  useEffect(() => {
    if (!isLoaded) return;
    
    // Async save sessions to DB
    dbService.saveAll(sessions).catch(e => console.error("DB save failed", e));
    
    // Sync fallback save sessions to LS
    storageService.saveSessionsFallback(sessions);

    // Save tags to LS
    localStorage.setItem('flow_tags', JSON.stringify(tags));
  }, [sessions, isLoaded, tags]);

  const handleStartFlow = (goal: string, tagId?: string) => {
    const newSession: CurrentSession = {
      id: crypto.randomUUID(),
      goal,
      startTime: Date.now(),
      tagId
    };
    setCurrentSession(newSession);
  };

  const handleCompleteSession = (data: { 
    flowScore: FlowScore; 
    bottleneck: Bottlenecks; 
    shipped: boolean;
    interruptions: number;
    notes: string;
  }) => {
    if (!currentSession) return;

    const session: FlowSession = {
      ...currentSession,
      ...data,
      endTime: Date.now(),
      leadTimeMinutes: Math.floor((Date.now() - currentSession.startTime) / 60000)
    };

    setSessions(prev => [session, ...prev]);
    
    // If shipped, mark tag as completed
    if (data.shipped && currentSession.tagId) {
      setTags(prev => prev.map(t => 
        t.id === currentSession.tagId 
          ? { ...t, status: 'completed', completedAt: session.endTime } 
          : t
      ));
    }

    setCurrentSession(null);
  };

  const handleUpdateSession = (id: string, updates: Partial<FlowSession>) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));

    // Handle retroactive shipping: If update includes shipped: true, mark tag as completed
    if (updates.shipped) {
       const session = sessions.find(s => s.id === id);
       
       // Determine the final tag ID for this session
       // If 'tagId' is in updates, use it (could be undefined/null if removed)
       // Otherwise, fallback to the session's existing tagId
       let targetTagId = session?.tagId;
       if ('tagId' in updates) {
          targetTagId = updates.tagId;
       }
       
       if (targetTagId) {
         setTags(prev => prev.map(t => 
           t.id === targetTagId 
              ? { ...t, status: 'completed', completedAt: Date.now() } 
              : t
         ));
       }
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const createTag = (name: string) => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      status: 'active',
      createdAt: Date.now()
    };
    setTags(prev => [...prev, newTag]);
    return newTag.id;
  };

  return {
    sessions,
    tags,
    currentSession,
    setCurrentSession,
    notificationInterval,
    setNotificationInterval,
    handleStartFlow,
    handleCompleteSession,
    handleUpdateSession,
    handleDeleteSession,
    createTag,
    setSessions,
    setTags
  };
};
