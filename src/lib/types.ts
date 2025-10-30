/** ───────────────────────────────────────────────────────────────
 * 🧱 Sui Transaction Schema (for JSON-RPC v1)
 * All programmable transactions follow this structure
 * ─────────────────────────────────────────────────────────────── */
export interface SuiTransactionResponse {
  id: string;
  jsonrpc: "2.0";
  result: SuiTransactionResult;
}

/** Root "result" object returned by sui_getTransactionBlock */
export interface SuiTransactionResult {
  digest: string;
  transaction: {
    data: {
      messageVersion: string; // "v1"
      transaction: SuiProgrammableTransaction;
      sender: string; // Address
      gasData: SuiGasData;
    };
    txSignatures: string[];
  };
  effects: SuiTransactionEffects;
  events: SuiEvent[];
  objectChanges: SuiObjectChange[];
  balanceChanges: SuiBalanceChange[];
  timestampMs: string;
  checkpoint: string;
}

/** ───────────────────────────────────────────────────────────────
 * ⚙️ Programmable Transaction — core instruction list
 * ─────────────────────────────────────────────────────────────── */
export interface SuiProgrammableTransaction {
  kind: "ProgrammableTransaction";
  inputs: SuiTransactionInput[];
  transactions: SuiInstruction[];
}

/** Input type: either an object reference or a literal ("pure") */
export type SuiTransactionInput =
  | {
      type: "pure";
      valueType: string; // e.g. "u64", "address", "0x1::string::String"
      value: string | number | boolean;
    }
  | {
      type: "object";
      objectType: "immOrOwnedObject" | "sharedObject";
      objectId: string;
      version?: string;
      digest?: string;
      initialSharedVersion?: string;
      mutable?: boolean;
    };

/** MoveVM programmable instruction */
export type SuiInstruction =
  | {
      MoveCall: {
        package: string;
        module: string;
        function: string;
        type_arguments: string[];
        arguments: SuiArgument[];
      };
    }
  | {
      SplitCoins: [string | SuiArgument, SuiArgument[]];
    }
  | {
      MergeCoins: [SuiArgument, SuiArgument[]];
    }
  | {
      MakeMoveVec: [string | null, SuiArgument[]];
    };

/** Argument references in instruction */
export type SuiArgument =
  | { Input: number }
  | { Result: number }
  | { NestedResult: [number, number] };

/** ───────────────────────────────────────────────────────────────
 * ⛽ Gas data
 * ─────────────────────────────────────────────────────────────── */
export interface SuiGasData {
  payment: SuiObjectRef[];
  owner: string;
  price: string; // in MIST
  budget: string; // in MIST
}

export interface SuiObjectRef {
  objectId: string;
  version: number | string;
  digest: string;
}

export interface SuiGasUsedData {
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  nonRefundableStorageFee: string;
}

export interface SuiGasUsedFormattedData {
  gasUsedInMist: {
    computationCostInMist: string;
    storageCostInMist: string;
    storageRebateInMist: string;
    nonRefundableStorageFeeInMist: string;
  };
  gasUsedInSui: {
    computationCostInSui: string;
    storageCostInSui: string;
    storageRebateInSui: string;
    nonRefundableStorageFeeInSui: string;
  };
  totalGasUsedInMist: string;
  totalGasUsedInSui: string;
}

/** ───────────────────────────────────────────────────────────────
 * 🧠 Transaction Effects (post-execution)
 * ─────────────────────────────────────────────────────────────── */
export interface SuiTransactionEffects {
  messageVersion: string;
  status: { status: "success" | "failure" };
  executedEpoch: string;
  gasUsed: SuiGasUsedData;
  modifiedAtVersions?: { objectId: string; sequenceNumber: string }[];
  sharedObjects?: SuiObjectRef[];
  mutated?: SuiObjectChange[];
  deleted?: { objectId: string; version: string; digest: string }[];
  gasObject: {
    owner: { AddressOwner: string };
    reference: SuiObjectRef;
  };
  eventsDigest?: string;
  dependencies?: string[];
  gasUsedFormatted?: SuiGasUsedFormattedData;
}

/** ───────────────────────────────────────────────────────────────
 * 📢 Move Event
 * ─────────────────────────────────────────────────────────────── */
export interface SuiEvent {
  id: { txDigest: string; eventSeq: string };
  packageId: string;
  transactionModule: string;
  sender: string;
  type: string; // fully qualified Move struct type
  parsedJson?: Record<string, any>;
  bcsEncoding?: string;
  bcs?: string;
}

/** ───────────────────────────────────────────────────────────────
 * 🧩 Object / Coin State Changes
 * ─────────────────────────────────────────────────────────────── */
export interface SuiObjectChange {
  type: "mutated" | "created" | "deleted";
  sender: string;
  owner: SuiOwner;
  objectType: string;
  objectId: string;
  version: string;
  previousVersion?: string;
  digest: string;
}

export type SuiOwner =
  | { AddressOwner: string }
  | { Shared: { initial_shared_version: string } };

/** ───────────────────────────────────────────────────────────────
 * 💰 Balance Deltas
 * ─────────────────────────────────────────────────────────────── */
export interface SuiBalanceChange {
  owner: { AddressOwner: string };
  coinType: string; // e.g. "0x2::sui::SUI"
  amount: string; // positive = gain, negative = loss
}
