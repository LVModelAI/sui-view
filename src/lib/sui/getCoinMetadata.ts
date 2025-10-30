import { suiClient } from "@/lib/sui-client";

export async function getCoinMetadata(coinType: string) {
  return suiClient.getCoinMetadata({
    coinType,
  });
}
