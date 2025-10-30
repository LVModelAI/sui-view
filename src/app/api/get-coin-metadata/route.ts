import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const coinType = searchParams.get("coinType");

  const blockberryBase = process.env.BLOCKBERRY_BASE_URL;
  if (!blockberryBase) {
    return new Response(
      JSON.stringify({ error: "Server missing BLOCKBERRY_BASE_URL" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
  if (!coinType) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: coinType" }),
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
    const url = `${blockberryBase}/coins/metadata/${encodeURIComponent(
      coinType
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
        error: "Failed to fetch coin metadata",
        details: String(err),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
