import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para manejar timeout de sesión por inactividad
 * @param {Function} onTimeout - Función a ejecutar cuando se agote el tiempo
 * @param {number} timeout - Tiempo en milisegundos (por defecto 30 minutos)
 * @param {boolean} enabled - Si el timer está habilitado
 * @returns {Object} - Funciones para resetear y obtener tiempo restante
 */
export function useInactivityTimer(onTimeout, timeout = 30 * 60 * 1000, enabled = true) {
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const callbackRef = useRef(onTimeout);

  // Actualizar callback ref cuando cambie
  useEffect(() => {
    callbackRef.current = onTimeout;
  }, [onTimeout]);

  // Resetear el timer
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    }, timeout);
  }, [timeout, enabled]);

  // Obtener tiempo restante
  const getRemainingTime = useCallback(() => {
    if (!enabled) return null;
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = Math.max(0, timeout - elapsed);
    return remaining;
  }, [timeout, enabled]);

  // Eventos de actividad del usuario
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  // Configurar listeners de actividad
  useEffect(() => {
    if (!enabled) return;

    // Throttle para evitar resets excesivos
    let throttleTimeout = null;
    
    const handleActivity = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        resetTimer();
        throttleTimeout = null;
      }, 1000); // Throttle de 1 segundo
    };

    // Agregar listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Inicializar timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, resetTimer]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    resetTimer,
    getRemainingTime,
    isEnabled: enabled
  };
}

/**
 * Hook para mostrar advertencias de inactividad
 * @param {Function} onTimeout - Función de timeout
 * @param {Function} onWarning - Función de advertencia
 * @param {number} timeout - Tiempo total de timeout
 * @param {number} warningTime - Tiempo antes del timeout para mostrar advertencia
 * @returns {Object} - Estado y funciones del timer
 */
export function useInactivityWithWarning(
  onTimeout, 
  onWarning, 
  timeout = 30 * 60 * 1000, // 30 minutos
  warningTime = 5 * 60 * 1000 // 5 minutos antes
) {
  const warningShownRef = useRef(false);
  const warningTimeoutRef = useRef(null);

  const handleTimeout = useCallback(() => {
    warningShownRef.current = false;
    onTimeout();
  }, [onTimeout]);

  const { resetTimer, getRemainingTime, isEnabled } = useInactivityTimer(
    handleTimeout, 
    timeout, 
    true
  );

  // Resetear timer y advertencia
  const resetTimerWithWarning = useCallback(() => {
    warningShownRef.current = false;
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    resetTimer();
    
    // Programar advertencia
    warningTimeoutRef.current = setTimeout(() => {
      if (!warningShownRef.current && onWarning) {
        warningShownRef.current = true;
        onWarning();
      }
    }, timeout - warningTime);
  }, [resetTimer, timeout, warningTime, onWarning]);

  // Verificar si debe mostrar advertencia
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingTime();
      if (remaining && remaining <= warningTime && !warningShownRef.current && onWarning) {
        warningShownRef.current = true;
        onWarning();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime, warningTime, onWarning]);

  useEffect(() => {
    resetTimerWithWarning();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  return {
    resetTimer: resetTimerWithWarning,
    getRemainingTime,
    isEnabled
  };
}