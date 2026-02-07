// ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-full">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={`${colors[toast.type]} border rounded-lg p-4 shadow-lg animate-slideIn`}
              role="alert"
            >
              <div className="flex items-start">
                <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold">{toast.title}</h4>
                  <p className="text-sm mt-1">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}