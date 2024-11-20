import { Databases, Client, ID } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  const clientIP = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
  const ipinfo = (await (await fetch(`https://ipinfo.io/${clientIP}/json`)).json())

  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);

  const database = new Databases(client)

  await database.createDocument('Logger', 'User', req.bodyText['user']['matric'], {
      Matric: req.bodyText['user']['matric'],
      Name: req.bodyText['user']['name'],
      device: [{
        Datetime: req.bodyText['device']['datetime'],
        Browser: req.bodyText['device']['browser'],
        Screen: req.bodyText['device']['screen'],
        Viewport: req.bodyText['device']['viewport'],
        CPU: req.bodyText['device']['CPU'],
        RAM: req.bodyText['device']['memory'],
        Timezone: req.bodyText['device']['timezone'],
      }],
      IPInfo: [{
        Address: ipinfo['ip'],
        Country: ipinfo['country'],
        City: ipinfo['city'],
        Region: ipinfo['region'],
        Coordinates: ipinfo['loc'],
        ISP: ipinfo['org'],
        Postal: ipinfo['postal'],
        Timezone: ipinfo['timezone'],
      }]
    }
  )

  log('body ' + req.bodyText)
  log('ip ' + clientIP)
  return res.text(`body: ${req.bodyText}\nip: ${clientIP}`)
};
