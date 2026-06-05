const getDeviceInfo = (userAgent, platform) => {
    // Xác định loại thiết bị
    let deviceType = "unknown";
    if (/mobile|iphone|ipad|android/i.test(userAgent)) {
        deviceType = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
        deviceType = "tablet";
    } else {
        deviceType = "desktop";
    }

    // Xác định trình duyệt
    let browser = "Unknown";
    if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
    else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = "Safari";
    else if (/edge|edg/i.test(userAgent)) browser = "Edge";
    else if (/opera|opr/i.test(userAgent)) browser = "Opera";

    // Tạo tên thiết bị
    let deviceName = `${browser} trên ${deviceType}`;
    if (platform && platform !== "") {
        deviceName = `${browser} trên ${platform}`;
    }

    return { deviceType, browser, deviceName };
};

module.exports = { getDeviceInfo };