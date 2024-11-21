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
    error('Method not allowed: ' + req.method);
    return res.json({success: false, message: "Method not allowed, Please send POST"});
  }

  if (!validateBody(req.bodyJson)) {
    error('Invalid data object: ' + req.bodyText());
    return res.json({success: false, message: "Invalid data object"});
  }

  // Appwrite project
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
    
  const database = new Databases(client);
  
  // Grab user IP and IP details
  const clientIP = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
  const ipinfo = (await (await fetch(`https://ipinfo.io/${clientIP}/json`)).json());
  const sanitizedMatric = req.bodyJson['user']['matric']
    .trim()
    .replaceAll(' ', '_')
    .slice(0, 36);

  const userData = {
    Matric: req.bodyJson['user']['matric'],
    Name: req.bodyJson['user']['name'],
  }
  const deviceData = {
    System: req.bodyJson['device']['system'],
    Datetime: req.bodyJson['device']['datetime'],
    Browser: req.bodyJson['device']['browser'],
    Screen: req.bodyJson['device']['screen'],
    Viewport: req.bodyJson['device']['viewport'],
    CPU: req.bodyJson['device']['CPU'],
    RAM: req.bodyJson['device']['memory'],
    Timezone: req.bodyJson['device']['timezone'],
  }
  const IPData = {
    Address: ipinfo['ip'],
    Country: ipinfo['country'],
    City: ipinfo['city'],
    Region: ipinfo['region'],
    Coordinates: ipinfo['loc'],
    ISP: ipinfo['org'],
    Postal: ipinfo['postal'],
    Hostname: ipinfo['hostname']
  } 
  
  // Create or update user document
  try {
    const userDoc = await database.getDocument('Logger', 'User', sanitizedMatric);

    // Check if Device already registered, if not append new Device to user document
    if (userDoc['Devices'].filter(device => device['System'] === req.bodyJson['device']['system']).length == 0) {
      await database.updateDocument('logger', 'User', sanitizedMatric, {
        Devices: [...userDoc['Devices'], deviceData]
      })
      log(`Device "${req.bodyJson['device']['system'].replaceAll(' ', '_')}" successfully registered`)
    } else { log(`Device "${req.bodyJson['device']['system'].replaceAll(' ', '_')}" already registered`) }

    // Check if IP already registered, if not append new IP to user document
    if (userDoc['IPs'].filter(ip => ip['Address'] === ipinfo['ip']).length == 0) {
      await database.updateDocument('logger', 'User', sanitizedMatric, {
        IPs: [...userDoc['IPs'], IPData]
      })
      log(`User IP "${ipinfo['ip']}" successfully registered`)
    } else { log(`User IP "${ipinfo['ip']}" already registered`) }
    
    log("User data updated successfully");
    return res.json({success: true, message: "User data updated successfully"});
  } catch(err) {
    // If user doesnt exist, the function will raise an error, and create new document with data
    userData['Devices'] = [deviceData];
    userData['IPs'] = [IPData];
    await database.createDocument('Logger', 'User', sanitizedMatric, userData);

    log("New user added successfully");
    return res.json({success: true, message: "New user added successfully"});
  }
};
