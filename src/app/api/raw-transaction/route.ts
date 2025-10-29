import { NextRequest } from "next/server";

const BLOCKBERRY_BASE = "https://api.blockberry.one/sui/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const digest = searchParams.get("digest");

  if (!digest) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: digest" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const apiKey = process.env.BLOCKBERRY_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server missing BLOCKBERRY_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  try {
    const url = `${BLOCKBERRY_BASE}/raw-transactions/${encodeURIComponent(
      digest
    )}`;
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        "x-api-key": apiKey,
      },
      // Prevent caching to ensure fresh data during demos
      cache: "no-store",
    });

    const text = await upstream.text();
    const status = upstream.status;
    const headers = {
      "content-type":
        upstream.headers.get("content-type") || "application/json",
    };
    return new Response(text, { status, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch raw transaction",
        details: String(err),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
