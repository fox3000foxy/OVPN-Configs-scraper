# OVPN-Configs-scraper

OVPN-Configs-scraper is a Node.js tool that automatically collects free OpenVPN configuration files from various public sources. It streamlines the retrieval, organization, and updating of these configs for quick use.

## Features
- Automated scraping of public VPN server lists.
- Generation of ready-to-use `.ovpn` files.
- IP address caching and duplicate management.
- Export of configurations to a dedicated folder.

> [!IMPORTANT]
> To deploy your own version, you can use the following section.
> PLEASE DO NOT FORK, OUR VERSIONS WILL DIFFER ANYWAYS.
> 
>  ## Prerequisites
>  - Node.js >= 20
>  - npm
>
>  ## Installation
>  ```bash
>  git clone https://github.com/your-username/OVPN-Configs-scraper.git
>  cd OVPN-Configs-scraper
>  npm install
>  ```
>
>  ## Build 
>  Before running the app, you need to build the TypeScript source files:
>  ```bash
>  npm run build
>  ```
>  This will compile the TypeScript code into JavaScript in the `dist/` directory.
> 
>  ## Usage
>  To run the scraper and update the configuration files:
>  ```bash
>  npm start
>  ```

> [!TIP]
> The generated `.ovpn` files can be found in the `data/configs/` folder.

## Download VPN Configurations
You can directly download the generated configuration files:

- [Go to the configs/ folder](./data/configs/)

Or download individually:

### Japan
| IP | Country | ISP | Provider | Config |
|---|---|---|---|---|
| 103.152.178.62 | Japan | Ayao Takata | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/103.152.178.62.ovpn) |
| 116.58.159.173 | Japan | Community Network Center Inc. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/116.58.159.173.ovpn) |
| 125.30.0.197 | Japan | Internet Initiative Japan Inc. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/125.30.0.197.ovpn) |
| 59.169.208.6 | Japan | JCOM Co., Ltd. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/59.169.208.6.ovpn) |
| 153.242.101.4 | Japan | NTT Communications Corporation | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/153.242.101.4.ovpn) |
| 1.66.33.240 | Japan | NTT Docomo, inc. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/1.66.33.240.ovpn) |
| 133.232.173.29 | Japan | NTT PC Communications, Inc. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/133.232.173.29.ovpn) |
| 60.137.146.81 | Japan | SoftBank Corp. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/60.137.146.81.ovpn) |
| 221.49.114.110 | Japan | SoftBank Corp. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/221.49.114.110.ovpn) |
| 126.109.247.157 | Japan | SoftBank Corp. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/126.109.247.157.ovpn) |
| 219.100.37.162 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.162.ovpn) |
| 219.100.37.89 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.89.ovpn) |
| 219.100.37.27 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.27.ovpn) |
| 219.100.37.119 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.119.ovpn) |
| 219.100.37.96 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.96.ovpn) |
| 219.100.37.200 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.200.ovpn) |
| 219.100.37.86 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.86.ovpn) |
| 219.100.37.127 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.127.ovpn) |
| 219.100.37.210 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.210.ovpn) |
| 219.100.37.6 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.6.ovpn) |
| 219.100.37.224 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.224.ovpn) |
| 219.100.37.95 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.95.ovpn) |
| 219.100.37.199 | Japan | SoftEther | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/219.100.37.199.ovpn) |


### Peru
| IP | Country | ISP | Provider | Config |
|---|---|---|---|---|
| 179.6.168.57 | Peru | America Movil Peru S.A.C. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/179.6.168.57.ovpn) |


### South Korea
| IP | Country | ISP | Provider | Config |
|---|---|---|---|---|
| 122.203.244.115 | South Korea | DACOM-PUBNETPLUS | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/122.203.244.115.ovpn) |
| 27.1.231.98 | South Korea | KangNam CableTV | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/27.1.231.98.ovpn) |
| 222.109.124.1 | South Korea | Korea Telecom | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/222.109.124.1.ovpn) |
| 14.35.12.234 | South Korea | Korea Telecom | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/14.35.12.234.ovpn) |
| 61.76.221.32 | South Korea | Korea Telecom | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/61.76.221.32.ovpn) |
| 211.55.92.107 | South Korea | Korea Telecom | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/211.55.92.107.ovpn) |
| 221.167.200.211 | South Korea | Korea Telecom | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/221.167.200.211.ovpn) |
| 115.41.120.164 | South Korea | LG HelloVision Corp. | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/115.41.120.164.ovpn) |
| 125.186.91.205 | South Korea | LG POWERCOMM | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/125.186.91.205.ovpn) |
| 125.180.28.77 | South Korea | LG POWERCOMM | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/125.180.28.77.ovpn) |
| 222.232.187.118 | South Korea | SK Broadband Co Ltd | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/222.232.187.118.ovpn) |
| 147.46.236.38 | South Korea | SNU | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/147.46.236.38.ovpn) |


### Vietnam
| IP | Country | ISP | Provider | Config |
|---|---|---|---|---|
| 115.78.10.208 | Vietnam | VIETELftth | VPNGate | [Download](https://raw.githubusercontent.com/fox3000foxy/OVPN-Configs-scraper/refs/heads/main/data/configs/115.78.10.208.ovpn) |

> **Tip**: For the full list, check the `data/configs/` folder after running the scraper.


## Contributing
Contributions are welcome! Feel free to open an issue or a pull request.

## License
MIT

