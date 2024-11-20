import { Databases } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  if (req.method != 'GET') {
    return res.status(405)
  }

  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // for user ip info https://ipinfo.io/{ip address}/json
  log(req.bodyText)
  log(clientIP)
  return res.empty()
};
