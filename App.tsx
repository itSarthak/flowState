import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

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
import { EndSessionDialog } from '@/src/components/ui/EndSessionDialog';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { HelpModal } from '@/src/components/ui/HelpModal';

const App: React.FC = () => {
  const {
    sessions,
    currentSession,
    notificationInterval,
    setNotificationInterval,
    handleStartFlow,
    handleCompleteSession,
    handleDeleteSession
  } = useSessions();

  const { activeDurationMinutes } = useTimer(currentSession, notificationInterval);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

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

  return (
    <div 
      className="min-h-screen max-w-5xl mx-auto px-4 py-8 md:py-16 selection:bg-blue-500/30 relative"
      onContextMenu={handleGlobalContextMenu}
    >
      <Header 
        currentSession={currentSession} 
        onStartFlow={handleStartFlow} 
        onEndFlow={() => setIsDialogOpen(true)}
        notificationInterval={notificationInterval}
        onSetNotificationInterval={setNotificationInterval}
        onExport={() => exportService.exportToJSON(sessions)}
        onShowHelp={() => setIsHelpOpen(true)}
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
        <Timeline sessions={sessions} onDelete={handleDeleteSession} />
      </div>

      <div className="mt-8 md:mt-12 pb-24">
        <BottleneckAnalysis sessions={sessions} />
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
    </div>
  );
};

export default App;
