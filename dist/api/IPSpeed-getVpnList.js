"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpnList = getVpnList;
const url = "https://ipspeed.info/freevpn_openvpn.php?language=en&page=";
async function scrapPage(page) {
    const response = await fetch(url + page);
    if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    return response.text();
}
function extractAttr(tag, attr) {
    const idx = tag.indexOf(attr + "=");
    if (idx === -1)
        return null;
    const quote = tag[idx + attr.length + 1];
    const start = idx + attr.length + 2;
    const end = tag.indexOf(quote, start);
    if (end === -1)
        return null;
    return tag.slice(start, end);
}
function stripTags(text) {
    let result = "";
    let inTag = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === "<")
            inTag = true;
        else if (ch === ">")
            inTag = false;
        else if (!inTag)
            result += ch;
    }
    return result.trim();
}
function extractCountryFromRow(rowHtml) {
    const clsIdx = rowHtml.indexOf('class="list_o1"');
    if (clsIdx === -1)
        return "";
    const startTagEnd = rowHtml.indexOf(">", clsIdx);
    if (startTagEnd === -1)
        return "";
    const endTagStart = rowHtml.indexOf("</", startTagEnd);
    if (endTagStart === -1)
        return "";
    const text = stripTags(rowHtml.slice(startTagEnd + 1, endTagStart));
    const parts = text.split(" ");
    return (parts[1] ?? "").trim();
}
function parsePage(html) {
    const results = [];
    let pos = 0;
    while (pos < html.length) {
        const aStart = html.indexOf("<a", pos);
        if (aStart === -1)
            break;
        const aEnd = html.indexOf(">", aStart);
        if (aEnd === -1)
            break;
        const aTag = html.slice(aStart, aEnd + 1);
        const href = extractAttr(aTag, "href");
        if (href && href.endsWith(".ovpn")) {
            const aClose = html.indexOf("</a>", aEnd);
            if (aClose === -1)
                break;
            const linkText = stripTags(html.slice(aEnd + 1, aClose));
            const ip = linkText.replace(".ovpn", "").trim();
            // Try to get enclosing <tr> to extract country
            const trStart = html.lastIndexOf("<tr", aStart);
            const trEnd = html.indexOf("</tr>", aClose);
            let country = "";
            if (trStart !== -1 && trEnd !== -1) {
                const rowHtml = html.slice(trStart, trEnd);
                country = extractCountryFromRow(rowHtml);
            }
            results.push({ ip, country, download_url: href });
            pos = aClose + 4;
        }
        else {
            pos = aEnd + 1;
        }
    }
    return results;
}
const PAGE_NB = 4;
async function getVpnList() {
    const pages = Array.from({ length: PAGE_NB }, (_, i) => i + 1);
    const settled = await Promise.allSettled(pages.map(page => scrapPage(page.toString())));
    const htmls = [];
    for (const res of settled) {
        if (res.status === "fulfilled") {
            htmls.push(res.value);
        }
        else {
            // Empêche l’UnhandledPromiseRejection
            console.warn("scrapPage failed:", res.reason);
        }
    }
    const allLinks = htmls.flatMap(parsePage);
    // Remove duplicate IPs and exclude Russia
    const seenIps = new Set();
    const uniqueLinks = [];
    for (const server of allLinks) {
        if (server.country === "Russia")
            continue;
        if (!seenIps.has(server.ip)) {
            seenIps.add(server.ip);
            uniqueLinks.push(server);
        }
    }
    return uniqueLinks;
}
