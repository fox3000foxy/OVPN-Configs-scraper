"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const VPNGATE_getVpnList_js_1 = require("./api/VPNGATE-getVpnList.js");
const OPL_getVpnList_js_1 = require("./api/OPL-getVpnList.js");
const getIPInfo_js_1 = require("./api/getIPInfo.js");
const simple_git_1 = __importDefault(require("simple-git"));
const node_fetch_1 = __importDefault(require("node-fetch"));
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
        const res = await (0, node_fetch_1.default)(configUrl);
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
    (0, simple_git_1.default)().pull();
    // Delete old configs
    fs_1.default.readdirSync(configsDir).forEach(file => {
        if (file.endsWith('.ovpn')) {
            fs_1.default.unlinkSync(path_1.default.join(configsDir, file));
        }
    });
    const [opl, vpngate] = await Promise.all([(0, OPL_getVpnList_js_1.getVpnList)(), (0, VPNGATE_getVpnList_js_1.getVpnList)()]);
    const allServers = [
        ...opl.servers.map((s) => ({ ...s, provider: 'OPL', url: s.download_url || "data:text/opvn;base64," + s.openvpn_configdata_base64 })),
        ...vpngate.servers.map((s) => ({ ...s, provider: 'VPNGate', url: s.download_url || "data:text/opvn;base64," + s.openvpn_configdata_base64 })),
    ];
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
    const ipInfos = await (0, getIPInfo_js_1.bulkIpLookup)(allIps);
    // On sauvegarde un cache enrichi (ISP, pays, etc) dans data/ipCache.json
    const ipCache = {};
    ipInfos.forEach((info) => {
        if (info && info.query)
            ipCache[info.query] = info;
    });
    fs_1.default.writeFileSync(path_1.default.join(dataDir, 'ipCache.json'), JSON.stringify(ipCache, null, 2));
    // On peut aussi sauvegarder la liste simple des IPs si besoin
    fs_1.default.writeFileSync(path_1.default.join(dataDir, 'ips.json'), JSON.stringify(allIps, null, 2));
    console.log('Done!');
}
async function loop() {
    const git = (0, simple_git_1.default)();
    while (true) {
        try {
            await main();
            // Git add, commit, push
            await git.add('./*');
            const date = new Date().toLocaleString('en-GB', { timeZone: 'GMT', hour12: false });
            await git.commit(`Update ${date} GMT`);
            await git.push();
            console.log('Git push done!');
        }
        catch (e) {
            console.error('Erreur dans main ou git:', e);
        }
        await new Promise(res => setTimeout(res, 60000)); // 1 minute
    }
}
loop();
