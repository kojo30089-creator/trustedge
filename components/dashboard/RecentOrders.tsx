"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  ArrowRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Skeleton } from "../ui/skeleton";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

type TransactionStatus = "approved" | "pending" | "rejected";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: TransactionStatus;
  created_at: string;
};

const formatCurrency = (amount: number) =>
  amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

function getTypeMeta(type: string) {
  const t = type.toLowerCase();

  if (t.includes("deposit")) {
    return {
      label: "Deposit",
      icon: <ArrowDownToLine className="h-4 w-4 text-emerald-600" />,
      chipClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }

  if (t.includes("withdraw")) {
    return {
      label: "Withdraw",
      icon: <ArrowUpFromLine className="h-4 w-4 text-rose-600" />,
      chipClass:
        "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    };
  }

  if (t.includes("invest")) {
    return {
      label: "Investment",
      icon: <Repeat className="h-4 w-4 text-indigo-600" />,
      chipClass:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    };
  }

  return {
    label: type.replace("_", " "),
    icon: <Repeat className="h-4 w-4 text-slate-600" />,
    chipClass:
      "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
  };
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5) // Replaces Appwrite's Query.limit(5)
        );

        const querySnapshot = await getDocs(q);

        const txs: Transaction[] = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          
          // Handle Firestore Timestamp
          const createdAtStr = data.createdAt?.toDate 
              ? data.createdAt.toDate().toISOString() 
              : (data.createdAt || new Date().toISOString());

          return {
            id: docSnap.id,
            type: data.type || "unknown",
            amount: Number(data.amount) || 0,
            status: (data.status as TransactionStatus) || "pending",
            created_at: createdAtStr,
          };
        });

        setTransactions(txs);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white/90 px-4 pb-4 pt-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/40 sm:px-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            A quick snapshot of your latest account activity.
          </p>
        </div>

        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-black/40 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-[560px]">
          <TableHeader className="border-y border-gray-100 bg-gray-50/70 dark:border-white/10 dark:bg-white/5">
            <TableRow>
              <TableCell className="py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Type
              </TableCell>
              <TableCell className="py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Amount
              </TableCell>
              <TableCell className="py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </TableCell>
              <TableCell className="py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Date
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/10">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-28 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => {
                const meta = getTypeMeta(tx.type);

                return (
                  <TableRow
                    key={tx.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/5"
                  >
                    {/* Type */}
                    <TableCell className="py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.chipClass}`}
                        >
                          {meta.icon}
                          <span>{meta.label}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                      {formatCurrency(tx.amount)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3 text-sm">
                      <Badge
                        size="sm"
                        color={
                          tx.status === "approved"
                            ? "success"
                            : tx.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No recent transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}