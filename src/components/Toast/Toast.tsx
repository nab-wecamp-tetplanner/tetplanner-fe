import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  exiting?: boolean;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={14} />,
  error: <XCircle size={14} />,
  warning: <AlertTriangle size={14} />,
  info: <Info size={14} />,
};

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const duration = toast.duration ?? 4000;

  return (
    <div
      className={`toast toast--${toast.type} ${toast.exiting ? 'toast--exiting' : ''}`}
      onClick={() => onClose(toast.id)}
      role="alert"
    >
      <div className="toast__icon">{ICONS[toast.type]}</div>
      <div className="toast__content">{toast.message}</div>
      <button
        className="toast__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose(toast.id);
        }}
        aria-label="Close notification"
      >
        <X size={12} />
      </button>
      <div
        className="toast__progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;
