import { NextRequest } from "next/server";
import OpenAI from "openai";
import { SuiContext } from "@/lib/sui-context";

function isValidDigest(value: string) {
  const trimmed = value.trim();
  return /^[A-Za-z0-9]{40,50}$/.test(trimmed);
}

export async function POST(req: NextRequest) {
  const { digest, rawText } = (await req.json().catch(() => ({}))) as {
    digest?: string;
    rawText?: string;
  };

  if (!digest || !isValidDigest(digest)) {
    return new Response(JSON.stringify({ error: "Invalid digest" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (!rawText || !rawText.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing raw transaction data" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  try {
    const client = new OpenAI();
    const systemInstruction = `You are a user-friendly agent that takes a Sui transaction digest (hash) and explains in plain language what actually happened — which objects were created, transferred, or mutated, and how much gas was used. Answer in Markdown.Displays human-readable summaries such as:
 [sender] transferred NFT #1234 to [recipient].”
“2 new objects were created.”
“Gas used: 0.015 SUI.”
Optionally includes a simple visualization (e.g., flow arrows showing sender → recipient).
Provides clear labels for Move calls and involved packages.
 First give a one line human readable but detailed summary of what happened along with the number of tokens involved . then provide a detailed explanation of what happened.`;

    const instructionsWithContext = `${systemInstruction}\n\nReference knowledge base (use for accurate interpretation) :\n${SuiContext}`;

    const response = await client.responses.create({
      model: "gpt-4o",
      instructions: instructionsWithContext,
      input: [
        {
          role: "user",
          content: `Digest: ${digest}\n\nRaw transaction data:\n${rawText}\n\First give a one line human readable summary of what happened. then provide a detailed explanation of what happened. use h1 for the one line summary and other headings and paragraphs for the detailed explanation.`,
        },
      ],
    });

    const explanation = (response as any).output_text ?? "";
    return new Response(JSON.stringify({ digest, explanation }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to generate explanation",
        details: String(err),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
