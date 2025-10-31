"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { SuiTransactionResponse } from "@/lib/types";
import { annotateTxnBlocks, extractAllCoinTypes } from "@/lib/utils";
import { getTxBlock } from "@/lib/sui/getTxBlock";
import { getCoinMetadata } from "@/lib/sui/getCoinMetadata";
import { CoinMetadata } from "@mysten/sui/client";
import { TxnMetadataMap, TxnMetadataItem } from "@/lib/types";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import Image from "next/image";

export default function Home() {
  const [digest, setDigest] = useState("");
  const [error, setError] = useState<string>("");
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [translateStage, setTranslateStage] = useState<
    "idle" | "fetching" | "summarizing"
  >("idle");

  function isValidDigest(value: string) {
    const trimmed = value.trim();
    // 40-50 alphanumeric characters (e.g., FwyP... style)
    return /^[A-Za-z0-9]{40,50}$/.test(trimmed);
  }

  function normalizeDigestInput(value: string) {
    const input = value.trim();
    if (!input.includes("/")) return input;
    const lastSegment = input.split("/").pop() || input;
    const noQuery = lastSegment.split("?")[0];
    const noHash = noQuery.split("#")[0];
    return noHash.trim();
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleTranslate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = normalizeDigestInput(digest);
    if (!isValidDigest(trimmed)) {
      setError("Enter a valid digest (40-50 characters, letters and numbers).");
      return;
    }
    handleReset();

    setError("");
    setLoadingTranslate(true);
    setTranslateStage("fetching");
    try {
      console.log("fetching raw transaction...");
      const rawRes = await fetch(
        `/api/raw-transaction?digest=${encodeURIComponent(trimmed)}`
      );
      const data: SuiTransactionResponse = await rawRes.json();
      const txBlock = data.result;
      console.log("fetched raw transaction");
      const coinTypes = extractAllCoinTypes(
        txBlock as unknown as SuiTransactionBlockResponse
      );

      const coins = [];
      // fetch the metadata for all the coin types with a delay of 200ms between each fetch to avoid rate limiting
      for (const coinType of coinTypes) {
        await sleep(200); // Wait 200ms before next fetch
        let coinTypeToFetch = coinType.includes("::sui::SUI")
          ? "0x2::sui::SUI"
          : coinType;
        console.log("fetching coin metadata for ---", coinTypeToFetch);
        const coinRes = await fetch(
          `/api/get-coin-metadata?coinType=${encodeURIComponent(
            coinTypeToFetch
          )}`
        );
        const coin: CoinMetadata = await coinRes.json();
        coins.push({
          ...coin,
          coinType,
        });
      }

      // annotate the transaction blocks with the coin metadata and handle decimal conversion for human readable format
      const annotatedTxn = annotateTxnBlocks(txBlock, coins);

      // fetch the transaction metadata like sender name, protocol name and url, etc, for the transaction digest to add more context to the explanation
      console.log("fetching txn metadata...");
      const txnMetadataRes = await fetch(
        `/api/get-txn-metadata?digest=${encodeURIComponent(trimmed)}`
      );
      const txnMetadataData: SuiTransactionResponse =
        await txnMetadataRes.json();
      console.log("fetched txn metadata");

      // add the transaction metadata to the annotated transaction blocks
      const annotatedWithMeta = { ...annotatedTxn, txnMetadataData };
      console.log("annotated with meta", annotatedWithMeta);
      const enrichedText = JSON.stringify(annotatedWithMeta, null, 2);

      // Update UI
      setTranslateStage("summarizing");
      // 2) Send to model for explanation (streaming)
      setExplanation("");

      // send the enriched text to the model for explanation
      console.log("summarizing txn...");
      const explainRes = await fetch(`/api/explain`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ digest: trimmed, rawText: enrichedText }),
      });

      if (!explainRes.ok) {
        const errText = await explainRes.text();
        console.error("Explain error:", errText);
        setError("Failed to generate explanation. Try again.");
        return;
      }

      const explainData = await explainRes.json();
      console.log("explanation", explainData.explanation);
      setExplanation(explainData?.explanation || "");
    } catch (error) {
      console.error(error);
      setError("An error occurred while translating the transaction.");
    } finally {
      setLoadingTranslate(false);
      setTranslateStage("idle");
    }
  }

  function handleReset() {
    // setDigest("");
    setError("");
    setExplanation("");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-black dark:to-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-black/5 bg-white/70 p-8 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60">
          <div className="mb-8 text-center">
            <div className="flex flex-row gap-3 items-center justify-center">
              <Image
                src={"/sui-vision-logo.png"}
                alt="sui-vision-logo"
                width={100}
                height={100}
                className="w-20"
              />
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                Sui View
              </h1>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Paste a transaction digest to preview what happened. No wallet
              needed.
            </p>
          </div>

          <form onSubmit={handleTranslate} className="mx-auto w-full max-w-2xl">
            <label htmlFor="digest" className="sr-only">
              Sui transaction digest
            </label>
            <div className="group relative">
              <input
                id="digest"
                value={digest}
                onChange={(e) => {
                  setDigest(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter a transaction digest or transaction URL"
                className="w-full rounded-2xl border border-black/10 bg-white/80 py-4 px-4 text-[15px] text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-emerald-500 focus:bg-white focus:shadow-md dark:border-white/15 dark:bg-zinc-800/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus:text-zinc-900"
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                aria-invalid={error ? "true" : "false"}
              />
              {error ? (
                <p className="mt-2 text-sm text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-start">
              <button
                type="submit"
                disabled={loadingTranslate}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {translateStage === "fetching"
                  ? "Fetching txn..."
                  : translateStage === "summarizing"
                  ? "Summarizing txn..."
                  : "Translate"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/30 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800/80 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>

          {explanation ? (
            <div className="mt-8 rounded-2xl border border-black/10 bg-white/80 p-5 text-zinc-900 shadow-sm dark:border-white/15 dark:bg-zinc-800/60 dark:text-zinc-100">
              <h2 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Explanation
              </h2>
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <Markdown>{explanation}</Markdown>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
