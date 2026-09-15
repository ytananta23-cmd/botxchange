import { mockAccounts, mockBots, mockCandles, mockOrders, mockPositions, mockProducts, mockUser } from './mockData';

// Falls back to the backend's own default port (see backend/src/env.ts) —
// deliberately NOT 3000, since that's this frontend's own dev server port
// (frontend/package.json's "dev" script).
const BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const USE_MOCK = false; // Toggle this to switch between mock and real backend

// The backend issues a 7-day session (both the JWT expiry and the auth
// cookie's maxAge). Storing the token in sessionStorage would silently cut
// that down to "until the tab is closed", which doesn't match what the
// backend/login flow promise the user — localStorage is the correct match
// for a multi-day session that should survive closing the browser tab.
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('botxchange_auth_token', token);
  } else {
    localStorage.removeItem('botxchange_auth_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('botxchange_auth_token');
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    // Sent alongside the Bearer header so the backend's auth cookie (set
    // SameSite=None/Secure specifically for this cross-origin deployment)
    // actually gets stored/sent — without this, fetch never attaches or
    // persists cross-site cookies and the cookie path silently does nothing.
    credentials: 'include',
  });
  if (!response.ok) {
    // The backend returns { error: "specific message" } on failures (e.g.
    // "An account with this email already exists.", "Invalid email or
    // password.") — surface that instead of the generic HTTP status text
    // so forms can show the user something actionable.
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `API error: ${response.statusText}`);
  }
  return response.json();
}

// Auth
export const authApi = {
  login: async (credentials: any) => {
    if (USE_MOCK) return { user: mockUser, token: 'mock-token' };
    const data = await fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },
  signup: async (data: any) => {
    if (USE_MOCK) return { user: mockUser, token: 'mock-token' };
    const resData = await fetchWithAuth('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
    if (resData.token) {
      setAuthToken(resData.token);
    }
    return resData;
  },
  logout: async () => {
    if (USE_MOCK) return { success: true };
    const data = await fetchWithAuth('/auth/logout', { method: 'POST' });
    setAuthToken(null);
    return data;
  },
  getMe: async () => {
    if (USE_MOCK) return mockUser;
    return fetchWithAuth('/auth/me');
  }
};

// Exchange
export const exchangeApi = {
  connect: async (data: any) => {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!data.apiKey || !data.apiSecret) {
            return reject(new Error('Invalid API credentials'));
          }
          const newAccount = {
            id: `acc_${data.mode}_${Date.now()}`,
            label: data.label || (data.mode === 'demo' ? 'Demo Account' : 'Delta Exchange Main'),
            type: data.mode,
            createdAt: new Date().toISOString(),
            balance: {
              balance: data.mode === 'demo' ? 10000 : 0,
              unrealizedPnl: 0,
              margin: 0,
              marginLevel: 0,
              leverage: 10,
              currency: 'USDT'
            }
          };
          mockAccounts.push(newAccount);
          resolve({ accountId: newAccount.id, status: 'connected' });
        }, 1500); // Simulate verification delay
      });
    }
    return fetchWithAuth('/exchange/connect', { method: 'POST', body: JSON.stringify(data) });
  },
  getAccounts: async () => {
    if (USE_MOCK) return [...mockAccounts];
    return fetchWithAuth('/exchange/accounts');
  },
  deleteAccount: async (id: string) => {
    if (USE_MOCK) {
      const idx = mockAccounts.findIndex(a => a.id === id);
      if (idx > -1) mockAccounts.splice(idx, 1);
      return { success: true };
    }
    return fetchWithAuth(`/exchange/accounts/${id}`, { method: 'DELETE' });
  }
};

// Accounts
export const accountsApi = {
  getBalance: async (id: string) => {
    if (USE_MOCK) return mockAccounts.find(a => a.id === id)?.balance || mockAccounts[0].balance;
    return fetchWithAuth(`/accounts/${id}/balance`);
  },
  deposit: async (id: string, amount: number) => {
    if (USE_MOCK) return { success: true };
    return fetchWithAuth(`/accounts/${id}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) });
  }
};

// Market Data
export const marketsApi = {
  getProducts: async () => {
    if (USE_MOCK) return mockProducts;
    return fetchWithAuth('/markets/products');
  },
  getCandles: async (symbol: string, resolution: string = '5m') => {
    if (USE_MOCK) return mockCandles;
    return fetchWithAuth(`/markets/${symbol}/candles?resolution=${resolution}`);
  }
};

// Trading
export const tradingApi = {
  createOrder: async (accountId: string, orderData: any) => {
    if (USE_MOCK) return { success: true, orderId: `ord_${Date.now()}` };
    return fetchWithAuth(`/accounts/${accountId}/orders`, { method: 'POST', body: JSON.stringify(orderData) });
  },
  getOrders: async (accountId: string, status: string = 'open') => {
    if (USE_MOCK) return mockOrders.filter(o => o.status === status);
    return fetchWithAuth(`/accounts/${accountId}/orders?status=${status}`);
  },
  cancelOrder: async (accountId: string, orderId: string) => {
    if (USE_MOCK) return { success: true };
    return fetchWithAuth(`/accounts/${accountId}/orders/${orderId}`, { method: 'DELETE' });
  },
  getPositions: async (accountId: string) => {
    if (USE_MOCK) return mockPositions;
    return fetchWithAuth(`/accounts/${accountId}/positions`);
  }
};

// Users
export const usersApi = {
  updateProfile: async (data: any) => {
    if (USE_MOCK) {
      Object.assign(mockUser, data);
      return { ...mockUser };
    }
    return fetchWithAuth('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
  updatePassword: async (data: { currentPassword: string; newPassword: string }) => {
    if (USE_MOCK) return { success: true };
    return fetchWithAuth('/users/me/password', { method: 'PATCH', body: JSON.stringify(data) });
  }
};

export const botsApi = {
  getBots: async (accountId: string, status?: string, mode?: string) => {
    if (USE_MOCK) {
      let bots = mockBots;
      if (status) bots = bots.filter(b => b.status === status);
      if (mode) bots = bots.filter(b => b.mode === mode);
      return bots;
    }
    return fetchWithAuth(`/accounts/${accountId}/bots?status=${status || ''}&mode=${mode || ''}`);
  },
  createBot: async (accountId: string, botData: any) => {
    if (USE_MOCK) {
      const newBot = {
        id: `bot_${Date.now()}`,
        name: `${botData.symbol} ${botData.strategyType === 'grid' ? 'Grid' : 'DCA'} Bot`,
        symbol: botData.symbol,
        strategyType: botData.strategyType,
        preset: botData.preset,
        status: 'active',
        mode: botData.mode || 'demo',
        pnl: 0,
        uptime: '0h',
        createdAt: new Date().toISOString(),
        liveTradingEnabled: (botData.mode || 'demo') !== 'real',
      };
      mockBots.unshift(newBot);
      return { success: true, botId: newBot.id };
    }
    return fetchWithAuth(`/accounts/${accountId}/bots`, { method: 'POST', body: JSON.stringify(botData) });
  },
  stopBot: async (accountId: string, botId: string) => {
    if (USE_MOCK) {
      const bot = mockBots.find(b => b.id === botId);
      if (bot) bot.status = 'stopped';
      return { success: true };
    }
    return fetchWithAuth(`/accounts/${accountId}/bots/${botId}/stop`, { method: 'POST' });
  },
  startBot: async (accountId: string, botId: string) => {
    if (USE_MOCK) {
      const bot = mockBots.find(b => b.id === botId);
      if (bot) bot.status = 'active';
      return { success: true };
    }
    return fetchWithAuth(`/accounts/${accountId}/bots/${botId}/start`, { method: 'POST' });
  },
  getPerformance: async (accountId: string, botId: string, range: string = '7d') => {
    if (USE_MOCK) return { profit: 125.50, trades: 14 };
    return fetchWithAuth(`/accounts/${accountId}/bots/${botId}/performance?range=${range}`);
  }
};
