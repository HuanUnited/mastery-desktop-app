import { useState, useRef } from 'react';
import { TimerProvider } from './context/TimerContext';
import { ThemeProvider } from './context/ThemeContext';
import { PhaseTimer } from './components/PhaseTimer';
import { ErrorEntryForm } from './components/ErrorEntryForm';
import { MaterialStatusForm } from './components/MaterialStatusForm';
import { RussianDrillingForm } from './components/RussianDrillingForm';
import { StreakDisplay } from './components/StreakDisplay';
import { Tasklist } from './components/Tasklist';
import { HistoryView } from './components/HistoryView';
import { GuidelineView } from './components/GuidelineView';
import { ThemeToggle } from './components/ThemeToggle';
import { DictionaryView } from './components/DictionaryView';
import { Button } from './components/ui/button';
import { useDatabase } from './hooks/useDatabase';
import { BookOpen, History, FileText, BookText  } from 'lucide-react';

export default function App() {
  const { exportJSON } = useDatabase();
  const [activeView, setActiveView] = useState('forms');
  const streakRef = useRef();
  const historyRef = useRef();

  const handleExport = async () => {
    const result = await exportJSON();
    if (result.success) {
      alert(`Data exported to: ${result.path}`);
    }
  };

  const handleEntryAdded = () => {
    if (streakRef.current) {
      streakRef.current.refresh();
    }
    if (historyRef.current) {
      historyRef.current.refresh();
    }
  };

  return (
    <ThemeProvider>
      <TimerProvider>
        <div className="min-h-screen bg-background text-foreground p-6 transition-colors duration-200">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Mastery Learning System</h1>
              
              <div className="flex gap-2">
                <Button 
  onClick={() => setActiveView('dictionary')} 
  variant={activeView === 'dictionary' ? 'default' : 'outline'}
>
              <BookText className="h-4 w-4 mr-2" />
              Dictionary
            </Button>
                <Button 
                  onClick={() => setActiveView('forms')} 
                  variant={activeView === 'forms' ? 'default' : 'outline'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Forms
                </Button>
                <Button 
                  onClick={() => setActiveView('history')} 
                  variant={activeView === 'history' ? 'default' : 'outline'}
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button 
                  onClick={() => setActiveView('guidelines')} 
                  variant={activeView === 'guidelines' ? 'default' : 'outline'}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guidelines
                </Button>
                <Button onClick={handleExport} variant="outline">
                  💾 Export
                </Button>
                <ThemeToggle />
              </div>
            </div>

            {activeView === 'forms' && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-3 space-y-6">
                  <PhaseTimer />
                  <StreakDisplay ref={streakRef} />
                  <Tasklist />
                </div>

                <div className="col-span-9 space-y-6">
                  <ErrorEntryForm onEntryAdded={handleEntryAdded} />
                  <div className="grid grid-cols-2 gap-6">
                    <MaterialStatusForm />
                    <RussianDrillingForm />
                  </div>
                </div>
              </div>
            )}

            {activeView === 'history' && (
              <HistoryView ref={historyRef} />
            )}

            {activeView === 'dictionary' && (
  <DictionaryView />
)}

            {activeView === 'guidelines' && (
              <GuidelineView />
            )}
          </div>
        </div>
      </TimerProvider>
    </ThemeProvider>
  );
}
