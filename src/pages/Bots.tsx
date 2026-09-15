import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsTrigger } from '../components/ui/tabs';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { Skeleton } from '../components/Skeleton';
import { TradingViewChart } from '../components/TradingViewChart';
import { botsApi, marketsApi, exchangeApi } from '../api/client';
import { CreateBotModal } from '../components/CreateBotModal';
import { BotPerformanceModal } from '../components/BotPerformanceModal';
import { ConnectAccountModal } from '../components/ConnectAccountModal';
import { useToast } from '../components/Toast';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useWsChannel } from '../hooks/useWsChannel';
import { Play, Square, Settings2, Plus, Bot, Wallet, AlertTriangle, BarChart3 } from 'lucide-react';

export const Bots = () => {
  const { show } = useToast();
  const isDesktop = useIsDesktop();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [modeTab, setModeTab] = useState('demo');
  const [statusTab, setStatusTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [busyBotId, setBusyBotId] = useState<string | null>(null);
  const [performanceBot, setPerformanceBot] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadAccountsAndData();
  }, [modeTab, statusTab]);

  const loadAccountsAndData = async () => {
    setLoading(true);
    try {
      const accountsData = await exchangeApi.getAccounts();
      setAccounts(accountsData);

      const modeAccounts = accountsData.filter((a: any) => a.type === modeTab);
      const activeAccountId = modeAccounts.length > 0 ? modeAccounts[0].id : null;

      if (activeAccountId) {
        const [botsData, productsData] = await Promise.all([
          botsApi.getBots(activeAccountId, statusTab, modeTab),
          marketsApi.getProducts()
        ]);
        setBots(botsData);
        setProducts(productsData);
      } else {
        setBots([]);
        setProducts(await marketsApi.getProducts());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeModeAccounts = accounts.filter(a => a.type === modeTab);
  const activeAccountId = activeModeAccounts.length > 0 ? activeModeAccounts[0].id : null;

  // Live bot updates from the backend's bot engine (backend/src/services/wsHub.ts
  // + botEngine.ts): a 'pnl' tick is merged into the matching bot in place so the
  // number animates smoothly; 'created'/'status' events reload the full list
  // since they can change which bots match the current status filter.
  useWsChannel(activeAccountId ? `bots:${activeAccountId}` : null, (data: any) => {
    if (data?.type === 'pnl' && data.botId) {
      setBots(prev => prev.map(b => (b.id === data.botId ? { ...b, pnl: data.pnl } : b)));
    } else {
      loadAccountsAndData();
    }
  });

  const handleToggleBot = async (bot: any) => {
    if (!activeAccountId) return;
    setBusyBotId(bot.id);
    try {
      if (bot.status === 'active') {
        await botsApi.stopBot(activeAccountId, bot.id);
        show('info', `${bot.name} stopped`);
      } else {
        await botsApi.startBot(activeAccountId, bot.id);
        show('success', `${bot.name} is now active`);
      }
      await loadAccountsAndData();
    } catch (e: any) {
      show('error', 'Failed to update bot', e.message);
      console.error(e);
    } finally {
      setBusyBotId(null);
    }
  };

  const handleCreateBot = async (data: { symbol: string; strategyType: string; preset: string; params?: Record<string, number> }) => {
    if (!activeAccountId) return;
    try {
      await botsApi.createBot(activeAccountId, { ...data, mode: modeTab });
      show('success', 'Bot launched', `${data.symbol} ${data.strategyType.toUpperCase()} bot is now running.`);
      await loadAccountsAndData();
    } catch (e: any) {
      show('error', 'Failed to create bot', e.message);
      throw e;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Chart Panel - only mounted on desktop; not just CSS-hidden on
          mobile, so the TradingView widget never loads twice at once. */}
      {isDesktop && (
      <div className="flex flex-col flex-1 border-r border-white/5 bg-[#0A0A0F]">
         <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-[#0D0D14]">
            <div className="flex items-center gap-3">
               <span className="font-bold text-lg">{selectedSymbol}</span>
               <Badge variant="outline" className="text-white/60">Perpetual</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
               <span>5m</span>
            </div>
         </div>
         <div className="flex-1 min-h-0">
            <TradingViewChart symbol={selectedSymbol} />
         </div>
      </div>
      )}

      {/* Bots Panel */}
      <div className="w-full lg:w-[480px] xl:w-[560px] flex flex-col bg-[#0D0D14] h-full">
         <div className="p-4 border-b border-white/5 space-y-4 bg-[#15151F]">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold">My Bots</h2>
               <Button size="sm" variant="gradient" className="gap-2" disabled={!activeAccountId} onClick={() => setShowCreateModal(true)}>
                 <Plus className="w-4 h-4" /> Create Bot
               </Button>
            </div>
            
            <div className="flex items-center justify-between gap-4">
               <Tabs value={modeTab} onValueChange={setModeTab} className="bg-black/20">
                 <TabsTrigger value="real">Real</TabsTrigger>
                 <TabsTrigger value="demo">Demo</TabsTrigger>
               </Tabs>
               
               <div className="flex gap-4 text-right">
                  <div>
                     <div className="text-xs text-white/40 mb-1">Total P&L</div>
                     {(() => {
                       const total = bots.reduce((sum, b) => sum + (b.pnl || 0), 0);
                       return (
                         <div className={`font-bold text-sm ${total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {total >= 0 ? '+' : ''}<AnimatedNumber value={total} prefix="$" />
                         </div>
                       );
                     })()}
                  </div>
               </div>
            </div>
         </div>

         {modeTab === 'real' && (
           <div className="flex gap-3 bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
             <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
             <p className="text-xs text-amber-300/90 leading-relaxed">
               Real-mode bots do not place live trades yet — this is a safety default until a strategy has been
               validated on Demo (testnet). Bots below will show as active but won't execute orders.
             </p>
           </div>
         )}

         <div className="p-4 border-b border-white/5">
            <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full flex">
               <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
               <TabsTrigger value="stopped" className="flex-1">Stopped</TabsTrigger>
            </Tabs>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
               <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
               </div>
            ) : activeModeAccounts.length === 0 ? (
               <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl m-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                     <Wallet className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="font-semibold mb-2">No {modeTab} account connected</h3>
                  <p className="text-sm text-white/40 mb-6">Connect your exchange API keys to start trading in {modeTab} mode.</p>
                  <Button variant="gradient" onClick={() => setShowConnectModal(true)}>Connect Account</Button>
               </div>
            ) : bots.length === 0 ? (
               <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                     <Bot className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="font-semibold mb-2">No {statusTab} bots</h3>
                  <p className="text-sm text-white/40 mb-6">Launch a new trading bot to see it here.</p>
                  <Button variant="outline" onClick={() => setShowCreateModal(true)}>Create your first bot</Button>
               </div>
            ) : (
               <AnimatePresence>
               {bots.map((bot, i) => (
                  <motion.div
                    key={bot.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                  <Card className="p-4 bg-[#15151F] border-white/5 cursor-pointer hover:border-white/10 card-hover" onClick={() => setSelectedSymbol(bot.symbol)}>
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                           <div>
                              <div className="font-semibold">{bot.name}</div>
                              <div className="text-xs text-white/40 flex items-center gap-2 mt-0.5">
                                 <span>{bot.symbol}</span>
                                 <span>•</span>
                                 <span className="uppercase">{bot.strategyType}</span>
                                 {bot.liveTradingEnabled === false && (
                                   <>
                                     <span>•</span>
                                     <span className="text-amber-400">not trading yet</span>
                                   </>
                                 )}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className={`font-bold ${bot.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {bot.pnl >= 0 ? '+' : ''}<AnimatedNumber value={bot.pnl} prefix="$" />
                           </div>
                           <div className="text-xs text-white/40 mt-0.5">Uptime: {bot.uptime}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        <Button size="sm" variant="secondary" className="flex-1 gap-2 text-white/80" onClick={e => { e.stopPropagation(); show('info', 'Coming soon', 'Manual bot parameter editing is on the roadmap.'); }}>
                           <Settings2 className="w-4 h-4" /> Config
                        </Button>
                        <Button size="sm" variant="secondary" className="flex-1 gap-2 text-white/80" onClick={e => { e.stopPropagation(); setPerformanceBot({ id: bot.id, name: bot.name }); }}>
                           <BarChart3 className="w-4 h-4" /> Stats
                        </Button>
                        <Button
                           size="sm"
                           variant={bot.status === 'active' ? 'outline' : 'gradient'}
                           className="flex-1 gap-2"
                           disabled={busyBotId === bot.id}
                           onClick={e => { e.stopPropagation(); handleToggleBot(bot); }}
                        >
                           {busyBotId === bot.id ? (
                             '...'
                           ) : bot.status === 'active' ? (
                             <><Square className="w-4 h-4 text-red-400" /> Stop</>
                           ) : (
                             <><Play className="w-4 h-4 text-white" /> Start</>
                           )}
                        </Button>
                     </div>
                  </Card>
                  </motion.div>
               ))}
               </AnimatePresence>
            )}
         </div>
      </div>

      <CreateBotModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBot}
        products={products}
      />
      <ConnectAccountModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={loadAccountsAndData}
        defaultMode={modeTab as 'demo' | 'real'}
      />
      <BotPerformanceModal
        open={!!performanceBot}
        onClose={() => setPerformanceBot(null)}
        accountId={activeAccountId}
        bot={performanceBot}
      />
    </div>
  );
};
