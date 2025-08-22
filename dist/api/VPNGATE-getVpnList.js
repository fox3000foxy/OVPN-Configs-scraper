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
                    reject({ servers: [], countries: {} });
                }
                else {
                    try {
                        const servers = [];
                        const countries = {};
                        const returnData = { servers, countries };
                        let lines = data.trim().split("\n");
                        if (lines.length < 2) {
                            reject(returnData);
                            return;
                        }
                        const headers = lines[1]
                            .slice(1, -1)
                            .split(",")
                            .map((header) => header.trim());
                        lines = lines.slice(2, lines.length - 2);
                        lines.forEach((vpn) => {
                            const values = vpn.split(",");
                            countries[values[6]?.toLowerCase() ?? ""] = values[5] ?? "";
                            const obj = {};
                            for (let j = 0; j < values.length; j++) {
                                const excludeHeaders = [
                                    "numvpnsessions",
                                    "uptime",
                                    "totalusers",
                                    "totaltraffic",
                                    "logtype",
                                    "message"
                                ];
                                const headerKey = headers[j]?.toLowerCase() ?? "";
                                if (!excludeHeaders.includes(headerKey)) {
                                    obj[headerKey] = values[j]?.trim() ?? "";
                                }
                            }
                            servers.push(obj);
                        });
                        resolve(returnData);
                    }
                    catch (error) {
                        reject({ servers: [], countries: {} });
                    }
                }
            });
        });
        console.log("Fetching VPN list from VPNGate API");
        req.on("error", () => {
            reject({ servers: [], countries: {} });
        });
        req.end();
    });
}
