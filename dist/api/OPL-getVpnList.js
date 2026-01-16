"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpnList = getVpnList;
const cheerio_1 = require("cheerio");
// import fetch from 'node-fetch';
const puppeteer_1 = __importDefault(require("puppeteer"));
// const require = createRequire(import.meta.url);
const configs = require("../../configs.json");
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}
async function getListsScriptFn() {
    while (!window.grecaptcha?.execute)
        await sleep(100);
    await sleep(1000);
    const fetchPage = async (page) => {
        fetch("https://openproxylist.com/openvpn/list", {
            "headers": {
                "accept": "*/*",
                "accept-language": "fr,en;q=0.9,ja;q=0.8,en-US;q=0.7,fr-FR;q=0.6",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "cf_clearance=rCCamg9Tvp3HCEee7.5OFtq2o5QMVlDgZ9R2UWkF2u0-1768507251-1.2.1.1-1CjPUl3a8J1Tdp4cNg7oazXmep7g12q6GYuxYTXDMyc5hZqPio24c8EYAcghMe1PxQE_8DElu3CGVpJzbJwgEaphvHfU7W6ZN9gqHaE04YSX6SGo3vZZN_73nxpUOVFIu_.y9B0Wi3H7KdPwMrQRJ7v01RCGZBfds17Yp1C8kXTH4nmLWyf6Tof67d_d0joFWX6o10MoJSCvvmhknETq8bUghQBO6tUp9FnhAxDtdjs",
                "Referer": "https://openproxylist.com/openvpn/"
            },
            "body": "dataType=openvpn&g-recaptcha-response=0cAFcWeA457Qzst3CUNPuhW8LG4Awi9aEzmH809L-55_gpfsjZVVwL6ctrRhgvtPKbQSgJB3pDGyaMt8WAwGaFlPPcsQV9vpgZDmRhyURK8w4-kLoA6q2387EN5xDQ0CXvpVrXWKbLBfcmASgLfad8ga44QtMztyrIpXpRAdNzujJ73_w-X2w6dOu87I0eKyYJNvY3QA5B7uhaINp1xDmM8qvF4scL_BdSGYdyuE-JyhFsq2tFHnvMee65YqGd-nHGRRcWraamJuyXSnYKNuffOHyLxsCnTz4klVS8T6M0c6qcJuEi0prkBgQSqksACtuX_rGNKubnXCFvpS0vHINj3E7FdBppBYb4xVzZ_9yH37KK5T1LNB-6NDFFx6XPL7IeQzHARjm1IRjATcxLk5tVQX1cKWYQajXEFDrpDU8GH-ZexIicJOcv1vUyHJqg2kG7TjorfDpEJGRZ8nLCZVzPU23fsTgFn4NKBv_rMkuSEgLoZ8bG7hpyB4lYC_cX5g6oh_UecugzSsAwhYtp8rMCGQH8-Q39eVUGoSOVQ1-PXuC5m_YX4Chtl9aqLzU5e3k0RVsfHyZEoOkhUEoZBtmz9AiflxiPbhivTua4Ik9HviAfydOS9Qt7VR7Ww89u7On-t4qb34Yzs6BiDH2SINDY6ADUTr5HrQrN9c33QUE5rtjO9XpI8THI2Vz1MJ_OOUcRHt0e5x7XL2jQ91LLnSUNd1E_hCiUDJH59BowRwzGOKhXyV1mA238-pIRhyoNzMhuzNvhMF9KziJENEPxS4zCBKNLaRlZ6-NRUCw0NKNtNIDLKNg_yksSdm76XtKLy3Oo1UsLzgwnUSquCalraUwdfzqz_f1zbUmhbFAdBoP6OfYt8miEQNJqsQ0&response=&sort=sortlast&page=1",
            "method": "POST"
        });
        // const token = await window.grecaptcha.execute(configs.oplConstants.site_key, { action: "homepage" });
        // return fetch("https://openproxylist.com/get-list.html", {
        //     headers: {
        //         "Content-Type": "application/x-www-form-urlencoded",
        //         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        //         "Accept-Language": "en-US,en;q=0.5",
        //         "Sec-Fetch-Dest": "document",
        //         "Sec-Fetch-Mode": "navigate",
        //         "Sec-Fetch-Site": "same-origin",
        //     },
        //     // referrer: configs.oplConstants.base_url, // Removed because 'referrer' is not a valid RequestInit property in node-fetch
        //     body: `g-recaptcha-response=${token}&response=&sort=sortlast&dataType=openvpn&page=${page}`,
        //     method: "POST",
        //     // mode: "cors",
        // }).then(r => r.ok ? r.text() : Promise.reject("Network error"));
    };
    while (!document.querySelector('.pagination .page-link[page-data]'))
        await sleep(100);
    const pages = Array.from(document.querySelectorAll('.pagination .page-link[page-data]'))
        .filter(el => !isNaN(parseInt(el.innerText)));
    const lastPage = !configs.devMode ? parseInt(pages[pages.length - 1].innerText) : 1;
    const results = await Promise.all(Array.from({ length: lastPage }, (_, i) => fetchPage((i + 1).toString())));
    return results.join("\\n<!--PAGE_BREAK-->\\n");
}
const getListsScript = `
    const configs = ${JSON.stringify(configs)};
    ${sleep.toString()}
    ${getListsScriptFn.toString()}
    getListsScriptFn();
`;
async function getVpnListHTML() {
    const browser = await puppeteer_1.default.launch({ headless: "shell" });
    const page = await browser.newPage();
    // Bloquer les requêtes de pub
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (/ads|doubleclick|googlesyndication|adservice|adserver/.test(req.url())) {
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto(configs.oplConstants.base_url, { waitUntil: "networkidle2" });
    // Supprimer la CSP pour permettre l'injection de scripts si besoin
    await page.setBypassCSP(true);
    // Injecter le script et récupérer le résultat
    const result = await page.evaluate(getListsScript);
    await browser.close();
    return result;
}
function parseVpnList(html) {
    const $ = (0, cheerio_1.load)(html);
    const servers = [];
    const countries = {};
    $("tr").each((i, el) => {
        if (i < 2)
            return;
        const ip = $(el).find("th").first().text().trim();
        if (!ip)
            return;
        const cells = $(el).find("td");
        const [country, city = ""] = $(cells[1]).text().trim().split(",").map(s => s.trim());
        const server = {
            ip,
            download_url: "https://openproxylist.com" + $(cells[0]).find("a").attr("href") || "",
            country,
            city,
            response_time: $(cells[2]).text().trim(),
            isp: $(cells[3]).text().trim(),
            last_check: $(cells[4]).text().trim(),
        };
        countries[country.toLowerCase().replace(/ /g, "_")] = country;
        servers.push(server);
    });
    return { servers, countries };
}
async function getVpnList() {
    try {
        console.log("Fetching VPN list HTML from OPL");
        const html = await getVpnListHTML();
        console.log("Fetched VPN list HTML successfully");
        const parsed = parseVpnList(html);
        console.log("Parsed VPN list successfully");
        return parsed;
    }
    catch (e) {
        console.error("Error fetching VPN list:", e);
        return { servers: [], countries: {} };
    }
}
