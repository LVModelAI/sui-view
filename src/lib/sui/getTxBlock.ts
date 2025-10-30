export async function getTxBlock(digest: string) {
  const res = await fetch(
    `/api/sui/get-tx-block?digest=${encodeURIComponent(digest)}`,
    {
      method: "GET",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`getTxBlock failed: ${res.status} ${err}`);
  }
  return await res.json();
}
