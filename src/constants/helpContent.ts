export interface HelpPoint {
  title: string;
  icon: string;
  content: string;
  details?: string;
  color: string;
}

export interface HelpSection {
  title: string;
  points: HelpPoint[];
}

export const helpContent: HelpSection[] = [
  {
    title: "Getting into Flow State",
    points: [
      {
        title: "What flow really is (not vibes)",
        icon: "lucide:target",
        color: "blue",
        content: "Flow (Mihaly Csikszentmihalyi’s research) happens when <strong>4 conditions</strong> align:\n\n• <u>Clear goal</u>\n• <u>Immediate feedback</u>\n• <u>Challenge slightly > skill</u>\n• <u>No cognitive interruptions</u>\n\n<em>Miss even one → no flow.</em>"
      },
      {
        title: "Engineer your environment",
        icon: "lucide:shield-check",
        color: "green",
        content: "<strong>Research-backed facts:</strong>\n• Every interruption costs <strong>~23 minutes</strong> to regain focus.\n• Multitasking reduces performance by <strong>40%</strong>.",
        details: "<strong>Actionable setup:</strong> Kill Slack/WhatsApp. One monitor = code only. Rule: If you might get pinged, you won’t enter flow."
      },
      {
        title: "Pre-commit your brain",
        icon: "lucide:brain-circuit",
        color: "purple",
        content: "Before you code, write <strong>ONE sentence:</strong>\n<em>'When this session ends, X will work.'</em>",
        details: "📌 <strong>Critical:</strong> Vague goals (e.g., 'work on auth') block deep flow. Success must be binary."
      },
      {
        title: "3️⃣ Biologically aligned blocks",
        icon: "lucide:timer",
        color: "orange",
        content: "<strong>Ultradian rhythm:</strong> Focus best in <strong>90–120 min</strong> cycles. Flow starts 15–25 min in.",
        details: "🚫 <strong>Pomodoro (25m)</strong> is bad for deep flow, good for beginners. Aim for 90m deep work + 15m full break."
      },
      {
        title: "Adjustable difficulty",
        icon: "lucide:gauge",
        color: "red",
        content: "Flow dies if task is <u>too easy</u> (boredom) or <u>too hard</u> (anxiety).",
        details: "<strong>Pro trick:</strong> Break tasks so each subtask is <em>barely uncomfortable</em>. Each subtask = flow candidate."
      },
      {
        title: "Dopamine discipline",
        icon: "lucide:zap",
        color: "yellow",
        content: "<strong>Neuroscience:</strong> Dopamine hits from social media reduce motivation for delayed rewards (coding).",
        details: "<strong>Rules:</strong> No scrolling before work. Dopamine <u>only</u> after shipping. Train: 'Shipping = reward'."
      }
    ]
  },
  {
    title: "Analyze Your Shipping Speed",
    points: [
      {
        title: "1️⃣ Define 'shipping' clearly",
        icon: "lucide:package-check",
        color: "blue",
        content: "<strong>Shipping ≠ coding.</strong> Shipping = usable output.",
        details: "Examples: PR approved, API deployed, UI visible. <u>Pick ONE definition</u> and stick to it."
      },
      {
        title: "Track Lead Time",
        icon: "lucide:activity",
        color: "emerald",
        content: "Lead Time = Time from <strong>'Started'</strong> → <strong>'Shipped'</strong>.\nTrack this for: Features, Bugs, Refactors.",
        details: "📊 Standard DORA metric used by high-performance engineering teams."
      },
      {
        title: "The 4 Bottlenecks",
        icon: "lucide:flask-conical",
        color: "rose",
        content: "Whichever dominates is your problem:\n• <strong>Thinking:</strong> Unclear reqs?\n• <strong>Coding:</strong> Skill gap?\n• <strong>Debugging:</strong> Poor feedback?\n• <strong>Waiting:</strong> Reviews/CI?",
        details: "Most assume it's (2). It's usually (1) or (4)."
      },
      {
        title: "Measure Flow Efficiency",
        icon: "lucide:bar-chart-3",
        color: "cyan",
        content: "Calculate: <strong>Output / Time</strong>.\nIf Time ↑ but Output ↓ → <u>distraction</u> or <u>vague goal</u>.",
        details: "Patterns emerge in ~2 weeks. Look for your peak focus windows."
      },
      {
        title: "Time to First Win",
        icon: "lucide:trophy",
        color: "amber",
        content: "Track: <em>How long until something works?</em>\nIf consistently <strong>>30 min</strong>, task is too big or feedback loop is slow.",
        details: "<strong>Fix this:</strong> Flow improves automatically once wins come early."
      }
    ]
  },
  {
    title: "Compounding Habits",
    points: [
      {
        title: "Daily shutdown ritual",
        icon: "lucide:moon",
        color: "indigo",
        content: "Write: <strong>What shipped</strong>, <strong>What blocked you</strong>, <strong>Next goal</strong>.",
        details: "Reduces 'Zeigarnik Effect' (cognitive load from unfinished tasks) overnight."
      },
      {
        title: "Ship ugly, then refine",
        icon: "lucide:hammer",
        color: "stone",
        content: "Perfectionism <u>kills</u> flow.",
        details: "<strong>Rule:</strong> Make it work → make it right → make it fast."
      },
      {
        title: "Public shipping",
        icon: "lucide:share-2",
        color: "sky",
        content: "Posting updates increases accountability and reinforces your <strong>identity as a shipper</strong>.",
        details: "<em>Identity > Motivation.</em>"
      }
    ]
  }
];
