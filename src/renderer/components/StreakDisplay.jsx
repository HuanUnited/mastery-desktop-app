import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useStreak } from '../hooks/useStreak';
import { Card } from './ui/card';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './streak-heatmap.css';

export const StreakDisplay = forwardRef((props, ref) => {
  const { streak, successCount, activityData, refreshStreak } = useStreak();
  
  useEffect(() => {
    refreshStreak();
  }, []);

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refresh: refreshStreak
  }));

  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 6);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-3xl font-bold text-primary">
              {streak} {streak === 1 ? 'Day' : 'Days'} 🔥
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Current streak
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-semibold text-green-600">
              {successCount}
            </p>
            <p className="text-sm text-muted-foreground">
              Successful attempts
            </p>
          </div>
        </div>

        <div className="heatmap-container">
          <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={activityData}
            classForValue={(value) => {
              if (!value || value.count === 0) {
                return 'color-empty';
              }
              if (value.count < 3) return 'color-scale-1';
              if (value.count < 6) return 'color-scale-2';
              if (value.count < 9) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return {};
              
              const dateStr = value.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              
              return {
                'data-tip': `${dateStr}: ${value.count || 0} ${value.count === 1 ? 'entry' : 'entries'}`
              };
            }}
            showWeekdayLabels
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted"></div>
            <div className="w-3 h-3 rounded-sm color-scale-1"></div>
            <div className="w-3 h-3 rounded-sm color-scale-2"></div>
            <div className="w-3 h-3 rounded-sm color-scale-3"></div>
            <div className="w-3 h-3 rounded-sm color-scale-4"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
});

StreakDisplay.displayName = 'StreakDisplay';
