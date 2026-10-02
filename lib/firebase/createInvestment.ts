import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

export class InvestmentFundingError extends Error {}

function balanceInCents(value: unknown): number {
  const amount = Number(value ?? 0);
  const cents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(cents)) {
    throw new InvestmentFundingError("Invalid account balance. Please contact support.");
  }
  return cents;
}

export function getAvailableInvestmentBalance(profile: {
  totalDeposit?: unknown;
}): number {
  return balanceInCents(profile.totalDeposit) / 100;
}

export async function createInvestment(
  db: Firestore,
  userId: string,
  plan: { id: string; min_amount: number; duration_days: number },
  crypto: string,
  amount: number,
): Promise<number> {
  const amountCents = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    !Number.isSafeInteger(amountCents) ||
    amountCents <= 0 ||
    Math.abs(amount * 100 - amountCents) > 0.000001
  ) {
    throw new InvestmentFundingError("Enter a valid amount with at most two decimal places.");
  }
  if (amount < plan.min_amount) {
    throw new InvestmentFundingError("Minimum requirement not met.");
  }

  const profileRef = doc(db, "users", userId);
  // Keep the same document ID if Firestore retries the transaction.
  const investmentRef = doc(collection(db, "investments"));
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + plan.duration_days);

  return runTransaction(db, async (transaction) => {
    const profileSnap = await transaction.get(profileRef);
    if (!profileSnap.exists()) {
      throw new InvestmentFundingError("User profile not found.");
    }

    const profile = profileSnap.data();
    const depositCents = balanceInCents(profile.totalDeposit);
    if (amountCents > depositCents) {
      throw new InvestmentFundingError("Insufficient total deposit. Investment rejected.");
    }

    const totalDeposit = (depositCents - amountCents) / 100;
    // Keep the account's combined balance in sync; profit cannot fund investments.
    const balance = (depositCents - amountCents + balanceInCents(profile.profit)) / 100;

    // The investment and its debit commit together, or neither is saved.
    transaction.set(investmentRef, {
      userId,
      planId: plan.id,
      crypto,
      amount: amountCents / 100,
      depositDebit: amountCents / 100,
      profitDebit: 0,
      status: "active",
      startDate,
      endDate,
      createdAt: serverTimestamp(),
    });
    transaction.update(profileRef, { totalDeposit, balance });
    return totalDeposit;
  });
}
