export const STORAGE_KEY_META = 'flow_dashboard_meta_v2';
export const STORAGE_KEY_SESSIONS = 'flow_dashboard_sessions_v2'; // LocalStorage fallback key

export const storageService = {
  saveMeta: (data: { currentSession: any, notificationInterval: number }) => {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(data));
  },
  loadMeta: () => {
    const saved = localStorage.getItem(STORAGE_KEY_META);
    return saved ? JSON.parse(saved) : null;
  },
  saveSessionsFallback: (sessions: any[]) => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  },
  loadSessionsFallback: () => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    return saved ? JSON.parse(saved) : [];
  }
};
