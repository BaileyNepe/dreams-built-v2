import { env } from 'config/env';
import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';

type ReCaptchaContextType = {
  execute: () => string | null;
  reset: () => void;
} | null;

const ReCaptchaContext = createContext<ReCaptchaContextType>(null);

export const ReCaptchaProvider = ({ children }: { children: ReactNode }) => {
  const lastExecutedRef = useRef(Date.now());

  const execute = useCallback(() => {
    const currentTime = Date.now();

    const duration = currentTime - lastExecutedRef.current;
    const minDuration = 300; // 300ms
    if (duration < minDuration && env.environment !== 'test') {
      return null;
    }

    lastExecutedRef.current = currentTime;
    return currentTime.toString();
  }, []);

  const reset = useCallback(() => {
    lastExecutedRef.current = Date.now();
  }, []);

  return (
    <ReCaptchaContext.Provider value={{ execute, reset }}>
      {children}
    </ReCaptchaContext.Provider>
  );
};

// Hook to use ReCaptcha
export const useReCaptcha = () => {
  const context = useContext(ReCaptchaContext);
  if (!context) {
    throw new Error('useReCaptcha must be used within a ReCaptchaProvider');
  }
  return context;
};
