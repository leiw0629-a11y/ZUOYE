// 全局变量，用于记录进入分析页之前的视图 ID
let lastViewId = 'view-student'; // 默认值给个学生页，防报错

/**
 * 打开数据分析视图
 * 逻辑：遍历检查当前哪个视图是开着的，记下来，然后全关掉，只开分析页
 */
function openAnalysisView() {
    const allViews = ['view-student', 'view-admin', 'view-global'];
    
    for (let id of allViews) {
        const el = document.getElementById(id);
        if (el && el.style.display !== 'none') {
            lastViewId = id; 
            el.style.display = 'none'; 
        }
    }

    const analysisView = document.getElementById('view-analysis');
    if (analysisView) {
        analysisView.style.display = 'flex';
    }
    
    initChartDropdown();
    // 渲染左侧列表，列表渲染完会自动调用 handleChartItem 触发第一条数据的图表渲染
    renderChartAllList();
}

/**
 * 1. 初始化下拉框 (只执行一次)
 * 负责把 window.classes 的数据填入 select
 */
function initChartDropdown() {
    const selectEl = document.getElementById('chart_class_slc');
    if (!selectEl) return;

    // 清空现有选项（保留第一个"全部"也可以，看你需求，这里假设全量重绘）
    selectEl.innerHTML = ""; 

    const classes = window.classes || [];
    
    // 生成选项
    selectEl.innerHTML = classes.map(cls => 
        `<option value="${cls.className}">${cls.className}</option>`
    ).join('');

    // 如果有数据，默认选中第一个
    if (classes.length > 0) {
        selectEl.value = classes[0].className;
    }
}

/**
 * 返回列表 (退出分析视图)
 * 逻辑：隐藏分析页，恢复刚才记录的那个视图
 */
function closeAnalysisView() {
    // 1. 隐藏分析视图
    document.getElementById('view-analysis').style.display = 'none';

    // 2. 恢复之前的视图
    const prevView = document.getElementById(lastViewId);
    if (prevView) {
        prevView.style.display = 'flex';
    } else {
        // 兜底：如果找不到上一页，默认回学生页
        document.getElementById('view-student').style.display = 'flex';
    }
}

/**
 * 2. 主渲染入口
 * 根据当前 Tab (学生/小组/班级) 和 选中的班级 刷新列表
 */
function renderChartAllList() {
    const selectEl = document.getElementById('chart_class_slc');
    if (!selectEl) return;

    const targetClass = selectEl.value; // 获取下拉框当前班级
    
    // 获取当前图表页面的 Tab，默认为学生
    const tab = window.currentChartTab || 'chart_tab_student';

    // 分发到具体的渲染函数
    if (tab === 'chart_tab_student') {
        renderChartStudentList(targetClass);
    } else if (tab === 'chart_tab_group') {
        renderChartGroupList(targetClass);
    } else if (tab === 'chart_tab_class') {
        renderChartClassList(); 
    }
}

/**
 * 3. 渲染【学生】列表 (带时间区间缺交统计 & 倒排)
 * 数据源：window.students
 */
function renderChartStudentList(classStr) {
    const listContainer = document.getElementById('chart_class_list');
    if (!listContainer) return;

    // 过滤出该班级的学生
    const data = (window.students || []).filter(s => s.className === classStr).sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'));

    if (data.length === 0) {
        if (typeof renderChartEmptyState === 'function') {
            renderChartEmptyState(listContainer, "该班级暂无学生数据");
        }
        if (typeof clearRightChartArea === 'function') {
            clearRightChartArea("暂无学生，无法生成分析视图");
        }
        return;
    }

    // =========== 🟢 [新增] 局部内联计算区间缺交次数 ===========
    const missingMap = {};
    data.forEach(s => missingMap[s.studentName] = 0);

    // 1. 获取当前图表选择的时间区间
    const { startDate, endDate } = typeof getChartDateRange === 'function' ? getChartDateRange() : { startDate: new Date(0), endDate: new Date() };
    
    // 将日期对象转为 YYYY-MM-DD 字符串，利用字符串进行极速比对
    const pad = n => String(n).padStart(2, '0');
    const startStr = `${startDate.getFullYear()}-${pad(startDate.getMonth()+1)}-${pad(startDate.getDate())}`;
    const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}`;

    const allTasks = typeof getGlobalClassTasks === 'function' ? getGlobalClassTasks(classStr) : [];
    
    if (allTasks.length > 0) {
        allTasks.forEach(task => {
            // 2. 核心过滤：只统计落在所选时间区间内的任务
            if (task.date >= startStr && task.date <= endStr) {
                const dailySubs = window.submissionData?.[task.actId]?.[task.date] || [];
                
                const finishers = new Set();
                dailySubs.forEach(sub => {
                    if (sub.subject === task.subject && sub.task === task.content) {
                        finishers.add(sub.name);
                    }
                });

                data.forEach(m => {
                    if (!finishers.has(m.studentName)) {
                        missingMap[m.studentName]++;
                    }
                });
            }
        });
    }
    // =========== 🟢 [新增结束] ===========

    // [新增] 按当前区间的缺交次数降序排列 (最多的排最前)
    data.sort((a, b) => missingMap[b.studentName] - missingMap[a.studentName]);

    let html = "";
    data.forEach((item, index) => {
        const itemId = `chart_item_s_${index}`;
        const avatar = item.avatar || "📊"; 
        const missingCount = missingMap[item.studentName] || 0;

        // 点击触发 handleChartItem，传入 'stu' 类型
        html += `
            <div id="${itemId}" class="chart_stu_item ${index === 0 ? 'active' : ''}" onclick="handleChartItem('${itemId}', 'stu', '${item.studentName}', '${item.className}')">
                <div class="avatar-circle" style="background:#E3F2FD;">${avatar}</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px; display:flex; justify-content:space-between; align-items: center;">
                        <span>${item.studentName}</span>
                        ${missingCount > 0 ? `<span style="background:#FF5252; color:white; font-size:10px; padding:2px 6px; border-radius:10px; margin-left: 4px;">缺${missingCount}</span>` : ''}
                    </div>
                    <div style="font-size:12px; color:#999;">点击查看分析</div>
                </div>
            </div>`;
    });

    listContainer.innerHTML = html;
    
    // 默认选中倒排后的第一名
    if (data.length > 0) {
        if (typeof handleChartItem === 'function') {
            handleChartItem('chart_item_s_0', 'stu', data[0].studentName, data[0].className);
        }
    }
}

/**
 * 4. 渲染【小组】列表
 * 数据源：window.groups
 */
function renderChartGroupList(classStr) {
    const listContainer = document.getElementById('chart_class_list');
    if (!listContainer) return;

    const data = (window.groups || []).filter(g => g.className === classStr);

    if (data.length === 0) {
        renderChartEmptyState(listContainer, "该班级暂无小组数据");
		clearRightChartArea("暂无小组，无法生成分析视图");
        return;
    }

    let html = "";
    data.forEach((item, index) => {
        const itemId = `chart_item_g_${index}`;
        
        // 点击触发 handleChartItem，传入 'group' 类型
        html += `
            <div id="${itemId}" class="chart_stu_item" onclick="handleChartItem('${itemId}', 'group', '${item.groupName}', '${item.className}')">
                <div class="avatar-circle" style="background:#FFF3E0;">🛡️</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px;">${item.groupName}</div>
                    <div style="font-size:12px; color:#999;">组员: ${item.memberCount || 0}人</div>
                </div>
            </div>`;
    });
    listContainer.innerHTML = html;
	if (data.length > 0) handleChartItem('chart_item_g_0', 'group', data[0].groupName, data[0].className);
}



/**
 * 监听下拉框改变
 */
function CharthandleTimeChange() {
    const val = document.getElementById('chartTimeSelect').value;
    const customArea = document.getElementById('chartDateArea');
    if (val === 'custom') {
        customArea.style.display = 'block'; // 展开自定义日期弹窗
    } else {
        if(customArea) customArea.style.display = 'none';
        renderChartStudentList(document.getElementById('chart_class_slc').value);
		refreshCurrentChart(); // 直接重绘
		
    }
}

/**
 * 自定义日期点击【确定】按钮
 */
function chartCustomDate() {
    renderChartStudentList(document.getElementById('chart_class_slc').value);
    refreshCurrentChart(); // 重新按自定义的时间取数据
}

/**
 * 触发当前高亮项的重新点击事件（刷新图表）
 */
function refreshCurrentChart() {
    const activeItem = document.querySelector('#chart_class_list .chart_stu_item.active');
    if (activeItem) {
        activeItem.click(); // 借用原有的点击事件走一遍流程
    }
}



/**
 * 5. 渲染【班级】列表
 * 数据源：window.classes
 */
function renderChartClassList() {
    const listContainer = document.getElementById('chart_class_list');
    if (!listContainer) return;

    const classes = window.classes || [];
    const selectEl = document.getElementById('chart_class_slc');
    const currentSelectedClass = selectEl ? selectEl.value : '';

    if (classes.length === 0) {
        renderChartEmptyState(listContainer, "暂无班级数据");
		clearRightChartArea("暂无班级，无法生成分析视图");
        return;
    }

    let html = "";
    classes.forEach((item, index) => {
        const itemId = `chart_item_c_${index}`;
        // 如果列表里的班级就是下拉框选中的，高亮一下
        const isActive = item.className === currentSelectedClass ? 'active' : '';

        // 点击触发 handleChartItem，传入 'class' 类型
        html += `
            <div id="${itemId}" class="chart_stu_item ${isActive}" onclick="handleChartItem('${itemId}', 'class', '${item.className}')">
                <div class="avatar-circle" style="background:#E8F5E9;">🏫</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px;">${item.className}</div>
                    <div style="font-size:12px; color:#999;">查看班级整体报表</div>
                </div>
            </div>`;
    });
    listContainer.innerHTML = html;
	if (classes.length > 0) handleChartItem('chart_item_c_0', 'class', classes[0].className);
}

/**
 * 6. 处理列表项点击 (核心交互)
 * 仅仅是 Alert，不做复杂渲染
 * @param {string} domId DOM元素的ID (用于高亮)
 * @param {string} type 类型: 'stu' | 'group' | 'class'
 * @param {string} name 名称/ID
 * @param {string} extra 额外信息(如班级名)
 */
/**
 * 处理列表项点击 (核心交互)
 */
function handleChartItem(domId, type, name, extra) {
    // 1. 视觉高亮处理
    const allItems = document.querySelectorAll('#chart_class_list .chart_stu_item');
    allItems.forEach(el => el.classList.remove('active'));
    
    const currentEl = document.getElementById(domId);
    if (currentEl) currentEl.classList.add('active');

    // 2. 智能提取班级名和目标名
    // 如果是班级，那 name 就是班级本身；如果是学生/小组，extra 才是班级
    const className = (type === 'class') ? name : extra;
    const targetName = name; 
	
	// 🟢 3. 拦截空数据状态：检查该班级是否有任务/活动
    const allTasks = typeof getGlobalClassTasks === 'function' ? getGlobalClassTasks(className) : [];
    if (allTasks.length === 0) {
        const heatDom = document.getElementById('chart_heatmap_container');
        const lineDom = document.getElementById('chart_line_container');
        
        // 核心修复：销毁已有的 ECharts 实例，切断内存绑定，防止报错
        if (heatDom) {
            echarts.dispose(heatDom); 
            renderChartEmptyState(heatDom, "该班级暂无作业记录");
        }
        if (lineDom) {
            echarts.dispose(lineDom);
            renderChartEmptyState(lineDom, "该班级暂无完成率数据");
        }
        if (document.getElementById('chart_stat_value_1')) document.getElementById('chart_stat_value_1').innerText = '-';
        if (document.getElementById('chart_stat_value_2')) document.getElementById('chart_stat_value_2').innerText = '-';
        if (document.getElementById('chart_stat_value_3')) document.getElementById('chart_stat_value_3').innerText = '-';
        return;
    }
    
	// 3. 获取时间范围
    const { startDate, endDate } = getChartDateRange();

    // 4. 调用万能数据计算中心
    const chartData = buildChartData(type, targetName, className, startDate, endDate);

    // 5. 将处理好的数据直接喂给图表进行渲染
    renderMockHeatmap(targetName, startDate, endDate, chartData.heatmapData);
    renderMockLineChart(targetName, startDate, endDate, chartData);
	
	renderChartStats(type, targetName, className, chartData);
}

/**
 * 7. Tab 切换逻辑
 * 切换 window.currentChartTab 状态并重绘
 */
function handleChartTab(tabId) {
    // 视觉切换
    // 注意：这里假设 Tab 元素有 class 'stu_tab_item' (复用了样式)，但 ID 是 chart_ 开头
    // 只要你的 HTML 结构里 Tab 是兄弟节点，这里简单粗暴重置
    const tabs = document.querySelectorAll('.chart_tabs_container .chart_tab_item');
    tabs.forEach(t => t.classList.remove('active'));
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');

    // 更新状态
    window.currentChartTab = tabId;

    // 重新渲染列表
    renderChartAllList();
}

/**
 * 8. 搜索过滤功能
 * 针对 chart_class_list 下的项进行文本匹配
 */
function handleChartSearch(keyword) {
    const items = document.querySelectorAll('#chart_class_list .chart_stu_item');
    if (items.length === 0) return;

    const term = (keyword || '').trim().toLowerCase();

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? '' : 'none';
    });
    
    // 控制清空按钮显隐 (如果有的话)
    const clearBtn = document.getElementById('chart_search_clear');
    if (clearBtn) {
        clearBtn.style.display = term.length > 0 ? 'block' : 'none';
    }
}

/**
 * 辅助：清空搜索
 */
function clearChartSearch() {
    const input = document.getElementById('chart_search_inp');
    if (input) {
        input.value = '';
        input.focus();
        handleChartSearch('');
    }
}

/**
 * 辅助：空状态显示
 */
function renderChartEmptyState(container, message) {
    container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:200px; color:#CFD8DC;">
            <div style="font-size:40px; margin-bottom:10px;">📉</div>
            <div style="font-size:13px;">${message}</div>
        </div>
    `;
}

/**
 * 渲染顶部三个统计卡片
 */
function renderChartStats(type, targetName, className, chartData) {
    const label1 = document.getElementById('chart_stat_label_1');
    const val1 = document.getElementById('chart_stat_value_1');
    const val2 = document.getElementById('chart_stat_value_2');
    const val3 = document.getElementById('chart_stat_value_3');

    if (!label1 || !val1 || !val2 || !val3) return;

    // 1. 处理第一个卡片 (名称和人数逻辑)
    const students = window.students || [];
    if (type === 'stu') {
        label1.innerText = '所属小组';
        const stuInfo = students.find(s => s.studentName === targetName && s.className === className);
        val1.innerText = (stuInfo && stuInfo.groupName) ? stuInfo.groupName : '暂无分组';
    } else if (type === 'group') {
        label1.innerText = '小组人数';
        const count = students.filter(s => s.groupName === targetName && s.className === className).length;
        val1.innerText = count + '人';
    } else if (type === 'class') {
        label1.innerText = '班级人数';
        const count = students.filter(s => s.className === className).length;
        val1.innerText = count + '人';
    }

    // 2. 处理第二个卡片 (累计缺交)
    val2.innerText = chartData.grandTotalMissing + '次';

    // 3. 处理第三个卡片 (作业完成度：(总应交 - 总缺交) / 总应交)
    let rate = 100; // 如果这期间压根没有作业，默认100%比较合理
    if (chartData.grandTotalPossible > 0) {
        rate = Math.round(((chartData.grandTotalPossible - chartData.grandTotalMissing) / chartData.grandTotalPossible) * 100);
    }
    rate = Math.max(0, rate); // 兜底，防止出现负数
    val3.innerText = rate + '%';
}

