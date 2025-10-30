import { SuiGasData, SuiGasUsedData } from "@/lib/types";
import {
  SuiObjectChange,
  SuiTransaction,
  SuiTransactionBlock,
  SuiTransactionBlockResponse,
} from "@mysten/sui/client";

const MIST_PER_SUI = 1e9;

export function toSui(mist: string): string {
  return (Number(mist) / MIST_PER_SUI).toFixed(6);
}

// Helper: Convert and label gas usage in both MIST and SUI
export function enrichGasUsage(gasObject: SuiGasUsedData) {
  const {
    computationCost,
    storageCost,
    storageRebate,
    nonRefundableStorageFee,
  } = gasObject;

  const gasUsedInMist = {
    computationCostInMist: computationCost,
    storageCostInMist: storageCost,
    storageRebateInMist: storageRebate,
    nonRefundableStorageFeeInMist: nonRefundableStorageFee,
  };

  const gasUsedInSui = {
    computationCostInSui: toSui(computationCost),
    storageCostInSui: toSui(storageCost),
    storageRebateInSui: toSui(storageRebate),
    nonRefundableStorageFeeInSui: toSui(nonRefundableStorageFee),
  };

  const totalMist =
    BigInt(computationCost) + BigInt(storageCost) - BigInt(storageRebate);
  const totalSui = (Number(totalMist) / MIST_PER_SUI).toFixed(6);

  return {
    gasUsedInMist,
    gasUsedInSui,
    totalGasUsedInMist: totalMist.toString(),
    totalGasUsedInSui: totalSui.toString(),
  };
}

function extractCoinTypesFromEvents(events: any[] = []): Set<string> {
  const coinTypes = new Set<string>();

  function recurse(obj: any) {
    if (!obj || typeof obj !== "object") return;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        // Looks like a Move type path, e.g., "0x2::sui::SUI"
        if (value.includes("::") && /^[0-9a-fA-Fx]+::/.test(value)) {
          coinTypes.add(value);
        }
      } else if (typeof value === "object") {
        recurse(value);
      }
    }
  }

  events.forEach((e) => recurse(e.parsedJson));

  return coinTypes;
}

export function extractAllCoinTypes(txn: SuiTransactionBlockResponse): {
  fromEvents: string[];
  fromBalanceChanges: string[];
  fromObjectChanges: string[];
  fromMoveCalls: string[];
} {
  if (
    !txn.events ||
    !txn.balanceChanges ||
    !txn.objectChanges ||
    !txn.transaction
  ) {
    return {
      fromEvents: [],
      fromBalanceChanges: [],
      fromObjectChanges: [],
      fromMoveCalls: [],
    };
  }

  // 1️⃣ From events (recursively)
  const fromEvents = new Set<string>();
  extractCoinTypesFromEvents(txn.events).forEach((t) => fromEvents.add(t));

  // 2️⃣ From balanceChanges
  const fromBalanceChanges = new Set<string>();
  txn.balanceChanges?.forEach((bc) => {
    if (bc.coinType) fromBalanceChanges.add(bc.coinType);
  });

  // 3️⃣ From objectChanges
  const fromObjectChanges = new Set<string>();
  txn.objectChanges?.forEach((oc: SuiObjectChange) => {
    if (!oc.type || oc.type === "published" || !oc.objectType) return;
    const match = oc.objectType?.match(/Coin<([^>]+)>/);
    if (match) fromObjectChanges.add(match[1]);
  });

  // 4️⃣ From MoveCalls (type_arguments)
  const fromMoveCalls = new Set<string>();
  // @ts-ignore
  if (!txn.transaction?.data?.transaction?.transactions) {
    return {
      fromEvents: Array.from(fromEvents),
      fromBalanceChanges: Array.from(fromBalanceChanges),
      fromObjectChanges: Array.from(fromObjectChanges),
      fromMoveCalls: [],
    };
  }
  // @ts-ignore
  txn.transaction?.data?.transaction?.transactions?.forEach((op: any) => {
    if (op.MoveCall?.type_arguments) {
      op.MoveCall.type_arguments.forEach((t: string) => fromMoveCalls.add(t));
    }
  });

  return {
    fromEvents: Array.from(fromEvents),
    fromBalanceChanges: Array.from(fromBalanceChanges),
    fromObjectChanges: Array.from(fromObjectChanges),
    fromMoveCalls: Array.from(fromMoveCalls),
  };
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
      amountSymbol: meta?.symbol ?? "UNKNOWN",
      amountName: meta?.name ?? "Unknown Token",
      amountIconUrl: meta?.iconUrl ?? null,
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
      coinSymbol: meta?.symbol ?? null,
      coinName: meta?.name ?? null,
      coinIconUrl: meta?.iconUrl ?? null,
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

    // detect coinType from coin_a / coin_b fields
    const coinAType = pj.coin_a?.name?.toLowerCase?.();
    const coinBType = pj.coin_b?.name?.toLowerCase?.();
    const coinAmeta = coinAType ? metaMap[coinAType] : undefined;
    const coinBmeta = coinBType ? metaMap[coinBType] : undefined;

    const newParsed = { ...pj };

    // enrich numeric values (amount_in, amount_out, etc.)
    for (const [key, val] of Object.entries(pj)) {
      if (typeof val === "string" && /^\d+$/.test(val)) {
        // infer which coin applies: in/out map
        const isIn =
          key.toLowerCase().includes("in") || key.toLowerCase().includes("a");
        const meta = isIn ? coinAmeta : coinBmeta;
        const decimals = meta?.decimals ?? defaultDecimals;

        newParsed[`${key}HumanReadable`] = handleDecimalConversion(
          val,
          decimals
        );
        newParsed[`${key}Symbol`] = meta?.symbol ?? "UNKNOWN";
        newParsed[`${key}Name`] = meta?.name ?? "Unknown Token";
        newParsed[`${key}IconUrl`] = meta?.iconUrl ?? null;
      }
    }

    return { ...evt, parsedJson: newParsed };
  });
}

/** --- 4️⃣ GAS USED --- */
export function annotateGasUsed(gasUsed: any) {
  const withUnits = Object.entries(gasUsed).reduce((acc, [key, val]) => {
    const num = Number(val);
    acc[`${key}InMist`] = `${num} MIST`;
    acc[`${key}InSui`] = `${(num / 1e9).toString()} SUI`;
    return acc;
  }, {} as Record<string, string>);

  return { ...gasUsed, ...withUnits };
}

/** --- 5️⃣ WRAPPER --- */
export function annotateTxnBlocks(txn: any, metadata: any[]) {
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

  if (txn.effects?.gasUsed)
    annotated.effects.gasUsed = annotateGasUsed(txn.effects.gasUsed);

  return annotated;
}
