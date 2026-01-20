import { load } from "cheerio";
import fetch from 'node-fetch';

interface IPSpeedServer {
    ip: string;
    country: string;
    download_url: string;
}

const url = "https://ipspeed.info/freevpn_openvpn.php?language=en&page=";

async function scrapPage(page: string): Promise<string> {
    const response = await fetch(url + page);
    if (!response.ok)
        throw new Error("Network error");
    return response.text();
}

function parsePage(html: string): IPSpeedServer[] {
    const $ = load(html);
    const links = $("a[href$='.ovpn']");
    const ipSpeedServers: IPSpeedServer[] = [];
    for (const link of links) {
        const parentRow = $(link).parent().parent();
        const country = parentRow.find(".list_o1").text().trim().split(" ")[1];
        const ip = $(link).text().trim().replace(".ovpn", "");
        const download_url = $(link).attr("href") as string;
        ipSpeedServers.push({ ip, country, download_url });
    }
    return ipSpeedServers;
}

const PAGE_NB = 4;
export async function getVpnList(): Promise<IPSpeedServer[]> {
    const pages = Array.from({ length: PAGE_NB }, (_, i) => i + 1);
    const htmls = await Promise.all(pages.map(page => scrapPage(page.toString())));
    const allLinks = htmls.flatMap(parsePage);
    // Remove duplicate IPs and exclude Russia
    const seenIps = new Set<string>();
    const uniqueLinks: IPSpeedServer[] = [];
    for (const server of allLinks) {
        if (server.country === 'Russia') continue;
        if (!seenIps.has(server.ip)) {
            seenIps.add(server.ip);
            uniqueLinks.push(server);
        }
    }
    return uniqueLinks;
} 
