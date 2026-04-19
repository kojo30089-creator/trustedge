"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { 
    doc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "firebase/firestore";

interface UserDangerActionsProps {
    profileDocId: string;  // profile $id (in Firebase, this is the same as userId)
    userId: string;        // auth userId
    initialStatus?: string; // active | suspended
}

export default function UserDangerActions({
    profileDocId, // Kept for prop compatibility, but we use userId in Firebase
    userId,
    initialStatus = "active",
}: UserDangerActionsProps) {
    const router = useRouter();

    const [status, setStatus] = useState(initialStatus.toLowerCase());

    const [loadingSuspend, setLoadingSuspend] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // modal states
    const [isSuspendModalOpen, setSuspendModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    /* ------------------ Suspend / Unsuspend ------------------ */
    const confirmSuspend = async () => {
        const isCurrentlySuspended = status === "suspended";
        const newStatus = isCurrentlySuspended ? "active" : "suspended";

        try {
            setLoadingSuspend(true);

            // Update user document in Firestore
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { status: newStatus });

            setStatus(newStatus);
            toast.success(
                newStatus === "suspended"
                    ? "User has been suspended."
                    : "User has been re-activated."
            );

            setSuspendModalOpen(false);
            router.refresh();
        } catch (err) {
            console.error("Suspend failed:", err);
            toast.error("Failed to update user status.");
        } finally {
            setLoadingSuspend(false);
        }
    };

    /* ------------------ DELETE USER + DATA ------------------ */
    const confirmDelete = async () => {
        try {
            setLoadingDelete(true);

            // 1) Define queries for all collections where this user has data
            const txQuery = query(collection(db, "transactions"), where("userId", "==", userId));
            const stockQuery = query(collection(db, "stock_logs"), where("userId", "==", userId));
            const notifQuery = query(collection(db, "notifications"), where("userId", "==", userId));
            const invesQuery = query(collection(db, "investments"), where("userId", "==", userId));
            const shipmentQuery = query(collection(db, "shipments"), where("userId", "==", userId));
            
            // Note: shipment_locations are tied to shipmentId, not userId directly.
            // We must fetch shipments first to delete their locations.

            // 2) Fetch all related documents concurrently
            const [
                txRes,
                stockRes,
                notifRes,
                invesRes,
                shipmentRes,
            ] = await Promise.all([
                getDocs(txQuery),
                getDocs(stockQuery),
                getDocs(notifQuery),
                getDocs(invesQuery),
                getDocs(shipmentQuery)
            ]);

            const deletePromises: Promise<void>[] = [];

            // Helper to queue deletes
            const queueDeletes = (snapshot: any, collectionName: string) => {
                snapshot.forEach((docSnap: any) => {
                    deletePromises.push(deleteDoc(doc(db, collectionName, docSnap.id)));
                });
            };

            // Queue standard deletes
            queueDeletes(txRes, "transactions");
            queueDeletes(stockRes, "stock_logs");
            queueDeletes(notifRes, "notifications");
            queueDeletes(invesRes, "investments");
            
            // Queue shipment deletes AND their associated locations
            for (const shipSnap of shipmentRes.docs) {
                // Delete the shipment itself
                deletePromises.push(deleteDoc(doc(db, "shipments", shipSnap.id)));

                // Find and delete all locations attached to this shipment
                const locQuery = query(collection(db, "shipment_locations"), where("shipmentId", "==", shipSnap.id));
                const locRes = await getDocs(locQuery);
                queueDeletes(locRes, "shipment_locations");
            }

            // 3) Execute all sub-document deletes
            await Promise.all(deletePromises);

            // 4) Delete the main user profile
            await deleteDoc(doc(db, "users", userId));

            // ⚠️ NOTE ON FIREBASE AUTH: 
            // Client-side SDKs cannot delete Firebase Auth accounts for security reasons.
            // Only the user themselves can delete their auth, or an Admin via the Firebase Admin SDK (Node.js backend).
            // This code deletes all their database records, effectively ghosting their account.
            // If you want to delete their actual login credentials, you need an API route using firebase-admin.

            toast.success("User and all related data deleted permanently.");
            router.push("/admin-Dashboard-Terminal");
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete user.");
        } finally {
            setLoadingDelete(false);
        }
    };


    return (
        <>
            {/* ---------- UI PANEL ---------- */}
            <div className="rounded-2xl border border-red-200/70 bg-red-50/70 p-4 text-xs shadow-sm dark:border-red-500/30 dark:bg-red-950/30">
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-200">
                            Danger zone
                        </p>
                        <p className="mt-0.5 text-[11px] text-red-600/90 dark:text-red-200/80">
                            Only use these actions if you're absolutely sure.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Suspend Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-between rounded-lg border-red-300 text-[11px] font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-200 dark:hover:bg-red-900/40"
                        onClick={() => setSuspendModalOpen(true)}
                        disabled={loadingSuspend || loadingDelete}
                    >
                        <span>{status === "suspended" ? "Unsuspend user" : "Suspend user"}</span>
                        <span className="text-[10px] opacity-80">
                            {status === "suspended" ? "Restore access" : "Block access"}
                        </span>
                    </Button>

                    {/* Delete Button */}
                    <Button
                        type="button"
                        variant="destructive"
                        className="h-11 w-full justify-between rounded-lg text-[11px] font-semibold"
                        onClick={() => setDeleteModalOpen(true)}
                        disabled={loadingDelete || loadingSuspend}
                    >
                        <span>Delete user & data</span>
                        <span className="text-[10px] opacity-80">No undo</span>
                    </Button>
                </div>
            </div>

            {/* ---------- SUSPEND / UNSUSPEND MODAL ---------- */}
            <Modal isOpen={isSuspendModalOpen} className="max-w-xl" onClose={() => setSuspendModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-2">
                        {status === "suspended" ? "Unsuspend User" : "Suspend User"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        {status === "suspended"
                            ? "This will restore the user's ability to log in and use the platform."
                            : "This action blocks the user from logging in or using their account."}
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmSuspend}
                            disabled={loadingSuspend}
                        >
                            {loadingSuspend ? "Processing..." : status === "suspended" ? "Unsuspend" : "Suspend"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ---------- DELETE MODAL ---------- */}
            <Modal isOpen={isDeleteModalOpen} className="max-w-xl" onClose={() => setDeleteModalOpen(false)}>
                <div className="p-6 ">
                    <h2 className="text-lg font-semibold mb-2">Delete User & All Data</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        This action is permanent. All transactions, shares, notifications, and the profile will be deleted forever.
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={loadingDelete}
                        >
                            {loadingDelete ? "Deleting..." : "Delete permanently"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}