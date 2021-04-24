/*
微信版本检测，核心代码检测来源官网【https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html】
*/


//compareVersion('1.11.0', '1.9.9'); // 版本号大于返回1，等于返回0，小于返回-1
export function compareVersion(v1, v2) { //v1当前版本，v2要求最低的版本
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);
        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}

export function getIosVersion() {
    //获取苹果系统的版本号  window.navigator.appVersion;
    let sysInfo = navigator.userAgent.toLowerCase();
    let arr = sysInfo.match(/cpu iphone os (.*?) like mac os/);
    if (arr !== null) {
        let version = arr[1].replace(/_/g, ".");
        return version;
    } else {
        return '';
    }
}



export let platform = (function() {
    //判断是IOS或ANDROID
    let u = navigator.userAgent;
    let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端
    let isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return {
        isAndroid: isAndroid,
        isIos: isIos,
    };
}());