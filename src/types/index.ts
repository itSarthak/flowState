
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
}

export interface CurrentSession {
  goal: string;
  startTime: number;
}
