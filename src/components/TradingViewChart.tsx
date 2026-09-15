import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  height?: number | string;
}

// Delta Exchange India's perpetual futures are listed on TradingView
// directly (data source "Delta Exchange India", exchange code DELTAIN),
// under "<SYMBOL>.P" — e.g. our own "BTCUSD" product is TradingView's
// DELTAIN:BTCUSD.P, confirmed against TradingView's own symbol pages for
// BTCUSD.P / ETHUSD.P / SOLUSD.P. Delta's own product `symbol` field
// (fetched in deltaClient.ts) already matches TradingView's base symbol
// 1:1, so no per-coin lookup table is needed — just append ".P".
//
// This shows Delta India's own real order-book chart (price/volume as
// actually traded there), not a same-asset proxy from another exchange —
// note this means testnet/demo accounts still show live production chart
// data, since Delta's testnet isn't a TradingView data source.
function toTradingViewSymbol(symbol: string): string {
  return `DELTAIN:${symbol}.P`;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;
function loadTradingViewScript(): Promise<void> {
  if (window.TradingView) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load TradingView script'));
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, height = '100%' }) => {
  const containerId = useRef(`tv-chart-${Math.random().toString(36).slice(2)}`).current;
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    loadTradingViewScript()
      .then(() => {
        if (cancelled || !window.TradingView) return;
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = '';

        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: toTradingViewSymbol(symbol),
          interval: '5',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0A0A0F',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          backgroundColor: '#0A0A0F',
          gridColor: 'rgba(255, 255, 255, 0.06)',
          container_id: containerId,
          overrides: {
            'paneProperties.background': '#0A0A0F',
            'paneProperties.backgroundType': 'solid',
          },
        });
      })
      .catch(() => {
        // Widget failed to load (e.g. offline) — the container just stays
        // empty; the rest of the trading UI keeps working.
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, containerId]);

  return (
    <div className="relative w-full h-full bg-[#0A0A0F] rounded-lg overflow-hidden">
      <div id={containerId} className="w-full h-full" style={{ height }} />
    </div>
  );
};
