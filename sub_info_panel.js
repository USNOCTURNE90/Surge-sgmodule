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
    
    // 计算已用流量和百分比
    const used = trafficInfo.upload + trafficInfo.download;
    const usedGB = (used / (1024 * 1024 * 1024)).toFixed(2);
    const percentage = ((used / trafficInfo.total) * 100).toFixed(1);
    
    // 计算剩余流量
    const remaining = trafficInfo.total - used;
    const remainingGB = (remaining / (1024 * 1024 * 1024)).toFixed(2);
    
    // 计算下一个重置日期
    const now = new Date();
    const resetDay = parseInt(config.reset_day) || 1;
    let nextReset = new Date(now.getFullYear(), now.getMonth(), resetDay);
    if (now.getDate() >= resetDay) {
        nextReset.setMonth(nextReset.getMonth() + 1);
    }
    const daysUntilReset = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24));
    
    // 添加显示内容
    content.push(`已用：${usedGB}GB (${percentage}%)`);
    content.push(`剩余：${remainingGB}GB`);
    content.push(`下个周期：${daysUntilReset}天后`);
    
    // 添加到期信息
    if (trafficInfo.expire) {
        const expireDate = new Date(trafficInfo.expire * 1000).toLocaleDateString();
        content.push(`到期：${expireDate}`);
    }
    
    return content.join('\n');
}

// 执行主函数
main();
