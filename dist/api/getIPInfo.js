"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkIpLookup = bulkIpLookup;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
function readCache() {
    const ipCachePath = path_1.default.resolve('data', 'ipCache.json');
    if (fs_1.default.existsSync(ipCachePath)) {
        const raw = fs_1.default.readFileSync(ipCachePath, 'utf8');
        return JSON.parse(raw);
    }
}
/**
 * Bulk IP lookup using IP-API (no token required, free for non-commercial use) with cache support.
 * @param {string[]} ips - Array of IP addresses
 * @param {number} chunkSize - Max IPs per bulk request (default 100 for IP-API)
 * @returns {Promise<Object[]>} - Array of lookup results (same order as input)
 */
async function bulkIpLookup(ips, chunkSize = 100) {
    const cache = readCache();
    const uncachedIps = [];
    const ipIndexMap = {};
    ips.forEach((ip, idx) => {
        if (!cache[ip]) {
            uncachedIps.push(ip);
        }
        if (!ipIndexMap[ip])
            ipIndexMap[ip] = [];
        ipIndexMap[ip].push(idx);
    });
    let newResults = {};
    for (let i = 0; i < uncachedIps.length; i += chunkSize) {
        const chunk = uncachedIps.slice(i, i + chunkSize);
        if (chunk.length === 0)
            continue;
        const res = await (0, node_fetch_1.default)("http://ip-api.com/batch", {
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
