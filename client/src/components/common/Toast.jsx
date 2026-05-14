import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration, exiting: false }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning', 5000)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

const typeConfig = {
  success: {
    bg: 'bg-green-500 dark:bg-green-600',
    icon: '✓',
    border: 'border-green-400'
  },
  error: {
    bg: 'bg-red-500 dark:bg-red-600',
    icon: '✕',
    border: 'border-red-400'
  },
  info: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    icon: 'ℹ',
    border: 'border-blue-400'
  },
  warning: {
    bg: 'bg-amber-500 dark:bg-amber-600',
    icon: '⚠',
    border: 'border-amber-400'
  }
};

const ToastItem = ({ toast, onClose }) => {
  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl
        bg-white dark:bg-gray-900 border ${config.border}
        ${toast.exiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <span className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} text-white flex items-center justify-center text-sm font-bold`}>
        {config.icon}
      </span>
      <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 font-medium">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    exiting: PropTypes.bool
  }).isRequired,
  onClose: PropTypes.func.isRequired
};
