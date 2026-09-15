import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/Skeleton';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { exchangeApi, accountsApi } from '../api/client';
import { Plus, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ConnectAccountModal } from '../components/ConnectAccountModal';
import { useToast } from '../components/Toast';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] } }),
};

export const Accounts = () => {
  const { show } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('real');
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectModalMode, setConnectModalMode] = useState<'demo' | 'real'>('real');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await exchangeApi.getAccounts();
      setAccounts(data);
      if (data.length > 0 && !data.some((a: any) => a.type === activeTab)) {
        setActiveTab(data[0].type);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(a => a.type === activeTab);
  const activeAccount = filteredAccounts.length > 0 ? filteredAccounts[0] : null;

  // The account list endpoint only returns { id, label, type } — balance has
  // to be fetched separately per-account from the real backend.
  useEffect(() => {
    if (!activeAccount) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    setBalanceLoading(true);
    accountsApi.getBalance(activeAccount.id)
      .then(data => { if (!cancelled) setBalance(data); })
      .catch(err => { console.error(err); if (!cancelled) setBalance(null); })
      .finally(() => { if (!cancelled) setBalanceLoading(false); });
    return () => { cancelled = true; };
  }, [activeAccount?.id]);

  const handleOpenConnect = (mode: 'demo' | 'real') => {
    setConnectModalMode(mode);
    setIsConnectModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts Overview</h1>
          <p className="text-white/60 text-sm mt-1">Manage your connected exchange accounts and balances.</p>
        </div>
        {accounts.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsTrigger value="real">Real Trading</TabsTrigger>
            <TabsTrigger value="demo">Demo Trading</TabsTrigger>
          </Tabs>
        )}
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : accounts.length === 0 ? (
        <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
          <Card className="bg-[#15151F] border-white/5 p-8 text-center max-w-2xl mx-auto mt-12">
             <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Wallet className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold mb-2">Connect a Delta Exchange account to get started</h3>
             <p className="text-white/60 mb-8 max-w-md mx-auto">
               BotXchange requires an API key to trade on your behalf. You can connect a testnet account for paper trading or a live account.
             </p>

             <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-400" onClick={() => handleOpenConnect('demo')}>
                  <span className="font-semibold text-base">Connect Demo Account</span>
                  <span className="text-xs font-normal opacity-80">(Testnet)</span>
                </Button>
                <Button variant="gradient" className="h-auto py-4 flex flex-col gap-2" onClick={() => handleOpenConnect('real')}>
                  <span className="font-semibold text-base">Connect Real Account</span>
                  <span className="text-xs font-normal opacity-90">(Live)</span>
                </Button>
             </div>
          </Card>
        </motion.div>
      ) : (
        <>
          {activeTab === 'real' && (!accounts.some(a => a.type === 'real')) && (
            <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 p-6">
                 <h3 className="text-lg font-semibold mb-4">Get Started</h3>
                 <div className="flex gap-2 mb-6">
                    <div className="h-2 flex-1 rounded-full bg-purple-500" />
                    <div className="h-2 flex-1 rounded-full bg-white/10" />
                    <div className="h-2 flex-1 rounded-full bg-white/10" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 text-white/60">
                       <CheckCircle2 className="w-6 h-6 text-green-500" />
                       <span className="flex-1">Create BotXchange Account</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                       <div className="w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-bold text-purple-400">2</div>
                       <span className="flex-1 font-medium">Connect Delta Exchange</span>
                       <Button variant="outline" size="sm" onClick={() => handleOpenConnect('real')}>Connect Keys</Button>
                    </div>
                    <div className="flex items-center gap-4 text-white/40">
                       <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold">3</div>
                       <span className="flex-1">Launch First Bot</span>
                    </div>
                 </div>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeAccount ? (
              <motion.div
                key={activeAccount.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid md:grid-cols-3 gap-6"
              >
                <Card className="md:col-span-2 p-6 bg-[#15151F] border-white/5 relative overflow-hidden card-hover">
                  <div className="ambient-glow w-64 h-64 bg-purple-500/10 -top-20 -right-20" />
                  <div className="absolute top-0 right-0 p-6">
                     <Badge variant={activeAccount.type === 'demo' ? 'demo' : 'real'} className="uppercase">
                       {activeAccount.type} MODE
                     </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-8 relative">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{activeAccount.label}</h3>
                      <p className="text-sm text-white/40">Delta Exchange India</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 relative">
                     <div>
                        <div className="text-sm text-white/40 mb-1">Total Balance</div>
                        {balanceLoading ? <Skeleton className="h-8 w-24" /> : (
                          <div className="text-2xl font-bold">
                            <AnimatedNumber value={balance?.balance || 0} prefix="$" />
                          </div>
                        )}
                     </div>
                     <div>
                        <div className="text-sm text-white/40 mb-1">Unrealized P&L</div>
                        {balanceLoading ? <Skeleton className="h-7 w-16" /> : (
                          <div className={`text-xl font-bold ${(balance?.unrealizedPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {(balance?.unrealizedPnl || 0) >= 0 ? '+' : ''}
                            <AnimatedNumber value={balance?.unrealizedPnl || 0} />
                          </div>
                        )}
                     </div>
                     <div>
                        <div className="text-sm text-white/40 mb-1">Margin Level</div>
                        <div className="text-xl font-bold">{balance?.marginLevel || 0}%</div>
                     </div>
                     <div>
                        <div className="text-sm text-white/40 mb-1">Leverage</div>
                        <div className="text-xl font-bold">{balance?.leverage || 0}x</div>
                     </div>
                  </div>

                  <div className="flex gap-4 border-t border-white/5 pt-6 relative">
                     {activeAccount.type === 'demo' && (
                       <Button variant="outline" className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10" onClick={() => window.open('https://testnet.delta.exchange', '_blank')}>
                         Manage Test Funds
                       </Button>
                     )}
                     <Button variant="secondary" onClick={() => show('info', 'Coming soon', 'Transfer history is on the roadmap.')}>Transfer History</Button>
                  </div>
                </Card>

                <div className="space-y-6">
                   <Card
                     className="p-6 bg-[#15151F] border-white/5 flex flex-col items-center justify-center text-center h-full hover:bg-white/[0.02] transition-colors cursor-pointer border-dashed border-white/20 card-hover"
                     onClick={() => handleOpenConnect(activeTab as 'demo' | 'real')}
                   >
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                       <Plus className="w-6 h-6 text-white/60" />
                     </div>
                     <h4 className="font-medium mb-1">Link New Account</h4>
                     <p className="text-sm text-white/40">Add another {activeTab} API key</p>
                   </Card>
                </div>
              </motion.div>
            ) : accounts.length > 0 ? (
              <motion.div key="empty-tab" initial="hidden" animate="show" custom={1} variants={fadeUp}>
                <Card className="p-12 text-center border-white/5 bg-[#15151F]">
                   <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                   <h3 className="text-lg font-semibold mb-2">No {activeTab} account found</h3>
                   <p className="text-white/40 mb-6">Connect your exchange API keys to view balances and trade.</p>
                   <Button variant="gradient" onClick={() => handleOpenConnect(activeTab as 'demo' | 'real')}>Connect {activeTab} Account</Button>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}

      <ConnectAccountModal
        open={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadAccounts}
        defaultMode={connectModalMode}
      />
    </div>
  );
};
