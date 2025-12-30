import { createContext, useContext, useState } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [capturedTime, setCapturedTime] = useState(0);

  const captureTime = (minutes) => {
    console.log('🕐 TimerContext: Capturing', minutes, 'minutes');
    setCapturedTime(minutes);
  };

  const clearCapturedTime = () => {
    console.log('🧹 TimerContext: Clearing captured time');
    setCapturedTime(0);
  };

  return (
    <TimerContext.Provider value={{ capturedTime, captureTime, clearCapturedTime }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};
