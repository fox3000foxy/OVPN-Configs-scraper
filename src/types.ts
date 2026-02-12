interface Server {
  isp: string;
  ip: string;
  country: string;
  provider: string;
}

interface VpnServer {
    [key: string]: string;
}

interface VpnListResult {
    servers: VpnServer[];
    countries: { [key: string]: string };
}
