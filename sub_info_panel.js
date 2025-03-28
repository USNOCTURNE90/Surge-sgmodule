/**
 * @file Sub_info.js
 * @description 自动获取机场流量信息和到期时间的脚本
 */

// 配置参数
const config = {
    url: $argument.url,
    reset_day: $argument.reset_day,
    title: $argument.title || "机场信息",
    icon: $argument.icon || "externaldrive.fill.badge.icloud",
    color: $argument.color || "#007aff"
};

// 主函数
async function main() {
    try {
        // 获取订阅信息
        const response = await $httpClient.get(config.url);
        
        // 从响应头中获取流量和到期信息
        const userInfo = response.headers['subscription-userinfo'];
        const trafficInfo = parseUserInfo(userInfo);
        
        // 生成面板显示内容
        const panelContent = generatePanelContent(trafficInfo);
        
        // 更新面板
        $done({
            title: config.title,
            content: panelContent,
            icon: config.icon,
            color: config.color
        });
    } catch (error) {
        console.error("获取信息失败:", error);
        $done({
            title: config.title,
            content: "获取信息失败，请检查网络连接",
            icon: config.icon,
            color: config.color
        });
    }
}

/**
 * 解析用户信息
 * @param {string} userInfo - 用户信息字符串
 * @returns {Object} 流量信息对象
 */
function parseUserInfo(userInfo) {
    if (!userInfo) return null;
    
    const upload = userInfo.match(/upload=(\d+)/);
    const download = userInfo.match(/download=(\d+)/);
    const total = userInfo.match(/total=(\d+)/);
    const expire = userInfo.match(/expire=(\d+)/);
    
    return {
        upload: upload ? parseInt(upload[1]) : 0,
        download: download ? parseInt(download[1]) : 0,
        total: total ? parseInt(total[1]) : 0,
        expire: expire ? parseInt(expire[1]) : null
    };
}

/**
 * 生成面板显示内容
 * @param {Object} trafficInfo - 流量信息
 * @returns {string} 面板内容
 */
function generatePanelContent(trafficInfo) {
    if (!trafficInfo) return "无法获取流量信息";
    
    let content = [];
    
    // 添加流量信息
    const used = trafficInfo.upload + trafficInfo.download;
    const remaining = trafficInfo.total - used;
    
    content.push(`上传：${formatBytes(trafficInfo.upload)}`);
    content.push(`下载：${formatBytes(trafficInfo.download)}`);
    content.push(`剩余：${formatBytes(remaining)}`);
    
    // 添加重置信息
    if (config.reset_day) {
        content.push(`重置：每月${config.reset_day}号`);
    }
    
    // 添加到期信息
    if (trafficInfo.expire) {
        const expireDate = new Date(trafficInfo.expire * 1000).toLocaleDateString();
        content.push(`到期：${expireDate}`);
    }
    
    return content.join('\n');
}

/**
 * 格式化字节数
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 执行主函数
main(); 
