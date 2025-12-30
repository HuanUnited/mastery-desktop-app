import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';

export const useStreak = () => {
  const { getErrorLogs } = useDatabase();
  const [streak, setStreak] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [activityData, setActivityData] = useState([]);

  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const calculateStreak = async () => {
    const logs = await getErrorLogs({ startDate: getDateDaysAgo(365) });
    
    const dateCountMap = {};
    logs.forEach(log => {
      const date = log.DateTimeGMT7.split('T')[0];
      dateCountMap[date] = (dateCountMap[date] || 0) + 1;
    });

    const heatmapData = Object.entries(dateCountMap).map(([date, count]) => ({
      date: new Date(date),
      count
    }));

    let currentStreak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (dateCountMap[dateStr]) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
    setSuccessCount(logs.filter(log => log.Successful === 1).length);
    setActivityData(heatmapData);
  };

  return { streak, successCount, activityData, refreshStreak: calculateStreak };
};
