import fs from 'fs';
import path from 'path';

import { getVpnList as VPNGate } from './api/VPNGATE-getVpnList';
import { bulkIpLookup } from './api/getIPInfo';
import { convertOvpnConfig } from './utils/convertOVPN';

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveConfig(ip: string, configUrl: string, outDir: string) {
  const outPath = path.join(outDir, `${ip}.ovpn`);
  let originalConfig: string;

  if (configUrl.startsWith('data:text/opvn;base64,')) {
    const base64 = configUrl.split(',')[1];
    originalConfig = Buffer.from(base64, 'base64').toString('utf8');
  } else {
    const res = await fetch(configUrl);
    originalConfig = await res.text();
  }

  const converted = convertOvpnConfig(originalConfig);
  fs.writeFileSync(outPath, converted, 'utf8');
}

async function main() {
  const dataDir = path.resolve('data');
  const configsDir = path.join(dataDir, 'configs');
  await ensureDir(dataDir);
  await ensureDir(configsDir);

  // Fetch VPN data concurrently
  const [vpngate] = await Promise.all([VPNGate()]);

  // Merge and filter servers
  const seenIps = new Set();
  const allServers = vpngate.servers
    .map((s: any) => ({ ...s, provider: 'VPNGate', url: s.download_url || "data:text/opvn;base64," + s.openvpn_configdata_base64 }))
    .filter((s: any) => s.ip && !seenIps.has(s.ip) && seenIps.add(s.ip));

  // Delete old configs that are not in allServers
  const oldConfigs = fs.readdirSync(configsDir).filter(file => file.endsWith('.ovpn'));
  const currentIps = new Set(allServers.map(server => server.ip));
  
  // Use a single unlink operation for better performance
  const filesToDelete = oldConfigs.filter(file => !currentIps.has(path.basename(file, '.ovpn')));
  if (filesToDelete.length) {
    filesToDelete.forEach(file => fs.unlinkSync(path.join(configsDir, file)));
  }

  // Save configs concurrently
  await Promise.all(allServers.map(server =>
    saveConfig(server.ip, server.url, configsDir).catch(e => console.error(`Failed for ${server.ip}:`, e))
  ));

  console.log(`Saved ${allServers.length} configs.`);

  // Lookup ISP info and save enriched cache
  const allIps = allServers.map((server: any) => server.ip);
  const ipInfos = await bulkIpLookup(allIps);
  const ipCache = Object.fromEntries(ipInfos.map((info: any) => [info.query, info]));

  fs.writeFileSync(path.join(dataDir, 'ipCache.json'), JSON.stringify(ipCache, null, 2));

  // Group servers by country and sort
  const serversByCountry = allServers.reduce((acc: any, server: any) => {
    const info = ipCache[server.ip] || {};
    const country = info.country || 'Unknown';
    if (country !== 'Russia') {
      if (!acc[country]) acc[country] = [];
      acc[country].push({ ...server, isp: info.isp || 'Unknown', country });
    }
    return acc;
  }, {});

  // Create README content
  const READMEText = fs.readFileSync(path.resolve('README.template.md'), 'utf-8');
  const tableContent = Object.entries(serversByCountry)
    .sort(([countryA], [countryB]) => countryA.localeCompare(countryB))
    .map(([country, servers]) => {
      const tableRows = (servers as Server[]).sort((a, b) => a.isp.localeCompare(b.isp))
        .map(server => `| ${server.ip} | ${server.country} | ${server.isp} | ${server.provider} | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/${server.ip}.ovpn) |`)
        .join('\n');
      return `\n\n### ${country}\n| IP | Country | ISP | Provider | Config |\n|---|---|---|---|---|\n${tableRows}\n`;
    }).join('');

  fs.writeFileSync(path.resolve('README.md'), READMEText.replace('{{ % table % }}', tableContent.trim()), 'utf-8');

  // Save filtered IPs
  const filteredIps = allServers.filter(server => ipCache[server.ip]?.country !== 'Russia').map(server => server.ip);
  fs.writeFileSync(path.join(dataDir, 'ips.json'), JSON.stringify(filteredIps, null, 2));
  console.log('Done!');
}

main();