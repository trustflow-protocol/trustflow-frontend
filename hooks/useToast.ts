import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '../components/atoms/toast';

let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      const id = `toast-${++counter}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string) => show(msg, 'success'), [show]);
  const error   = useCallback((msg: string) => show(msg, 'error'),   [show]);
  const warning = useCallback((msg: string) => show(msg, 'warning'), [show]);
  const info    = useCallback((msg: string) => show(msg, 'info'),    [show]);

  return { toasts, show, dismiss, success, error, warning, info };
}
