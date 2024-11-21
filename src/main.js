import { Databases, Client } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  if (req.method != 'POST') {
    return res.json({success: false, message: "Method not allowed, Please send POST"})
  }

  // Validate request body
  const user = [ "matric", "name" ].toString()
  const device = [ "datetime", "browser", "screen", "viewport", "CPU", "memory", "timezone" ].toString()
  if (req.bodyJson['user'].toString() != user || req.bodyJson['device'].toString() != device) {
    return res.json({success: false, message: "Invalid data object"})
  }

  const clientIP = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
  let ipinfo
  if (clientIP) {
    ipinfo = (await (await fetch(`https://ipinfo.io/${clientIP}/json`)).json())
  } else {
    ipinfo = {
      "ip": null,
      "city": null,
      "region": null,
      "country": null,
      "loc": null,
      "org": null,
      "postal": null
    }
  }
  log(ipinfo)

  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
    
    const database = new Databases(client)

  log('body ' + req.bodyJson)
  log('ip ' + clientIP)
    
  await database.createDocument('Logger', 'User', req.bodyJson['user']['matric'], {
      Matric: req.bodyJson['user']['matric'],
      Name: req.bodyJson['user']['name'],
      device: {
        Datetime: req.bodyJson['device']['datetime'],
        Browser: req.bodyJson['device']['browser'],
        Screen: req.bodyJson['device']['screen'],
        Viewport: req.bodyJson['device']['viewport'],
        CPU: req.bodyJson['device']['CPU'],
        RAM: req.bodyJson['device']['memory'],
        Timezone: req.bodyJson['device']['timezone'],
      },
      IPInfo: {
        $id: ipinfo['ip'],
        Address: ipinfo['ip'],
        Country: ipinfo['country'],
        City: ipinfo['city'],
        Region: ipinfo['region'],
        Coordinates: ipinfo['loc'],
        ISP: ipinfo['org'],
        Postal: ipinfo['postal'],
      }
    }
  )

  return res.text(`body: ${req.bodyJson}\nip: ${clientIP}`)
};
