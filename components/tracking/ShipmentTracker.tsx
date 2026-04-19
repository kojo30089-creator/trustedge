"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { 
  Search, 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Navigation,
  Box
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

// --- TYPES ---
interface ShipmentLocation {
    lat: number;
    lng: number;
    timestamp: string;
    status: string;
    locationName?: string;
}

interface ShipmentDestination {
    lat: number;
    lng: number;
    status: string;
    timestamp: string;
    label?: string;
}

interface Shipment {
    id: string;
    trackingCode: string;
    status: string;
    history: ShipmentLocation[];
    current: ShipmentLocation | null;
    destination: ShipmentDestination | null;
    originLabel?: string;
    destinationLabel?: string;
}

// --- DYNAMIC IMPORTS ---
const MapView = dynamic(() => import("./MapView"), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-400 text-sm">
            Loading Global Maps...
        </div>
    )
});

// --- HELPERS ---
const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered")) return "bg-emerald-500 text-white";
    if (s.includes("transit") || s.includes("shipped")) return "bg-blue-500 text-white";
    if (s.includes("exception") || s.includes("delay")) return "bg-amber-500 text-white";
    return "bg-gray-500 text-white";
};

// Haversine distance (km)
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

async function geocodeLocation(name: string) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), formatted: data[0].display_name };
        }
        return null;
    } catch {
        return null;
    }
}

export default function ShipmentTracker() {
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [trackingInput, setTrackingInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // --- DATA FETCHING ---
    const handleSearch = async () => {
        if (!trackingInput.trim()) return;
        setLoading(true);
        setSearchError(null);

        try {
            const code = trackingInput.trim().toUpperCase();

            // 1. Find shipment in Firestore
            const shipmentQuery = query(
                collection(db, "shipments"),
                where("trackingCode", "==", code)
            );
            
            const shipmentRes = await getDocs(shipmentQuery);

            if (shipmentRes.empty) {
                setSearchError("Tracking number not found.");
                setShipment(null);
                setLoading(false);
                return;
            }

            const shipmentDoc = shipmentRes.docs[0];
            const s = shipmentDoc.data();
            const shipmentId = shipmentDoc.id;

            // 2. Fetch History from Firestore
            const historyQuery = query(
                collection(db, "shipment_locations"),
                where("shipmentId", "==", shipmentId),
                orderBy("timestamp", "asc")
            );

            const historyRes = await getDocs(historyQuery);

            const history: ShipmentLocation[] = await Promise.all(
                historyRes.docs.map(async (docSnap) => {
                    const h = docSnap.data();
                    
                    // Handle Firestore GeoPoint or manual coordinate arrays
                    let lat = Number.NaN;
                    let lng = Number.NaN;

                    if (h.locationPoint && typeof h.locationPoint.latitude === 'number') {
                        // Assuming Firestore GeoPoint
                        lat = h.locationPoint.latitude;
                        lng = h.locationPoint.longitude;
                    } else if (Array.isArray(h.locationPoint?.coordinates)) {
                        // Assuming GeoJSON format [lng, lat]
                        lng = typeof h.locationPoint.coordinates[0] === "number" ? h.locationPoint.coordinates[0] : Number.NaN;
                        lat = typeof h.locationPoint.coordinates[1] === "number" ? h.locationPoint.coordinates[1] : Number.NaN;
                    }

                    if ((Number.isNaN(lat) || Number.isNaN(lng)) && h.locationName) {
                        const geo = await geocodeLocation(h.locationName);
                        if (geo) { lat = geo.lat; lng = geo.lng; }
                    }

                    // Handle Timestamp formatting
                    const timestampStr = h.timestamp?.toDate 
                        ? h.timestamp.toDate().toISOString() 
                        : (h.createdAt?.toDate ? h.createdAt.toDate().toISOString() : new Date().toISOString());

                    return {
                        lat,
                        lng,
                        status: h.status ?? s.status ?? "In transit",
                        timestamp: timestampStr,
                        locationName: h.locationName ?? "",
                    };
                })
            );

            const current = history.length > 0 ? history[history.length - 1] : null;

            // 3. Destination Logic
            let destLat = Number(s.destinationLat);
            let destLng = Number(s.destinationLng);

            if (Number.isNaN(destLat) || Number.isNaN(destLng)) {
                if (s.destinationCity && s.destinationCountry) {
                    const destName = `${s.destinationCity}, ${s.destinationCountry}`;
                    const geoDest = await geocodeLocation(destName);
                    if (geoDest) { destLat = geoDest.lat; destLng = geoDest.lng; }
                }
            }

            let destination: ShipmentDestination | null = null;
            if (!Number.isNaN(destLat) && !Number.isNaN(destLng)) {
                
                // Handle Expected Delivery Date Timestamp
                const expectedDateStr = s.expectedDeliveryDate?.toDate 
                    ? s.expectedDeliveryDate.toDate().toISOString() 
                    : (typeof s.expectedDeliveryDate === 'string' ? s.expectedDeliveryDate : current?.timestamp || "");

                destination = {
                    lat: destLat,
                    lng: destLng,
                    status: "Destination",
                    timestamp: expectedDateStr,
                    label: s.destinationCity && s.destinationCountry ? `${s.destinationCity}, ${s.destinationCountry}` : "Destination",
                };
            }

            setShipment({
                id: shipmentId,
                trackingCode: s.trackingCode,
                status: s.status ?? "In transit",
                history,
                current,
                destination,
                originLabel: s.originCity && s.originCountry ? `${s.originCity}, ${s.originCountry}` : undefined,
                destinationLabel: s.destinationCity && s.destinationCountry ? `${s.destinationCity}, ${s.destinationCountry}` : undefined,
            });

        } catch (error) {
            console.error(error);
            setSearchError("System error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- DERIVED STATE ---
    const positions: [number, number][] = shipment?.history
        .filter(h => !Number.isNaN(h.lat) && !Number.isNaN(h.lng))
        .map(h => [h.lat, h.lng] as [number, number]) || [];

    if (shipment?.current && !Number.isNaN(shipment.current.lat)) {
        positions.push([shipment.current.lat, shipment.current.lng]);
    }

    let distanceRemaining: number | null = null;
    if (shipment?.current && shipment.destination && !Number.isNaN(shipment.current.lat) && !Number.isNaN(shipment.destination.lat)) {
        distanceRemaining = getDistanceKm(shipment.current.lat, shipment.current.lng, shipment.destination.lat, shipment.destination.lng);
    }

    return (
        <div className="h-[calc(100vh-6rem)] min-h-[600px] flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-[1920px] mx-auto animate-in fade-in duration-500">
            
            {/* LEFT: SIDEBAR (SEARCH + TIMELINE) */}
            <section className="w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-6 shrink-0 h-full overflow-hidden">
                
                {/* 1. Search Box */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Navigation className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        Track Shipment
                    </h1>
                    
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 h-4 w-4 text-gray-400" />
                        <Input 
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Tracking ID (e.g. SHIP-992)"
                            className="h-12 pl-10 pr-24 rounded-xl bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-base"
                        />
                        <Button 
                            onClick={handleSearch}
                            disabled={loading}
                            size="sm"
                            className="absolute right-1.5 h-9 rounded-lg bg-brand-600 hover:bg-brand-700 text-white"
                        >
                            {loading ? "..." : "Track"}
                        </Button>
                    </div>
                    
                    {searchError && (
                        <p className="mt-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg text-center">
                            {searchError}
                        </p>
                    )}
                </div>

                {/* 2. Shipment Details */}
                <div className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-sm">
                    {shipment ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(shipment.status)}`}>
                                            {shipment.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ETA</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {shipment.destination?.timestamp ? new Date(shipment.destination.timestamp).toLocaleDateString() : "Pending"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Box className="h-4 w-4" />
                                        <span>Standard Freight</span>
                                    </div>
                                    {distanceRemaining && (
                                        <div className="text-xs text-gray-500 font-mono">
                                            {distanceRemaining.toFixed(0)} km remaining
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {shipment.history.length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 py-10">No tracking updates available yet.</p>
                                ) : (
                                    shipment.history.slice().reverse().map((event, i) => (
                                        <div key={i} className="relative flex gap-4">
                                            {/* Line */}
                                            {i !== shipment.history.length - 1 && (
                                                <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-200 dark:bg-white/10" />
                                            )}
                                            
                                            {/* Icon */}
                                            <div className={`
                                                relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-zinc-900
                                                ${i === 0 ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400"}
                                            `}>
                                                {i === 0 ? <Truck className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                            </div>

                                            {/* Content */}
                                            <div className="pt-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{event.status}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.locationName || "In Transit"}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                                    {new Date(event.timestamp).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
                            <Package className="h-16 w-16 mb-4 opacity-20" />
                            <p className="font-medium text-gray-900 dark:text-white">Ready to Track</p>
                            <p className="text-xs mt-1 max-w-[200px]">Enter your unique shipment ID to view real-time location and status updates.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* RIGHT: MAP AREA */}
            <section className="flex-1 hidden lg:flex bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-inner relative">
                {shipment && positions.length > 0 ? (
                    <MapView shipment={shipment} positions={positions} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-white/5">
                        <div className="text-center opacity-40">
                            <MapPin className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm font-medium">Map Visualization</p>
                        </div>
                    </div>
                )}
                
                {/* Floating Map Controls (Visual Only) */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-white dark:bg-black/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200 dark:border-white/10">
                        <Navigation className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                </div>
            </section>

        </div>
    );
}