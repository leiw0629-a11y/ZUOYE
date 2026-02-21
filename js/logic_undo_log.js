/**
 * 显示“撤销日志”弹窗
 */
function showUndoLogModal() {
    // 1. 检查模板
    if (!window.AppTemplates || !window.AppTemplates.undoLogModal) {
        console.error("未找到 window.AppTemplates.undoLogModal");
        return;
    }

    // 2. 检查 DOM
    let modal = document.getElementById('uLog_modal');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', window.AppTemplates.undoLogModal);
        modal = document.getElementById('uLog_modal');
    }

    // 3. 显示
    modal.style.display = 'flex';
	document.getElementById('uLog_table_body').innerHTML = '';
	uLogInitDate();
	document.getElementById('ulog_className_title').innerHTML = document.getElementById('stu_class_slc').value;
	// 只做这一件事
    uLogRenderActivityList();
}

/**
 * 渲染撤销日志左侧【活动列表】
 * 仅依赖：stu_class_slc + window.activityList
 */
/**
 * 渲染撤销日志左侧【活动列表】(已修改：支持分组、排序、排除未开始)
 * 仅依赖：stu_class_slc + window.activityList
 */
function uLogRenderActivityList() {
    const container = document.getElementById('uLog_active_list');
    if (!container) return;

    container.innerHTML = '';

    // 1. 获取当前班级
    const classSelect = document.getElementById('stu_class_slc');
    const className = classSelect ? classSelect.value : '';
    if (!className) return;

    // 2. 筛选与排序
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // A. 基础筛选：班级匹配 + 排除未开始
    let validActivities = window.activityList.filter(act => {
        return act.className === className && act.startDate <= today;
    });

    if (validActivities.length === 0) {
        container.innerHTML = `<div style="padding:20px;color:#999;text-align:center;">暂无活动</div>`;
        return;
    }

    // B. 分组：进行中 vs 已结束
    let ongoing = validActivities.filter(act => !act.isEnd);
    let ended = validActivities.filter(act => act.isEnd);

    // C. 排序：按 act_id (时间戳) 倒序
    const sortById = (a, b) => b.act_id - a.act_id;
    ongoing.sort(sortById);
    ended.sort(sortById);

    // 3. 定义渲染函数
    let isFirstItem = true; // 用于默认选中

    const renderItem = (act, isEnded) => {
        const item = document.createElement('div');
        item.className = 'uLog_item';

        // 默认选中第一个渲染的元素
        if (isFirstItem) {
            item.classList.add('active');
            uLogOnActivityChange(act.act_id);
            isFirstItem = false;
        }

        item.onclick = function () {
            // 切换 active 样式
            const items = container.getElementsByClassName('uLog_item');
            for (let el of items) el.classList.remove('active');
            this.classList.add('active');

            uLogOnActivityChange(act.act_id);
        };

        // 处理圆点颜色：如果已结束，强制用灰色覆盖默认绿色
        const dotStyle = isEnded ? 'style="background-color: #BDBDBD;"' : '';

        item.innerHTML = `
            <div class="uLog_item-top">
                <span class="uLog_item-name">${act.activityName}</span>
                <span class="uLog_status-dot" ${dotStyle}></span>
            </div>
            <div class="uLog_item-bottom">
                <span class="uLog_subject-tag">${act.subject === 'all' ? '全科' : (act.subject || '全科')}</span>
                <span class="uLog_item-date">${act.startDate || ''} ~ ${act.endDate || ''}</span>
            </div>
        `;

        container.appendChild(item);
    };

    // 4. 执行渲染
    // A. 先渲染进行中
    ongoing.forEach(act => renderItem(act, false));

    // B. 再渲染已结束 (如果有，加分割线)
    if (ended.length > 0) {
        const divider = document.createElement('div');
        divider.style.cssText = "font-size: 12px; color: #999; margin: 15px 0 5px 10px;";
        divider.innerText = "已结束";
        container.appendChild(divider);

        ended.forEach(act => renderItem(act, true));
    }
}

/**
 * 左侧活动切换时触发
 * @param {String} actId
 */
function uLogOnActivityChange(actId) {
    window.uLogCurrentActId = actId; // 记录当前活动
    uLogRenderTableByAct(actId);
}

/**
 * 根据 活动ID + 日期 渲染撤销日志表格
 * @param {String} actId
 */
function uLogRenderTableByAct(actId) {
    const tbody = document.getElementById('uLog_table_body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // 1. 获取日期
    const dateInput = document.getElementById('uLog_date_input');
    const dateStr = dateInput ? dateInput.value : '';
    if (!dateStr) return;

    // 2. 取日志数据
    const actLog = window.revokedLog?.[actId];
    const dayLogs = actLog?.[dateStr] || [];
    // 3. 无数据兜底
    if (!Array.isArray(dayLogs) || dayLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:#999;padding:20px;">
                    暂无撤销记录
                </td>
            </tr>
        `;
        return;
    }

    // 4. 渲染每一条撤销记录
    dayLogs.forEach(log => {
        const tr = document.createElement('tr');

        // 注意点 ②：task 为空显示 -
        const taskText = log.task && log.task.trim() ? log.task : '-';

        tr.innerHTML = `
            <td>${log.name}</td>
            <td>${log.finishTime || '-'}</td>
            <td>${log.subject || '-'}</td>
            <td class="uLog_col-content" title="${taskText}">${taskText}</td>
            <td class="uLog_col-time">${log.revokedAt || '-'}</td>
        `;

        tbody.appendChild(tr);
    });
}


/**
 * 关闭弹窗
 */
function uLog_closeModal() {
    const modal = document.getElementById('uLog_modal');
    if (modal) {
        modal.style.display = 'none';
        // modal.remove(); // 如果希望每次关闭都销毁 DOM，可以取消注释这行
    }
}

// 1. 初始化【撤销日志】的日期 (打开弹窗时调用)
function uLogInitDate() {
    const now = new Date();
    
    // 获取 YYYY-MM-DD
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // 获取 中文格式
    const displayStr = `📅 ${year}年${parseInt(month)}月${parseInt(day)}日`;

    // 赋值给 uLog 专用的 ID
    const input = document.getElementById('uLog_date_input');
    const display = document.getElementById('uLog_date_display');
    
    if(input && display) {
        input.value = todayStr;
        display.innerText = displayStr;
    }
}

function uLog_updateDate(input) {
    if(!input.value) return;

    const date = new Date(input.value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    document.getElementById('uLog_date_display').innerText =
        `📅 ${year}年${month}月${day}日`;

    // ⭐ 日期变了，重新渲染右侧
    if (window.uLogCurrentActId) {
        uLogRenderTableByAct(window.uLogCurrentActId);
    }
}
