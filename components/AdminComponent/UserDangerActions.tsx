"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Pencil, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import {
    doc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";

const PRESET_SUSPENSION_REASONS = [
    "Suspicious account activity or unauthorized access attempt.",
    "Incomplete or unverified KYC / identity documentation.",
    "Violation of platform Terms of Service.",
    "Payment dispute, chargeback, or compliance hold.",
    "Pending routine security and compliance review.",
];

interface UserDangerActionsProps {
    profileDocId: string;  // profile $id (in Firebase, this is the same as userId)
    userId: string;        // auth userId
    initialStatus?: string; // active | suspended
    initialReason?: string | null;
}

type SuspendDialogMode = "suspend" | "unsuspend" | "edit-reason";

export default function UserDangerActions({
    profileDocId, // Kept for prop compatibility, but we use userId in Firebase
    userId,
    initialStatus = "active",
    initialReason = null,
}: UserDangerActionsProps) {
    const router = useRouter();
    const reasonInputId = useId();
    const reasonHelperId = useId();
    const reasonErrorId = useId();
    const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);

    const [status, setStatus] = useState(initialStatus.toLowerCase());
    const [currentReason, setCurrentReason] = useState(initialReason || "");

    const [reasonInput, setReasonInput] = useState(initialReason || "");
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [reasonTouched, setReasonTouched] = useState(false);

    const [loadingSuspend, setLoadingSuspend] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // modal states
    const [isSuspendModalOpen, setSuspendModalOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<SuspendDialogMode>("suspend");
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const openSuspendDialog = (mode: SuspendDialogMode) => {
        setDialogMode(mode);
        setReasonError(null);
        setReasonTouched(false);
        if (mode === "edit-reason") {
            setReasonInput(currentReason);
        } else if (mode === "suspend") {
            setReasonInput(currentReason || "");
        }
        setSuspendModalOpen(true);
    };

    const validateReason = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return "Please provide a reason for suspending this account.";
        }
        if (trimmed.length < 10) {
            return "Please enter at least 10 characters so the user understands the restriction.";
        }
        return null;
    };

    /* ------------------ Suspend / Unsuspend / Edit Reason ------------------ */
    const handleSuspendSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (dialogMode === "unsuspend") {
            await executeUnsuspend();
            return;
        }

        const validationError = validateReason(reasonInput);
        if (validationError) {
            setReasonTouched(true);
            setReasonError(validationError);
            reasonTextareaRef.current?.focus();
            return;
        }

        const trimmedReason = reasonInput.trim();

        try {
            setLoadingSuspend(true);
            const userRef = doc(db, "users", userId);

            if (dialogMode === "edit-reason") {
                await updateDoc(userRef, {
                    suspensionReason: trimmedReason,
                });
                setCurrentReason(trimmedReason);
                toast.success("Suspension reason updated.");
            } else {
                await updateDoc(userRef, {
                    status: "suspended",
                    suspensionReason: trimmedReason,
                    suspendedAt: new Date().toISOString(),
                });
                setStatus("suspended");
                setCurrentReason(trimmedReason);
                toast.success("User has been suspended.");
            }

            setSuspendModalOpen(false);
            router.refresh();
        } catch (err) {
            console.error("Suspend update failed:", err);
            toast.error("Failed to update user suspension.");
        } finally {
            setLoadingSuspend(false);
        }
    };

    const executeUnsuspend = async () => {
        try {
            setLoadingSuspend(true);

            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                status: "active",
                suspensionReason: "",
                suspendedAt: null,
            });

            setStatus("active");
            setCurrentReason("");
            setReasonInput("");
            toast.success("User has been re-activated.");

            setSuspendModalOpen(false);
            router.refresh();
        } catch (err) {
            console.error("Unsuspend failed:", err);
            toast.error("Failed to re-activate user.");
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
                getDocs(shipmentQuery),
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
                deletePromises.push(deleteDoc(doc(db, "shipments", shipSnap.id)));

                const locQuery = query(collection(db, "shipment_locations"), where("shipmentId", "==", shipSnap.id));
                const locRes = await getDocs(locQuery);
                queueDeletes(locRes, "shipment_locations");
            }

            // 3) Execute all sub-document deletes
            await Promise.all(deletePromises);

            // 4) Delete the main user profile
            await deleteDoc(doc(db, "users", userId));

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
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-200">
                            Danger zone
                        </p>
                        <p className="mt-0.5 text-[11px] text-red-600/90 dark:text-red-200/80">
                            Only use these actions if you&apos;re absolutely sure.
                        </p>
                    </div>
                </div>

                {/* Active Suspension Reason Preview */}
                {status === "suspended" && (
                    <div className="mb-3 rounded-xl border border-amber-300/60 bg-amber-50/90 p-3 dark:border-amber-500/30 dark:bg-amber-950/40">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                        Active Suspension Reason
                                    </p>
                                    <p className="mt-1 text-xs text-amber-950 dark:text-amber-100 break-words">
                                        {currentReason || "No custom reason specified (default message shown)."}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 shrink-0 px-2 text-[11px] font-semibold text-amber-800 hover:bg-amber-200/60 dark:text-amber-200 dark:hover:bg-amber-900/50"
                                onClick={() => openSuspendDialog("edit-reason")}
                                disabled={loadingSuspend || loadingDelete}
                            >
                                <Pencil className="h-3 w-3 mr-1" aria-hidden="true" />
                                Edit
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {/* Suspend / Unsuspend Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full justify-between rounded-lg border-red-300 text-[11px] font-semibold text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-200 dark:hover:bg-red-900/40"
                        onClick={() => openSuspendDialog(status === "suspended" ? "unsuspend" : "suspend")}
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
                        <span>Delete user &amp; data</span>
                        <span className="text-[10px] opacity-80">No undo</span>
                    </Button>
                </div>
            </div>

            {/* ---------- SUSPEND / UNSUSPEND / EDIT REASON DIALOG ---------- */}
            <Dialog open={isSuspendModalOpen} onOpenChange={setSuspendModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleSuspendSubmit} noValidate>
                        <DialogHeader>
                            <DialogTitle>
                                {dialogMode === "unsuspend"
                                    ? "Unsuspend User"
                                    : dialogMode === "edit-reason"
                                      ? "Edit Suspension Reason"
                                      : "Suspend User"}
                            </DialogTitle>
                            <DialogDescription>
                                {dialogMode === "unsuspend"
                                    ? "This will restore the user's ability to log in and use the platform, and clear any active suspension reason."
                                    : "Provide a clear reason for this restriction. The user will see this message when they attempt to access their account."}
                            </DialogDescription>
                        </DialogHeader>

                        {dialogMode !== "unsuspend" && (
                            <div className="my-5 space-y-4">
                                {/* Quick Preset Reasons */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Quick presets
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESET_SUSPENSION_REASONS.map((preset) => {
                                            const isSelected = reasonInput.trim() === preset;
                                            return (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => {
                                                        setReasonInput(preset);
                                                        if (reasonError) {
                                                            setReasonError(null);
                                                        }
                                                    }}
                                                    className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                                                        isSelected
                                                            ? "border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-950/50 dark:text-red-200"
                                                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`}
                                                >
                                                    {preset}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Reason Textarea */}
                                <div className="space-y-2">
                                    <Label htmlFor={reasonInputId}>
                                        Reason for suspension{" "}
                                        <span className="text-destructive" aria-hidden="true">*</span>
                                    </Label>
                                    <Textarea
                                        ref={reasonTextareaRef}
                                        id={reasonInputId}
                                        name="suspensionReason"
                                        rows={4}
                                        required
                                        maxLength={500}
                                        value={reasonInput}
                                        onChange={(e) => {
                                            const nextVal = e.target.value;
                                            setReasonInput(nextVal);
                                            if (reasonError && !validateReason(nextVal)) {
                                                setReasonError(null);
                                            }
                                        }}
                                        onBlur={() => {
                                            setReasonTouched(true);
                                            setReasonError(validateReason(reasonInput));
                                        }}
                                        aria-invalid={Boolean(reasonError)}
                                        aria-describedby={
                                            reasonError
                                                ? `${reasonHelperId} ${reasonErrorId}`
                                                : reasonHelperId
                                        }
                                        placeholder="Describe why this account is being suspended..."
                                        className="resize-y"
                                    />
                                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span id={reasonHelperId}>
                                            Displayed to the user on the suspension page.
                                        </span>
                                        <span className="tabular-nums shrink-0">
                                            {reasonInput.length}/500
                                        </span>
                                    </div>
                                    {reasonError && (reasonTouched || reasonError) && (
                                        <p
                                            id={reasonErrorId}
                                            role="alert"
                                            className="text-xs font-medium text-destructive"
                                        >
                                            {reasonError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <DialogFooter className={dialogMode === "unsuspend" ? "mt-6" : ""}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSuspendModalOpen(false)}
                                disabled={loadingSuspend}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant={dialogMode === "edit-reason" ? "default" : "destructive"}
                                disabled={loadingSuspend}
                            >
                                {loadingSuspend
                                    ? "Saving..."
                                    : dialogMode === "unsuspend"
                                      ? "Unsuspend User"
                                      : dialogMode === "edit-reason"
                                        ? "Save Reason"
                                        : "Suspend User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ---------- DELETE DIALOG ---------- */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Delete User &amp; All Data</DialogTitle>
                        <DialogDescription>
                            This action is permanent. All transactions, shares, notifications, and the profile will be deleted forever.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={loadingDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={loadingDelete}
                        >
                            {loadingDelete ? "Deleting..." : "Delete permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
