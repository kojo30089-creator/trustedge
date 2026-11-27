"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  MailOpen,
  CheckCircle2,
  Trash2,
  Eye,
  Search,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "resolved";
  createdAt: string;
}

interface AdminContactMessagesProps {
  onUnreadCountChange?: (count: number) => void;
}

function formatDate(isoString: string): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderMessageStatusBadge(status: ContactMessage["status"]) {
  const styles: Record<ContactMessage["status"], string> = {
    unread: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    read: "text-slate-600 bg-slate-500/10 dark:text-slate-300",
    resolved: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest",
        styles[status] || styles.unread,
      )}
    >
      {status}
    </span>
  );
}

export default function AdminContactMessages({
  onUnreadCountChange,
}: AdminContactMessagesProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unread" | "read" | "resolved"
  >("all");
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "contact_messages"),
        orderBy("createdAt", "desc"),
        limit(100),
      );
      const snap = await getDocs(q);
      const list: ContactMessage[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const createdAtStr = d.createdAtServer?.toDate
          ? d.createdAtServer.toDate().toISOString()
          : d.createdAt || new Date().toISOString();
        const rawStatus = (d.status || "unread").toLowerCase();
        const normalizedStatus: ContactMessage["status"] =
          rawStatus === "resolved" || rawStatus === "read"
            ? rawStatus
            : "unread";
        return {
          id: docSnap.id,
          name: d.name || "Anonymous",
          email: d.email || "No email",
          subject: d.subject || "No subject",
          message: d.message || "",
          status: normalizedStatus,
          createdAt: createdAtStr,
        };
      });
      setMessages(list);
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      toast.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const unread = messages.filter((m) => m.status === "unread").length;
    onUnreadCountChange?.(unread);
  }, [messages, onUnreadCountChange]);

  const filteredMessages = useMemo(() => {
    const q = search.toLowerCase().trim();
    return messages.filter((m) => {
      const matchesStatus =
        statusFilter === "all" || m.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, search, statusFilter]);

  const updateMessageStatus = async (
    id: string,
    newStatus: ContactMessage["status"],
    silent = false,
  ) => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "contact_messages", id), { status: newStatus });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
      );
      setSelectedMessage((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev,
      );
      if (!silent) {
        toast.success(`Message marked as ${newStatus}`);
      }
    } catch (error) {
      console.error("Status update failed:", error);
      if (!silent) toast.error("Failed to update message status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetails = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      updateMessageStatus(msg.id, "read", true);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      setUpdatingId(id);
      await deleteDoc(doc(db, "contact_messages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted");
    } catch (error) {
      console.error("Delete message failed:", error);
      toast.error("Failed to delete message");
    } finally {
      setUpdatingId(null);
    }
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <section className="px-4 md:px-10 mt-14">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Contact Submissions
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              {(["all", "unread", "read", "resolved"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                    statusFilter === tab
                      ? "bg-white dark:bg-[#121214] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search sender, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={fetchMessages}
              disabled={loading}
              aria-label="Refresh contact messages"
              className="h-10 w-10 rounded-xl"
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-[#121214] border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-6">
                    Sender
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">
                    Subject &amp; Preview
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">
                    Status
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">
                    Received
                  </TableCell>
                  <TableCell className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right px-6">
                    Details
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse"
                    >
                      Loading_Contact_Submissions...
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-sm text-slate-500"
                    >
                      No contact form submissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((msg) => (
                    <TableRow
                      key={msg.id}
                      onClick={() => handleOpenDetails(msg)}
                      className={cn(
                        "cursor-pointer border-slate-50 dark:border-white/[0.02] hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors",
                        msg.status === "unread" &&
                          "bg-blue-50/30 dark:bg-blue-950/10",
                      )}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 text-slate-500">
                            {msg.status === "unread" ? (
                              <Mail className="h-4 w-4 text-blue-500" />
                            ) : (
                              <MailOpen className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p
                              className={cn(
                                "text-sm text-slate-900 dark:text-white",
                                msg.status === "unread"
                                  ? "font-bold"
                                  : "font-medium",
                              )}
                            >
                              {msg.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {msg.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 max-w-md">
                        <p
                          className={cn(
                            "text-sm text-slate-800 dark:text-slate-200 truncate",
                            msg.status === "unread"
                              ? "font-semibold"
                              : "font-medium",
                          )}
                        >
                          {msg.subject}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {msg.message}
                        </p>
                      </TableCell>

                      <TableCell className="py-4">
                        {renderMessageStatusBadge(msg.status)}
                      </TableCell>

                      <TableCell className="py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </TableCell>

                      <TableCell className="py-4 text-right px-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(msg);
                          }}
                          className="h-8 rounded-lg text-xs font-semibold gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
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

      {/* Message Details Dialog */}
      <Dialog
        open={Boolean(selectedMessage)}
        onOpenChange={(open) => {
          if (!open) setSelectedMessage(null);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  {renderMessageStatusBadge(selectedMessage.status)}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <DialogTitle className="text-xl leading-snug">
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedMessage.name}
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {selectedMessage.email}
                  </a>
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 rounded-2xl border bg-muted/40 p-4 max-h-[45vh] overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {selectedMessage.message}
                </p>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={updatingId === selectedMessage.id}
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>

                <div className="flex flex-wrap items-center gap-2 justify-end">
                  {selectedMessage.status !== "resolved" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={updatingId === selectedMessage.id}
                      onClick={() =>
                        updateMessageStatus(selectedMessage.id, "resolved")
                      }
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Mark Resolved
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={updatingId === selectedMessage.id}
                      onClick={() =>
                        updateMessageStatus(selectedMessage.id, "unread")
                      }
                      className="gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Mark Unread
                    </Button>
                  )}

                  <Button asChild size="sm" className="gap-1.5">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Reply via Email
                    </a>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
