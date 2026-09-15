import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface CreateBotModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { symbol: string; strategyType: string; preset: string; params?: Record<string, number> }) => Promise<void> | void;
  products: { symbol: string }[];
}

// Matches the "optimal" preset on the backend (backend/src/services/botEngine.ts)
// — used as sensible starting values when someone switches to Custom.
const CUSTOM_DEFAULTS = {
  grid: { rangePercent: '5', gridLevels: '6' },
  dca: { stepPercent: '3', maxSteps: '5' },
};

export const CreateBotModal: React.FC<CreateBotModalProps> = ({ open, onClose, onCreate, products }) => {
  const [symbol, setSymbol] = useState('BTCUSD');
  const [strategyType, setStrategyType] = useState<'grid' | 'dca'>('grid');
  const [preset, setPreset] = useState<'conservative' | 'optimal' | 'aggressive' | 'custom'>('optimal');
  const [rangePercent, setRangePercent] = useState(CUSTOM_DEFAULTS.grid.rangePercent);
  const [gridLevels, setGridLevels] = useState(CUSTOM_DEFAULTS.grid.gridLevels);
  const [stepPercent, setStepPercent] = useState(CUSTOM_DEFAULTS.dca.stepPercent);
  const [maxSteps, setMaxSteps] = useState(CUSTOM_DEFAULTS.dca.maxSteps);
  const [customError, setCustomError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    let params: Record<string, number> | undefined;
    if (preset === 'custom') {
      if (strategyType === 'grid') {
        const r = Number(rangePercent), g = Number(gridLevels);
        if (!r || r <= 0 || !g || g <= 0) {
          setCustomError('Enter a valid range % and number of grid levels.');
          return;
        }
        params = { rangePercent: r, gridLevels: g };
      } else {
        const s = Number(stepPercent), m = Number(maxSteps);
        if (!s || s <= 0 || !m || m <= 0) {
          setCustomError('Enter a valid step % and max steps.');
          return;
        }
        params = { stepPercent: s, maxSteps: m };
      }
    }

    setSubmitting(true);
    try {
      await onCreate({ symbol, strategyType, preset, ...(params && { params }) });
      onClose();
    } finally {
      setSubmitting(false);
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
          <h3 className="text-lg font-semibold">Create New Bot</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Asset <span className="text-white/40 font-normal">(Top 10 by Volume)</span></label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50"
            >
              {(products.length ? products : [{ symbol: 'BTCUSD' }, { symbol: 'ETHUSD' }]).map(p => (
                <option key={p.symbol} value={p.symbol}>{p.symbol}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Strategy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStrategyType('grid')}
                className={`rounded-lg border p-3 text-left ${strategyType === 'grid' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <div className="font-medium text-sm">Grid Bot</div>
                <div className="text-xs text-white/40 mt-0.5">Sideways markets</div>
              </button>
              <button
                type="button"
                onClick={() => setStrategyType('dca')}
                className={`rounded-lg border p-3 text-left ${strategyType === 'dca' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <div className="font-medium text-sm">DCA Bot</div>
                <div className="text-xs text-white/40 mt-0.5">Trending markets</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">AI Preset</label>
            <div className="grid grid-cols-4 gap-2">
              {(['conservative', 'optimal', 'aggressive', 'custom'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={`rounded-lg border py-2 text-xs capitalize ${preset === p ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {preset === 'custom' && (
            <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
              {strategyType === 'grid' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Range % (total width of the grid)</label>
                    <input
                      type="number" min="0" step="0.1"
                      value={rangePercent}
                      onChange={e => setRangePercent(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Grid levels</label>
                    <input
                      type="number" min="1" step="1"
                      value={gridLevels}
                      onChange={e => setGridLevels(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Step % (price drop that triggers each buy)</label>
                    <input
                      type="number" min="0" step="0.1"
                      value={stepPercent}
                      onChange={e => setStepPercent(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Max steps</label>
                    <input
                      type="number" min="1" step="1"
                      value={maxSteps}
                      onChange={e => setMaxSteps(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50"
                    />
                  </div>
                </>
              )}
              {customError && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{customError}</div>}
            </div>
          )}

          <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
            {submitting ? 'Launching...' : 'Launch Bot'}
          </Button>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
