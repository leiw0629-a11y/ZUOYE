/**
 * 显示“撤销/修改”批量录入弹窗
 */
 window.undoCurrentTaskIndex = -1;
function showUndoBatchEntry() {
    // 1. 检查模板是否存在
    if (!window.AppTemplates || !window.AppTemplates.undoBatchEntry) {
        console.error("错误：未找到 window.AppTemplates.undoBatchEntry 模板，请先加载模板 JS 文件。");
        return;
    }

    // 2. 检查 DOM 中是否已经存在该弹窗
    let modal = document.getElementById('undo_batch-modal');

    if (!modal) {
        // 如果不存在，将模板 HTML 追加到 body 底部
        document.body.insertAdjacentHTML('beforeend', window.AppTemplates.undoBatchEntry);
        modal = document.getElementById('undo_batch-modal');
    }
	// ⬇️⬇️⬇️ 新增：强制清空左右两侧容器 ⬇️⬇️⬇️
    // 1. 清空左侧活动列表（防止显示模板里的“寒假数学口算营”）
    const actContainer = document.getElementById('undo_batch_activity_list_container');
    if (actContainer) actContainer.innerHTML = '';

    // 2. 清空左侧科目列表（防止显示模板里的“语文作业”）
    const subjContainer = document.getElementById('undo_batch_subject_list_container');
    if (subjContainer) subjContainer.innerHTML = '';

    // 3. 清空右侧学生列表（防止显示模板里的“李明、王芳”）
    const stuContainer = document.getElementById('undo_batch-student-container');
    if (stuContainer) stuContainer.innerHTML = '';

    // 4. 重置中间标题
    const titleEl = document.getElementById('undo_batch_toolbar_subject_name');
    if (titleEl) titleEl.innerText = '加载中...';
	document.getElementById('undo_className_title').innerHTML = document.getElementById('stu_class_slc').value;
    // 3. 显示弹窗
    modal.style.display = 'flex';
    initUndoBatchStudentCount();
    // 4. 初始化日期选择器 (核心逻辑入口)
    initUndoBatchDate();
	renderUndoActivityList();
}

/**
 * 初始化日期选择器
 * 核心功能：计算 min 属性，限制用户能选到的最早日期
 */
function initUndoBatchDate() {
    const now = new Date();
    const todayStr = getLocalYMD(now);
    
    // 1. 基础 UI 赋值 (默认选中今天)
    const input = document.getElementById('undo_date_input');
    const display = document.getElementById('undo_date_display');
    
    // 格式化中文显示
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const displayStr = `📅 ${year}年${month}月${day}日`;

    if (input && display) {
        input.value = todayStr;
        display.innerText = displayStr;
        
        // 设置最大日期为今天 (不能撤销未来的)
        input.max = todayStr;

        // ===========================================
        // 2. 计算最小日期 (Min Date)
        // ===========================================
        const maxUndoDays = window.defaultConfig?.maxUndoDays || 3; // 默认3天
        const minDateStr = calculateMinUndoDate(todayStr, maxUndoDays);
        
        input.min = minDateStr;
        console.log(`[Undo] 日期范围限制: ${minDateStr} ~ ${todayStr} (配置回溯: ${maxUndoDays}天)`);
    }
}

/**
 * 核心算法：计算全局最小允许日期
 */
function calculateMinUndoDate(todayStr, maxDays) {
    // 防止配置写错出现 0 或负数，最少也要是 1 (仅限今天)
    const safeMaxDays = Math.max(1, maxDays);

    // A. 兜底：如果没有活动数据，直接做简单的自然日减法
    // 1天 -> 减0天(今天); 2天 -> 减1天(昨天)
    if (!window.activityList || window.activityList.length === 0) {
        return subtractSimpleDays(todayStr, safeMaxDays - 1);
    }

    // B. 有活动：根据 dayType 倒推
    let globalEarliest = todayStr; 

    window.activityList.forEach(act => {
        // ⭐ 核心修正：传入 (safeMaxDays - 1)
        // 意为：除了今天之外，还需要往回找几个工作日
        const actLimitDate = getEarliestDateForActivity(act, todayStr, safeMaxDays - 1);
        
        //我们要取所有活动中“最早”的那个日期，保证用户能选到范围最大的那个
        if (actLimitDate < globalEarliest) {
            globalEarliest = actLimitDate;
        }
    });

    return globalEarliest;
}

/**
 * 针对单个活动，计算其允许回溯的最早日期
 * @param {Object} activity 活动对象
 * @param {String} todayStr 今天日期 YYYY-MM-DD
 * @param {Number} pastDaysAllowed 需要往回找的工作日数量 (配置天数 - 1)
 */
function getEarliestDateForActivity(activity, todayStr, pastDaysAllowed) {
    const actId = activity.act_id;
    const actInfoList = window.activityInfo?.[actId];
    
    // 如果没有日程表，按自然日兜底
    if (!actInfoList || !Array.isArray(actInfoList)) {
        return subtractSimpleDays(todayStr, pastDaysAllowed);
    }

    // ⭐ 核心修正：定义 Map，确保查找效率和逻辑正确
    const dayMap = new Map();
    actInfoList.forEach(d => dayMap.set(d.date, d.dayType));

    let usedDays = 0;
    let limitDate = todayStr; // 默认最早是今天
    let currentDate = new Date(todayStr);
    
    // 安全计数器，防止死循环 (比如往前找一年都没找到足够的日子)
    let safetyCounter = 0;

    // 开始倒推循环：只要还没凑够过去的有效工作日，就一直往回找
    while (usedDays < pastDaysAllowed && safetyCounter < 365) {
        // 1. 往回拨一天
        currentDate.setDate(currentDate.getDate() - 1);
        const checkDateStr = getLocalYMD(currentDate);
        safetyCounter++;

        // 2. 边界检查：如果日期已经早于活动开始时间，就不能再回溯了
        // 这一步完美解决了你提到的“新建活动只显示今天”的问题
        if (activity.startDate && checkDateStr < activity.startDate) {
            limitDate = activity.startDate; // 既然到了起跑线，最早就是这天了
            break; 
        }

        // 3. 检查这一天在这个活动里是啥状态
        const type = dayMap.get(checkDateStr);

        // 如果 type 是 undefined (无数据)，通常跳过或者继续找
        if (type === undefined) {
            continue; 
        }

        if (type === 0) {
            // 情况B: 休息日
            // 不消耗 usedDays 额度，但日期要更新（因为这一天在范围内是可见的）
            // 比如：今天(工)-昨天(休)-前天(工)。如果回溯1天，范围应该包含昨天。
            limitDate = checkDateStr; 
        } else {
            // 情况C: 工作日 (type 1 或 2)
            usedDays++; // 消耗一天额度
            limitDate = checkDateStr; // 更新下限
        }
    }

    return limitDate;
}

// ===========================================
// 2. 核心逻辑：渲染该活动当天的科目列表
// ===========================================
function renderUndoBatchSubjects(actId) {
    const container = document.getElementById('undo_batch_subject_list_container');
    if (!container) return;
    
    container.innerHTML = ''; // 清空列表

    // 1. 获取当前选中的日期 (直接读 Value)
    const dateInput = document.getElementById('undo_date_input');
    const targetDate = dateInput ? dateInput.value : ""; 
    
    if (!actId || !targetDate) return;

    // 2. 获取活动数据
    const actDays = window.activityInfo[actId];
    if (!actDays) {
        container.innerHTML = `<div style="padding:10px; color:#999;">未找到活动数据</div>`;
        return;
    }

    // 3. 查找那天的数据
    const targetDayData = actDays.find(item => item.date === targetDate);

    // 4. 渲染任务列表
    if (targetDayData && targetDayData.tasks && targetDayData.tasks.length > 0) {
        
        targetDayData.tasks.forEach((task, index) => {
            // 拼接显示名称：如果有 content 就拼上去，没有就只显示 subject
            const displayName = task.content 
                ? `${task.subject} ${task.content}` 
                : task.subject;
            
            // 根据科目匹配图标 (和 batch 保持一致)
            const icon = task.subject.includes('数学') ? '📐' : 
                         task.subject.includes('英语') ? '🔤' : '📖';

            // 创建 DOM 元素
            const item = document.createElement('div');
            item.className = 'undo_batch-subject-item';
            
            // 默认选中第一个
            if (index === 0) {
                item.classList.add('undo_active');
                
                // 更新全局变量和标题
                window.undoCurrentTaskIndex = index;
                updateUndoSubjectTitle(displayName);
                renderUndoStudentList()
            }

            // 点击事件：传入 index 以便后续回溯
            item.onclick = function() {
                undoSelectBatchSubject(this, index, displayName);
            };

            item.innerHTML = `<span>${icon} ${displayName}</span>`;
            container.appendChild(item);
        });

    } else {
        // 如果当天没有作业
        container.innerHTML = `<div style="padding:10px; color:#999;">本日无作业任务</div>`;
        updateUndoSubjectTitle("暂无任务");
        window.undoCurrentTaskIndex = -1;
    }
}

// ===========================================
// 3. 配套点击函数：点击某个科目
// ===========================================
function undoSelectBatchSubject(el, index, name) {
    // 1. 样式切换
    const container = document.getElementById('undo_batch_subject_list_container');
    const items = container.getElementsByClassName('undo_batch-subject-item');
    for (let item of items) {
        item.classList.remove('undo_active');
    }
    el.classList.add('undo_active');

    // 2. 更新全局索引
    window.undoCurrentTaskIndex = index;
    
    // 3. 更新右侧标题
    updateUndoSubjectTitle(name);

    // 4. 收起侧边栏 (移动端体验优化)
    if (window.undoToggleBatchPicker) {
        // 这里假设 undoToggleBatchPicker 是控制整个侧边栏显隐的，如果只控制活动Picker则不需要
        // 根据你的模板结构，sidebar 包含 subject-list，通常点击科目不需要收起 sidebar，
        // 除非是在极窄屏幕下。这里先保留，可根据实际体验决定是否移除。
        // window.undoToggleBatchPicker(); 
    }

    // 5. TODO: 触发右侧学生名单刷新
    renderUndoStudentList();
}

// ===========================================
// 4. 辅助函数：更新右侧 Toolbar 标题
// ===========================================
function updateUndoSubjectTitle(name) {
    const titleEl = document.getElementById('undo_batch_toolbar_subject_name');
    if (titleEl) {
        titleEl.innerText = name;
    }
}
/**
 * 辅助：自然日减法 (用于兜底)
 * return YYYY-MM-DD
 */
function subtractSimpleDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - days);
    return getLocalYMD(d);
}

/**
 * 辅助：获取本地 YYYY-MM-DD
 */
function getLocalYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/**
 * 更新显示的日期文字 (Input onchange 触发)
 */
function undoUpdateDateDisplay(input) {
    if(!input.value) return;
    
    const parts = input.value.split('-'); 
    const year = parts[0];
    const month = parseInt(parts[1]); 
    const day = parseInt(parts[2]);
    
    document.getElementById('undo_date_display').innerText = `📅 ${year}年${month}月${day}日`;
    
    // 触发筛选逻辑 (您说暂时不管这里，留空或打log)
    console.log("用户选择了日期，准备触发活动筛选：", input.value);
	renderUndoActivityList();
}

// ===========================================
// 1. 新增：专用全局变量 (避免与其他模块冲突)
// ===========================================
window.undoCurrentActId = null; 

// ===========================================
// 2. 核心逻辑：渲染左侧活动列表
// ===========================================
// ===========================================
// 2. 核心逻辑：渲染左侧活动列表 (已修改：按时间倒序 + 已结束分组)
// ===========================================
function renderUndoActivityList() {
    // 1. 获取班级
    const classSelect = document.getElementById('stu_class_slc');
    const className = classSelect ? classSelect.value : ""; 

    if (!className) return;

    // 2. 获取日期
    const dateInput = document.getElementById('undo_date_input');
    const targetDate = dateInput ? dateInput.value : ""; 

    if (!targetDate) return;

    // 3. 筛选活动
    let validActivities = window.activityList.filter(act => {
        if (act.className !== className) return false;
        
        const actInfo = window.activityInfo[act.act_id];
        if (!actInfo || !Array.isArray(actInfo)) return false;

        const dayConfig = actInfo.find(d => d.date === targetDate);
        // 必须当天有作业才显示
        return (dayConfig && dayConfig.tasks && dayConfig.tasks.length > 0);
    });

    // 4. 渲染容器清空
    const container = document.getElementById('undo_batch_activity_list_container');
    if (!container) return;
    container.innerHTML = ''; 

    if (validActivities.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#999; font-size:14px;">该日期无作业记录</div>`;
        window.undoCurrentActId = null;
        updateUndoTitle("暂无活动");
        const subjectContainer = document.getElementById('undo_batch_subject_list_container');
        if(subjectContainer) subjectContainer.innerHTML = '';
        updateUndoSubjectTitle("暂无任务");
        return;
    }

    // ===========================================
    // 修改 A: 排序 (act_id 倒序，即时间从新到旧)
    // ===========================================
    validActivities.sort((a, b) => {
        const idA = a.act_id || "";
        const idB = b.act_id || "";
        return idB.localeCompare(idA); // 字符串倒序
    });

    // ===========================================
    // 修改 B: 分组 (进行中 vs 已结束)
    // ===========================================
    const ongoingList = validActivities.filter(act => !act.isEnd);
    const endedList = validActivities.filter(act => act.isEnd);

    // 定义一个全局标志位，用于判断是否是整个列表的第一个项 (用于默认选中)
    let isGlobalFirst = true;

    // 封装渲染单项的逻辑
    const renderItem = (act) => {
        const statusText = act.isEnd ? "已结束" : "进行中";
        const statusClass = act.isEnd ? "undo_finished" : "undo_ongoing"; 

        const item = document.createElement('div');
        item.className = 'undo_batch-act-item';
        
        // 默认选中逻辑：只选中整个列表排在最上面的第一个
        if (isGlobalFirst) {
            item.classList.add('undo_active');
            
            // 1. 记录活动 ID
            window.undoCurrentActId = act.act_id; 
            // 2. 更新标题
            updateUndoTitle(act.activityName);    
            // 3. 初始化时，直接渲染该活动的科目
            renderUndoBatchSubjects(act.act_id); 
            
            isGlobalFirst = false; // 锁死，后面的不再选中
        }

        item.onclick = function() {
            undoSelectBatchActivity(this, act.activityName, act.act_id);
        };

        item.innerHTML = `
            <div class="undo_batch-act-status ${statusClass}"></div>
            <div class="undo_batch-act-info">
                <div class="undo_batch-act-name">${act.activityName}</div>
                <div class="undo_batch-act-meta">${statusText}</div>
            </div>
        `;
        container.appendChild(item);
    };

    // ===========================================
    // 修改 C: 按顺序输出 DOM
    // ===========================================
    
    // 1. 先渲染进行中
    ongoingList.forEach(act => renderItem(act));

    // 2. 如果有已结束的，加个分割线，再渲染已结束
    if (endedList.length > 0) {
        // 如果上面有内容，才显示分割线，或者只要有已结束就显示？
        // 这里简单处理：只要有已结束活动，就显示分割线
        if (ongoingList.length > 0) {
            const divider = document.createElement('div');
            // 简单的内联样式，灰色小字
            divider.style.cssText = "font-size: 12px; color: #bbb; margin: 12px 0 6px 12px; transform: scale(0.9); transform-origin: left center;";
            divider.innerText = "已结束";
            container.appendChild(divider);
        } else if (endedList.length > 0) {
            // 如果全是已结束，也给个提示稍微好看点（可选）
            const divider = document.createElement('div');
            divider.style.cssText = "font-size: 12px; color: #bbb; margin: 0 0 6px 12px; transform: scale(0.9); transform-origin: left center;";
            divider.innerText = "已结束";
            container.appendChild(divider);
        }

        endedList.forEach(act => renderItem(act));
    }
}

// ===========================================
// 3. 辅助函数：更新标题 (抽离出来方便调用)
// ===========================================
function updateUndoTitle(name) {
    const titleEl = document.getElementById('undo_batch-curr-name');
    if (titleEl) titleEl.innerText = name;
}

// ===========================================
// 4. 修改原有的点击函数 (支持 ID)
// ===========================================
function undoSelectBatchActivity(el, name, actId) {
    // 1. 样式切换
    const container = document.getElementById('undo_batch_activity_list_container');
    const items = container.getElementsByClassName('undo_batch-act-item');
    for (let item of items) {
        item.classList.remove('undo_active');
    }
    el.classList.add('undo_active');

    // 2. 更新标题
    updateUndoTitle(name);

    // 3. ✅ 更新全局ID
    window.undoCurrentActId = actId;
    console.log("当前选中撤销活动ID:", window.undoCurrentActId);

    // 4. 收起侧边栏 (移动端适配)
    if (window.undoToggleBatchPicker) {
        // 只有当侧边栏是展开状态才收起，这里简化调用
        const sidebar = document.getElementById('undo_batch-sidebar');
        if (sidebar && sidebar.classList.contains('undo_is-picking')) {
             window.undoToggleBatchPicker();
        }
    }

    // 5. TODO: 触发右侧学生列表刷新
    renderUndoBatchSubjects(actId);
}

// ===========================================
// 3. 核心逻辑：渲染右侧已提交作业的学生列表
// ===========================================
function renderUndoStudentList() {
    const container = document.getElementById('undo_batch-student-container');
    if (!container) return;
    container.innerHTML = ''; // 清空列表

    // 1. 获取上下文必要信息
    const actId = window.undoCurrentActId;
    const dateInput = document.getElementById('undo_date_input');
    const dateStr = dateInput ? dateInput.value : "";
    const taskIndex = window.undoCurrentTaskIndex;

    // 2. 安全检查：如果缺少必要参数，直接返回
    if (!actId || !dateStr || taskIndex === -1) {
        updateUndoStats(0, 0); // 归零统计
        return;
    }

    // 3. 获取【目标任务】的详细信息 (从配置中拿)
    // 我们需要知道当前选中的是 "数学" 还是 "数学 口算"
    const actInfo = window.activityInfo[actId];
    const dayConfig = actInfo ? actInfo.find(d => d.date === dateStr) : null;
    
    if (!dayConfig || !dayConfig.tasks || !dayConfig.tasks[taskIndex]) {
        console.warn("未找到对应的任务配置");
        return;
    }
    
    const targetTaskConfig = dayConfig.tasks[taskIndex];
    const targetSubject = targetTaskConfig.subject;
    const targetContent = targetTaskConfig.content || ""; // 确保为字符串，方便比对

    // 4. 获取【提交记录】 (从 submissionData 中拿)
    // 路径：window.submissionData[actId][dateStr]
    let allSubmissions = [];
    if (window.submissionData && 
        window.submissionData[actId] && 
        window.submissionData[actId][dateStr]) {
        allSubmissions = window.submissionData[actId][dateStr];
    }

    // 5. 🚀 核心筛选逻辑：找出提交了【该特定任务】的学生
    const submittedStudents = allSubmissions.filter(record => {
        // 规则：subject 必须匹配
        const subjectMatch = record.subject === targetSubject;
        
        // 规则：task (内容) 必须匹配 content
        // 如果配置里 content 是空，记录里的 task 也应该是空
        const recordTask = record.task || "";
        const contentMatch = recordTask === targetContent;

        return subjectMatch && contentMatch;
    });

    // 6. 渲染学生胶囊
    if (submittedStudents.length > 0) {
        submittedStudents.forEach(record => {
            const capsule = document.createElement('div');
            capsule.className = 'undo_batch-student-capsule'; // 默认是白底（未选中撤销）
            capsule.innerText = record.name;
            
            // 点击事件：选中表示“我要撤销这个人”
            capsule.onclick = function() {
                this.classList.toggle('undo_active');
                updateUndoStats(); // 更新底部统计
            };

            container.appendChild(capsule);
        });
    } else {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#999; width:100%;">无人提交该作业</div>`;
    }

    // 7. 更新统计信息 (传入已提交总人数)
    updateUndoStats(submittedStudents.length);
    
    // 8. 重置全选按钮状态
    const selectAllBtn = document.getElementById('undo_btn-select-all');
    if(selectAllBtn) selectAllBtn.checked = false;
}

// ===========================================
// 4. 辅助：更新底部统计栏
// ===========================================
function updateUndoStats(fixedSubmittedCount = null) {
    // 1. 获取DOM
    const studentCountEl = document.getElementById('undo_batch-student-count'); // 全班
    const expectedEl = document.getElementById('undo_batch-expected-count');   // 这里借用来显示“已交”
    const actualEl = document.getElementById('undo_batch-actual-count');       // 这里用来显示“撤销”

    // 2. 获取全班人数 (从下拉框班级获取，或者简单读取页面缓存)
    // 为了简单，我们尝试解析 DOM 里的 "全班40" 或者重新计算
    // 这里建议重新获取一次班级人数
    const classSelect = document.getElementById('stu_class_slc');
    const className = classSelect ? classSelect.value : "";
    const totalStudents = window.students.filter(s => s.className === className).length;

    // 3. 获取已提交人数
    // 如果传入了 fixedSubmittedCount (渲染时)，就用它；否则读取 DOM 胶囊数量
    let submittedCount = 0;
    if (fixedSubmittedCount !== null) {
        submittedCount = fixedSubmittedCount;
    } else {
        const container = document.getElementById('undo_batch-student-container');
        submittedCount = container ? container.querySelectorAll('.undo_batch-student-capsule').length : 0;
    }

    // 4. 获取拟撤销人数 (选中的)
    const selectedUndoCount = document.querySelectorAll('.undo_batch-student-capsule.undo_active').length;

    // 5. 更新文本
    if (studentCountEl) studentCountEl.innerText = `全班${totalStudents}`;
    if (expectedEl) expectedEl.innerText = `已交${submittedCount}`; // 复用位置显示已交
    if (actualEl) actualEl.innerText = `撤销${selectedUndoCount}`;
    
    // 6. 样式微调
    // 如果有人被选中撤销，按钮变红提示风险，或者计数变红
    if (actualEl) {
        if (selectedUndoCount > 0) actualEl.classList.add('undo_danger');
        else actualEl.classList.remove('undo_danger');
    }
}

// ===========================================
// 5. 交互：全选/反选
// ===========================================
function undo_toggleBatchSelectAll(isChecked) {
    const capsules = document.querySelectorAll('.undo_batch-student-capsule');
    capsules.forEach(capsule => {
        if (isChecked) {
            capsule.classList.add('undo_active');
        } else {
            capsule.classList.remove('undo_active');
        }
    });
    updateUndoStats();
}

function undoFinishBatchEntry() {
    // --- 1. 获取上下文必要信息 ---
    const actId = window.undoCurrentActId;
    const dateInput = document.getElementById('undo_date_input');
    const dateStr = dateInput ? dateInput.value : "";
    const taskIndex = window.undoCurrentTaskIndex;

    // --- 2. 基础验证 ---
    if (!actId || !dateStr || taskIndex === -1) {
        alert("请先选择要撤销的作业任务");
        return;
    }

    // --- 3. 获取选中的学生 (要撤销的人) ---
    // 注意：这里选中的(undo_active)是“我要删除的人”
    const selectedCapsules = document.querySelectorAll('#undo_batch-student-container .undo_batch-student-capsule.undo_active');
    
    if (selectedCapsules.length === 0) {
        alert("请至少选择一名学生进行撤销");
        return;
    }
    
    const namesToRevoke = Array.from(selectedCapsules).map(el => el.innerText.trim());
    const revokeCount = namesToRevoke.length;

    if (!confirm(`确定要撤销 ${revokeCount} 人的作业记录吗？\n撤销后可重新录入。`)) {
        return;
    }

    // --- 4. 获取任务配置 (用于比对和重置 isBatch) ---
    const actInfo = window.activityInfo[actId];
    const dayConfig = actInfo.find(d => d.date === dateStr);
    const targetTaskConfig = dayConfig.tasks[taskIndex];
    
    const targetSubject = targetTaskConfig.subject;
    const targetContent = targetTaskConfig.content || "";

    // --- 5. 数据处理：剪切 (Move) 模式 ---
    // 确保源数据存在
    if (!window.submissionData[actId] || !window.submissionData[actId][dateStr]) {
        alert("数据异常：未找到提交记录");
        return;
    }

    const currentSubmissions = window.submissionData[actId][dateStr];
    
    // 临时数组：用于存放剩下的记录
    const keptSubmissions = [];
    // 临时数组：用于存放被撤销的记录
    const revokedSubmissions = [];

    // 遍历当天的所有提交记录
    currentSubmissions.forEach(record => {
        // 判断这条记录是否属于“当前选中的任务”且“包含在要撤销的人名列表中”
        const isTargetTask = (record.subject === targetSubject) && ((record.task || "") === targetContent);
        const isTargetStudent = namesToRevoke.includes(record.name);

        if (isTargetTask && isTargetStudent) {
            // 命中！添加到撤销日志
            // 💾 记录撤销时间
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
            
            // 扩展记录对象，增加撤销元数据
            const logEntry = {
                ...record,
                actId: actId,          // 补充活动ID
                originDate: dateStr,   // 补充原日期
                revokedAt: timeStr,    // 撤销时间
                operator: "teacher"    // 操作人 (可扩展)
            };
            
            revokedSubmissions.push(logEntry);
        } else {
            // 没命中，保留
            keptSubmissions.push(record);
        }
    });

    // --- 6. 写入数据 ---
    // A. 更新提交记录 (只保留没被删的)
    window.submissionData[actId][dateStr] = keptSubmissions;
    
    // B. 写入撤销日志
    // 确保 window.revokedLog 是数组
    if (!window.revokedLog) window.revokedLog = {};
	if (!window.revokedLog[actId]) window.revokedLog[actId] = {};
	if (!window.revokedLog[actId][dateStr]) window.revokedLog[actId][dateStr] = [];
    window.revokedLog[actId][dateStr].push(...revokedSubmissions);

    // --- 7. 关键逻辑：检查是否需要重置 isBatch ---
    // 检查 keptSubmissions 里，是否还有属于当前任务 (targetSubject + targetContent) 的记录
    const remainingCount = keptSubmissions.filter(r => 
        r.subject === targetSubject && (r.task || "") === targetContent
    ).length;

    if (remainingCount === 0) {
        // ⚠️ 如果该任务下没有任何记录了，说明被撤空了
        // 将状态回滚为 false (未录入)
        targetTaskConfig.isBatch = false;
        console.log(`[Undo] 任务 [${targetSubject} ${targetContent}] 已被清空，状态重置为 isBatch = false`);
    }

    // --- 8. 保存与刷新 ---
    saveData(); // 保存到 LocalStorage

    // 提示
	showToastHTML(`
            <div class="cm-toast-title">成功撤销 ${revokedSubmissions.length} 条记录</div>
        `);
    
    // 刷新左侧 (为了更新那绿色的对勾状态，如果 isBatch 变回 false，对勾可能需要处理)
    // 注意：目前的 renderUndoBatchSubjects 主要是显示列表，如果你的 CSS 依赖 isBatch 变色，这里会生效
    // 重新获取一下当前任务名，防止刷新后丢失
    const displayName = targetContent ? `${targetSubject} ${targetContent}` : targetSubject;

    // 刷新右侧学生列表 (被撤销的人应该消失)
    renderUndoStudentList();
    
    // 刷新左侧科目列表 (如果 isBatch 变了，可能需要视觉反馈，虽然撤销界面通常不强求显示已完成状态)
    // 但为了稳妥，刷新一下
    renderUndoBatchSubjects(actId);
    
    // 恢复之前的选中状态 (因为 renderUndoBatchSubjects 会重置 index)
    // 我们手动模拟点击回当前 index，保持体验连贯
    setTimeout(() => {
        const container = document.getElementById('undo_batch_subject_list_container');
        if (container && container.children[taskIndex]) {
            // 模拟点击逻辑，但不完全触发 click (避免死循环或多余动画)
            const items = container.getElementsByClassName('undo_batch-subject-item');
            for (let item of items) item.classList.remove('undo_active');
            items[taskIndex].classList.add('undo_active');
            
            // 恢复标题
            window.undoCurrentTaskIndex = taskIndex;
            updateUndoSubjectTitle(displayName);
        }
    }, 50);
}

/**
 * 关闭弹窗
 */
function closeUndoBatchModal() {
    const modal = document.getElementById('undo_batch-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 切换侧边栏视图
 */
function undoToggleBatchPicker() {
    const sidebar = document.getElementById('undo_batch-sidebar');
    if (!sidebar) return;
    if (sidebar.classList.contains('undo_is-picking')) {
        sidebar.classList.remove('undo_is-picking');
    } else {
        sidebar.classList.add('undo_is-picking');
    }
}

/**
 * 初始化撤销弹窗里的【全班人数】
 * 只依赖班级下拉框 stu_class_slc + window.students
 * 可在活动渲染前调用
 */
function initUndoBatchStudentCount() {
    const countEl = document.getElementById('undo_batch-student-count');
    if (!countEl) return;

    const classSelect = document.getElementById('stu_class_slc');
    const className = classSelect ? classSelect.value : "";

    if (!className || !Array.isArray(window.students)) {
        countEl.innerText = '全班0';
        return;
    }

    const total = window.students.filter(s => s.className === className).length;
    countEl.innerText = `全班${total}`;
}