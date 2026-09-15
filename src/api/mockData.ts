export const mockUser = {
  id: 'usr_123',
  email: 'trader@example.com',
  name: 'Crypto Trader',
  settings: {
    language: 'en',
    oneClickTrading: false
  }
};

export const mockAccounts: any[] = [];

export const mockProducts = [
  { symbol: 'BTCUSD', description: 'Bitcoin Perpetual', tickSize: 0.5, contractValue: 0.001, maxLeverage: 100, price: 64200.50, change: 2.5 },
  { symbol: 'ETHUSD', description: 'Ethereum Perpetual', tickSize: 0.1, contractValue: 0.01, maxLeverage: 100, price: 3450.20, change: 1.2 },
  { symbol: 'SOLUSD', description: 'Solana Perpetual', tickSize: 0.01, contractValue: 1, maxLeverage: 50, price: 145.80, change: -0.5 },
  { symbol: 'DOGEUSD', description: 'Dogecoin Perpetual', tickSize: 0.0001, contractValue: 100, maxLeverage: 50, price: 0.1250, change: 5.4 },
  { symbol: 'XRPUSD', description: 'Ripple Perpetual', tickSize: 0.0001, contractValue: 10, maxLeverage: 50, price: 0.5840, change: -1.1 },
];

export const mockBots = [
  {
    id: 'bot_1',
    name: 'BTC Grid Scalper',
    symbol: 'BTCUSD',
    strategyType: 'grid',
    preset: 'optimal',
    status: 'active',
    mode: 'real',
    pnl: 145.20,
    uptime: '14d 5h',
    createdAt: new Date().toISOString(),
    liveTradingEnabled: false // matches backend/src/routes/bots.ts: mode !== 'real'
  },
  {
    id: 'bot_2',
    name: 'ETH Trend Follower',
    symbol: 'ETHUSD',
    strategyType: 'dca',
    preset: 'aggressive',
    status: 'stopped',
    mode: 'demo',
    pnl: -24.50,
    uptime: '2d 1h',
    createdAt: new Date().toISOString(),
    liveTradingEnabled: true
  }
];

export const mockOrders = [
  { id: 'ord_1', symbol: 'BTCUSD', side: 'buy', size: 10, orderType: 'limit', limitPrice: 64000, status: 'open', createdAt: new Date().toISOString() },
  { id: 'ord_2', symbol: 'ETHUSD', side: 'sell', size: 50, orderType: 'market', status: 'closed', filledPrice: 3450, createdAt: new Date().toISOString() }
];

export const mockPositions = [
  { id: 'pos_1', symbol: 'BTCUSD', side: 'long', size: 5, entryPrice: 63500, markPrice: 64200.50, pnl: 3.5, leverage: 10 }
];

// Generate fake candle data
export const mockCandles = Array.from({ length: 100 }).map((_, i) => {
  const time = Math.floor(Date.now() / 1000) - (100 - i) * 300;
  const basePrice = 64000;
  const volatility = 100;
  const open = basePrice + Math.random() * volatility - volatility / 2;
  const close = open + Math.random() * volatility - volatility / 2;
  const high = Math.max(open, close) + Math.random() * (volatility / 2);
  const low = Math.min(open, close) - Math.random() * (volatility / 2);
  return { time, open, high, low, close };
});
