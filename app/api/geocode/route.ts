// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.OPENCAGE_API_KEY; // put it in .env
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    q
  )}&key=${apiKey}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }

  const data = await res.json();
  const result = data.results?.[0];

  if (!result) {
    return NextResponse.json({ error: "No results" }, { status: 404 });
  }

  const { lat, lng } = result.geometry;

  return NextResponse.json({
    lat,
    lng,
    formatted: result.formatted,
  });
}
