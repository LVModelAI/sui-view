import { suiClient } from "@/lib/sui-client";

export async function getTxBlock(digest: string) {
  return suiClient.getTransactionBlock({
    digest,
    options: {
      showInput: true,
      showRawInput: false,
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
      showBalanceChanges: true,
      showRawEffects: false,
    },
  });
}
