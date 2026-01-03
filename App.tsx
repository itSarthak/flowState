import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { FlowSession } from '@/src/types';

// Hooks
import { useSessions } from '@/src/hooks/useSessions';
import { useTimer } from '@/src/hooks/useTimer';

// Services
import { exportService } from '@/src/services/exportService';

// Components
import { Header } from '@/src/components/layout/Header';
import { FlowPanel } from '@/src/components/features/Session/FlowPanel';
import { ShippingPanel } from '@/src/components/features/Session/ShippingPanel';
import { Timeline } from '@/src/components/features/Timeline/Timeline';
import { BottleneckAnalysis } from '@/src/components/features/Analytics/BottleneckAnalysis';
import { ActivityHeatmap } from '@/src/components/features/Analytics/ActivityHeatmap';
import { Infographics, AnalyticFilter } from '@/src/components/features/Analytics/Infographics';
import { EndSessionDialog } from '@/src/components/ui/EndSessionDialog';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { HelpModal } from '@/src/components/ui/HelpModal';
import { WisdomModal } from '@/src/components/features/Wisdom/WisdomModal';
import { ShippingCycleAnalysis } from '@/src/components/features/Analytics/ShippingCycleAnalysis';
import { EditSessionModal } from '@/src/components/ui/EditSessionModal';

const App: React.FC = () => {
  const {
    sessions,
    tags,
    createTag,
    currentSession,
    notificationInterval,
    setNotificationInterval,
    handleStartFlow,
    handleCompleteSession,
    handleUpdateSession,
    handleDeleteSession
  } = useSessions();

  const [filter, setFilter] = useState<AnalyticFilter>('week');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const { activeDurationMinutes } = useTimer(currentSession, notificationInterval);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWisdomOpen, setIsWisdomOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<FlowSession | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // Tab Bar Title and Emoji logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (currentSession) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime) / 60000);
        document.title = `▶ ${elapsed}m | ${currentSession.goal}`;
      }, 1000);
    } else {
      document.title = '⏸ Flow & Shipping';
    }

    return () => clearInterval(interval);
  }, [currentSession]);

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems = [
    {
      label: currentSession ? 'End Flow Session' : 'Start Flow Session',
      icon: <Icon icon={currentSession ? "lucide:square" : "lucide:play"} className="w-4 h-4" />,
      onClick: () => currentSession ? setIsDialogOpen(true) : document.querySelector('input')?.focus()
    },
    {
      label: 'Get Wisdom',
      icon: <Icon icon="lucide:sparkles" className="w-4 h-4" />,
      onClick: () => setIsWisdomOpen(true)
    },
    {
      label: 'Help / How to use',
      icon: <Icon icon="lucide:help-circle" className="w-4 h-4" />,
      onClick: () => setIsHelpOpen(true)
    },
    {
      label: 'Download Data (JSON)',
      icon: <Icon icon="lucide:file-json" className="w-4 h-4" />,
      onClick: () => exportService.exportToJSON(sessions)
    },
    {
      label: 'Download Data (CSV)',
      icon: <Icon icon="lucide:file-spreadsheet" className="w-4 h-4" />,
      onClick: () => exportService.exportToCSV(sessions)
    }
  ];

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    }
    return 'dark';
  });

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Circular View Transition
  const toggleTheme = async (e: React.MouseEvent) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // @ts-ignore - View Transitions API
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 750,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  // ... (context menu code)

  return (
    <div 
      className="min-h-screen max-w-5xl mx-auto px-4 py-8 md:py-16 selection:bg-white/80 selection:text-black relative"
      onContextMenu={handleGlobalContextMenu}
    >
      <Header 
        currentSession={currentSession} 
        tags={tags}
        onCreateTag={createTag}
        onStartFlow={handleStartFlow} 
        onEndFlow={() => setIsDialogOpen(true)}
        notificationInterval={notificationInterval}
        onSetNotificationInterval={setNotificationInterval}
        onExport={() => exportService.exportToJSON(sessions)}
        onShowHelp={() => setIsHelpOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-12">
        <FlowPanel 
          isActive={!!currentSession} 
          duration={activeDurationMinutes} 
          lastFlowScore={sessions[0]?.flowScore}
        />
        <ShippingPanel sessions={sessions} />
      </div>

      <div className="mt-8 md:mt-12">
        <ActivityHeatmap sessions={sessions} />
      </div>

      <div className="mt-8 md:mt-12">
        <BottleneckAnalysis sessions={sessions} filter={filter} />
      </div>

      <div className="mt-8 md:mt-12">
        <Timeline 
          sessions={sessions} 
          onDelete={handleDeleteSession} 
          onEdit={setEditingSession}
        />
      </div>

      <div className="mt-8 md:mt-12">
        <Infographics sessions={sessions} filter={filter} setFilter={setFilter} />
      </div>

      <div className="mt-8 md:mt-12 pb-24">
        <ShippingCycleAnalysis sessions={sessions} tags={tags} />
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <EndSessionDialog 
            onClose={() => setIsDialogOpen(false)} 
            onSave={(data) => {
              handleCompleteSession(data);
              setIsDialogOpen(false);
            }} 
          />
        )}
        {editingSession && (
          <EditSessionModal 
            session={editingSession}
            tags={tags}
            onCreateTag={createTag}
            onClose={() => setEditingSession(null)}
            onSave={handleUpdateSession}
          />
        )}
        {isHelpOpen && (
          <HelpModal onClose={() => setIsHelpOpen(false)} />
        )}
      </AnimatePresence>
      
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)} 
          items={menuItems}
        />
      )}
      
      <WisdomModal 
        isOpen={isWisdomOpen} 
        onOpen={() => setIsWisdomOpen(true)} 
        onClose={() => setIsWisdomOpen(false)} 
      />
    </div>
  );
};

export default App;
