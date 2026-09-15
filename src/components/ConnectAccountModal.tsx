import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, ShieldAlert, Eye, EyeOff, Info } from 'lucide-react';
import { exchangeApi } from '../api/client';
import { useToast } from './Toast';

interface ConnectAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: 'demo' | 'real';
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ open, onClose, onSuccess, defaultMode = 'real' }) => {
  const { show } = useToast();
  const [mode, setMode] = useState<'demo' | 'real'>(defaultMode);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [label, setLabel] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // This modal stays mounted between opens (for exit animations), so its
  // internal state has to be re-synced with props every time it re-opens —
  // otherwise a stale `mode`/leftover form values from the previous time
  // it was opened would carry over.
  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setApiKey('');
      setApiSecret('');
      setLabel('');
      setError('');
    }
  }, [open, defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await exchangeApi.connect({ apiKey, apiSecret, label, mode });
      show('success', `${mode === 'demo' ? 'Demo' : 'Real'} account connected`, label || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151F] p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Connect Delta Exchange</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10 mb-6">
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === 'demo' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white'}`}
            onClick={() => setMode('demo')}
          >
            Demo (Testnet)
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === 'real' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white'}`}
            onClick={() => setMode('real')}
          >
            Real (Live)
          </button>
        </div>

        {mode === 'demo' ? (
          <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300/80 leading-relaxed">
              Generate a separate API key at <strong>testnet.delta.exchange</strong> — this is different from your real Delta Exchange India account.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400/80 leading-relaxed">
              Ensure you <strong>ONLY</strong> check the "Trading" permissions when generating your API keys.
              <strong> NEVER enable "Withdrawal".</strong>
            </p>
          </div>
        )}

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">API Key</label>
            <Input 
              placeholder="Paste your API Key" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">API Secret</label>
            <div className="relative">
              <Input 
                type={showSecret ? "text" : "password"}
                placeholder="Paste your API Secret" 
                value={apiSecret}
                onChange={e => setApiSecret(e.target.value)}
                required 
                className="pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-white/80">Label (Optional)</label>
            <Input 
              placeholder="e.g., Main Trading Account" 
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          <Button type="submit" variant="gradient" className="w-full mt-4" disabled={loading}>
            {loading ? 'Verifying...' : 'Connect Account'}
          </Button>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
