import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TradingViewChart } from '../components/TradingViewChart';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/Skeleton';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { marketsApi, tradingApi, exchangeApi, accountsApi, authApi } from '../api/client';
import { useToast } from '../components/Toast';
import { Search, ChevronDown, Settings2, Wallet, LineChart, ListOrdered, Store } from 'lucide-react';
import { ConnectAccountModal } from '../components/ConnectAccountModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useWsChannel } from '../hooks/useWsChannel';

type MobileView = 'chart' | 'trade' | 'markets' | 'orders';

export const Trade = () => {
  const { show } = useToast();
  const isDesktop = useIsDesktop();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [orders, setOrders] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('limit');
  const [bottomTab, setBottomTab] = useState('open');
  const [qty, setQty] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [search, setSearch] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('chart');
  // Defaults to requiring confirmation (false) until the real preference
  // loads, rather than risking one-click submission before we know it's
  // actually on — see Settings.tsx for where this gets turned on.
  const [oneClickTrading, setOneClickTrading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    authApi.getMe()
      .then((u: any) => setOneClickTrading(!!u?.settings?.oneClickTrading))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await exchangeApi.getAccounts();
      setAccounts(data);
      if (data.length > 0 && !activeAccountId) {
        setActiveAccountId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setProductsLoading(true);
    marketsApi.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    if (!activeAccountId) {
      setOrders([]);
      setPositions([]);
      return;
    }
    setOrdersLoading(true);
    const request = bottomTab === 'positions'
      ? tradingApi.getPositions(activeAccountId)
      : tradingApi.getOrders(activeAccountId, bottomTab);
    request
      .then(data => (bottomTab === 'positions' ? setPositions(data) : setOrders(data)))
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [bottomTab, activeAccountId]);

  const selectedProduct = products.find(p => p.symbol === selectedSymbol) || products[0];
  const activeAccount = accounts.find(a => a.id === activeAccountId);

  useEffect(() => {
    if (!activeAccountId) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    setBalanceLoading(true);
    accountsApi.getBalance(activeAccountId)
      .then(data => { if (!cancelled) setBalance(data); })
      .catch(err => { console.error(err); if (!cancelled) setBalance(null); })
      .finally(() => { if (!cancelled) setBalanceLoading(false); });
    return () => { cancelled = true; };
  }, [activeAccountId]);

  const refreshOrders = async () => {
    if (!activeAccountId) return;
    if (bottomTab === 'positions') {
      setPositions(await tradingApi.getPositions(activeAccountId));
    } else {
      setOrders(await tradingApi.getOrders(activeAccountId, bottomTab));
    }
  };

  // Live price ticker for the selected symbol — the backend's WS hub only
  // polls/broadcasts a symbol while at least one client is subscribed to it.
  useWsChannel(selectedSymbol ? `market:${selectedSymbol}` : null, (data: { price: number; change: number }) => {
    setProducts(prev => prev.map(p => (p.symbol === selectedSymbol ? { ...p, price: data.price, change: data.change } : p)));
  });

  // Live order/fill updates for the active account (placed, cancelled, or a
  // bot fill) — refresh whichever of the Open/Positions/History tabs is
  // showing, plus the balance panel since a fill changes margin/PnL too.
  useWsChannel(activeAccountId ? `orders:${activeAccountId}` : null, () => {
    refreshOrders();
    if (activeAccountId) accountsApi.getBalance(activeAccountId).then(setBalance).catch(() => {});
  });

  const validateOrder = (): string | null => {
    if (!qty || Number(qty) <= 0) return 'Enter a valid quantity.';
    if (orderType !== 'market' && (!limitPrice || Number(limitPrice) <= 0)) return 'Enter a valid price.';
    if (stopLoss && Number(stopLoss) <= 0) return 'Stop loss must be a positive price.';
    if (takeProfit && Number(takeProfit) <= 0) return 'Take profit must be a positive price.';
    return null;
  };

  // Buy/Sell buttons call this. With one-click trading on, it submits
  // immediately (previous behavior). Otherwise it opens a confirmation
  // dialog first — see Settings.tsx for the toggle.
  const initiateOrder = (side: 'buy' | 'sell') => {
    if (!activeAccountId) return;
    setOrderSide(side);
    setPlaceError('');
    const err = validateOrder();
    if (err) {
      setPlaceError(err);
      return;
    }
    if (oneClickTrading) {
      submitOrder(side);
    } else {
      setPendingOrder(side);
    }
  };

  const submitOrder = async (side: 'buy' | 'sell') => {
    if (!activeAccountId) return;
    setPendingOrder(null);
    setPlacing(true);
    try {
      await tradingApi.createOrder(activeAccountId, {
        symbol: selectedSymbol,
        side,
        size: Number(qty),
        orderType,
        limitPrice: orderType !== 'market' ? Number(limitPrice) : undefined,
        stopLoss: stopLoss ? Number(stopLoss) : undefined,
        takeProfit: takeProfit ? Number(takeProfit) : undefined,
      });
      show('success', `${side === 'buy' ? 'Buy' : 'Sell'} order placed`, `${qty} lots of ${selectedSymbol}`);
      setQty('');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      await refreshOrders();
    } catch (e: any) {
      setPlaceError(e.message || 'Failed to place order.');
      show('error', 'Order failed', e.message);
    } finally {
      setPlacing(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!activeAccountId) return;
    try {
      await tradingApi.cancelOrder(activeAccountId, orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      show('info', 'Order cancelled');
    } catch (e: any) {
      show('error', 'Failed to cancel order', e.message);
    }
  };

  const applyMarginPercent = (pct: number) => {
    if (!balance?.margin) return;
    const price = orderType === 'market' ? selectedProduct?.price : Number(limitPrice) || selectedProduct?.price;
    if (!price) return;
    const size = ((balance.margin * (pct / 100)) / price).toFixed(2);
    setQty(size);
  };

  const OrderTicket = (
    <div className="p-4 space-y-4">
      <Tabs value={orderType} onValueChange={setOrderType}>
        <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
        <TabsTrigger value="limit" className="flex-1">Limit</TabsTrigger>
        <TabsTrigger value="stop" className="flex-1">Stop</TabsTrigger>
      </Tabs>

      {orderType !== 'market' && (
        <div className="flex bg-black/20 rounded-lg border border-white/10 p-1">
          <span className="text-white/40 text-sm px-3 py-1.5 border-r border-white/5 shrink-0">Price</span>
          <input
            type="number"
            value={limitPrice}
            onChange={e => setLimitPrice(e.target.value)}
            className="bg-transparent text-white px-3 w-full outline-none text-sm text-right"
            placeholder="0.00"
          />
        </div>
      )}

      <div className="flex bg-black/20 rounded-lg border border-white/10 p-1">
        <span className="text-white/40 text-sm px-3 py-1.5 border-r border-white/5 shrink-0">Qty (Lots)</span>
        <input
          type="number"
          value={qty}
          onChange={e => setQty(e.target.value)}
          className="bg-transparent text-white px-3 w-full outline-none text-sm text-right"
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map(pct => (
          <button
            key={pct}
            type="button"
            onClick={() => applyMarginPercent(pct)}
            disabled={!activeAccountId}
            className="text-xs py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            {pct}%
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex bg-black/20 rounded-lg border border-white/10 p-1">
          <span className="text-white/40 text-xs px-2 py-1.5 border-r border-white/5 shrink-0">SL</span>
          <input
            type="number"
            value={stopLoss}
            onChange={e => setStopLoss(e.target.value)}
            className="bg-transparent text-white px-2 w-full outline-none text-sm text-right"
            placeholder="Optional"
          />
        </div>
        <div className="flex bg-black/20 rounded-lg border border-white/10 p-1">
          <span className="text-white/40 text-xs px-2 py-1.5 border-r border-white/5 shrink-0">TP</span>
          <input
            type="number"
            value={takeProfit}
            onChange={e => setTakeProfit(e.target.value)}
            className="bg-transparent text-white px-2 w-full outline-none text-sm text-right"
            placeholder="Optional"
          />
        </div>
      </div>

      {placeError && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{placeError}</div>}

      <div className="pt-2 border-t border-white/5">
        <div className="flex justify-between text-xs text-white/40 mb-3">
          <span>Available Margin</span>
          {balanceLoading ? <Skeleton className="h-4 w-20" /> : (
            <span className="text-white">{activeAccount ? `${(balance?.margin || 0).toLocaleString()} USDT` : '-'}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={placing || !activeAccountId}
            className="flex-1 bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:text-green-300 h-12 disabled:opacity-50"
            onClick={() => initiateOrder('buy')}
          >
            {placing && orderSide === 'buy' ? 'Placing...' : 'Buy / Long'}
          </Button>
          <Button
            variant="outline"
            disabled={placing || !activeAccountId}
            className="flex-1 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 h-12 disabled:opacity-50"
            onClick={() => initiateOrder('sell')}
          >
            {placing && orderSide === 'sell' ? 'Placing...' : 'Sell / Short'}
          </Button>
        </div>
      </div>
    </div>
  );

  const MarketsList = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/5 shrink-0 space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Top 10 by Volume</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search markets..."
            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-purple-500/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {productsLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          products.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase())).map(p => (
            <div
              key={p.symbol}
              onClick={() => { setSelectedSymbol(p.symbol); setMobileView('chart'); }}
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.02] border-l-2 transition-colors ${selectedSymbol === p.symbol ? 'border-purple-500 bg-white/[0.02]' : 'border-transparent'}`}
            >
              <div>
                <div className="font-medium text-sm">{p.symbol}</div>
                <div className="text-xs text-white/40">{p.maxLeverage ? `${p.maxLeverage}x` : '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{p.price}</div>
                <div className={`text-xs ${p.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {p.change >= 0 ? '+' : ''}{p.change}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const OrdersPanel = (
    <div className="flex flex-col h-full bg-[#0D0D14]">
      <div className="h-10 border-b border-white/5 flex items-center px-4 bg-[#15151F] shrink-0">
        <Tabs value={bottomTab} onValueChange={setBottomTab} className="bg-transparent h-full pt-1">
          <TabsTrigger value="open" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none">Open{bottomTab === 'open' ? ` (${orders.length})` : ''}</TabsTrigger>
          <TabsTrigger value="positions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none">Positions{bottomTab === 'positions' ? ` (${positions.length})` : ''}</TabsTrigger>
          <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none">History</TabsTrigger>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto">
        {ordersLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : bottomTab === 'positions' ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/40 sticky top-0 bg-[#0D0D14] z-10">
              <tr>
                <th className="px-4 py-2 font-normal">Symbol</th>
                <th className="px-4 py-2 font-normal">Side</th>
                <th className="px-4 py-2 font-normal">Size</th>
                <th className="px-4 py-2 font-normal">Entry Price</th>
                <th className="px-4 py-2 font-normal">Mark Price</th>
                <th className="px-4 py-2 font-normal">Leverage</th>
                <th className="px-4 py-2 font-normal text-right">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {positions.map((p, i) => (
                <tr key={`${p.symbol}-${p.side}-${i}`} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2 font-medium">{p.symbol}</td>
                  <td className={`px-4 py-2 ${p.side === 'long' ? 'text-green-400' : 'text-red-400'} uppercase`}>{p.side}</td>
                  <td className="px-4 py-2">{p.size} Lots</td>
                  <td className="px-4 py-2">{p.entryPrice}</td>
                  <td className="px-4 py-2">{p.markPrice || '—'}</td>
                  <td className="px-4 py-2">{p.leverage ? `${p.leverage}x` : '—'}</td>
                  <td className={`px-4 py-2 text-right font-medium ${p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-white/40">No open positions</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/40 sticky top-0 bg-[#0D0D14] z-10">
              <tr>
                <th className="px-4 py-2 font-normal">Time</th>
                <th className="px-4 py-2 font-normal">Symbol</th>
                <th className="px-4 py-2 font-normal">Side</th>
                <th className="px-4 py-2 font-normal">Price</th>
                <th className="px-4 py-2 font-normal">Amount</th>
                <th className="px-4 py-2 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-white/60 whitespace-nowrap">{new Date(o.createdAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-2 font-medium">{o.symbol}</td>
                  <td className={`px-4 py-2 ${o.side === 'buy' ? 'text-green-400' : 'text-red-400'} uppercase`}>{o.side}</td>
                  <td className="px-4 py-2">{o.limitPrice || 'Market'}</td>
                  <td className="px-4 py-2">{o.size} Lots</td>
                  <td className="px-4 py-2 text-right">
                    {o.status === 'open' && (
                      <button onClick={() => handleCancelOrder(o.id)} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-white/40">No {bottomTab} orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const mobileNavItems: { key: MobileView; label: string; icon: any }[] = [
    { key: 'chart', label: 'Chart', icon: LineChart },
    { key: 'trade', label: 'Trade', icon: Store },
    { key: 'markets', label: 'Markets', icon: Search },
    { key: 'orders', label: 'Orders', icon: ListOrdered },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col h-full bg-[#0A0A0F] overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/5 bg-[#0D0D14] flex items-center justify-between px-3 sm:px-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => setMobileView('markets')}
            className="flex items-center gap-1 sm:gap-2 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <span className="font-bold text-base sm:text-lg">{selectedSymbol}</span>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </button>
          {selectedProduct && (
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div>
                <div className="text-white/40 text-xs">Price</div>
                <div className={selectedProduct.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {selectedProduct.price.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-white/40 text-xs">24h Change</div>
                <div className={selectedProduct.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {selectedProduct.change >= 0 ? '+' : ''}{selectedProduct.change}%
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-sm shrink-0">
          {activeAccount ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-[#15151F] border border-white/5 rounded-lg px-2 sm:px-3 py-1.5">
              <Badge variant={activeAccount.type === 'demo' ? 'demo' : 'real'} className="uppercase text-[10px] px-1.5 py-0 hidden xs:inline-flex">{activeAccount.type}</Badge>
              <span className="font-bold text-white text-xs sm:text-sm"><AnimatedNumber value={balance?.balance || 0} prefix="$" decimals={2} /></span>
            </div>
          ) : (
            <Button size="sm" variant="gradient" onClick={() => setShowConnectModal(true)}>Connect</Button>
          )}
          <Button variant="secondary" size="sm" className="hidden md:flex" onClick={() => show('info', 'Coming soon', 'Chart/order settings are on the roadmap.')}><Settings2 className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Mobile section switcher */}
      <div className="lg:hidden h-12 border-b border-white/5 bg-[#0D0D14] flex items-stretch shrink-0">
        {mobileNavItems.map(item => (
          <button
            key={item.key}
            onClick={() => setMobileView(item.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${mobileView === item.key ? 'text-purple-400 border-b-2 border-purple-500' : 'text-white/50 border-b-2 border-transparent'}`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {!activeAccount && accounts.length === 0 && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <Card className="bg-[#15151F] border-white/5 p-8 text-center max-w-md w-full shadow-2xl">
              <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No account connected</h3>
              <p className="text-white/60 mb-8">You need to connect a Delta Exchange account to start trading.</p>
              <Button variant="gradient" className="w-full" onClick={() => setShowConnectModal(true)}>Connect Account</Button>
            </Card>
          </div>
        )}

        {/* Only one of these two layouts is ever actually mounted — not
            just CSS-hidden — so a heavy widget like TradingView never gets
            instantiated twice at once. */}
        {!isDesktop ? (
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {mobileView === 'chart' && <div className="h-full" style={{ minHeight: 320 }}><TradingViewChart symbol={selectedSymbol} /></div>}
                {mobileView === 'trade' && <div className="h-full overflow-y-auto bg-[#15151F]">{OrderTicket}</div>}
                {mobileView === 'markets' && <div className="h-full bg-[#0D0D14]">{MarketsList}</div>}
                {mobileView === 'orders' && <div className="h-full">{OrdersPanel}</div>}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 border-b border-white/5 relative bg-[#0D0D14]">
                <TradingViewChart symbol={selectedSymbol} />
              </div>
              <div className="h-64 shrink-0">{OrdersPanel}</div>
            </div>

            <div className="w-80 border-l border-white/5 bg-[#15151F] flex flex-col shrink-0">
              <div className="border-b border-white/5">{OrderTicket}</div>
              <div className="flex-1 min-h-0 bg-[#0D0D14]">{MarketsList}</div>
            </div>
          </div>
        )}
      </div>

      <ConnectAccountModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={loadAccounts}
      />
      <ConfirmDialog
        open={!!pendingOrder}
        tone="neutral"
        title={pendingOrder === 'buy' ? 'Confirm Buy Order' : 'Confirm Sell Order'}
        description={
          `${qty} lot${Number(qty) === 1 ? '' : 's'} of ${selectedSymbol} — ` +
          (orderType === 'market' ? 'at market price' : `${orderType} @ ${limitPrice}`) +
          (stopLoss ? `, SL ${stopLoss}` : '') +
          (takeProfit ? `, TP ${takeProfit}` : '') +
          '. One-click trading is off, so orders ask for confirmation — turn it on in Settings to skip this.'
        }
        confirmLabel={pendingOrder === 'buy' ? 'Confirm Buy' : 'Confirm Sell'}
        onCancel={() => setPendingOrder(null)}
        onConfirm={() => pendingOrder && submitOrder(pendingOrder)}
      />
    </motion.div>
  );
};
