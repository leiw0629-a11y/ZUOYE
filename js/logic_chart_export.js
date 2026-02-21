/**
 * 辅助：通用下载图片函数
 * @param {string} base64Url 图片的 Base64 数据
 * @param {string} filename 下载的文件名
 */
function downloadChartImage(base64Url, filename) {
    const a = document.createElement('a');
    a.href = base64Url;
    a.download = filename || 'chart_export.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * 1. 导出高清【热点图】
 */
function exportHeatmap() {
    const dom = document.getElementById('chart_heatmap_container');
    if (!dom) return;
    const myChart = echarts.getInstanceByDom(dom);
    if (!myChart) return alert('暂无热点图数据可导出');

    // 智能提取图表里的 title 作为导出的文件名
    const title = myChart.getOption().title[0].text || '热点图';
    
    // 🟢 pixelRatio: 3 保证3倍高清放大不模糊
    const url = myChart.getDataURL({
        type: 'png',
        pixelRatio: 3, 
        backgroundColor: '#fff' // 必须设为纯白，否则透明背景导出后可能会变黑
    });
    
    downloadChartImage(url, `${title}.png`);
}

/**
 * 2. 导出高清【趋势图】
 */
function exportLineChart() {
    const dom = document.getElementById('chart_line_container');
    if (!dom) return;
    const myChart = echarts.getInstanceByDom(dom);
    if (!myChart) return alert('暂无趋势图数据可导出');

    const title = myChart.getOption().title[0].text || '趋势图';
    
    const url = myChart.getDataURL({
        type: 'png',
        pixelRatio: 3,
        backgroundColor: '#fff'
    });
    
    downloadChartImage(url, `${title}.png`);
}

/**
 * 3. 导出高清【合并图】(热点图在上，趋势图在下自动拼接)
 */
function exportCombinedChart() {
    const heatDom = document.getElementById('chart_heatmap_container');
    const lineDom = document.getElementById('chart_line_container');
    
    const heatChart = heatDom ? echarts.getInstanceByDom(heatDom) : null;
    const lineChart = lineDom ? echarts.getInstanceByDom(lineDom) : null;

    if (!heatChart || !lineChart) {
        return alert('图表数据不完整，无法导出合并长图');
    }

    // 提取标题 (用热点图的标题稍微改一下当做总标题)
    let combinedTitle = '综合分析报告';
    const heatTitle = heatChart.getOption().title[0].text;
    if (heatTitle) {
        combinedTitle = heatTitle.replace(' 作业缺勤频次', '') + ' 综合分析报表';
    }

    // 分别获取两张图的高清 Base64
    const heatUrl = heatChart.getDataURL({ type: 'png', pixelRatio: 3, backgroundColor: '#fff' });
    const lineUrl = lineChart.getDataURL({ type: 'png', pixelRatio: 3, backgroundColor: '#fff' });

    // 使用原生 Canvas 将两张图片上下无缝拼接
    const img1 = new Image();
    const img2 = new Image();
    
    img1.src = heatUrl;
    img1.onload = () => {
        img2.src = lineUrl;
        img2.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 画布宽度取两张图里的最大值，高度是两张图相加
            canvas.width = Math.max(img1.width, img2.width);
            canvas.height = img1.height + img2.height;
            
            // 铺一层纯白背景底色
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 画第一张图 (热点图居中)
            const x1 = (canvas.width - img1.width) / 2;
            ctx.drawImage(img1, x1, 0);
            
            // 画第二张图 (趋势图紧挨着热点图下面，并居中)
            const x2 = (canvas.width - img2.width) / 2;
            ctx.drawImage(img2, x2, img1.height);
            
            // 导出合并后的长图并下载
            const combinedUrl = canvas.toDataURL('image/png');
            downloadChartImage(combinedUrl, `${combinedTitle}.png`);
        };
    };
}