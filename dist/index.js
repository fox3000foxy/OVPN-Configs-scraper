"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const VPNGATE_getVpnList_1 = require("./api/VPNGATE-getVpnList");
const getIPInfo_1 = require("./api/getIPInfo");
const convertOVPN_1 = require("./utils/convertOVPN");
async function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
async function saveConfig(ip, configUrl, outDir) {
    const outPath = path_1.default.join(outDir, `${ip}.ovpn`);
    let originalConfig;
    if (configUrl.startsWith('data:text/opvn;base64,')) {
        const base64 = configUrl.split(',')[1];
        originalConfig = Buffer.from(base64, 'base64').toString('utf8');
    }
    else {
        const res = await fetch(configUrl);
        originalConfig = await res.text();
    }
    const converted = (0, convertOVPN_1.convertOvpnConfig)(originalConfig);
    fs_1.default.writeFileSync(outPath, converted, 'utf8');
}
async function main() {
    const dataDir = path_1.default.resolve('data');
    const configsDir = path_1.default.join(dataDir, 'configs');
    await ensureDir(dataDir);
    await ensureDir(configsDir);
    // Fetch VPN data concurrently
    const [vpngate] = await Promise.all([(0, VPNGATE_getVpnList_1.getVpnList)()]);
    // Merge and filter servers
    const seenIps = new Set();
    const allServers = vpngate.servers
        .map((s) => ({ ...s, provider: 'VPNGate', url: s.download_url || "data:text/opvn;base64," + s.openvpn_configdata_base64 }))
        .filter((s) => s.ip && !seenIps.has(s.ip) && seenIps.add(s.ip));
    // Delete old configs that are not in allServers
    const oldConfigs = fs_1.default.readdirSync(configsDir).filter(file => file.endsWith('.ovpn'));
    const currentIps = new Set(allServers.map(server => server.ip));
    // Use a single unlink operation for better performance
    const filesToDelete = oldConfigs.filter(file => !currentIps.has(path_1.default.basename(file, '.ovpn')));
    if (filesToDelete.length) {
        filesToDelete.forEach(file => fs_1.default.unlinkSync(path_1.default.join(configsDir, file)));
    }
    // Save configs concurrently
    await Promise.all(allServers.map(server => saveConfig(server.ip, server.url, configsDir).catch(e => console.error(`Failed for ${server.ip}:`, e))));
    console.log(`Saved ${allServers.length} configs.`);
    // Lookup ISP info and save enriched cache
    const allIps = allServers.map((server) => server.ip);
    const ipInfos = await (0, getIPInfo_1.bulkIpLookup)(allIps);
    const ipCache = Object.fromEntries(ipInfos.map((info) => [info.query, info]));
    fs_1.default.writeFileSync(path_1.default.join(dataDir, 'ipCache.json'), JSON.stringify(ipCache, null, 2));
    // Group servers by country and sort
    const serversByCountry = allServers.reduce((acc, server) => {
        const info = ipCache[server.ip] || {};
        const country = info.country || 'Unknown';
        if (country !== 'Russia') {
            if (!acc[country])
                acc[country] = [];
            acc[country].push({ ...server, isp: info.isp || 'Unknown', country });
        }
        return acc;
    }, {});
    // Create README content
    const READMEText = fs_1.default.readFileSync(path_1.default.resolve('README.template.md'), 'utf-8');
    const tableContent = Object.entries(serversByCountry)
        .sort(([countryA], [countryB]) => countryA.localeCompare(countryB))
        .map(([country, servers]) => {
        const tableRows = servers.sort((a, b) => a.isp.localeCompare(b.isp))
            .map(server => `| ${server.ip} | ${server.country} | ${server.isp} | ${server.provider} | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/${server.ip}.ovpn) |`)
            .join('\n');
        return `\n\n### ${country}\n| IP | Country | ISP | Provider | Config |\n|---|---|---|---|---|\n${tableRows}\n`;
    }).join('');
    fs_1.default.writeFileSync(path_1.default.resolve('README.md'), READMEText.replace('{{ % table % }}', tableContent.trim()), 'utf-8');
    // Save filtered IPs
    const filteredIps = allServers.filter(server => ipCache[server.ip]?.country !== 'Russia').map(server => server.ip);
    fs_1.default.writeFileSync(path_1.default.join(dataDir, 'ips.json'), JSON.stringify(filteredIps, null, 2));
    console.log('Done!');
}
main();
