"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchTeslaPrice,
  fetchStockPrice,
  fetchSpaceXPrice,
} from "@/lib/handlers/handler";

type LivePrices = Record<string, number>;

interface LiveMarketContextType {
  livePrices: LivePrices;
  isMarketLoading: boolean;
}

const LiveMarketContext = createContext<LiveMarketContextType | undefined>(
  undefined,
);

// Base fallback prices
const BASE_PRICES: LivePrices = {
  tesla: 245.5,
  spacex: 185.0,
  neuralink: 92.4,
  boring: 45.2,
};

export function LiveMarketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [livePrices, setLivePrices] = useState<LivePrices>(BASE_PRICES);
  const [isMarketLoading, setIsMarketLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch the real prices once
    const initPrices = async () => {
      try {
        const [tesla, spacex, neuralink] = await Promise.all([
          fetchTeslaPrice(),
          fetchSpaceXPrice(),
          fetchStockPrice("neuralink"),
        ]);

        if (isMounted) {
          setLivePrices({
            tesla: Number(tesla) || BASE_PRICES.tesla,
            spacex: Number(spacex) || BASE_PRICES.spacex,
            neuralink: Number(neuralink) || BASE_PRICES.neuralink,
            boring: BASE_PRICES.boring,
          });
          setIsMarketLoading(false);
        }
      } catch (error) {
        console.error("Context fetch error:", error);
        setIsMarketLoading(false);
      }
    };

    initPrices();

    // 2. Run the mature, slow simulation centrally
    const interval = setInterval(() => {
      setLivePrices((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          // Low volatility (max +/- 0.05%) every 15 seconds
          const change = 1 + (Math.random() * 0.001 - 0.0005);
          updated[key] = Number((updated[key] * change).toFixed(2));
        });
        return updated;
      });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <LiveMarketContext.Provider value={{ livePrices, isMarketLoading }}>
      {children}
    </LiveMarketContext.Provider>
  );
}

export function useLiveMarket() {
  const context = useContext(LiveMarketContext);
  if (context === undefined) {
    throw new Error("useLiveMarket must be used within a LiveMarketProvider");
  }
  return context;
}
