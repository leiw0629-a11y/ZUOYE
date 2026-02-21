/**
 * 切换小组信息弹窗显示/隐藏
 * @param {boolean} show - true:显示, false:关闭
 * @param {string} [groupName] - 小组名
 * @param {string} [className] - 班级名
 * @param {string} [date] - 日期 YYYY-MM-DD
 * @param {string} [actId] - 活动ID
 */
function toggleGiPopup(show, groupName, className, date, actId) {
    const overlay = document.getElementById('gi_overlay');
    if (!overlay) return;

    if (show) {
        // 1. 只有参数齐全才渲染
        if (groupName && className && date && actId) {
            renderGroupList(groupName, className, date, actId);
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
 * 渲染左侧小组成员列表
 */
function renderGroupList(groupName, className, date, actId) {
    // --- 1. 获取基础数据 ---
    const allStudents = window.students || [];
    const members = allStudents.filter(s => s.className === className && s.groupName === groupName);

    // [样式修复]：更新标题，且不再强制设置字体大小，交还给 CSS 控制
    const headerEl = document.getElementById('gi_header_groupname');
    if (headerEl) {
        headerEl.innerText = `${className} · ${groupName}`;
        // headerEl.style.fontSize = '16px'; // 已删除此行，CSS 里的设置现在会生效了
    }
    
    updateGiText('gi_header_date', date);
    updateGiText('gi_group_title', `成员列表 (${members.length}人)`);

    // --- 2. 获取活动数据 ---
    const dayDataList = window.activityInfo[actId] || [];
    const dayInfo = dayDataList.find(d => d.date === date) || {};
    const tasks = dayInfo.tasks || [];
    const exemptList = dayInfo.exemptStudents || [];
    
    // 获取当天的所有提交
    const dailySubs = (window.submissionData[actId] && window.submissionData[actId][date]) || [];

    // [核心修改点]：不再判断 isBatch，直接以“当天布置的所有作业”为准
    // 原代码：const requiredTasks = tasks.filter(t => String(t.isBatch) === 'true');
    const tasksPerPerson = tasks.length; // 只要布置了就算应交

    // --- 3. 统计 & 遍历渲染名单 ---
    const listContainer = document.querySelector('.gi_list_scroll_area');
    if (!listContainer) return;
    
    let html = '';
    let totalFinishedTaskCount = 0; // 统计小组总共交了多少份

    members.forEach((member, index) => {
        // --- 计算该学生的作业完成量 ---
        const mySubs = dailySubs.filter(s => s.name === member.studentName);
        
        // [核心修改点]：检查该学生完成了列表中的哪些任务（也不再卡 isBatch）
        const myFinishedCount = tasks.filter(task => {
            return mySubs.some(sub => 
                sub.subject === task.subject && 
                (task.content ? sub.task === task.content : true)
            );
        }).length;

        // 累加到小组总实交
        totalFinishedTaskCount += myFinishedCount;

        // 计算该学生的状态 (红/绿/蓝 - 这里的颜色逻辑目前保持原样，如果需要颜色也忽略isBatch请告知)
        const statusConfig = getGroupStudentStatus(member.studentName, tasks, exemptList, dailySubs);
        
        // 默认选中第一个
        const activeClass = (index === 0) ? 'active' : '';
        
        // 生成 HTML
        html += `
            <button class="gi_st_btn ${statusConfig.cssClass} ${activeClass}" 
                onclick="handleGroupItemClick(this, '${member.studentName}', '${date}', '${actId}')">
                <span class="gi_st_name">${member.studentName}</span>
                <span class="gi_st_status">${statusConfig.text}</span>
            </button>
        `;
    });

    listContainer.innerHTML = html;

    // --- 4. 更新顶部统计数据 ---
    // 应交总数 = 人数 * 当日所有作业数
    const totalTargetCount = members.length * tasksPerPerson;
    
    // 计算百分比
    const rate = totalTargetCount > 0 ? Math.round((totalFinishedTaskCount / totalTargetCount) * 100) : 0;
    
    updateGiText('gi_stat_rate', `${rate}%`);
    updateGiText('gi_stat_total', totalTargetCount);       // 现在的分母包含了所有作业
    updateGiText('gi_stat_actual', totalFinishedTaskCount); 

    // --- 5. 自动触发第一个学生的详情渲染 ---
    if (members.length > 0) {
        renderGroupStudentDetail(members[0].studentName, date, actId);
    } else {
        document.querySelector('.gi_detail_scroll').innerHTML = '';
        const nameEl = document.querySelector('.gi_dh_name');
        if(nameEl) nameEl.innerText = '';
    }
}

/**
 * 辅助函数：更新文本
 */
function updateGiText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

/**
 * 计算列表项状态 (红/绿/蓝逻辑)
 */
function getGroupStudentStatus(studentName, tasks, exemptList, dailySubs) {
    // 找出必做任务
    const requiredTasks = tasks.filter(t => String(t.isBatch) === 'true');
    
    // 1. 如果没有必做任务 -> 显灰
    if (requiredTasks.length === 0) {
        return { cssClass: '', text: '待录入' };
    }

    // 2. 检查该学生的提交情况
    const mySubs = dailySubs.filter(s => s.name === studentName);
    const isExempt = exemptList.includes(studentName);

    // 3. 核心判定
    const isTaskDone = (reqTask) => {
        return mySubs.some(sub => 
            sub.subject === reqTask.subject && 
            (reqTask.content ? sub.task === reqTask.content : true)
        );
    };

    const hasMissing = requiredTasks.some(req => !isTaskDone(req));

    if (!hasMissing) {
        return { cssClass: 'done', text: '已完成' };
    } else {
        if (isExempt) {
            return { cssClass: 'leave', text: '请假' };
        } else {
            return { cssClass: 'undone', text: '缺交' };
        }
    }
}

/**
 * 点击列表项事件
 */
function handleGroupItemClick(btnEl, studentName, date, actId) {
    // 1. 切换高亮样式
    document.querySelectorAll('.gi_st_btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    // 2. 渲染右侧详情
    renderGroupStudentDetail(studentName, date, actId);
}

/**
 * 渲染右侧详情
 */
function renderGroupStudentDetail(name, date, actId) {
    const nameEl = document.querySelector('.gi_dh_name');
    if (nameEl) nameEl.innerText = name;

    const container = document.querySelector('.gi_detail_scroll');
    if (!container) return;

    // 准备数据
    const dayDataList = window.activityInfo[actId] || [];
    const dayInfo = dayDataList.find(d => d.date === date);
    if (!dayInfo) return;

    const tasks = dayInfo.tasks || [];
    const exemptList = dayInfo.exemptStudents || [];
    const isExempt = exemptList.includes(name);

    const dailySubs = (window.submissionData[actId] && window.submissionData[actId][date]) || [];
    const mySubs = dailySubs.filter(sub => sub.name === name);

    // 空状态
    if (tasks.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center; color:#B0BEC5;">暂无任务</div>';
        return;
    }

    let html = '';
    tasks.forEach(task => {
        // 复用逻辑或使用内置逻辑
        let status = { className: '', text: '' };
        
        // 尝试复用 logic_student_info.js 的逻辑，如果没有则自己算
        if (typeof calculateTaskStatus === 'function') {
            const raw = calculateTaskStatus(task, mySubs, isExempt);
            const map = {
                'si_status_done': 'done',
                'si_status_missing': 'missing',
                'si_status_input': 'input',
                'si_status_leave': 'leave'
            };
            status.className = map[raw.className] || '';
            status.text = raw.text;
        } else {
             // 简单的内置兜底
             status.text = '未知';
        }

        html += `
            <div class="gi_task_item">
                <div class="gi_task_main">
                    <div class="gi_tm_top">
                        <span class="gi_tm_title">${task.subject}</span>
                    </div>
                    <div class="gi_tm_desc">${task.content || '(无内容)'}</div>
                </div>
                <div class="gi_capsule ${status.className}">${status.text}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}