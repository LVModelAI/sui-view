import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const digest = searchParams.get("digest");
  if (!digest) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: digest" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const blockberryBase = process.env.BLOCKBERRY_BASE_URL;
  const apiKey = process.env.BLOCKBERRY_API_KEY;
  if (!blockberryBase || !apiKey) {
    return new Response(
      JSON.stringify({
        error: "Server missing BLOCKBERRY_BASE_URL or BLOCKBERRY_API_KEY",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  try {
    const url = `${blockberryBase}/transactions/${encodeURIComponent(
      digest
    )}/metadata`;
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
        error: "Failed to fetch transaction metadata",
        details: String(err),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
