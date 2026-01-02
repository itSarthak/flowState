
export type FlowScore = 1 | 2 | 3 | 4 | 5;

export interface Bottlenecks {
  thinking: number;
  coding: number;
  debugging: number;
  waiting: number;
}

export interface FlowSession {
  id: string;
  goal: string;
  startTime: number; // timestamp
  endTime: number;   // timestamp
  flowScore: FlowScore;
  interruptions: number;
  shipped: boolean;
  leadTimeMinutes: number;
  bottleneck: Bottlenecks;
  notes?: string;
  tagId?: string;
}

export interface Tag {
  id: string;
  name: string;
  status: 'active' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export interface CurrentSession {
  id: string;
  goal: string;
  startTime: number;
  tagId?: string;
}
