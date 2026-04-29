import { useEffect, useCallback } from 'react';
import styles from './toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const dismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [dismiss, toast.duration]);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert" aria-live="assertive">
      <span className={styles.icon}>{ICONS[toast.type]}</span>
      <p className={styles.message}>{toast.message}</p>
      <button
        className={styles.close}
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container} aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};
