import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

function readCache() {
  const ipCachePath = path.resolve('data', 'ipCache.json');
  if (fs.existsSync(ipCachePath)) {
    const raw = fs.readFileSync(ipCachePath, 'utf8');
    return JSON.parse(raw);
  }
}

/**
 * Bulk IP lookup using IP-API (no token required, free for non-commercial use) with cache support.
 * @param {string[]} ips - Array of IP addresses
 * @param {number} chunkSize - Max IPs per bulk request (default 100 for IP-API)
 * @returns {Promise<Object[]>} - Array of lookup results (same order as input)
 */
export async function bulkIpLookup(ips: string[], chunkSize = 100) {
  const cache = readCache();
  const uncachedIps: string[] = [];
  const ipIndexMap: Record<string, number[]> = {};

 
  ips.forEach((ip, idx) => {
    if (!cache[ip]) {
      uncachedIps.push(ip);
    }
    if (!ipIndexMap[ip]) ipIndexMap[ip] = [];
    ipIndexMap[ip].push(idx);
  });

  let newResults: Record<string, any> = {};
 
  for (let i = 0; i < uncachedIps.length; i += chunkSize) {
    const chunk = uncachedIps.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    const res = await fetch("http://ip-api.com/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chunk.map(ip => ({ query: ip }))),
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
   
    chunk.forEach((ip, idx) => {
      cache[ip] = data[idx];
      newResults[ip] = data[idx];
    });
  }
 
  return ips.map(ip => cache[ip]);
}

