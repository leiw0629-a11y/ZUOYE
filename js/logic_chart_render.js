/**
 * 热点图渲染函数 (仅负责渲染，数据已在外部计算完毕)
 * @param {string} targetName 名字（学生/小组/班级）
 * @param {Date} startDate 开始时间
 * @param {Date} endDate 结束时间
 * @param {Array} dataMap 图表数据
 */
function renderMockHeatmap(targetName, startDate, endDate, dataMap) {
    const dom = document.getElementById('chart_heatmap_container');
    if (!dom) return;

    // 1. 获取起始日期是星期几 (1-7，周一是1，周日是7)
    const startDay = startDate.getDay() || 7;
    
    // 2. 算出实际相隔的天数
    const actualDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // 3. 核心修复：补全第一周前面空缺的天数，算出“视觉上”日历格子的总长度
    const visualTotalDays = actualDays + (startDay - 1);
    
    // 4. 算出准确的跨行数 (ECharts 实际会画的周数)
    const totalWeeks = Math.ceil(visualTotalDays / 7);
    
    // 5. 计算高度 = 顶部预留(80) + 底部预留(20) + (准确行数 * 固定高度40)
    const requiredHeight = 100 + (totalWeeks * 40);
    
    // 6. 把高度赋值给 DOM
    dom.style.height = requiredHeight + 'px';

    // --- 初始化 ECharts ---
    let myChart = echarts.getInstanceByDom(dom);
    if (!myChart) {
        myChart = echarts.init(dom);
    }
    myChart.resize(); // 高度变化后必须 resize 撑满

    const startStr = echarts.format.formatTime('MM月dd日', startDate);
    const endStr = echarts.format.formatTime('MM月dd日', endDate);
    const reportTitle = `${targetName} ${startStr}~${endStr} 作业缺勤频次`;

    // --- 配置项 ---
    const option = {
        title: {
            text: reportTitle,
            left: 'center',
            top: 0,
            textStyle: { fontSize: 16, fontWeight: 'bold', color: '#333' }
        },
        tooltip: {
            position: 'top',
            formatter: function (p) {
                const date = p.data[0];
                const val = p.data[1];
                const tag = p.data[2];
                
                // 🟢 根据新的标签规则更新提示
                if (tag === '休') return `${date} 休息日`; 
                
                let baseMsg = val > 0 ? `${date} 缺交 ${val} 人次` : `${date} 全齐`;
                
                // 如果是请假，但在统计上仍有缺交，同时提示出来
                if (tag === '请假') {
                    return `${baseMsg} (已请假)`;
                }
                
                return baseMsg;
            }
        },
        visualMap: {
            min: 0,
            max: 10,
            type: 'piecewise',
            orient: 'horizontal',
            left: 'center',
            top: 25, 
            dimension: 1, 
            pieces: [
                { value: 0, color: '#F5F7FA', label: '全齐' },       
                { min: 1, max: 2, color: '#FFEBEE', label: '缺1-2' }, 
                { min: 3, max: 5, color: '#EF9A9A', label: '缺3-5' }, 
                { min: 6, color: '#D32F2F', label: '严重' }           
            ],
            itemWidth: 10,
            itemHeight: 10,
            textStyle: { color: '#666', fontSize: 12 }
        },
        calendar: {
            orient: 'vertical',
            range: [startDate, endDate], // 这里的起止时间现在由下拉框决定了
            top: 80,     
            bottom: 20, 
            left: 30,    
            right: 10,
            cellSize: [100, 40], // ⚠️ 这里我帮你把 '100' 的引号去掉了，ECharts 严格要求传数字
            yearLabel: { show: false },
            dayLabel: {
                firstDay: 1,
                nameMap: 'cn',
                position: 'start',
                color: '#999',
                margin: 10         
            },
            monthLabel: {
                position: 'start',
                color: '#333',
                nameMap: 'cn'
            },
            itemStyle: {
                borderWidth: 2,
                borderColor: '#ffffff'
            },
            splitLine: { show: false }
        },
        series: [{
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: dataMap, 
            label: {
                show: true,
                formatter: function (p) {
                    return p.data[2] ? p.data[2] : '';
                },
                color: '#B0BEC5', 
                fontSize: 10
            },
            // 👇 🟢 新增：覆盖默认的鼠标悬浮高亮效果 👇
            emphasis: {
                itemStyle: {
					color: 'inherit',
                    borderColor: '#FFC107', // 金色边框 (琥珀金，很温和)
                    shadowColor: 'rgba(255, 193, 7, 0.5)' 
                }
            }
            // 👆 新增结束 👆
        }]
    };

    // 加上 true 参数，确保每次下拉框切换时间时，旧的格子能被彻底清除
    myChart.setOption(option, true); 
    window.addEventListener('resize', function() { myChart.resize(); });
}

/**
 * 折线图渲染函数 (仅负责渲染，数据已在外部计算完毕)
 * @param {string} targetName 名字（学生/小组/班级）
 * @param {Date} startDate 开始时间
 * @param {Date} endDate 结束时间
 * @param {Object} chartData 包含折线图所需的 categories, classData, targetData
 */
function renderMockLineChart(targetName, startDate, endDate, chartData) {
    const dom = document.getElementById('chart_line_container');
    if (!dom) return;

    let myChart = echarts.getInstanceByDom(dom);
    if (!myChart) {
        myChart = echarts.init(dom);
    }
    myChart.resize();

    // 动态生成标题日期
    const startStr = echarts.format.formatTime('MM月dd日', startDate);
    const endStr = echarts.format.formatTime('MM月dd日', endDate);
    const chartTitle = `${targetName} ${startStr}~${endStr} 完成率对比`;

    // --- 配置项 (完全保留原始静态视觉配置) ---
    const option = {
        title: {
            text: chartTitle,
            left: 'center', 
            top: 0,
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#EEE',
            borderWidth: 1,
            textStyle: { color: '#333' },
            formatter: function(params) {
                let html = `<div style="font-weight:bold; margin-bottom:5px;">${params[0].axisValue}</div>`;
                params.forEach(item => {
                    html += `
                    <div style="display:flex; justify-content:space-between; width:140px;">
                        <span style="color:${item.color}">● ${item.seriesName}</span>
                        <span style="font-weight:bold">${item.value}%</span>
                    </div>`;
                });
                return html;
            }
        },
        legend: {
            data: ['班级完成度', '当前查看目标'],
            right: 0, 
            top: 30,  
            icon: 'roundRect' 
        },
        grid: {
            top: 80,    
            left: 10,   
            right: 20,  
            bottom: 10, 
            containLabel: true 
        },
        xAxis: {
            type: 'category',
            data: chartData.lineCategories, // 🟢 替换为外部传进来的 X 轴时间刻度
            axisLine: { lineStyle: { color: '#EEE' } },
            axisTick: { show: false },
            axisLabel: { color: '#999', margin: 15 }, 
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            max: 100,
            splitLine: { 
                lineStyle: { type: 'dashed', color: '#F5F5F5' } 
            },
            axisLabel: { color: '#999' }
        },
        series: [
            {
                name: '班级完成度',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: chartData.lineClassData, // 🟢 替换为外部传进来的班级数据
                lineStyle: { 
                    width: 3, 
                    color: '#FF7043', 
                    type: 'dashed'    
                }, 
                itemStyle: { color: '#FF7043' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(255, 112, 67, 0.1)' },
                        { offset: 1, color: 'rgba(255, 112, 67, 0.0)' }
                    ])
                },
                z: 1 
            },
            {
                name: '当前查看目标',
                type: 'line',
                smooth: true,
                data: chartData.lineTargetData, // 🟢 替换为外部传进来的个体数据
                lineStyle: { 
                    width: 3, 
                    color: '#2979FF' 
                }, 
                itemStyle: { 
                    color: '#2979FF', 
                    borderWidth: 2, 
                    borderColor: '#fff' 
                },
                symbol: 'circle',
                symbolSize: 8,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(41, 121, 255, 0.2)' },
                        { offset: 1, color: 'rgba(41, 121, 255, 0.0)' }
                    ])
                },
                markPoint: {
                    data: [
                        { type: 'min', name: '最低', itemStyle: { color: '#D32F2F' } }
                    ]
                },
                z: 2 
            }
        ]
    };
	if (chartData.type === 'class') {
        option.legend.data = ['班级整体'];
        option.series.pop(); // pop() 会直接删掉 series 数组里的最后一条(也就是蓝色线)
    }
    
    myChart.setOption(option, true); 
    window.addEventListener('resize', function() { myChart.resize(); });
}

/**
 * 辅助：清空右侧图表区 (当左侧列表无数据时调用)
 */
function clearRightChartArea(message) {
    const heatDom = document.getElementById('chart_heatmap_container');
    const lineDom = document.getElementById('chart_line_container');
    
    if (heatDom) {
        if (typeof echarts !== 'undefined') echarts.dispose(heatDom);
        renderChartEmptyState(heatDom, message);
    }
    if (lineDom) {
        if (typeof echarts !== 'undefined') echarts.dispose(lineDom);
        renderChartEmptyState(lineDom, "暂无报表数据");
    }
	if (document.getElementById('chart_stat_value_1')) document.getElementById('chart_stat_value_1').innerText = '-';
    if (document.getElementById('chart_stat_value_2')) document.getElementById('chart_stat_value_2').innerText = '-';
    if (document.getElementById('chart_stat_value_3')) document.getElementById('chart_stat_value_3').innerText = '-';
}