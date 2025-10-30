import { NextRequest } from "next/server";
import { BLOCKBERRY_BASE_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const digest = searchParams.get("digest");
  const blockberryBase = BLOCKBERRY_BASE_URL;
  if (!blockberryBase) {
    return new Response(
      JSON.stringify({ error: "Server missing BLOCKBERRY_BASE_URL" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
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
    const url = `${blockberryBase}/raw-transactions/${encodeURIComponent(
      digest
    )}`;
    console.log("url", url);
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        "x-api-key": apiKey,
      },
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
