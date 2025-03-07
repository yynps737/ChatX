// src/reportWebVitals.js
// 性能监测工具

const reportWebVitals = onPerfEntry => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(onPerfEntry);  // 累积布局偏移
            getFID(onPerfEntry);  // 首次输入延迟
            getFCP(onPerfEntry);  // 首次内容绘制
            getLCP(onPerfEntry);  // 最大内容绘制
            getTTFB(onPerfEntry); // 首字节时间
        });
    }
};

export default reportWebVitals;