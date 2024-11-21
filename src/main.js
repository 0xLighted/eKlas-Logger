import { Databases, Client } from 'node-appwrite'

function validateBody(bodyJson) {
  const userBody = [ "matric", "name" ].toString()
  const deviceBody = [ "system", "datetime", "browser", "screen", "viewport", "CPU", "memory", "timezone" ].toString()
  
  try {
    if (Object.keys(bodyJson['user']).toString() != userBody || Object.keys(bodyJson['device']).toString() != deviceBody)
      { return false }
  } catch { return false }

  return true
}


export default async ({ req, res, log, error }) => {
  if (req.method != 'POST') {
    error('Method not allowed: ' + req.method)
    return res.json({success: false, message: "Method not allowed, Please send POST"})
  }

  if (!validateBody(req.bodyJson)) {
    error('Invalid data object: ' + req.bodyText())
    return res.json({success: false, message: "Invalid data object"})
  }

  // Appwrite project
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
    
  const database = new Databases(client)

  // Grab user IP and IP details
  // const clientIP = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
  // const ipinfo = (await (await fetch(`https://ipinfo.io/${clientIP}/json`)).json())
  // log(ipinfo)
  // log('ip ' + clientIP)

  // const userData = {
  //   Matric: req.bodyJson['user']['matric'],
  //   Name: req.bodyJson['user']['name'],
  // }
  // const deviceData = {
  //   $id: req.bodyJson['device']['system'].replaceAll(' ', '-'),
  //   System: req.bodyJson['device']['system'],
  //   Datetime: req.bodyJson['device']['datetime'],
  //   Browser: req.bodyJson['device']['browser'],
  //   Screen: req.bodyJson['device']['screen'],
  //   Viewport: req.bodyJson['device']['viewport'],
  //   CPU: req.bodyJson['device']['CPU'],
  //   RAM: req.bodyJson['device']['memory'],
  //   Timezone: req.bodyJson['device']['timezone'],
  // }
  // const IPData = {
  //   $id: ipinfo['ip'].replaceAll('.', '_'),
  //   Address: ipinfo['ip'],
  //   Country: ipinfo['country'],
  //   City: ipinfo['city'],
  //   Region: ipinfo['region'],
  //   Coordinates: ipinfo['loc'],
  //   ISP: ipinfo['org'],
  //   Postal: ipinfo['postal'],
  //   Hostname: ipinfo['hostname']
  // } 
  
  // try {
  //   await database.getDocument('Logger', 'User', req.bodyJson['user']['matric'].replaceAll(' ', '-'))
  // } catch {
  //   // If user doesnt exist, the function will raise an error, and we create new document with data info
  //   userData['Device'] = [deviceData]
  //   userData['IPInfo'] = [IPData]
  //   await database.createDocument('Logger', 'User', req.bodyJson['user']['matric'].replaceAll(' ', '-'), userData)

  //   log("New user added successfully")
  //   return res.json({success: true, message: "New user added successfully"})
  // }

  // // Since user exists, check if other documents exist
  // try {
  //   if (await database.getDocument('Logger', 'Device', req.bodyJson['device']['system'].replaceAll(' ', '-'))) {
  //     userData['Device'] = [deviceData]
  //   }
  // } catch { log(`Device "${req.bodyJson['device']['system'].replaceAll(' ', '-')}" already exists`) }

  // try {
  //   if (await database.getDocument('Logger', 'IP-Info', ipinfo['ip'].replaceAll('.', '_'))) {
  //     userData['IPInfo'] = [IPData]
  //   }
  // } catch { log(`User IP "${ipinfo['ip']}" already exists`) }
    
  let doc
  try {
    doc = await database.getDocument('Logger', 'User', req.bodyJson['user']['matric'].replaceAll(' ', '-'))
  } catch (error) {
    doc = null
  }
  log(doc)

  // IF THE DOCUMENT ALREADY EXIST, NO NEED TO WRITE ANYTHING
  // DO A CHECK TO SEE IF THAT DOCUMENT ALREADY EXIST
  // THEN POSSIBLY APPEND IT TO THE USER DOCUMENT
  // await database.createDocument('Logger', 'User', req.bodyJson['user']['matric'].replaceAll(' ', '-'), userData)

  return res.json({success: true, message: "Data stored successfully"})
};
