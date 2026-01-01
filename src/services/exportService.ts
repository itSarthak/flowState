import { FlowSession } from '../types';

export const exportService = {
  exportToJSON: (sessions: FlowSession[]) => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, `flow-sessions-export-${new Date().toISOString().split('T')[0]}.json`);
  },

  exportToCSV: (sessions: FlowSession[]) => {
    if (sessions.length === 0) return;
    
    const headers = ['Goal', 'Duration (min)', 'Flow Score', 'Interruptions', 'Shipped', 'Thinking %', 'Coding %', 'Debugging %', 'Waiting %', 'Notes', 'Start Time', 'End Time'];
    
    const rows = sessions.map(s => [
      `"${s.goal.replace(/"/g, '""')}"`,
      s.leadTimeMinutes,
      s.flowScore,
      s.interruptions,
      s.shipped ? 'Yes' : 'No',
      s.bottleneck.thinking,
      s.bottleneck.coding,
      s.bottleneck.debugging,
      s.bottleneck.waiting,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      new Date(s.startTime).toLocaleString(),
      new Date(s.endTime).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `flow-sessions-export-${new Date().toISOString().split('T')[0]}.csv`);
  }
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
