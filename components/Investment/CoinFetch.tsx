"use client"

import * as React from "react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// --- TYPES ---
interface Coin {
    id: string
    symbol: string
    name: string
    image: string
    current_price: number
    price_change_percentage_24h: number
    total_volume: number
    sparkline_in_7d: { price: number[] }
}

interface ProcessedCoin extends Coin {
    chartData: { price: number }[]
    color: string
}

export default function CoinFetch() {
    const router = useRouter()
    const [coins, setCoins] = React.useState<ProcessedCoin[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(false)

    const fetchMarketData = React.useCallback(async () => {
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h"
            )
            if (!response.ok) throw new Error("Rate limit or network error")

            const data: Coin[] = await response.json()

            const processed = data.map((coin) => {
                const prices = coin.sparkline_in_7d.price
                const startPrice = prices[0]
                const endPrice = prices[prices.length - 1]
                const isUp = endPrice >= startPrice

                const simpleChart = prices
                    .filter((_, i) => i % 4 === 0)
                    .map((p) => ({ price: p }))

                return {
                    ...coin,
                    chartData: simpleChart,
                    color: isUp ? "#10b981" : "#f43f5e", 
                }
            })

            setCoins(processed)
            setError(false)
        } catch (err) {
            console.error("Fetch Error:", err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchMarketData()
        const interval = setInterval(fetchMarketData, 60000)
        return () => clearInterval(interval)
    }, [fetchMarketData])

    const handleInvest = (coin: Coin) => {
        router.push(`/investments/${coin.name}`)
    }

    // --- NEW: PREMIUM SKELETON LOADER ---
    if (loading && coins.length === 0) {
        return (
            <div className="w-full flex flex-col gap-4 py-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-2 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div>
                                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
                                <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                        <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                ))}
            </div>
        )
    }

    if (error && coins.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] w-full text-center px-4">
                <div className="h-12 w-12 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-rose-500" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Market Data Unavailable</p>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                    We couldn't connect to the exchange feed. This might be due to API rate limits.
                </p>
                <Button
                    onClick={() => { setLoading(true); fetchMarketData(); }}
                    className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
                >
                    Retry Connection
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-4">
            <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <th className="pb-4 px-2 md:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Asset</th>
                        <th className="pb-4 px-2 md:px-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                        <th className="pb-4 px-2 md:px-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">24h Change</th>
                        <th className="pb-4 px-4 text-right hidden md:table-cell text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume</th>
                        <th className="pb-4 px-4 text-center hidden lg:table-cell text-xs font-semibold text-slate-400 uppercase tracking-wider">7D Trend</th>
                        <th className="pb-4 px-2 md:px-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {coins.map((coin) => {
                        const isUp = coin.price_change_percentage_24h >= 0

                        return (
                            <tr
                                key={coin.id}
                                onClick={() => handleInvest(coin)}
                                className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                                {/* Asset */}
                                <td className="py-4 px-2 md:px-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 overflow-hidden rounded-full border border-slate-100 dark:border-slate-800 bg-white p-[1px] md:p-0.5">
                                            <img
                                                src={coin.image}
                                                alt={coin.name}
                                                className="h-full w-full object-cover rounded-full"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                                                {coin.name}
                                            </div>
                                            <div className="text-[11px] md:text-sm font-medium text-slate-500 uppercase">
                                                {coin.symbol}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Price */}
                                <td className="py-4 px-2 md:px-4 text-right font-mono font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                </td>

                                {/* 24h Change */}
                                <td className="py-4 px-2 md:px-4 text-right">
                                    <div className={`inline-flex items-center justify-end gap-1 font-semibold text-xs md:text-sm ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                                        {isUp ? <TrendingUp className="h-3 w-3 md:h-4 md:w-4" /> : <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />}
                                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                    </div>
                                </td>

                                {/* Volume */}
                                <td className="py-4 px-4 text-right font-medium text-slate-500 hidden md:table-cell text-sm">
                                    ${(coin.total_volume / 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}M
                                </td>

                                {/* Sparkline Chart */}
                                <td className="py-4 px-4 hidden lg:table-cell align-middle">
                                    <div className="h-10 w-28 mx-auto">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={coin.chartData}>
                                                <Line
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke={coin.color}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                />
                                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </td>

                                {/* Action */}
                                <td className="py-4 px-2 md:px-4 text-right">
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleInvest(coin);
                                        }}
                                        className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors font-semibold shadow-none border-none h-8 md:h-9 text-xs px-3 md:px-4"
                                    >
                                        Trade
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}