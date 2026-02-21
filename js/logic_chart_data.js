/**
 * 获取当前的起止时间
 * 取消了强制对齐当周周一的逻辑，保证所选天数完全准确
 */
function getChartDateRange() {
    const selectEl = document.getElementById('chartTimeSelect');
    const val = selectEl ? selectEl.value : 'month'; // 默认近一月
    
    let end = new Date();
    end.setHours(0, 0, 0, 0);
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    if (val === 'week') {
        start.setDate(end.getDate() - 6);
    } else if (val === 'month') {
        start.setDate(end.getDate() - 29);
    } else if (val === 'year') {
        start.setDate(end.getDate() - 364);
    } else if (val === 'all') {
        start.setFullYear(end.getFullYear() - 1); // 默认最多看近一年
    } else if (val === 'custom') {
        const sVal = document.getElementById('startDate').value;
        const eVal = document.getElementById('endDate').value;
        // 把横杠换成斜杠，JS就会老老实实按本地时间的 00:00:00 来解析了
        if (sVal) {
            start = new Date(sVal.replace(/-/g, '/'));
            start.setHours(0, 0, 0, 0);
        }
        if (eVal) {
            end = new Date(eVal.replace(/-/g, '/'));
            end.setHours(0, 0, 0, 0);
        }
    }
    
    // 已删除：强制对齐到周一的逻辑

    return { startDate: start, endDate: end };
}


/**
 * 核心：计算图表所需的数据
 */
function buildChartData(type, targetName, className, startDate, endDate) {
    const allTasks = typeof getGlobalClassTasks === 'function' ? getGlobalClassTasks(className) : [];
    const tasksByDate = {};
    allTasks.forEach(task => {
        if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
        tasksByDate[task.date].push(task);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. 强制拦截：结束时间绝不允许超过今天 (未来的时间没有数据)
    if (endDate > today) {
        endDate.setTime(today.getTime());
    }

    // 2. 动态收缩：以真实的 activityList 作为活动起点的判断依据
    const activities = (window.activityList || []).filter(act => act.className === className); 
    // 🟢 新增：提取该班级下的所有活动ID，用于后续去 activityInfo 里查请假/休息状态
    const classActIds = activities.map(act => act.act_id || act.actId); 

    if (activities.length > 0) {
        let earliestDate = null;
        activities.forEach(act => {
            const dateStr = act.startDate; 
            if (dateStr) {
                const d = new Date(dateStr.replace(/-/g, '/'));
                d.setHours(0, 0, 0, 0);
                if (!earliestDate || d < earliestDate) {
                    earliestDate = d;
                }
            }
        });

        if (earliestDate && startDate < earliestDate) {
            startDate.setTime(earliestDate.getTime());
        }
    }

    // 1. 确定我们要算谁的账 (提取目标名单)
    let targetMembers = [];
    if (type === 'stu') {
        targetMembers = [targetName];
    } else if (type === 'group') {
        targetMembers = (window.students || [])
            .filter(s => s.className === className && s.groupName === targetName)
            .map(s => s.studentName);
    } else if (type === 'class') {
        targetMembers = (window.students || [])
            .filter(s => s.className === className)
            .map(s => s.studentName);
    }
    const totalTargetStudents = targetMembers.length || 1;

    // 2. 确定全班总名单 (给折线图算大盘基准用)
    const classMembers = (window.students || [])
        .filter(s => s.className === className)
        .map(s => s.studentName);
    const totalClassStudents = classMembers.length || 1;

    // 返回的容器
    const heatmapData = [];
    const lineCategories = [];
    const lineTargetData = [];
    const lineClassData = [];
	let grandTotalMissing = 0;  // 记录时间段内的总缺交次数
    let grandTotalPossible = 0; // 记录时间段内的应交总人次
	
    window.activityInfo = window.activityInfo || {}; // 防报错兜底

    let dayTime = startDate.getTime();
    const endTime = endDate.getTime();

    // 3. 按日期遍历进行统计
    while (dayTime <= endTime) {
        const curDate = new Date(dayTime);
        const y = curDate.getFullYear();
        const m = String(curDate.getMonth() + 1).padStart(2, '0');
        const d = String(curDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        lineCategories.push(`${m}-${d}`);

        // ====== 🟢 新增：查询当天的 休/假 状态 ======
        let isRestDay = false;
        let isAllLeave = false;
        
        // 遍历当前班级的所有活动，去 activityInfo 里查当天的状态
        classActIds.forEach(actId => {
            const actInfoArr = window.activityInfo[actId] || [];
            const dayInfo = actInfoArr.find(info => info.date === dateStr);
            if (dayInfo) {
                // 如果当天被设为休息 (dayType === 0)
                if (dayInfo.dayType === 0) {
                    isRestDay = true;
                }
                // 检查请假：只有当 targetMembers 里【所有人】都在免做名单时，才打上请假标签
                const exempts = dayInfo.exemptStudents || [];
                if (targetMembers.length > 0 && targetMembers.every(member => exempts.includes(member))) {
                    isAllLeave = true;
                }
            }
        });

        // 决定热点图标签显示什么（优先级：休 > 请假）
        let dayLabel = '';
        if (isRestDay) {
            dayLabel = '休';
        } else if (isAllLeave) {
            dayLabel = '请假';
        }
        // ============================================

        const daysTasks = tasksByDate[dateStr] || [];

        if (daysTasks.length === 0) {
            // 没有任务（此时依然把 dayLabel 塞进去）
            heatmapData.push([dateStr, 0, dayLabel]);
            lineTargetData.push(0);
            lineClassData.push(0);
        } else {
            let targetMissingCount = 0; // 热点图：记录目标群体缺交人次
            let targetDoneCount = 0;    // 折线图：记录目标群体完成人次
            let classTotalDoneCount = 0; // 折线图：记录班级大盘完成人次
            const taskCount = daysTasks.length;

            daysTasks.forEach(task => {
                const dailySubs = window.submissionData[task.actId]?.[dateStr] || [];
                const finishers = new Set();
                dailySubs.forEach(sub => {
                    if (sub.subject === task.subject && sub.task === task.content) {
                        finishers.add(sub.name);
                    }
                });

                // 核对目标名单
                targetMembers.forEach(member => {
                    if (finishers.has(member)) {
                        targetDoneCount++;
                    } else {
                        targetMissingCount++;
                    }
                });

                // 核对全班名单
                classMembers.forEach(member => {
                    if (finishers.has(member)) {
                        classTotalDoneCount++;
                    }
                });
            });

            // 🟢 关键点：如果今天是法定休息日，不管他交没交，缺勤数强制清 0
            if (isRestDay) {
                targetMissingCount = 0;
            } else {
                // 🟢 如果不是休息日，才将当天的任务量和缺交量累加到总盘子里
                grandTotalMissing += targetMissingCount;
                grandTotalPossible += (taskCount * totalTargetStudents);
            }

            // 这里原封不动地推入计算出的 targetMissingCount，如果请假没交，数值依旧 > 0
            heatmapData.push([dateStr, targetMissingCount, dayLabel]);
            
            // 算百分比完成率
            const targetRate = Math.round((targetDoneCount / (taskCount * totalTargetStudents)) * 100);
            const classRate = Math.round((classTotalDoneCount / (taskCount * totalClassStudents)) * 100);
            
            lineTargetData.push(targetRate);
            lineClassData.push(classRate);
        }
        dayTime += 24 * 3600 * 1000;
    }

    return { heatmapData, lineCategories, lineTargetData, lineClassData, grandTotalMissing, grandTotalPossible, type };
}
