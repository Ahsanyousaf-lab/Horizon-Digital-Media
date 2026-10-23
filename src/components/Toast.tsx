import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--primary)] shadow-2xl text-sm text-[var(--text)] animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md w-[90vw]">
      <i
        className={`fa-solid ${
          type === 'success' ? 'fa-circle-check text-[var(--secondary)]' : 'fa-circle-info text-[var(--primary)]'
        } text-lg`}
      ></i>
      <div className="flex-1 text-xs sm:text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1"
        aria-label="Close notification"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};
