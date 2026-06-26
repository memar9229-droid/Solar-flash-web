    /**
 * api/services/helius.js
 * Clean Helius RPC service
 */
import { httpPost, log } from "../lib/http.js";

const RPC_URL = () => {
  const k = process.env.HELIUS_API_KEY;
  if (!k) throw new Error("HELIUS_API_KEY not set");
  return `https://mainnet.helius-rpc.com/?api-key=${k}`;
};

export async function rpc(method, params) {
  log("info", "Helius RPC", { method });
  const r = await httpPost(RPC_URL(), { jsonrpc:"2.0", id:1, method, params });
  if (!r.ok) throw new Error(`Helius RPC ${method} failed: ${r.status}`);
  const data = await r.json();
  if (data.error) throw new Error(`Helius RPC error: ${data.error.message}`);
  return data.result;
}

export const getBalance             = (address)  => rpc("getBalance",             [address]);
export const getAccountInfo         = (mint)     => rpc("getAccountInfo",         [mint, {encoding:"jsonParsed"}]);
export const getTokenLargestAccounts= (mint)     => rpc("getTokenLargestAccounts",[mint]).then(r=>r?.value??[]);
export const getTokenAccountsByOwner= (owner)    => rpc("getTokenAccountsByOwner", [owner, {programId:"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"}, {encoding:"jsonParsed"}]);
export const getAsset               = (mint)     => rpc("getAsset",               {id:mint, displayOptions:{showFungible:true}});

    
