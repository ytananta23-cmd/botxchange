import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  // 'danger' (default) keeps the original red warning look, for destructive
  // actions like disconnecting or deleting something. 'neutral' is for
  // routine confirmations (e.g. placing an order) that don't need to look
  // like something's about to go wrong.
  tone?: 'danger' | 'neutral';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  tone = 'danger',
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#15151F] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${tone === 'danger' ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
              {tone === 'danger' ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <Info className="w-6 h-6 text-purple-400" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">{description}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
              <Button variant={tone === 'danger' ? 'destructive' : 'gradient'} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
