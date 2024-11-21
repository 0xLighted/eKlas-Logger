import { Databases, Client } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  if (req.method != 'POST') {
    return res.json({success: false, message: "Method not allowed, Please send POST"})
  }

  // Validate request body
  const user = [ "matric", "name" ].toString()
  const device = [ "_system", "datetime", "browser", "screen", "viewport", "CPU", "memory", "timezone" ].toString()
  try {
    if (Object.keys(req.bodyJson['user']).toString() != user || Object.keys(req.bodyJson['device']).toString() != device) {
      return res.json({success: false, message: "Invalid data object"})
    }
  } catch {
    return res.json({success: false, message: "Invalid data object"})
  }
  
  // Grab user IP and IP details
  const clientIP = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
  const ipinfo = (await (await fetch(`https://ipinfo.io/${clientIP}/json`)).json())
  log(ipinfo)
  log('ip ' + clientIP)

  // Appwrite project
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
  
  // Connect to database and create new document
  const database = new Databases(client)
  await database.createDocument('Logger', 'User', req.bodyJson['user']['matric'], {
      Matric: req.bodyJson['user']['matric'],
      Name: req.bodyJson['user']['name'],
      device: [{
        $id: req.bodyJson['device']['_system'],
        Datetime: req.bodyJson['device']['datetime'],
        Browser: req.bodyJson['device']['browser'],
        Screen: req.bodyJson['device']['screen'],
        Viewport: req.bodyJson['device']['viewport'],
        CPU: req.bodyJson['device']['CPU'],
        RAM: req.bodyJson['device']['memory'],
        Timezone: req.bodyJson['device']['timezone'],
      }],
      IPInfo: [{
        $id: ipinfo['ip'],
        Address: ipinfo['ip'],
        Country: ipinfo['country'],
        City: ipinfo['city'],
        Region: ipinfo['region'],
        Coordinates: ipinfo['loc'],
        ISP: ipinfo['org'],
        Postal: ipinfo['postal'],
        Hostname: ipinfo['hostname']
      }]
    }
  )

  return res.json({success: true, message: "Data stored successfully"})
};
