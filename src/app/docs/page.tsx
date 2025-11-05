"use client";

import Image from "next/image";
import { useState } from "react";

export default function DocsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-black dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0 prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-7 prose-p:my-4 prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-li:my-2 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold prose-ol:text-zinc-600 dark:prose-ol:text-zinc-400 prose-ol:my-4 prose-ul:my-4">
          <h1 className="text-4xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 mt-0">
            Sui View — Transaction Translator
          </h1>

          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6 leading-7">
            Human-readable explanations for Sui blockchain transactions. Paste a
            transaction digest and get a clear, Markdown-formatted summary of
            what happened, which tokens were involved, object changes, and gas
            usage.
          </p>

          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">
            Architecture
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            Sui View is a web application that translates complex Sui blockchain
            transactions into easy-to-understand explanations. The system works
            in several stages to collect, enrich, and explain transaction data.
          </p>

          <div className="my-8 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-zinc-900 relative group">
            <Image
              src="/sui-view-architecture.png"
              alt="Sui View Architecture"
              width={1000}
              height={1000}
              className="w-full h-auto cursor-pointer"
              onClick={openFullscreen}
            />
            <button
              onClick={openFullscreen}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-theme-blue-500"
              aria-label="View fullscreen"
              title="View fullscreen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>

          {isFullscreen && (
            <div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={closeFullscreen}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeFullscreen();
              }}
            >
              <button
                onClick={closeFullscreen}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-theme-blue-500"
                aria-label="Close fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="max-w-full max-h-full flex items-center justify-center">
                <Image
                  src="/sui-view-architecture.png"
                  alt="Sui View Architecture"
                  width={2000}
                  height={2000}
                  className="max-w-full max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">
            How It Works
          </h3>

          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            When you submit a transaction digest, the application follows this
            process:
          </p>

          <ol className="list-decimal list-inside my-4 space-y-3 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Fetch Raw Transaction Data:
              </strong>{" "}
              Retrieves the complete transaction details from the Sui
              blockchain, including all balance changes, object modifications,
              and events.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Identify Tokens:
              </strong>{" "}
              Scans the transaction to find all cryptocurrency tokens involved,
              extracting their types and addresses.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Enrich with Metadata:
              </strong>{" "}
              Fetches human-readable information for each token (names, symbols,
              decimals) and transaction metadata (sender names, protocol
              information).
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Convert to Human-Readable Format:
              </strong>{" "}
              Transforms raw numbers into readable amounts using proper decimal
              places and formatting.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Generate Explanation:
              </strong>{" "}
              Uses AI to analyze the enriched transaction data and create a
              natural language explanation of what happened.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Display Results:
              </strong>{" "}
              Presents the explanation in a clean, formatted Markdown display.
            </li>
          </ol>

          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">
            Key Components
          </h3>

          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            The application consists of three main components:
          </p>

          <ul className="list-disc list-inside my-4 space-y-3 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                User Interface:
              </strong>{" "}
              A simple web interface where users can paste transaction digests
              or URLs. The interface handles input validation and displays the
              final explanation.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Data Enrichment Layer:
              </strong>{" "}
              Processes raw blockchain data by identifying tokens, fetching
              metadata, and converting technical values into human-friendly
              formats. This includes converting raw balance changes into
              readable amounts with proper token names and symbols.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Explanation Engine:
              </strong>{" "}
              Uses AI to analyze the enriched transaction data and generate
              natural language explanations. The engine is trained with
              Sui-specific context to provide accurate and relevant
              explanations.
            </li>
          </ul>

          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">
            Data Sources
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            Sui View relies on two primary data sources to provide comprehensive
            transaction explanations:
          </p>

          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">
            Sui Blockchain API
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            Sui Blockchain provides on-chain data services for the Sui
            blockchain. Sui View uses Sui Blockchain to:
          </p>
          <ul className="list-disc list-inside my-4 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Fetch raw transaction data from the blockchain</li>
            <li>
              Retrieve transaction metadata (sender names, protocol information)
            </li>
            <li>Obtain coin metadata (token names, symbols, decimal places)</li>
          </ul>

          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">
            OpenAI
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            OpenAI's language model powers the explanation generation. The
            system uses GPT-4o to analyze enriched transaction data and create
            natural, human-readable explanations. The AI is provided with
            Sui-specific context to ensure accurate interpretation of
            transaction types and patterns.
          </p>

          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">
            Usage Guide
          </h2>

          <ol className="list-decimal list-inside my-4 space-y-3 text-zinc-600 dark:text-zinc-400">
            <li>
              Navigate to the home page and locate the transaction input field.
            </li>
            <li>
              Paste a Sui transaction digest or a full transaction URL from Sui
              explorers.
            </li>
            <li>Click the "Translate" button to begin processing.</li>
            <li>
              Wait while the system fetches and analyzes the transaction data.
              You may see status messages indicating the progress.
            </li>
            <li>
              Read the generated explanation, which will appear below the input
              field. The explanation includes details about tokens involved,
              balance changes, object modifications, and gas usage.
            </li>
          </ol>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 my-6">
            <p className="text-sm text-blue-900 dark:text-blue-200 m-0">
              <strong className="font-semibold text-blue-900 dark:text-blue-200">
                Tip:
              </strong>{" "}
              You can paste either a transaction digest (the alphanumeric hash)
              or a full URL from Sui Vision or other Sui explorers. The system
              will automatically extract the digest from URLs.
            </p>
          </div>

          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">
            What You'll See
          </h3>

          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            The explanation provides a comprehensive overview of the
            transaction:
          </p>

          <ul className="list-disc list-inside my-4 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Transaction Summary:
              </strong>{" "}
              A high-level description of what the transaction accomplished
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Token Movements:
              </strong>{" "}
              Details about which tokens were sent, received, or involved, with
              readable amounts and token names
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Balance Changes:
              </strong>{" "}
              How account balances changed as a result of the transaction
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Object Changes:
              </strong>{" "}
              Information about any Sui objects that were created, modified, or
              deleted
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Gas Information:
              </strong>{" "}
              Details about the gas fees paid for the transaction
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">
                Events:
              </strong>{" "}
              Any events emitted by the transaction, which can provide
              additional context about what happened
            </li>
          </ul>

          {/* <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mt-12 mb-4">
            Limitations
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 leading-7 my-4">
            While Sui View provides comprehensive transaction explanations,
            there are a few things to keep in mind:
          </p>

          <ul className="list-disc list-inside my-4 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              The service requires active API connections to Sui Blockchain and
              OpenAI. Service availability depends on these third-party
              providers.
            </li>
            <li>
              Rate limits from both Sui Blockchain and OpenAI may apply, which could
              affect performance during high usage periods.
            </li>
            <li>
              Sui View is read-only and does not interact with wallets or
              private keys. It only reads public blockchain data and generates
              summaries.
            </li>
            <li>
              The explanations are generated by AI and should be used as a
              helpful guide rather than an authoritative source for critical
              decisions.
            </li>
          </ul> */}
        </div>
      </div>
    </div>
  );
}
