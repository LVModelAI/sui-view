import { SuiTransactionBlockResponse } from "@mysten/sui/client";

export interface SuiTransactionResponse {
  id: string;
  jsonrpc: "2.0";
  result: SuiTransactionBlockResponse;
}
export interface SuiGasUsedData {
  computationCost: string;
  storageCost: string;
  storageRebate: string;
  nonRefundableStorageFee: string;
}

export type TxnMetadataObjectType =
  | "ACCOUNT"
  | "COIN"
  | "OBJECT"
  | "NFT"
  | "PACKAGE"
  | string;

export interface TxnMetadataItem {
  objectType: TxnMetadataObjectType;
  id: string;
  name: string | null;
  imgUrl: string | null;
  symbol: string | null;
  poolCoins: unknown | null;
  projectName: string | null;
  projectImg: string | null;
  isIndexed: boolean | null;
  securityMessage: string | null;
}

export type TxnMetadataMap = Record<string, TxnMetadataItem>;
