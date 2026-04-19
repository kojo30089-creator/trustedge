"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX LEAFLET ICONS IN NEXT.JS ---
// Leaflet's default icon paths often break in bundlers. This fixes it.
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const CurrentIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <div class="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
           <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DestIcon = L.divIcon({
  className: "bg-transparent",
  html: `<div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-md"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// --- TYPES (Must match your page types) ---
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
}

interface MapViewProps {
  shipment: Shipment;
  positions: [number, number][]; 
}

// --- HELPER TO AUTO-FIT BOUNDS ---
function MapController({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions as LatLngTuple[]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [map, positions]);

  return null;
}

export default function MapView({ shipment, positions }: MapViewProps) {
  
  const center = useMemo<LatLngExpression>(() => {
    if (shipment.current && !Number.isNaN(shipment.current.lat)) {
      return [shipment.current.lat, shipment.current.lng];
    }
    return [20, 0]; // Default world view
  }, [shipment]);

  // Filter valid history points for the polyline
  const validRoute = positions.filter(p => !Number.isNaN(p[0]) && !Number.isNaN(p[1])) as LatLngExpression[];

  return (
    <MapContainer
      center={center}
      zoom={4}
      scrollWheelZoom={true}
      className="h-full w-full bg-gray-100 dark:bg-zinc-900"
      zoomControl={false} // We can hide default zoom if we want a cleaner look
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapController positions={validRoute} />

      {/* The Route Line */}
      {validRoute.length > 1 && (
        <Polyline 
          positions={validRoute} 
          pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
        />
      )}

      {/* History Markers */}
      {shipment.history.map((h, i) => {
        if (Number.isNaN(h.lat) || Number.isNaN(h.lng)) return null;
        const isCurrent = i === shipment.history.length - 1;
        
        return (
          <Marker 
            key={i} 
            position={[h.lat, h.lng]} 
            icon={isCurrent ? CurrentIcon : DefaultIcon}
            opacity={isCurrent ? 1 : 0.6}
          >
            <Popup className="text-xs font-sans">
              <div className="font-bold text-gray-800">{h.status}</div>
              <div className="text-gray-500">{h.locationName}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(h.timestamp).toLocaleString()}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Destination Marker */}
      {shipment.destination && !Number.isNaN(shipment.destination.lat) && (
        <Marker 
          position={[shipment.destination.lat, shipment.destination.lng]} 
          icon={DestIcon}
        >
          <Popup className="text-xs font-sans">
            <div className="font-bold text-emerald-600">Destination</div>
            <div className="text-gray-600">{shipment.destination.label}</div>
          </Popup>
        </Marker>
      )}

    </MapContainer>
  );
}