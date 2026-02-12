"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpnList = getVpnList;
const http_1 = __importDefault(require("http"));
function getVpnList() {
    return new Promise((resolve, reject) => {
        const vpnGateApiUrl = "http://www.vpngate.net/api/iphone/";
        const req = http_1.default.get(vpnGateApiUrl, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk.toString();
            });
            res.on("end", () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP error: ${res.statusCode}`));
                    return;
                }
                try {
                    const lines = data.trim().split("\n");
                    if (lines.length < 3) {
                        reject(new Error("Invalid data format: not enough lines"));
                        return;
                    }
                    const headers = lines[1].slice(1, -1).split(",").map(header => header.trim());
                    const servers = [];
                    const countries = {};
                    const seenIps = new Set();
                    for (let i = 2; i < lines.length - 2; i++) {
                        const values = lines[i].split(",");
                        const country = values[5]?.trim();
                        const ip = values[3]?.trim();
                        if (country === 'Russia' || !ip || seenIps.has(ip))
                            continue;
                        seenIps.add(ip);
                        countries[values[6]?.toLowerCase() ?? ""] = country ?? "";
                        const obj = {};
                        headers.forEach((header, j) => {
                            const excludeHeaders = [
                                "numvpnsessions",
                                "uptime",
                                "totalusers",
                                "totaltraffic",
                                "logtype",
                                "message"
                            ];
                            if (!excludeHeaders.includes(header.toLowerCase())) {
                                obj[header.toLowerCase()] = values[j]?.trim() ?? "";
                            }
                        });
                        servers.push(obj);
                    }
                    resolve({ servers, countries });
                }
                catch (error) {
                    reject(new Error(`Parsing error: ${error}`));
                }
            });
        });
        console.log("Fetching VPN list from VPNGate API");
        req.on("error", (err) => {
            reject(new Error(`Network error: ${err.message}`));
        });
        req.end();
    });
}
