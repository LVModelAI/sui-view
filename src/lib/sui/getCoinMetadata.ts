export async function getCoinMetadata(coinType: string) {
  const res = await fetch(
    `/api/sui/get-coin-metadata?coinType=${encodeURIComponent(coinType)}`,
    {
      method: "GET",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`getCoinMetadata failed: ${res.status} ${err}`);
  }
  return await res.json();
}
