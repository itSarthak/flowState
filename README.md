<div align="center">
<h1>Flow and Shipping Dashboard</h1>
</div>

## Project Summary

The Flow and Shipping Dashboard is a high-performance productivity tool designed for software engineers and makers. It bridges the gap between **Deep Work (Flow)** and **Tangible Output (Shipping)**. By tracking focus sessions, analyzing shipping cycles, and identifying bottlenecks, it helps you optimize your engineering velocity.

## Key Features

### Shipping Cycles (New)

Track the "True Lead Time" of your features.

- **Tagging System**: Group multiple sessions under a single tag (e.g., "API Refactor").
- **Cycle Analysis**: Visualize exactly how many hours and sessions it took to ship a specific feature.
- **Auto-Completion**: Marking a session as "Shipped" automatically closes the cycle.

### Flow State Management

- **Focus Timer**: Distraction-free tracking of your deep work.
- **Flow Score**: Rate your focus quality (1-5) after every session to track mental performance.
- **Wisdom Mode**: Get random productivity insights and scientifically-backed flow tips via the "Get Wisdom" context menu.

### Advanced Performance Analytics

- **Activity Heatmap**: GitHub-style visualization of your daily momentum.
- **Infographics**: Detailed charts showing Focus Time, Average Quality, and Ship Rate trends (Day/Week/Month).
- **Bottleneck Analysis**: Identify where you spend most time: Implementation, Debugging, Architecture, or Waiting.
- **Tooltip Insights**: Hover over metrics to see "Best Day," "Average Flow Score," and more.

### ⚡ Professional Workflow Tools

- **Session Editing**: Right-click on the timeline to rename goals or reassign tags—keeping your history clean.
- **Smart Timeline**: Sessions are grouped by date (Today, Yesterday, DD/MM) for easy scanning.
- **Smart Alerts**: Intelligent browser notifications and sound alerts to keep you on track.
- **Data Export**: Full control of your data with JSON and CSV export options.

## Installation and Setup

### System Requirements

- Node.js (v16+)

### Quick Start

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```

## Technical Architecture

Built with a focus on local-first performance and premium UX:

- **React & TypeScript**: Robust and type-safe codebase.
- **Vite**: Blazing fast build tool.
- **Tailwind CSS**: Utility-first styling for a sleek, dark-mode interface.
- **Framer Motion**: Smooth, high-fidelity animations.
- **Recharts**: Interactive data visualization.
- **Local Storage**: All data persists locally on your device for complete privacy.
