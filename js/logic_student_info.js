/**
 * 控制详细弹窗的开关与渲染
 * @param {boolean} show - true 显示，false 隐藏
 * @param {string} [name] - 学生姓名
 * @param {string} [date] - 日期 (YYYY-MM-DD)
 * @param {string} [actId] - 活动ID
 */
function toggleSiPopup(show, name, date, actId) {
    const overlay = document.getElementById('si_popup_overlay');
    if (!overlay) return;

    if (show) {
        // 1. 只有当参数齐全时才进行渲染
        if (name && date && actId) {
            renderStudentInfo(name, date, actId);
        }
        
        // 2. 显示弹窗 & 锁定背景滚动
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        // 3. 隐藏弹窗 & 恢复背景滚动
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * 核心渲染逻辑
 */
function renderStudentInfo(name, date, actId) {
    // --- 1. 获取 DOM ---
    const dateEl = document.getElementById('si_date');
    const nameEl = document.getElementById('si_student_name');
    const listBody = document.querySelector('.si_body');
    
    // --- 2. 设置头部信息 ---
    if (dateEl) dateEl.innerText = date;
    if (nameEl) nameEl.innerText = name;
    if (!listBody) return;

    // --- 3. 准备数据 ---
    // 获取当天的活动配置
    const allDays = window.activityInfo[actId] || [];
    const targetDay = allDays.find(d => d.date === date);

    if (!targetDay) {
        listBody.innerHTML = '<div style="padding:30px; text-align:center; color:#999;">未找到当日活动数据</div>';
        return;
    }

    const tasks = targetDay.tasks || [];
    const exemptList = targetDay.exemptStudents || [];
    const isExempt = exemptList.includes(name); // 是否是请假/免做生

    // 获取当天的提交记录
    const dailySubs = (window.submissionData[actId] && window.submissionData[actId][date]) || [];
    // 过滤出该学生的记录
    const mySubs = dailySubs.filter(sub => sub.name === name);

    // --- 4. 空状态处理 ---
    if (tasks.length === 0) {
        listBody.innerHTML = '<div style="padding:40px; text-align:center; color:#B0BEC5; font-size:14px;">🎉 今日无作业任务</div>';
        return;
    }

    // --- 5. 生成列表 HTML ---
    let html = '';
    tasks.forEach(task => {
        // 计算每一项的状态
        const statusConfig = calculateTaskStatus(task, mySubs, isExempt);

        html += `
            <div class="si_item">
                <div class="si_item_left">
                    <div class="si_subject_row">
                        <span class="si_subject_name">${task.subject}</span>
                    </div>
                    <div class="si_desc">${task.content || '<span style="color:#ddd; font-style:italic;">(无具体内容)</span>'}</div>
                </div>
                <div class="si_capsule ${statusConfig.className}">${statusConfig.text}</div>
            </div>
        `;
    });

    listBody.innerHTML = html;
}

/**
 * 计算单条任务的状态 (3层优先级)
 * @param {Object} task - 任务对象 {subject, content, isBatch}
 * @param {Array} mySubs - 该生当天的所有提交记录
 * @param {boolean} isExempt - 是否在请假名单中
 * @returns {Object} { className, text }
 */
function calculateTaskStatus(task, mySubs, isExempt) {
    const isBatch = String(task.isBatch) === 'true';

    // ---------------------------------------------------------
    // 🛑 Layer 1: 录入中 (Priority High)
    // 逻辑：只要老师没把 isBatch 置为 true，一律显黄，不管做没做
    // ---------------------------------------------------------
    if (!isBatch) {
        return { className: 'si_status_input', text: '待录入' };
    }

    // ---------------------------------------------------------
    // 🔍 数据准备: 检查是否已提交
    // 逻辑：如果有 content，必须 subject 和 content 都匹配；如果没有 content，只匹配 subject
    // ---------------------------------------------------------
    const hasSubmitted = mySubs.some(sub => {
        const subjectMatch = sub.subject === task.subject;
        const contentMatch = task.content ? (sub.task === task.content) : true;
        return subjectMatch && contentMatch;
    });

    // ---------------------------------------------------------
    // ☕ Layer 2: 请假判定 (Exempt)
    // 逻辑：如果是请假生，做了显绿(鼓励)，没做显蓝(正常请假)
    // ---------------------------------------------------------
    if (isExempt) {
        if (hasSubmitted) {
            return { className: 'si_status_done', text: '已完成' };
        } else {
            return { className: 'si_status_leave', text: '请假' };
        }
    }

    // ---------------------------------------------------------
    // ✅ Layer 3: 普通判定 (Normal)
    // 逻辑：做了显绿，没做显红
    // ---------------------------------------------------------
    if (hasSubmitted) {
        return { className: 'si_status_done', text: '已完成' };
    } else {
        return { className: 'si_status_missing', text: '缺交' };
    }
}