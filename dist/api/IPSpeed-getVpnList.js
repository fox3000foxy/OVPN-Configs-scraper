"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpnList = getVpnList;
const url = "https://ipspeed.info/freevpn_openvpn.php?language=en&page=";
async function scrapPage(page) {
    const response = await fetch(url + page);
    if (!response.ok)
        throw new Error("Network error");
    return response.text();
}
function parsePage(html) {
    // Regex pour matcher les lignes du tableau : <td class="list_o1">... Country</td><td><a href="...">IP.ovpn</a></td>
    try {
        const regex = /<td class="list_o1"[^>]*>(?:[^<]*\s+)?([^<]+)<\/td>\s*<td[^>]*><a href="([^"]+\.ovpn)"[^>]*>([^<]+)\.ovpn<\/a><\/td>/gi;
        const ipSpeedServers = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
            const country = match[1].trim();
            const download_url = match[2];
            const ip = match[3].trim();
            ipSpeedServers.push({ ip, country, download_url });
        }
        return ipSpeedServers;
    }
    catch (error) {
        console.error("Error parsing page:", error);
        return [];
    }
}
const PAGE_NB = 4;
async function getVpnList() {
    const pages = Array.from({ length: PAGE_NB }, (_, i) => i + 1);
    const htmls = await Promise.all(pages.map(page => scrapPage(page.toString())));
    const allLinks = htmls.flatMap(parsePage);
    // Remove duplicate IPs and exclude Russia
    const seenIps = new Set();
    const uniqueLinks = [];
    for (const server of allLinks) {
        if (server.country === 'Russia')
            continue;
        if (!seenIps.has(server.ip)) {
            seenIps.add(server.ip);
            uniqueLinks.push(server);
        }
    }
    return uniqueLinks;
}
