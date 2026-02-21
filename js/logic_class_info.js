/**
 * 切换班级信息弹窗
 * @param {boolean} show - 是否显示
 * @param {string} [actId] - 活动ID
 * @param {string} [date] - 日期 YYYY-MM-DD
 */
function toggleCiPopup(show, actId, date) {
    
	const overlay = document.getElementById('ci_overlay');
    if (!overlay) return;
	
    if (show) {
        // 1. 只有参数齐全才渲染
        if (actId && date) {
            renderClassInfo(actId, date);
        }

        // 2. 显示 & 锁滚动
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * 核心渲染主控函数 (修改版：统计算全部，名单只算isBatch)
 */
function renderClassInfo(actId, date) {
    // --- 1. 获取基础数据 ---
    const activity = window.activityList.find(a => String(a.act_id) === String(actId));
    if (!activity) return;
	
    const className = activity.className;
	
    // 填充头部信息
    updateText('ci_header_classname', className);
    updateText('ci_header_date', date);

    // --- 2. 班级与任务数据 ---
    const allStudents = window.students || [];
    const classMembers = allStudents.filter(s => s.className === className);
    const totalCount = classMembers.length;

    const dayDataList = window.activityInfo[actId] || [];
    const dayInfo = dayDataList.find(d => d.date === date) || {};
    const tasks = dayInfo.tasks || [];
    
    // [修改点1]：统计分母时，算上所有任务 (包含待录入的)
    const tasksPerPerson = tasks.length; 
    
    // [修改点2]：但筛选“谁没交”时，只看 isBatch=true 的
    const requiredTasks = tasks.filter(t => String(t.isBatch) === 'true');
    
    // 获取当天的所有提交
    const dailySubs = (window.submissionData[actId] && window.submissionData[actId][date]) || [];
	
    // --- 3. 核心计算 ---
    
    let totalFinishedTaskCount = 0; // 全班实交总作业份数 (统计所有类型)

    const unfinishedStudents = classMembers.filter(student => {
        const mySubs = dailySubs.filter(s => s.name === student.studentName);

        // A. 统计该学生实际上完成了多少项任务 (针对 所有任务) -> 用于计算顶部的大盘数据
        const finishedAllCount = tasks.filter(task => {
            return mySubs.some(sub => 
                sub.subject === task.subject && 
                (task.content ? sub.task === task.content : true)
            );
        }).length;

        // 累加到班级总实交
        totalFinishedTaskCount += finishedAllCount;

        // B. 判断该学生是否“缺交” (针对 必做任务) -> 用于决定进不进名单
        // 如果没有必做任务，这人肯定不算缺交
        if (requiredTasks.length === 0) return false;

        const finishedRequiredCount = requiredTasks.filter(task => {
            return mySubs.some(sub => 
                sub.subject === task.subject && 
                (task.content ? sub.task === task.content : true)
            );
        }).length;

        // 如果完成的必做数 < 必做总数，说明缺交
        return finishedRequiredCount < requiredTasks.length;
    });

    const unfinishedCount = unfinishedStudents.length;
    
    // [修改点3]：重新计算应交与百分比 (基于所有任务)
    const totalTargetCount = totalCount * tasksPerPerson;
    
    // 计算百分比
    const rate = totalTargetCount > 0 ? Math.round((totalFinishedTaskCount / totalTargetCount) * 100) : 0;

    // --- 4. 更新统计面板 UI ---
    if (totalTargetCount === 0) {
        // 如果今天完全没任务
        updateText('ci_stat_rate', `100%`); 
        updateText('ci_stat_total', 0);       
        updateText('ci_stat_actual', 0); 
    } else {
        updateText('ci_stat_rate', `${rate}%`);
        updateText('ci_stat_total', totalTargetCount);       
        updateText('ci_stat_actual', totalFinishedTaskCount); 
    }
    
    // 更新列表标题
    updateText('ci_list_title', `待补交人员 (${unfinishedCount}人)`);

    // --- 5. 渲染左侧列表 ---
    const listContainer = document.getElementById('ci_unfinished_list');
    if (listContainer) {
        listContainer.innerHTML = ''; // 清空

        if (unfinishedCount === 0) {
            // 文案：虽然没人缺交，但可能是因为没有必做任务
            const msg = requiredTasks.length === 0 ? '今日未提交作业' : '暂无缺交人员';
            const color = requiredTasks.length === 0 ? '#90A4AE' : '#4CAF50';
            
            listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:${color};">${msg}</div>`;
            
            // 清空右侧详情
            const nameEl = document.getElementById('ci_detail_name');
            const container = document.getElementById('ci_detail_container');
            if(nameEl) nameEl.innerText = '';
            if(container) container.innerHTML = '<div style="padding:40px; text-align:center; color:#CFD8DC;"></div>';
            
        } else {
            let html = '';
            unfinishedStudents.forEach((member, index) => {
                const activeClass = (index === 0) ? 'active' : '';
                html += `
                    <button class="ci_st_btn ${activeClass}" 
                        onclick="handleCiItemClick(this, '${member.studentName}', '${actId}', '${date}')">
                        ${member.studentName}
                    </button>
                `;
            });
            listContainer.innerHTML = html;

            renderClassDetailRight(unfinishedStudents[0].studentName, actId, date);
        }
    }
}

/**
 * 点击左侧列表项
 */
function handleCiItemClick(btn, name, actId, date) {
    // 切换 active 样式
    const allBtns = document.querySelectorAll('.ci_st_btn');
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 渲染右侧
    renderClassDetailRight(name, actId, date);
}

/**
 * 渲染右侧详情 (复用胶囊逻辑)
 */
function renderClassDetailRight(name, actId, date) {
    const nameEl = document.getElementById('ci_detail_name');
    const container = document.getElementById('ci_detail_container');
    if (!nameEl || !container) return;

    if (!name) {
        nameEl.innerText = '';
        container.innerHTML = '<div style="padding:40px; text-align:center; color:#CFD8DC;">暂无缺交科目</div>';
        return;
    }

    nameEl.innerText = name;

    // 准备数据
    const dayDataList = window.activityInfo[actId] || [];
    const dayInfo = dayDataList.find(d => d.date === date) || {};
    const tasks = dayInfo.tasks || [];
    const exemptList = dayInfo.exemptStudents || [];
    const isExempt = exemptList.includes(name);

    const dailySubs = (window.submissionData[actId] && window.submissionData[actId][date]) || [];
    const mySubs = dailySubs.filter(sub => sub.name === name);

    // 渲染 HTML
    let html = '';
    
    if (tasks.length === 0) {
        html = '<div style="padding:20px; text-align:center; color:#999;">无任务</div>';
    } else {
        tasks.forEach(task => {
            // 计算状态 (Red/Green/Yellow/Blue)
            const status = getCiTaskStatus(task, mySubs, isExempt);

            html += `
                <div class="ci_task_item">
                    <div class="ci_task_main">
                        <div class="ci_tm_top">
                            <span class="ci_tm_title">${task.subject}</span>
                        </div>
                        <div class="ci_tm_desc">${task.content || '<span style="color:#ddd">无具体内容</span>'}</div>
                    </div>
                    <div class="ci_capsule ${status.cssClass}">${status.text}</div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

/**
 * 辅助：计算单个任务状态 (适配 ci_ 样式)
 */
function getCiTaskStatus(task, mySubs, isExempt) {
    const isBatch = String(task.isBatch) === 'true';

    // 1. 录入中 (Yellow)
    if (!isBatch) {
        return { cssClass: 'input', text: '待录入' };
    }

    // 检查是否提交
    const hasSubmitted = mySubs.some(sub => {
        const subjectMatch = sub.subject === task.subject;
        const contentMatch = task.content ? (sub.task === task.content) : true;
        return subjectMatch && contentMatch;
    });

    // 2. 请假逻辑 (Blue/Green)
    if (isExempt) {
        if (hasSubmitted) return { cssClass: 'done', text: '已完成' };
        return { cssClass: 'leave', text: '请假' };
    }

    // 3. 普通逻辑 (Red/Green)
    if (hasSubmitted) {
        return { cssClass: 'done', text: '已完成' };
    } else {
        return { cssClass: 'missing', text: '缺交' };
    }
}

/**
 * 简单封装更新文本
 */
function updateText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}