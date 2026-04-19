"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Truck,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { FaShippingFast } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";

import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  doc,
  addDoc, 
  updateDoc, 
  serverTimestamp,
  GeoPoint
} from "firebase/firestore";

/* ---------- Types ---------- */

type ShipmentStatus =
  | "pending"
  | "created"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "delayed"
  | "cancelled";

interface ShipmentRow {
  id: string;
  trackingCode: string;
  userId: string;
  profileId: string;
  userName: string;
  userEmail: string;
  userCountry: string;
  status: ShipmentStatus;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  carrier: string;
  weight: number;
  expectedDeliveryDate: string | null;
  lastStatus: string;
  lastLocationName: string;
  createdAt: string;
}

interface CreateShipmentForm {
  trackingCode: string;
  status: ShipmentStatus;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  carrier: string;
  weight: string;
  expectedDeliveryDate: string;
  firstLocationName: string;
  firstLocationNote: string;
  firstLocationLat: string;
  firstLocationLng: string;
}

interface ProfileInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
}

interface ShipmentLocation {
  id: string;
  status: ShipmentStatus;
  note: string;
  locationName: string;
  latitude?: number | null;
  longitude?: number | null;
  timestamp: string;
  index: number;
}

/* ---------- Helpers ---------- */

const statusLabel: Record<ShipmentStatus, string> = {
  pending: "Pending",
  created: "Created",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

const statusColor: Record<
  ShipmentStatus,
  "info" | "success" | "warning" | "error" | "dark"
> = {
  pending: "warning",
  created: "info",
  in_transit: "info",
  out_for_delivery: "info",
  delivered: "success",
  delayed: "error",
  cancelled: "dark",
};

const initialCreateForm: CreateShipmentForm = {
  trackingCode: "",
  status: "created",
  originCity: "",
  originCountry: "",
  destinationCity: "",
  destinationCountry: "",
  carrier: "",
  weight: "",
  expectedDeliveryDate: "",
  firstLocationName: "",
  firstLocationNote: "",
  firstLocationLat: "",
  firstLocationLng: "",
};

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHIP-${result}`;
}

/* ---------- Route update form state ---------- */

const initialRouteForm = {
  status: "in_transit" as ShipmentStatus,
  locationName: "",
  note: "",
  lat: "",
  lng: "",
};

export default function UserShipmentsClient({
  profileId, 
  userId,
}: {
  profileId: string;
  userId: string;
}) {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateShipmentForm>(initialCreateForm);
  const [creating, setCreating] = useState(false);

  // Route update modal
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [activeShipment, setActiveShipment] = useState<ShipmentRow | null>(null);
  const [routeLocations, setRouteLocations] = useState<ShipmentLocation[]>([]);
  const [routeForm, setRouteForm] = useState(initialRouteForm);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [updatingRoute, setUpdatingRoute] = useState(false);

  /* ----- Fetch profile + shipments on mount ----- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Get profile by userId
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            throw new Error("User not found");
        }
        
        const userData = userDocSnap.data();

        const profileInfo: ProfileInfo = {
          id: userDocSnap.id,
          userId: userDocSnap.id, 
          firstName: userData.firstName ?? "",
          lastName: userData.lastName ?? "",
          email: userData.email ?? "",
          country: userData.country ?? "",
        };

        setProfile(profileInfo);

        // 2) Fetch shipments belonging to this user
        const shipmentsQuery = query(
            collection(db, "shipments"),
            where("userId", "==", profileInfo.userId),
            orderBy("createdAt", "desc")
        );

        const res = await getDocs(shipmentsQuery);

        const formatted: ShipmentRow[] = res.docs.map((docSnap) => {
            const data = docSnap.data();
            
            const createdAtStr = data.createdAt?.toDate 
                ? data.createdAt.toDate().toISOString() 
                : new Date().toISOString();

            return {
                id: docSnap.id,
                trackingCode: data.trackingCode ?? "",
                userId: data.userId ?? "",
                profileId: data.userId ?? "",
                userName: `${data.userFirstName ?? profileInfo.firstName} ${data.userLastName ?? profileInfo.lastName}`.trim() || "Unknown user",
                userEmail: data.userEmail ?? profileInfo.email ?? "—",
                userCountry: data.userCountry ?? profileInfo.country ?? "—",
                status: (data.status as ShipmentStatus) ?? "pending",
                originCity: data.originCity ?? "",
                originCountry: data.originCountry ?? "",
                destinationCity: data.destinationCity ?? "",
                destinationCountry: data.destinationCountry ?? "",
                carrier: data.carrier ?? "",
                weight: Number(data.weight) || 0,
                expectedDeliveryDate: data.expectedDeliveryDate ?? null, 
                lastStatus: data.lastStatus ?? "",
                lastLocationName: data.lastLocationName ?? "",
                createdAt: createdAtStr,
            };
        });

        setShipments(formatted);
      } catch (error) {
        console.error("Error fetching profile or shipments:", error);
        toast.error("Failed to load shipments for this user.");
        setProfile(null);
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  /* ----- Filters & search ----- */

  const filteredShipments = useMemo(() => {
    let data = shipments;

    if (statusFilter !== "all") {
      data = data.filter((s) => s.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((s) => {
      return (
        s.trackingCode.toLowerCase().includes(q) ||
        s.originCity.toLowerCase().includes(q) ||
        s.destinationCity.toLowerCase().includes(q)
      );
    });
  }, [shipments, search, statusFilter]);

  /* ----- Create shipment handlers ----- */

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetCreateModal = () => {
    setCreateForm(initialCreateForm);
    setCreating(false);
  };

  const handleOpenCreate = () => {
    setCreating(false);
    setCreateForm({
      ...initialCreateForm,
      trackingCode: generateTrackingCode(),
    });
    setCreateModalOpen(true);
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error("Profile not loaded.");
      return;
    }
    if (!createForm.trackingCode.trim()) {
      toast.error("Tracking code is missing. Please close and reopen the modal.");
      return;
    }
    if (!createForm.originCity || !createForm.originCountry) {
      toast.error("Origin city and country are required.");
      return;
    }
    if (!createForm.destinationCity || !createForm.destinationCountry) {
      toast.error("Destination city and country are required.");
      return;
    }

    setCreating(true);
    try {
      const nowStr = new Date().toISOString();

      // 1) Create shipment tied to this user
      const shipmentData = {
        userId: profile.userId,
        trackingCode: createForm.trackingCode.trim(),
        status: createForm.status,
        originCity: createForm.originCity.trim(),
        originCountry: createForm.originCountry.trim(),
        destinationCity: createForm.destinationCity.trim(),
        destinationCountry: createForm.destinationCountry.trim(),
        carrier: createForm.carrier.trim(),
        weight: parseFloat(createForm.weight || "0") || 0,
        expectedDeliveryDate: createForm.expectedDeliveryDate || null,
        lastStatus: createForm.firstLocationNote || statusLabel[createForm.status] || "Shipment created",
        lastLocationName: createForm.firstLocationName || "",
        createdAt: serverTimestamp()
      };

      const shipmentDocRef = await addDoc(collection(db, "shipments"), shipmentData);

      // 2) Create first location (optional)
      if (createForm.firstLocationName || createForm.firstLocationLat) {
        const lat = parseFloat(createForm.firstLocationLat);
        const lng = parseFloat(createForm.firstLocationLng);

        const locationPoint = !isNaN(lat) && !isNaN(lng) ? new GeoPoint(lat, lng) : null;

        await addDoc(collection(db, "shipment_locations"), {
            shipmentId: shipmentDocRef.id, 
            status: createForm.status,
            note: createForm.firstLocationNote || statusLabel[createForm.status] || "Shipment created",
            locationName: createForm.firstLocationName || "",
            locationPoint: locationPoint,
            timestamp: serverTimestamp(),
            index: 0,
        });
      }

      // 3) Update UI
      const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Unknown user";

      const newRow: ShipmentRow = {
        id: shipmentDocRef.id,
        trackingCode: shipmentData.trackingCode,
        userId: profile.userId,
        profileId: profile.userId,
        userName: fullName,
        userEmail: profile.email,
        userCountry: profile.country || "—",
        status: shipmentData.status,
        originCity: shipmentData.originCity,
        originCountry: shipmentData.originCountry,
        destinationCity: shipmentData.destinationCity,
        destinationCountry: shipmentData.destinationCountry,
        carrier: shipmentData.carrier,
        weight: shipmentData.weight,
        expectedDeliveryDate: shipmentData.expectedDeliveryDate,
        lastStatus: shipmentData.lastStatus,
        lastLocationName: shipmentData.lastLocationName,
        createdAt: nowStr,
      };

      setShipments((prev) => [newRow, ...prev]);

      toast.success("Shipment created successfully.");
      setCreateModalOpen(false);
      resetCreateModal();
    } catch (error) {
      console.error("Create shipment error:", error);
      toast.error("Failed to create shipment.");
    } finally {
      setCreating(false);
    }
  };

  /* ---------- Route update handlers ---------- */

  const handleOpenRouteModal = async (shipment: ShipmentRow) => {
    setActiveShipment(shipment);
    setRouteForm(initialRouteForm);
    setRouteLocations([]);
    setRouteModalOpen(true);

    try {
      setLoadingRoute(true);

      const locQuery = query(
          collection(db, "shipment_locations"),
          where("shipmentId", "==", shipment.id),
          orderBy("timestamp", "asc")
      );

      const res = await getDocs(locQuery);

      const mapped: ShipmentLocation[] = res.docs.map((docSnap) => {
          const data = docSnap.data();
          
          const timestampStr = data.timestamp?.toDate 
            ? data.timestamp.toDate().toISOString() 
            : new Date().toISOString();

          return {
            id: docSnap.id,
            status: data.status as ShipmentStatus,
            note: data.note ?? "",
            locationName: data.locationName ?? "",
            latitude: data.locationPoint?.latitude ?? null, 
            longitude: data.locationPoint?.longitude ?? null,
            timestamp: timestampStr,
            index: data.index ?? 0,
          };
      });

      setRouteLocations(mapped);
    } catch (error) {
      console.error("Error loading route:", error);
      toast.error("Failed to load route history.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleRouteFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setRouteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRouteStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShipment) return;

    if (!routeForm.locationName && !routeForm.note) {
      toast.error("Enter at least a location name or note.");
      return;
    }

    setUpdatingRoute(true);
    try {
      const nowStr = new Date().toISOString();
      const lat = parseFloat(routeForm.lat);
      const lng = parseFloat(routeForm.lng);

      const locationPoint = !isNaN(lat) && !isNaN(lng) ? new GeoPoint(lat, lng) : null;

      const status = routeForm.status;
      const note = routeForm.note || statusLabel[status] || "Shipment updated";
      const locationName = routeForm.locationName || "";

      // 1) Create new location step
      const locDocRef = await addDoc(collection(db, "shipment_locations"), {
          shipmentId: activeShipment.id, 
          status: status,
          note: note,
          locationName: locationName,
          locationPoint: locationPoint,
          timestamp: serverTimestamp(),
          index: routeLocations.length, 
      });

      // 2) Update parent shipment's status
      const shipmentRef = doc(db, "shipments", activeShipment.id);
      await updateDoc(shipmentRef, {
          status: status,
          lastStatus: note,
          lastLocationName: locationName,
          updatedAt: serverTimestamp()
      });

      // 3) Update local UI state for route
      const newLocation: ShipmentLocation = {
        id: locDocRef.id,
        status,
        note,
        locationName,
        latitude: locationPoint ? lat : null,
        longitude: locationPoint ? lng : null,
        timestamp: nowStr,
        index: routeLocations.length,
      };

      setRouteLocations((prev) => [...prev, newLocation]);

      // 4) Update shipments list so table reflects new status
      setShipments((prev) =>
        prev.map((s) =>
          s.id === activeShipment.id
            ? {
              ...s,
              status,
              lastStatus: note,
              lastLocationName: locationName,
            }
            : s,
        ),
      );

      toast.success("Route updated.");
      setRouteForm(initialRouteForm);
    } catch (error) {
      console.error("Route update error:", error);
      toast.error("Failed to update route.");
    } finally {
      setUpdatingRoute(false);
    }
  };

  /* ---------- UI ---------- */

  const userName =
    profile && `${profile.firstName} ${profile.lastName}`.trim()
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "User";

  return (
    <>
      {/* Hero bar */}
      <div className="flex h-[26vh] items-center bg-brand-900 px-4 md:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="py-3 flex items-center justify-between">
              <Link href="/admin-Dashboard-Terminal">
                <button className="hover:bg-white/0 text-base text-white/70 font-semibold gap-2 hover:text-white flex items-center ggap-2">
                  <FaArrowLeftLong />
                  Back
                </button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <UserIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">
                  Shipments for
                </p>
                <h1 className="font-inter text-2xl font-bold tracking-wide md:text-3xl lg:text-4xl">
                  {userName}
                </h1>
              </div>
            </div>
            {profile && (
              <p className="text-xs opacity-80">
                {profile.email} • {profile.country || "No country set"}
              </p>
            )}
          </div>

          <Button
            size="lg"
            className="mt-2 flex h-11 items-center gap-2 rounded-full bg-white text-[#420101] hover:bg-gray-100 md:mt-0"
            onClick={handleOpenCreate}
          >
            <FaShippingFast className="h-5 w-5" />
            <span className="text-sm font-semibold md:text-base">
              Create shipment
            </span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 pb-10 md:px-10">
        <div className="mx-auto -mt-6 flex w-full max-w-7xl flex-col gap-6">
          {/* User summary card */}
          {profile && (
            <div className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/40 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 rounded-full">
                  <AvatarImage src="/images/user/user-38.jpg" alt={userName} />
                  <AvatarFallback className="rounded-full text-sm">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text:white">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-white/10">
                  Shipments:{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {shipments.length}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Filters & search */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/40 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Shipments for this user
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Search by tracking code or route. Filter by delivery status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder="Search shipments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-9 text-sm"
                />
              </div>

              {/* Status filter */}
              <select
                className="h-10 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm outline-none focus:border-[#420101] focus:ring-2 focus:ring-[#420101]/20 dark:border-white/10 dark:bg-black dark:text-gray-200"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ShipmentStatus | "all")
                }
              >
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="created">Created</option>
                <option value="in_transit">In transit</option>
                <option value="out_for_delivery">Out for delivery</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/8 dark:bg-black/40">
            <div className="max-w-full overflow-x-auto">
              <Table className="min-w-[980px]">
                <TableHeader className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500 dark:border-white/8 dark:bg-white/5">
                  <TableRow>
                    <TableCell className="px-5 py-3 text-left">
                      Shipment
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      Route
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      Carrier
                    </TableCell>
                    <TableCell className="px-5 py-3 text-center">
                      Weight
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      Status
                    </TableCell>
                    <TableCell className="px-5 py-3 text-left">
                      Created
                    </TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 text-sm dark:divide-white/6">
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Loading shipments…
                      </TableCell>
                    </TableRow>
                  ) : filteredShipments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No shipments found for this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShipments.map((s) => (
                      <TableRow
                        key={s.id}
                        className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5"
                      >
                        {/* Shipment / tracking */}
                        <TableCell className="px-5 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#420101]/10 text-[#420101]">
                              <Package className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {s.trackingCode}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Last: {s.lastStatus || "—"}
                              </p>
                              {s.lastLocationName && (
                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-3 w-3" />
                                  {s.lastLocationName}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Route */}
                        <TableCell className="px-5 py-4 align-top">
                          <p className="text-sm text-gray-800 dark:text-gray-100">
                            {s.originCity}, {s.originCountry}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-400">
                            →
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-100">
                            {s.destinationCity}, {s.destinationCountry}
                          </p>
                        </TableCell>

                        {/* Carrier */}
                        <TableCell className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                            <Truck className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span>{s.carrier || "—"}</span>
                          </div>
                          {s.expectedDeliveryDate && (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              ETA:{" "}
                              {new Date(
                                s.expectedDeliveryDate,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </TableCell>

                        {/* Weight */}
                        <TableCell className="px-5 py-4 text-center align-top text-sm text-gray-800 dark:text-gray-100">
                          {s.weight ? `${s.weight.toFixed(2)} kg` : "—"}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-5 py-4 align-top">
                          <Badge size="sm" color={statusColor[s.status]}>
                            {statusLabel[s.status]}
                          </Badge>
                        </TableCell>

                        {/* Created */}
                        <TableCell className="px-5 py-4 align-top text-xs text-gray-600 dark:text-gray-400">
                          {new Date(s.createdAt).toLocaleString()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-5 py-4 align-top text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={() => handleOpenRouteModal(s)}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Route
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        className="m-4 max-w-3xl"
      >
        <div className="w-full rounded-3xl bg-white p-5 shadow-2xl dark:bg-black lg:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create shipment
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This shipment will be linked directly to this user&apos;s
                profile.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateShipment} className="space-y-5">
            {/* Tracking */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Tracking code
                </label>
                <Input
                  name="trackingCode"
                  value={createForm.trackingCode}
                  readOnly
                  className="mt-2 h-10 text-sm bg-gray-50/80 dark:bg-white/5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={createForm.status}
                  onChange={handleFormChange}
                  className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none focus:border-[#420101] focus:ring-2 focus:ring-[#420101]/20 dark:border-white/15 dark:bg-black dark:text-gray-200"
                >
                  <option value="created">Created</option>
                  <option value="in_transit">In transit</option>
                  <option value="out_for_delivery">Out for delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Route */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Origin city
                </label>
                <Input
                  name="originCity"
                  value={createForm.originCity}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                  placeholder="e.g. Lagos"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Origin country
                </label>
                <Input
                  name="originCountry"
                  value={createForm.originCountry}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                  placeholder="e.g. Nigeria"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Destination city
                </label>
                <Input
                  name="destinationCity"
                  value={createForm.destinationCity}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                  placeholder="e.g. London"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Destination country
                </label>
                <Input
                  name="destinationCountry"
                  value={createForm.destinationCountry}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                  placeholder="e.g. United Kingdom"
                  required
                />
              </div>
            </div>

            {/* Carrier + weight + ETA */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Carrier
                </label>
                <Input
                  name="carrier"
                  value={createForm.carrier}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                  placeholder="e.g. DHL, FedEx"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Weight (kg)
                </label>
                <Input
                  name="weight"
                  type="number"
                  step="0.01"
                  value={createForm.weight}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                  placeholder="e.g. 2.5"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Expected delivery date
                </label>
                <Input
                  name="expectedDeliveryDate"
                  type="date"
                  value={createForm.expectedDeliveryDate}
                  onChange={handleFormChange}
                  className="mt-2 h-10 text-sm"
                />
              </div>
            </div>

            {/* First location block */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 text-xs dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 font-semibold text-gray-800 dark:text-white">
                First location update (optional)
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    Location name
                  </label>
                  <Input
                    name="firstLocationName"
                    value={createForm.firstLocationName}
                    onChange={handleFormChange}
                    className="mt-2 h-9 text-xs"
                    placeholder="e.g. Lagos main hub"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    Status / note
                  </label>
                  <Input
                    name="firstLocationNote"
                    value={createForm.firstLocationNote}
                    onChange={handleFormChange}
                    className="mt-2 h-9 text-xs"
                    placeholder="e.g. Shipment received at facility"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    Latitude
                  </label>
                  <Input
                    name="firstLocationLat"
                    type="number"
                    step="0.000001"
                    value={createForm.firstLocationLat}
                    onChange={handleFormChange}
                    className="mt-2 h-9 text-xs"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    Longitude
                  </label>
                  <Input
                    name="firstLocationLng"
                    type="number"
                    step="0.000001"
                    value={createForm.firstLocationLng}
                    onChange={handleFormChange}
                    className="mt-2 h-9 text-xs"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-10" disabled={creating}>
                {creating ? "Creating..." : "Create shipment"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Route Update Modal */}
      <Modal
        isOpen={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        className="m-4 max-w-3xl"
      >
        <div className="w-full rounded-3xl bg-white p-5 shadow-2xl dark:bg-black lg:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Route history
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {activeShipment?.trackingCode
                  ? `Tracking: ${activeShipment.trackingCode}`
                  : "Select a shipment to view its route history."}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-xs dark:border-white/10 dark:bg-white/5">
            {loadingRoute ? (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Loading route…
              </p>
            ) : routeLocations.length === 0 ? (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                No route updates yet. Add the first location below.
              </p>
            ) : (
              routeLocations.map((loc, i) => (
                <div key={loc.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-[#420101] shrink-0" />
                    {i < routeLocations.length - 1 && (
                      <div className="h-full w-px bg-gray-300 dark:bg-white/10" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {statusLabel[loc.status]}
                    </p>
                    {loc.locationName && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                        <MapPin className="h-3 w-3" />
                        {loc.locationName}
                      </p>
                    )}
                    {loc.note && (
                      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        {loc.note}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                      {new Date(loc.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add new step */}
          <form onSubmit={handleAddRouteStep} className="mt-5 space-y-4">
            <p className="text-xs font-semibold text-gray-800 dark:text-white">
              Add route update
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={routeForm.status}
                  onChange={handleRouteFormChange}
                  className="mt-2 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none focus:border-[#420101] focus:ring-2 focus:ring-[#420101]/20 dark:border-white/15 dark:bg-black dark:text-gray-200"
                >
                  <option value="in_transit">In transit</option>
                  <option value="out_for_delivery">Out for delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                  <option value="created">Created</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  Location name
                </label>
                <Input
                  name="locationName"
                  value={routeForm.locationName}
                  onChange={handleRouteFormChange}
                  className="mt-2 h-9 text-xs"
                  placeholder="e.g. Lagos main hub"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                Status / note
              </label>
              <Input
                name="note"
                value={routeForm.note}
                onChange={handleRouteFormChange}
                className="mt-2 h-9 text-xs"
                placeholder="e.g. Shipment departed facility"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  Latitude
                </label>
                <Input
                  name="lat"
                  type="number"
                  step="0.000001"
                  value={routeForm.lat}
                  onChange={handleRouteFormChange}
                  className="mt-2 h-9 text-xs"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  Longitude
                </label>
                <Input
                  name="lng"
                  type="number"
                  step="0.000001"
                  value={routeForm.lng}
                  onChange={handleRouteFormChange}
                  className="mt-2 h-9 text-xs"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setRouteModalOpen(false)}
              >
                Close
              </Button>
              <Button type="submit" className="h-9" disabled={updatingRoute}>
                {updatingRoute ? "Saving…" : "Add update"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}