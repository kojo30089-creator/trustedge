// --- FIREBASE IMPORTS ---
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

// --------------------------------------------------------
// 1. EXTERNAL API FETCH (No Firebase changes needed)
// --------------------------------------------------------
export async function fetchTeslaPrice() {
  // ⚠️ Note: It's best practice to move this API key to your .env file
  // process.env.NEXT_PUBLIC_FINNHUB_API_KEY
  const apiKey = 'd583bspr01qptoaq18ogd583bspr01qptoaq18p0';

  if (!apiKey) throw new Error("Missing API Key");

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=TSLA&token=${apiKey}`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds (Great for Next.js App Router!)
      }
    );

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    return data.c; 
  } catch (error) {
    console.error("Finnhub API Error:", error);
    return 0; 
  }
}

// --------------------------------------------------------
// 2. FIRESTORE CUSTOM PRICES FETCH
// --------------------------------------------------------
export async function fetchStockPrice(symbol: string) {
  const key = symbol.toLowerCase(); // e.g., 'spacex', 'neuralink'

  try {
    // Point Read: Fetching a specific document
    // Make sure to create a collection called "market_data" 
    // and a document inside it called "custom_stocks"
    const docRef = doc(db, "market_data", "custom_stocks");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Return the specific key, safely cast to a Number
      return Number(data[key] || 0);
    }

    console.warn("Custom stocks document not found in Firestore.");
    return 0;

  } catch (error) {
    console.error("Firestore Fetch Error:", error);
    return 0;
  }
}