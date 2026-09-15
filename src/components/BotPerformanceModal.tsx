import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Tabs, TabsTrigger } from './ui/tabs';
import { AnimatedNumber } from './AnimatedNumber';
import { Skeleton } from './Skeleton';
import { botsApi } from '../api/client';

interface BotPerformanceModalProps {
  open: boolean;
  onClose: () => void;
  accountId: string | null;
  bot: { id: string; name: string } | null;
}

export const BotPerformanceModal: React.FC<BotPerformanceModalProps> = ({ open, onClose, accountId, bot }) => {
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ profit: number; trades: number } | null>(null);

  useEffect(() => {
    if (!open || !accountId || !bot) return;
    let cancelled = false;
    setLoading(true);
    botsApi.getPerformance(accountId, bot.id, range)
      .then(res => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, accountId, bot, range]);

  return (
    <AnimatePresence>
      {open && bot && (
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
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#15151F] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{bot.name}</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <Tabs value={range} onValueChange={setRange} className="mb-6">
              <TabsTrigger value="1d" className="flex-1">1D</TabsTrigger>
              <TabsTrigger value="7d" className="flex-1">7D</TabsTrigger>
              <TabsTrigger value="30d" className="flex-1">30D</TabsTrigger>
            </Tabs>

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                  <div className="text-xs text-white/40 mb-1">Profit</div>
                  <div className={`font-bold text-lg ${(data?.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(data?.profit || 0) >= 0 ? '+' : ''}<AnimatedNumber value={data?.profit || 0} prefix="$" />
                  </div>
                </div>
                <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                  <div className="text-xs text-white/40 mb-1">Trades</div>
                  <div className="font-bold text-lg">{data?.trades ?? 0}</div>
                </div>
              </div>
            )}

            <p className="text-xs text-white/30 mt-4 leading-relaxed">
              Trades placed automatically by this bot within the selected window. Manually placed orders and open/cancelled orders aren't counted.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
