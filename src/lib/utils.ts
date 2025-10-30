import { SuiGasUsedData } from "@/lib/types";
import {
  SuiObjectChange,
  SuiTransaction,
  SuiTransactionBlock,
  SuiTransactionBlockResponse,
} from "@mysten/sui/client";

const MIST_PER_SUI = 1e9;

function ensure0xCoinType(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.includes("::")) return trimmed;
  const parts = trimmed.split("::");
  if (parts.length < 3) return trimmed;
  const pkg = parts[0];
  const pkgWith0x =
    pkg.startsWith("0x") || pkg.startsWith("0X") ? pkg : `0x${pkg}`;
  parts[0] = pkgWith0x;
  return parts.join("::");
}

export function toSui(mist: string): string {
  return (Number(mist) / MIST_PER_SUI).toFixed(6);
}

// // Helper: Convert and label gas usage in both MIST and SUI
// export function enrichGasUsage(gasObject: SuiGasUsedData) {
//   const {
//     computationCost,
//     storageCost,
//     storageRebate,
//     nonRefundableStorageFee,
//   } = gasObject;

//   const gasUsedInMist = {
//     computationCostInMist: computationCost,
//     storageCostInMist: storageCost,
//     storageRebateInMist: storageRebate,
//     nonRefundableStorageFeeInMist: nonRefundableStorageFee,
//   };

//   const gasUsedInSui = {
//     computationCostInSui: toSui(computationCost),
//     storageCostInSui: toSui(storageCost),
//     storageRebateInSui: toSui(storageRebate),
//     nonRefundableStorageFeeInSui: toSui(nonRefundableStorageFee),
//   };

//   const totalMist =
//     BigInt(computationCost) + BigInt(storageCost) - BigInt(storageRebate);
//   const totalSui = (Number(totalMist) / MIST_PER_SUI).toFixed(6);

//   return {
//     gasUsedInMist,
//     gasUsedInSui,
//     totalGasUsedInMist: totalMist.toString(),
//     totalGasUsedInSui: totalSui.toString(),
//   };
// }

function extractCoinTypesFromEvents(events: any[] = []): Set<string> {
  const coinTypes = new Set<string>();

  function recurse(obj: any) {
    if (!obj || typeof obj !== "object") return;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        // Looks like a Move type path, e.g., "0x2::sui::SUI" or "2::sui::SUI"
        if (value.includes("::")) {
          coinTypes.add(ensure0xCoinType(value));
        }
      } else if (typeof value === "object") {
        recurse(value);
      }
    }
  }

  events.forEach((e) => recurse(e.parsedJson));

  return coinTypes;
}

export function extractAllCoinTypes(
  txn: SuiTransactionBlockResponse
): string[] {
  if (!txn?.events || !txn?.balanceChanges) return [];

  const allCoinTypes = new Set<string>();

  // From events (recursively)
  extractCoinTypesFromEvents(txn.events).forEach((t) => allCoinTypes.add(t));

  // From balanceChanges
  txn.balanceChanges.forEach((bc) => {
    if (bc.coinType) allCoinTypes.add(ensure0xCoinType(bc.coinType));
  });

  return Array.from(allCoinTypes);
}

export function handleDecimalConversion(
  amount: string,
  decimals: number
): string {
  return (Number(amount) / 10 ** decimals).toString();
}

/** --- 1️⃣ BALANCE CHANGES --- */
export function annotateBalanceChanges(
  balanceChanges: any[],
  metadata: any[],
  defaultDecimals = 9
) {
  const metaMap = Object.fromEntries(
    metadata.map((m) => [m.coinType.toLowerCase(), m])
  );

  return balanceChanges.map((change) => {
    const type = change.coinType?.toLowerCase();
    const meta = metaMap[type];
    const decimals = meta?.decimals ?? defaultDecimals;

    const humanReadable = handleDecimalConversion(change.amount, decimals);

    return {
      ...change,
      amountHumanReadable: humanReadable,
      amountSymbol: meta?.coinSymbol ?? "UNKNOWN",
      amountName: meta?.coinName ?? "Unknown Token",
      amountIconUrl: meta?.imgUrl ?? null,
    };
  });
}

/** --- 2️⃣ OBJECT CHANGES --- */
export function annotateObjectChanges(objectChanges: any[], metadata: any[]) {
  const metaMap = Object.fromEntries(
    metadata.map((m) => [m.coinType.toLowerCase(), m])
  );

  return objectChanges.map((obj) => {
    const coinMatch = obj.objectType?.match(/Coin<([^>]+)>/);
    const coinType = coinMatch ? coinMatch[1].toLowerCase() : null;
    const meta = coinType ? metaMap[coinType] : undefined;

    return {
      ...obj,
      coinType,
      coinSymbol: meta?.coinSymbol ?? null,
      coinName: meta?.coinName ?? null,
      coinIconUrl: meta?.imgUrl ?? null,
    };
  });
}

/** --- 3️⃣ EVENTS --- */
export function annotateEvents(
  events: any[],
  metadata: any[],
  defaultDecimals = 9
) {
  const metaMap = Object.fromEntries(
    metadata.map((m) => [m.coinType.toLowerCase(), m])
  );

  return events.map((evt) => {
    const pj = evt.parsedJson ?? {};

    // 1) detect coinType from coin_type.name (single-coin events)
    const coinTypeFromNameRaw = pj.coin_type?.name?.toLowerCase?.();
    const coinTypeFromName = coinTypeFromNameRaw
      ? ensure0xCoinType(String(coinTypeFromNameRaw)).toLowerCase()
      : undefined;
    const singleCoinMeta = coinTypeFromName
      ? metaMap[coinTypeFromName]
      : undefined;
    // console.log("singleCoinMeta", singleCoinMeta);

    // 2) also detect from coin_a / coin_b for AMM-style events
    const coinATypeRaw = pj.coin_a?.name?.toLowerCase?.();
    const coinBTypeRaw = pj.coin_b?.name?.toLowerCase?.();
    const coinAType = coinATypeRaw
      ? ensure0xCoinType(String(coinATypeRaw)).toLowerCase()
      : undefined;
    const coinBType = coinBTypeRaw
      ? ensure0xCoinType(String(coinBTypeRaw)).toLowerCase()
      : undefined;
    const coinAmeta = coinAType ? metaMap[coinAType] : undefined;
    const coinBmeta = coinBType ? metaMap[coinBType] : undefined;

    const newParsed = { ...pj };

    // enrich numeric values (amount_in, amount_out, etc.)
    for (const [key, val] of Object.entries(pj)) {
      if (typeof val === "string" && /^\d+$/.test(val)) {
        const keyLower = key.toLowerCase();
        // Preference: if coin_type.name is present, only convert keys that look like amounts
        if (singleCoinMeta && keyLower.includes("amount")) {
          const decimals = singleCoinMeta.decimals ?? defaultDecimals;
          newParsed[`${key}HumanReadable`] = handleDecimalConversion(
            val,
            decimals
          );
          newParsed[`${key}Symbol`] = singleCoinMeta?.coinSymbol ?? "UNKNOWN";
          newParsed[`${key}Name`] = singleCoinMeta?.coinName ?? "Unknown Token";
          newParsed[`${key}IconUrl`] = singleCoinMeta?.imgUrl ?? null;
          continue;
        }

        // Fallback: AMM-style coin_a / coin_b inference
        const isIn = keyLower.includes("in") || keyLower.includes("a");
        const meta = isIn ? coinAmeta : coinBmeta;
        const decimals = meta?.decimals ?? defaultDecimals;

        newParsed[`${key}HumanReadable`] = handleDecimalConversion(
          val,
          decimals
        );
        newParsed[`${key}Symbol`] = meta?.coinSymbol ?? "UNKNOWN";
        newParsed[`${key}Name`] = meta?.coinName ?? "Unknown Token";
        newParsed[`${key}IconUrl`] = meta?.imgUrl ?? null;
      }
    }

    return { ...evt, parsedJson: newParsed };
  });
}

/** --- 4️⃣ GAS USED --- */
export function annotateGasUsed(gasUsed: SuiGasUsedData) {
  const withUnits = Object.entries(gasUsed).reduce((acc, [key, val]) => {
    const num = Number(val);
    acc[`${key}InMist`] = `${num} MIST`;
    acc[`${key}InSui`] = `${(num / 1e9).toString()} SUI`;
    return acc;
  }, {} as Record<string, string>);

  return { ...gasUsed, ...withUnits };
}

/** --- 5️⃣ WRAPPER --- */
export function annotateTxnBlocks(
  txn: SuiTransactionBlockResponse,
  metadata: any[]
) {
  const annotated = { ...txn };

  if (txn.balanceChanges)
    annotated.balanceChanges = annotateBalanceChanges(
      txn.balanceChanges,
      metadata
    );

  if (txn.objectChanges)
    annotated.objectChanges = annotateObjectChanges(
      txn.objectChanges,
      metadata
    );

  if (txn.events) annotated.events = annotateEvents(txn.events, metadata);

  if (txn.effects?.gasUsed && annotated.effects)
    annotated.effects.gasUsed = annotateGasUsed(txn.effects?.gasUsed);

  return annotated;
}
