import React, { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (type: ToastType, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let idCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, title: string, description?: string) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const iconFor = (type: ToastType) => {
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />;
    if (type === 'error') return <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
    return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
  };

  const borderFor = (type: ToastType) => {
    if (type === 'success') return 'border-green-500/20';
    if (type === 'error') return 'border-red-500/20';
    return 'border-blue-500/20';
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-start gap-3 p-4 rounded-xl border bg-[#15151F]/95 backdrop-blur-xl shadow-2xl ${borderFor(t.type)}`}
            >
              {iconFor(t.type)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{t.title}</div>
                {t.description && <div className="text-xs text-white/50 mt-0.5">{t.description}</div>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-white/30 hover:text-white/70 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
