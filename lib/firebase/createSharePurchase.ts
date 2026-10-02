import { collection, doc, runTransaction, serverTimestamp, type Firestore } from "firebase/firestore";

export class SharePurchaseError extends Error {}

export async function createSharePurchase(
  db: Firestore,
  userId: string,
  shareType: string,
  amount: number,
  pricePerShare: number,
): Promise<number> {
  const amountCents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || !Number.isSafeInteger(amountCents) || amountCents <= 0 ||
      Math.abs(amount * 100 - amountCents) > 0.000001) {
    throw new SharePurchaseError("Enter a valid amount with at most two decimal places.");
  }
  if (!Number.isFinite(pricePerShare) || pricePerShare <= 0) {
    throw new SharePurchaseError("Share price is unavailable. Please try again.");
  }

  const userRef = doc(db, "users", userId);
  const logRef = doc(collection(db, "stock_logs"));

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef);
    if (!snapshot.exists()) throw new SharePurchaseError("User profile not found.");

    const deposit = Number(snapshot.data().totalDeposit ?? 0);
    const depositCents = Math.round(deposit * 100);
    if (!Number.isFinite(deposit) || deposit < 0 || !Number.isSafeInteger(depositCents)) {
      throw new SharePurchaseError("Invalid deposit balance. Please contact support.");
    }
    if (amountCents > depositCents) {
      throw new SharePurchaseError("Insufficient total deposit. Profit cannot be used to buy shares.");
    }

    const totalDeposit = (depositCents - amountCents) / 100;
    transaction.set(logRef, {
      userId,
      shares: Number((amount / pricePerShare).toFixed(6)),
      amount,
      pricePerShare,
      shareType,
      status: "success",
      createdAt: serverTimestamp(),
    });
    transaction.update(userRef, { totalDeposit });
    return totalDeposit;
  });
}
