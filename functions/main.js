import { Databases, Client } from 'node-appwrite'

const max = 999999
const min = 100000

function validateBody(bodyJson) {
  const userBody = [ "Matric", "Name", "LatestPHPSession" ].toString()
  const deviceBody = [ "Browser", "Screen", "Viewport", "CPU", "RAM", "Timezone","System" ].toString()
  const ipBody = [ "Address", "Country", "City", "Region", "Coordinates", "ISP", "Postal", "Hostname" ].toString()
  
  try {
    if (Object.keys(bodyJson['user']).toString() != userBody || Object.keys(bodyJson['device']).toString() != deviceBody || Object.keys(bodyJson['ip']).toString() != ipBody)
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
  
  const sanitizedMatric = req.bodyJson['user']['matric']
    .trim()
    .replaceAll(' ', '_')
    .slice(0, 36);

  const userData = req.bodyJson['user']
  const deviceData = req.bodyJson['device']
  const IPData = req.bodyJson['ip']
  log(ipinfo)
  
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
    log(`${sanitizedMatric}_${Math.floor(Math.random() * (max - min + 1) + min)}`)

    if (deviceData != {}) {
      userData['Devices'] = await database.createDocument('Logger', 'Device', `${sanitizedMatric}_${Math.floor(Math.random() * (max - min + 1) + min)}`, deviceData);
    } else {
      error("No device data available");
      return res.json({success: false, message: `User ${sanitizedMatric}: No device data available`});
    }
    if (IPData != {}) {
      userData['IPs'] = await database.createDocument('Logger', 'IP-Info', `${sanitizedMatric}_${Math.floor(Math.random() * (max - min + 1) + min)}`, IPData);
    } else {
      error("No IP data available");
      return res.json({success: false, message: `User ${sanitizedMatric}: No IP data available`});  
    }
    log(userData)
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