/**
 * 机场流量查询脚本
 * @author Claude
 * @version 1.0.0
 */

// 配置信息
const config = {
    // 订阅链接
    subscriptionUrl: $argument,
    // 更新间隔（秒）
    updateInterval: 60
};

// 主函数
async function main() {
    try {
        // 获取订阅信息
        const subscriptionInfo = await getSubscriptionInfo(config.subscriptionUrl);
        
        // 计算流量信息
        const trafficInfo = calculateTrafficInfo(subscriptionInfo);
        
        // 更新面板
        updatePanel(trafficInfo);
    } catch (error) {
        console.error('Error:', error);
        $done({
            title: '机场流量查询',
            content: '获取数据失败，请检查配置',
            icon: 'exclamationmark.triangle',
            'icon-color': '#FF3B30'
        });
    }
}

/**
 * 获取订阅信息
 * @param {string} url - 订阅链接
 * @returns {Promise<Object>} 订阅信息对象
 */
async function getSubscriptionInfo(url) {
    const response = await $httpClient.get(url);
    const info = parseSubscriptionInfo(response.body);
    return info;
}

/**
 * 解析订阅信息
 * @param {string} content - 订阅内容
 * @returns {Object} 解析后的订阅信息
 */
function parseSubscriptionInfo(content) {
    // 这里需要根据实际的订阅格式进行解析
    // 示例格式：
    const info = {
        upload: 0,
        download: 0,
        total: 0,
        expire: 0,
        reset: 0
    };
    
    // 解析逻辑
    // ...
    
    return info;
}

/**
 * 计算流量信息
 * @param {Object} subscriptionInfo - 订阅信息
 * @returns {Object} 流量信息
 */
function calculateTrafficInfo(subscriptionInfo) {
    const used = (subscriptionInfo.upload + subscriptionInfo.download) / (1024 * 1024 * 1024);
    const total = subscriptionInfo.total / (1024 * 1024 * 1024);
    const remaining = total - used;
    const percentage = (used / total * 100).toFixed(2);
    
    const now = new Date();
    const resetDate = new Date(subscriptionInfo.reset * 1000);
    const expireDate = new Date(subscriptionInfo.expire * 1000);
    
    const daysToReset = Math.ceil((resetDate - now) / (1000 * 60 * 60 * 24));
    const daysToExpire = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));
    
    return {
        used: used.toFixed(2),
        total: total.toFixed(2),
        remaining: remaining.toFixed(2),
        percentage: percentage,
        daysToReset: daysToReset,
        daysToExpire: daysToExpire
    };
}

/**
 * 更新面板显示
 * @param {Object} trafficInfo - 流量信息
 */
function updatePanel(trafficInfo) {
    $done({
        title: '机场流量查询',
        content: `${trafficInfo.used}GB (${trafficInfo.percentage}%)\n${trafficInfo.remaining}GB\n${trafficInfo.daysToReset}天\n${trafficInfo.daysToExpire}天`,
        icon: 'chart.bar',
        'icon-color': '#007AFF'
    });
}

// 执行主函数
main(); 
