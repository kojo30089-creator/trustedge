"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); 

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Clean up previous widget to prevent duplicates on theme change
    containerRef.current.innerHTML = "";

    // 2. Create the specific div that TradingView looks for
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    containerRef.current.appendChild(widgetContainer);

    // 3. Create the script element
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;

    // 4. Configuration
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
        { proName: "FOREXCOM:EURUSD", title: "EUR/USD" }
      ],
      showSymbolLogo: true,
      colorTheme: theme === "dark" ? "dark" : "light",
      isTransparent: true, // This is crucial for your design
      displayMode: "adaptive",
      locale: "en",
    });

    // 5. Append script to the main container
    containerRef.current.appendChild(script);
  }, [theme]); 

  return (
    <div 
      className="tradingview-widget-container w-full h-[72px]" // Height prevents layout shift
      ref={containerRef} 
    />
  );
}

export default TradingViewTicker;