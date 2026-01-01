import { useState, useEffect, useRef } from 'react';
import { CurrentSession } from '../types';
import { notificationService } from '../services/notificationService';

export const useTimer = (currentSession: CurrentSession | null, notificationInterval: number) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const lastNotificationTimeRef = useRef<number>(0);

  useEffect(() => {
    if (currentSession) {
      lastNotificationTimeRef.current = Date.now();
    }
  }, [currentSession?.startTime]);

  useEffect(() => {
    let intervalId: number;
    if (currentSession) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        setCurrentTime(now);

        const elapsedMinutes = (now - currentSession.startTime) / 60000;
        const lastNotificationElapsed = (now - lastNotificationTimeRef.current) / 60000;

        if (elapsedMinutes >= notificationInterval && lastNotificationElapsed >= notificationInterval) {
          notificationService.trigger(currentSession.goal, Math.floor(elapsedMinutes));
          lastNotificationTimeRef.current = now;
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [currentSession, notificationInterval]);

  const activeDurationMinutes = currentSession 
    ? Math.floor((currentTime - currentSession.startTime) / 60000) 
    : 0;

  return {
    activeDurationMinutes,
    currentTime
  };
};
