import { Databases, Client, ID } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  const clientIP = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
  const ipinfo = (await (await fetch(`https://ipinfo.io/${clientIP}/json`)).json())

  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
    
    const database = new Databases(client)

  log('body ' + req.bodyJson)
  log('ip ' + clientIP)
    
  await database.createDocument('Logger', 'User', req.bodyJson['user']['matric'], {
      Matric: req.bodyJson['user']['matric'],
      Name: req.bodyJson['user']['name'],
      device: [{
        Datetime: req.bodyJson['device']['datetime'],
        Browser: req.bodyJson['device']['browser'],
        Screen: req.bodyJson['device']['screen'],
        Viewport: req.bodyJson['device']['viewport'],
        CPU: req.bodyJson['device']['CPU'],
        RAM: req.bodyJson['device']['memory'],
        Timezone: req.bodyJson['device']['timezone'],
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

  return res.text(`body: ${req.bodyJson}\nip: ${clientIP}`)
};
