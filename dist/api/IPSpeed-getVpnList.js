"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpnList = getVpnList;
const cheerio_1 = require("cheerio");
const node_fetch_1 = __importDefault(require("node-fetch"));
const url = "https://ipspeed.info/freevpn_openvpn.php?language=en&page=";
async function scrapPage(page) {
    const response = await (0, node_fetch_1.default)(url + page);
    if (!response.ok)
        throw new Error("Network error");
    return response.text();
}
function parsePage(html) {
    const $ = (0, cheerio_1.load)(html);
    const links = $("a[href$='.ovpn']");
    const ipSpeedServers = [];
    for (const link of links) {
        const parentRow = $(link).parent().parent();
        const country = parentRow.find(".list_o1").text().trim().split(" ")[1];
        const ip = $(link).text().trim().replace(".ovpn", "");
        const download_url = $(link).attr("href");
        ipSpeedServers.push({ ip, country, download_url });
    }
    return ipSpeedServers;
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
