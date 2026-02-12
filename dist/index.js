"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import simpleGit from 'simple-git';
const VPNGATE_getVpnList_1 = require("./api/VPNGATE-getVpnList");
const getIPInfo_1 = require("./api/getIPInfo");
// --- Ajout de la fonction convertOvpnConfig ---
function convertOvpnConfig(config) {
    const supportedCiphers = [
        'AES-128-CBC',
        'AES-128-GCM',
        'AES-256-CBC',
        'AES-256-GCM'
    ].join(':');
    let convertedConfig = config;
    convertedConfig = convertedConfig.replace(/^tls-version.*$/gm, '');
    convertedConfig = convertedConfig.replace(/^route.*$/gim, '');
    convertedConfig = convertedConfig.replace(/^redirect-gateway.*$/gim, '');
    const additionalConfig = `
tls-version-min 1.0
tls-version-max 1.2
data-ciphers ${supportedCiphers}
redirect-gateway bypass-dhcp
`;
    return convertedConfig.replace(/^(\s*cipher\s+([^\s]+).*)$/gim, (match, fullLine) => `${fullLine}${additionalConfig}`);
}
// --- Fin ajout ---
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
    const converted = convertOvpnConfig(originalConfig);
    fs_1.default.writeFileSync(outPath, converted, 'utf8');
}
async function main() {
    const dataDir = path_1.default.resolve('data');
    const configsDir = path_1.default.join(dataDir, 'configs');
    await ensureDir(dataDir);
    await ensureDir(configsDir);
    // simpleGit().pull();
    const [vpngate] = await Promise.all([(0, VPNGATE_getVpnList_1.getVpnList)()]);
    // On fusionne toutes les sources, puis on retire les doublons d'IP
    const mergedServers = [
        ...vpngate.servers.map((s) => ({ ...s, provider: 'VPNGate', url: s.download_url || "data:text/opvn;base64," + s.openvpn_configdata_base64 })),
        // ...ipspeed.map((s: any) => ({ ...s, provider: 'IPSpeed', url: s.download_url }))
    ];
    // Sécurité anti-doublons d'IP
    const seenIps = new Set();
    const allServers = mergedServers.filter((s) => {
        if (!s.ip || seenIps.has(s.ip))
            return false;
        seenIps.add(s.ip);
        return true;
    });
    // Delete old configs
    fs_1.default.readdirSync(configsDir).forEach(file => {
        if (file.endsWith('.ovpn')) {
            fs_1.default.unlinkSync(path_1.default.join(configsDir, file));
        }
    });
    // Sauvegarde des configs modifiées
    for (const server of allServers) {
        try {
            await saveConfig(server.ip, server.url, configsDir);
        }
        catch (e) {
            console.error(`Failed for ${server.ip}:`, e);
        }
    }
    console.log(`Saved ${allServers.length} configs.`);
    // Lookup ISP info et sauvegarde du cache enrichi
    const allIps = allServers.map((server) => server.ip);
    const ipInfos = await (0, getIPInfo_1.bulkIpLookup)(allIps);
    // On sauvegarde un cache enrichi (ISP, pays, etc) dans data/ipCache.json
    const ipCache = {};
    ipInfos.forEach((info) => {
        if (info && info.query)
            ipCache[info.query] = info;
    });
    fs_1.default.writeFileSync(path_1.default.join(dataDir, 'ipCache.json'), JSON.stringify(ipCache, null, 2));
    // Regrouper les serveurs par pays puis trier par ISP, en excluant la Russie
    const serversByCountry = {};
    allServers.forEach((server) => {
        const info = ipCache[server.ip] || {};
        const country = info.country || 'Unknown';
        if (country === 'Russia')
            return; // Désactiver la Russie
        if (!serversByCountry[country])
            serversByCountry[country] = [];
        serversByCountry[country].push({ ...server, isp: info.isp || 'Unknown', country });
    });
    // Trier les pays alphabétiquement
    const sortedCountries = Object.keys(serversByCountry).sort();
    const READMEText = fs_1.default.readFileSync(path_1.default.resolve('README.template.md'), 'utf-8');
    let tableContent = '';
    const tableHeader = `| IP | Country | ISP | Provider | Config |\n|---|---|---|---|---|`;
    for (const country of sortedCountries) {
        // Trier les serveurs de ce pays par ISP
        const servers = serversByCountry[country].sort((a, b) => a.isp.localeCompare(b.isp));
        const tableRows = servers.map(server => {
            const configLink = `[Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/${server.ip}.ovpn)`;
            return `| ${server.ip} | ${server.country} | ${server.isp} | ${server.provider} | ${configLink} |`;
        }).join('\n');
        tableContent += `\n\n### ${country}\n${tableHeader}\n${tableRows}\n`;
    }
    const updatedREADME = READMEText.replace('{{ % table % }}', tableContent.trim());
    fs_1.default.writeFileSync(path_1.default.resolve('README.md'), updatedREADME, 'utf-8');
    // On peut aussi sauvegarder la liste simple des IPs si besoin (hors Russie)
    const filteredIps = allServers.filter((server) => {
        const info = ipCache[server.ip] || {};
        return info.country !== 'Russia';
    }).map((server) => server.ip);
    fs_1.default.writeFileSync(path_1.default.join(dataDir, 'ips.json'), JSON.stringify(filteredIps, null, 2));
    console.log('Done!');
}
// async function loop() {
//   while (true) {
//     try {
//       await main();
//     } catch (e) {
//       console.error('Erreur dans main:', e);
//     }
//     await new Promise(res => setTimeout(res, 60_000 * 10)); // 10 minutes
//   }
// }
// loop();
main();
