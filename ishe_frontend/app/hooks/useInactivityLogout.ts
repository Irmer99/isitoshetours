import { useEffect, useRef, useState, useCallback } from "react";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

interface UseInactivityLogoutOptions {
  timeout?: number;
  warningBefore?: number;
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useInactivityLogout({
  timeout = 30 * 60 * 1000,
  warningBefore = 60 * 1000,
  onWarning,
  onLogout,
}: UseInactivityLogoutOptions = {}) {
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const warningRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const logoutRef = useRef(onLogout);
  const warningCallbackRef = useRef(onWarning);

  logoutRef.current = onLogout;
  warningCallbackRef.current = onWarning;

  const resetTimers = useCallback(() => {
    setShowWarning(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (warningBefore > 0 && warningBefore < timeout) {
      warningRef.current = setTimeout(() => {
        setShowWarning(true);
        warningCallbackRef.current?.();
      }, timeout - warningBefore);
    }

    timeoutRef.current = setTimeout(() => {
      setShowWarning(false);
      logoutRef.current?.();
    }, timeout);
  }, [timeout, warningBefore]);

  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    resetTimers();

    const handleActivity = () => {
      if (showWarning) return;
      resetTimers();
    };

    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      for (const event of ACTIVITY_EVENTS) {
        document.removeEventListener(event, handleActivity);
      }
    };
  }, [resetTimers, showWarning]);

  return { showWarning, extendSession };
}
