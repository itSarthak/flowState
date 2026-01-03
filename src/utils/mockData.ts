import { FlowSession, Tag, FlowScore, Bottlenecks } from '../types';

const GOALS = [
  "Refactor auth logic", "Implement stripe webhooks", "Design landing page", 
  "Fix mobile navigation", "Optimize DB queries", "Write documentation", 
  "Setup CI/CD", "Integrate analytics", "Build dashboard widgets", 
  "Deploy to staging", "Code review", "Debug memory leak", 
  "Update dependencies", "Testing suite", "Onboarding flow", "User settings UI"
];

const TAGS_DATA = [
  { name: "Feature", id: "t-feature" },
  { name: "Bug", id: "t-bug" },
  { name: "DevOps", id: "t-devops" },
  { name: "Design", id: "t-design" },
  { name: "Research", id: "t-research" }
];

export const generateMockData = () => {
  const sessions: FlowSession[] = [];
  const tags: Tag[] = TAGS_DATA.map(t => ({
    id: t.id,
    name: t.name,
    status: 'active',
    createdAt: new Date('2025-08-01').getTime()
  }));

  const start = new Date('2025-08-04').getTime(); // Start on Monday
  const end = new Date('2026-01-02').getTime(); // End before Jan 3
  const dayMs = 24 * 60 * 60 * 1000;

  // Pre-calculate which days will be 'no work' days
  const totalDays = Math.ceil((end - start) / dayMs);
  const noWorkDaysIndices = new Set<number>();
  while (noWorkDaysIndices.size < 10) {
    noWorkDaysIndices.add(Math.floor(Math.random() * totalDays));
  }

  let dayIndex = 0;
  for (let current = start; current <= end; current += dayMs) {
    if (noWorkDaysIndices.has(dayIndex)) {
      dayIndex++;
      continue;
    }

    // Number of sessions per day: 1 to 4
    const sessionsToday = Math.floor(Math.random() * 4) + 1; 

    for (let i = 0; i < sessionsToday; i++) {
      const startHour = 8 + (i * 3) + Math.floor(Math.random() * 2);
      const sessionStart = new Date(current).setHours(startHour, Math.floor(Math.random() * 60));
      const duration = 30 + Math.floor(Math.random() * 150); // 30m to 180m
      const sessionEnd = sessionStart + (duration * 60 * 1000);

      const bottleneck: Bottlenecks = {
        thinking: Math.floor(Math.random() * 10),
        coding: Math.floor(Math.random() * 10),
        debugging: Math.floor(Math.random() * 10),
        waiting: Math.floor(Math.random() * 5)
      };

      sessions.push({
        id: crypto.randomUUID(),
        goal: GOALS[Math.floor(Math.random() * GOALS.length)],
        startTime: sessionStart,
        endTime: sessionEnd,
        leadTimeMinutes: duration,
        flowScore: (Math.floor(Math.random() * 5) + 1) as FlowScore,
        interruptions: Math.floor(Math.random() * 4),
        shipped: Math.random() > 0.4,
        bottleneck,
        tagId: TAGS_DATA[Math.floor(Math.random() * TAGS_DATA.length)].id,
        notes: "Automated mock data for UI testing."
      });
    }
    dayIndex++;
  }

  return { sessions, tags };
};
