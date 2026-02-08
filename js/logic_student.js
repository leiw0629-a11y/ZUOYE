
window.currentStuTab = 'stu_tab_student'; // 默认选中“学生”Tab
window.currentActivityId = window.currentActivityId || []; // 活动id
window.currentLeftSelection = window.currentLeftSelection || {};
/**
 * 1. 初始化下拉框 (只执行一次)
 * 负责把 window.classes 的数据填入 select
 */
function initStudentDropdown() {
    const selectEl = document.getElementById('stu_class_slc');
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
 * 渲染左侧列表 (学生版)
 * 通常显示在 #view-student .list-content 中
 */
function renderStudentAllList() {
    const selectEl = document.getElementById('stu_class_slc');
    if (!selectEl) return;

    // ✅ 直接读取当前选中的值 (不再重新生成 options)
    const targetClass = selectEl.value;
    
    // 获取当前 Tab
    const tab = window.currentStuTab || 'stu_tab_student';

    // 根据 Tab 分发
    if (tab === 'stu_tab_student') {
        renderCmStudentList(targetClass);
    } else if (tab === 'stu_tab_group') {
        renderStudentGroupList(targetClass);
    } else if (tab === 'stu_tab_class') {
        // 班级列表不需要过滤，直接显示全部
        renderClassList(); 
    }
}

function renderClassList() {
    const listContainer = document.getElementById('stu_class_list');
    if (!listContainer) return;

    // 获取全局班级数据
    const classes = window.classes || [];

    if (classes.length === 0) {
        renderEmptyState(listContainer, "暂无班级数据");
        return;
    }
    
    // ✅ 新增：获取当前下拉框选中的班级值
    const selectEl = document.getElementById('stu_class_slc');
    const currentSelectedClass = selectEl ? selectEl.value : '';

    let html = "";
    classes.forEach((item, index) => {
        const itemId = `stu_item_c_${index}`;
        
        // ✅ 核心修改：如果列表项的班级名 == 下拉框选中的值，就高亮
        const isActive = item.className === currentSelectedClass ? 'active' : '';
        
        html += `
            <div id="${itemId}" class="stu_list_item ${isActive}" onclick="handleStuItem('${itemId}', 'cls', '${item.className}')">
                <div class="avatar-circle">🏫</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px; display:flex; justify-content:space-between;">
                        ${item.className}
                    </div>
                    <div style="font-size:12px; color:#999;">班级列表</div>
                </div>
            </div>`;
    });
    listContainer.innerHTML = html;
	if (classes.length > 0) {
        // 1. 查找当前下拉框选中班级在数组中的索引
        const selectedIndex = classes.findIndex(c => c.className === currentSelectedClass);
        
        // 2. 如果找到了(-1表示没找到)就用该索引，否则兜底用 0 (第一个)
        const targetIndex = selectedIndex !== -1 ? selectedIndex : 0;
        const targetClass = classes[targetIndex];

        // 3. 触发选中逻辑
        handleStuItem(`stu_item_c_${targetIndex}`, 'cls', targetClass.className);
    }
}

function handleClassChange() {
    const selectEl = document.getElementById('stu_class_slc');
    if (!selectEl) return;
    
    const targetClass = selectEl.value; // 获取新选中的班级名
    const tab = window.currentStuTab || 'stu_tab_student';

    // 1. 如果是学生或小组 Tab -> 重新渲染整个列表
    if (tab === 'stu_tab_student') {
        renderCmStudentList(targetClass);
    } 
    else if (tab === 'stu_tab_group') {
        renderStudentGroupList(targetClass);
    }
    // 2. ✅ 新增：如果是班级 Tab -> 只切换高亮，不重绘
    else if (tab === 'stu_tab_class') {
        const classes = window.classes || [];
        // 找到对应班级的索引
        const index = classes.findIndex(c => c.className === targetClass);
        
        if (index !== -1) {
            // 构造对应的 ID (stu_item_c_0, stu_item_c_1...)
            const targetId = `stu_item_c_${index}`;
            
            // 调用现有的高亮函数
            handleStuItem(targetId);
            
            // (可选) 自动滚动到该位置，体验更好
            const itemEl = document.getElementById(targetId);
            if (itemEl) itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
	
	renderStudentActivityPanel();
}

function renderEmptyState(container, message) {
    container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:200px; color:#CFD8DC;">
            <div style="font-size:40px; margin-bottom:10px;">☕</div>
            <div style="font-size:13px;">${message}</div>
        </div>
    `;
}

/**
 * 1. 渲染学生列表 (对应 stu_tab_student)
 */
function renderCmStudentList(classStr) {
    const listContainer = document.getElementById('stu_class_list');
    if (!listContainer) return;

    // 过滤数据
    const data = (window.students || []).filter(s => s.className === classStr);

    if (data.length === 0) {
        renderEmptyState(listContainer, "暂无学生数据，请先新建");
        return;
    }

    let html = "";
    data.forEach((item, index) => {
        const itemId = `stu_item_s_${index}`;
        // 模拟一些随机头像和积分数据（若原数据没有）
        const avatar = item.avatar || "🐯";
        const score = item.score || 0;
        const missingCount = item.missing || 0; // 缺勤/缺交数

        html += `
            <div id="${itemId}" class="stu_list_item ${index === 0 ? 'active' : ''}" onclick="handleStuItem('${itemId}', 'stu', '${item.studentName}', '${item.className}')">
                <div class="avatar-circle">${avatar}</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px; display:flex; justify-content:space-between;">
                        ${item.studentName} 
                        ${missingCount > 0 ? `<span style="background:#FF5252; color:white; font-size:10px; padding:2px 6px; border-radius:10px;">缺${missingCount}</span>` : ''}
                    </div>
                    <div style="font-size:12px; color:#999;">积分: ${score}</div>
                </div>
            </div>`;
    });

    listContainer.innerHTML = html;
    
    if (data.length > 0) {
		handleStuItem('stu_item_s_0', 'stu', data[0].studentName, data[0].className);
}
}

/**
 * 2. 渲染小组列表 (对应 stu_tab_group)
 */
function renderStudentGroupList(classStr) {
    const listContainer = document.getElementById('stu_class_list');
    const data = (window.groups || []).filter(g => g.className === classStr);

    if (data.length === 0) {
        renderEmptyState(listContainer, "暂无小组数据，请先新建");
        return;
    }

    let html = "";
    data.forEach((item, index) => {
        const itemId = `stu_item_g_${index}`;
        html += `
            <div id="${itemId}" class="stu_list_item ${index === 0 ? 'active' : ''}" onclick="handleStuItem('${itemId}', 'grd', '${item.groupName}', '${item.className}')">
                <div class="avatar-circle">🛡️</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px;">${item.groupName}</div>
                    <div style="font-size:12px; color:#999;">成员: ${item.memberCount || 0}人</div>
                </div>
            </div>`;
    });
    listContainer.innerHTML = html;
	if (data.length > 0) {
		handleStuItem('stu_item_g_0', 'grd', data[0].groupName, data[0].className);
	}
}

/**
 * 渲染网格
 * @param {string} type - 'stu' | 'grd' | 'cls'
 * @param {string} name - 学生名 / 小组名 / 班级名
 * @param {string} context - 班级名 (针对小组或学生辅助用)
 */
function renderStudentGrid(type, name, context) {
    const container = document.getElementById('grid-container-student');
    if (!container) return;
	// --- ✅ 修改开始：处理 ID 为空的情况 (显示大号咖啡) ---
    const actId = window.currentActivityId;
    
    if (!actId) {
        // 更新标题
        const titleEl = document.getElementById('studentTitle');
        if (titleEl) {
             titleEl.innerText = `${name} - (暂无活动)`;
        }
        
        // 渲染中间的大号空状态
        // 关键点：加了 grid-column: 1 / -1 让它横跨所有列
        container.innerHTML = `
            <div style="
                grid-column: 1 / -1;      /* 核心修复：跨越整个网格宽度 */
                width: 100%;              /* 确保撑满 */
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 100%; 
                min-height: 400px;        /* 保证高度，让🏖️垂直居中 */
                color: #B0BEC5;    
            ">
                <div style="font-size: 80px; margin-bottom: 20px;">🏖️</div>
                <div style="font-size: 18px; font-weight: bold;">当前班级暂无活动</div>
                <div style="font-size: 14px; margin-top: 5px; opacity: 0.8;">请联系老师新建活动，或切换其他班级</div>
            </div>
        `;
        return; 
    }
    // --- ✅ 修改结束 ---
    
    const currentAct = (window.activityList || []).find(a => String(a.act_id) === String(actId));
    const actName = currentAct ? currentAct.activityName : '';

    // 2. 获取标题元素
    const titleEl = document.getElementById('studentTitle');

    // 3. 根据类型组合文字：班级/学生/小组 + 活动名
    if (titleEl) {
        if (type === 'stu') {
            // 显示：学生名 - 活动名
            titleEl.innerText = `${name} - ${actName}`;
        } else if (type === 'grd') {
            // 显示：班级名 小组名 - 活动名 (context是班级名)
            titleEl.innerText = `${context} ${name} - ${actName}`;
        } else if (type === 'cls') {
            // 显示：班级名 - 活动名
            titleEl.innerText = `${name} - ${actName}`;
        }
    }
    // --- ✅ 修改结束 ---
	
    const dayDataList = window.activityInfo[window.currentActivityId];
    if (!dayDataList || dayDataList.length === 0) {
        container.innerHTML = '<div style="padding:20px; color:#999;">暂无活动详情数据</div>';
        return;
    }

    container.innerHTML = ""; 
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 1. 筛选出“今天之前”且“非休息日”的索引，用于随机生成缺交
    const pastNonHolidayIndexes = dayDataList
        .map((d, i) => (d.date < today && d.dayType !== 0 ? i : -1))
        .filter(i => i !== -1);
    
    // 随机取两个作为红色缺交
    const dangerIndexes = pastNonHolidayIndexes.sort(() => 0.5 - Math.random()).slice(0, 2);

    // 2. 遍历渲染
    dayDataList.forEach((day, index) => {
        const dayLabel = `D${index + 1}`;
        let cellClass = "grid-cell";
        let icon = "🌟";
        let statusText = "已完成";
        let holidayBadge = "";

        // --- 核心逻辑判定 ---

        if (day.dayType === 0) {
            // A. 休息日 (优先级最高)
            // ✅ 修改点：追加一个专属类名 'stu-holiday-readonly'
            cellClass += " holiday stu-holiday-readonly";
            icon = "🏖️";
            statusText = ""; 
            holidayBadge = '<div class="holiday-badge">休</div>';
        } else if (day.date > today) {
            // B. 大于今天的非休息日 -> 强制上锁
            cellClass += " locked";
            icon = "🔒";
            statusText = "未开启";
        } else if (dangerIndexes.includes(index)) {
            // C. 今天之前的随机缺交
            cellClass += " danger";
            icon = "💣";
            statusText = "缺交";
        } else if (day.dayType === 2) {
            // D. 今天之前的奖励日
            cellClass += " done";
            icon = "🎁";
            statusText = "已领奖";
        } else {
            // E. 今天之前的普通完成
            cellClass += " done";
            icon = "🌟";
            statusText = "已完成";
        }

        container.innerHTML += `
            <div class="${cellClass}">
                <span class="day-label">${dayLabel}</span>
                ${holidayBadge}
                <div class="cell-icon">${icon}</div>
                <div class="cell-status-text">${statusText}</div>
            </div>`;
    });

    // 更新完成度百分比
    const total = dayDataList.length;
    const doneCount = container.querySelectorAll('.done').length;
    const progressTag = document.querySelector('.progress-tag');
    if (progressTag) progressTag.innerText = `完成度 ${doneCount}/${total}`;
}



function handleStuTab(tabId) {
    // 1. 视觉切换
    document.querySelectorAll('.stu_tab_item').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // 2. 更新状态并重新渲染
    window.currentStuTab = tabId;
    renderStudentAllList();
}

function handleStuItem(activeId, type, extra1, extra2) {
    // 1. 原有的高亮逻辑
    document.querySelectorAll('.stu_list_item').forEach(item => {
        item.classList.remove('active');
    });
    const target = document.getElementById(activeId);
    if (target) {
        target.classList.add('active');
    }

    // 2. 新增：如果是班级列表项 (id以 stu_item_c_ 开头)，同步下拉框选中值
    if (activeId.startsWith('stu_item_c_')) {
        // 从ID中提取索引，例如 stu_item_c_0 -> 0
        const index = activeId.split('_')[3]; 
        const classes = window.classes || [];
        
        if (classes[index]) {
            const selectEl = document.getElementById('stu_class_slc');
            if (selectEl) {
                // 同步下拉框的值，但不会触发 onchange 事件 (符合需求，防止数据打架)
                selectEl.value = classes[index].className;
				
				renderStudentActivityPanel();
            }
        }
    }
	// --- ✅ 新增：保存当前选中的参数到全局变量 ---
    window.currentLeftSelection = {
        type: type,
        name: extra1,
        context: extra2
    };
	renderStudentGrid(type, extra1, extra2);
}

// ✅ 最终简化版：只负责展开/收起面板
function toggleStuActivityPicker() {
    const panel = document.getElementById('stu_right_panel');
    
    // 只需要切换这个类，CSS 会自动处理面板滑入、背景模糊和箭头旋转
    panel.classList.toggle('is-picking');
    
    // (可选优化) 如果展开了，自动聚焦到列表里的搜索框
    if (panel.classList.contains('is-picking')) {
        setTimeout(() => {
            // 注意：这里找的是列表里的 .stu_mini_search
            const input = panel.querySelector('.stu_mini_search'); 
            if(input) input.focus();
        }, 300); // 等动画滑完再聚焦
    }
}


/**
 * 搜索功能
 * 根据输入值过滤当前显示的列表项
 */
function handleSearch(keyword) {
    // --- 1. 列表过滤逻辑 (保持不变) ---
    const items = document.querySelectorAll('#stu_class_list .stu_list_item');
    if (items.length === 0) return;

    const term = (keyword || '').trim().toLowerCase();

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? '' : 'none';
    });

    // --- 2. 新增：控制红叉显示/隐藏 ---
    const clearBtn = document.getElementById('stu_search_clear');
    if (clearBtn) {
        // 有内容就显示 block，没内容就隐藏 none
        clearBtn.style.display = term.length > 0 ? 'block' : 'none';
    }
}

/**
 * 新增：点击红叉清空搜索
 */
function clearSearch() {
    const input = document.getElementById('stu_search_inp');
    if (input) {
        input.value = ''; // 1. 清空输入框
        input.focus();    // 2. 重新聚焦，方便用户继续输入
        handleSearch(''); // 3. 触发搜索函数，恢复列表显示并隐藏红叉
    }
}

/**
 * 渲染右侧活动选择面板
 * 逻辑：匹配班级 -> 过滤掉未开始 -> 排序 -> 渲染 -> 默认选中
 */
function renderStudentActivityPanel(maintainState = false) {
    const container = document.querySelector('.stu_activity_scroller');
    const selectEl = document.getElementById('stu_class_slc');
	
    if (!container || !selectEl) return;
	
    const targetClass = selectEl.value;
    const activities = window.activityList || [];
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	
		
    // 1. 过滤逻辑：匹配班级 + 排除未开始 (开始日期 > 今天)
    let filtered = activities.filter(act => {
        const isClassMatch = (targetClass === 'all' || act.className === targetClass);
        const isStarted = act.startDate <= today;
        return isClassMatch && isStarted;
    });
	
	// --- ✅ 修改开始：处理无活动的情况 ---
    if (filtered.length === 0) {
        // 1. 设置空状态 UI
        container.innerHTML = `
            <div class="stu_picker_search">
                <input type="text" placeholder="搜索活动..." class="stu_mini_search">
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding-top:50px; color:#CFD8DC;">
                <div style="font-size:30px; margin-bottom:10px;">📂</div>
                <div style="font-size:13px;">暂无活动，请新建</div>
            </div>`;
        
        // 2. 将全局活动ID置为空 (关键需求)
        window.currentActivityId = null;

        // 3. 更新顶部显示的活动名称为提示语
        const titleEl = document.querySelector('.stu_current_name');
        if (titleEl) titleEl.innerText = "暂无活动";

        // 4. 强制刷新左侧网格（传入当前的选中项，以便网格显示为空状态）
        const sel = window.currentLeftSelection;
        if (sel) {
            renderStudentGrid(sel.type, sel.name, sel.context);
        }
        return; // 直接结束，不再执行后面的排序逻辑
    }
    // --- ✅ 修改结束 ---
	
    // 2. 分类与排序
    // 进行中：结束日期 >= 今天； 已结束：结束日期 < 今天
    let ongoing = filtered.filter(act => !act.isEnd);
    let ended = filtered.filter(act => act.isEnd);

    // 按开始日期降序排列（最近的在前）
    const sortByDate = (a, b) => new Date(b.startDate) - new Date(a.startDate);
    ongoing.sort(sortByDate);
    ended.sort(sortByDate);

    // 3. 构造 HTML (保持 tpl_student.js 中的结构)
    let html = `
        <div class="stu_picker_search">
            <input type="text" placeholder="搜索活动..." class="stu_mini_search" oninput="handleActivitySearch(this.value)">
        </div>`;

    // 渲染进行中
    ongoing.forEach(act => {
		
        html += `
            <div class="stu_act_item ongoing-item" data-id="${act.act_id}" onclick="selectStuActivity('${act.activityName}', '${act.act_id}')">
                <div class="stu_act_status ongoing"></div>
                <div class="stu_act_info">
                    <div class="stu_act_name">${act.activityName}</div>
                    <div class="stu_act_meta">${act.startDate} · 剩余${calculateDaysLeft(act.endDate)}天</div>
                </div>
            </div>`;
    });

    // 渲染已结束分隔线及列表
    if (ended.length > 0) {
        html += `<div class="stu_act_divider">已结束</div>`;
        ended.forEach(act => {
            html += `
                <div class="stu_act_item ended" data-id="${act.act_id}" onclick="selectStuActivity('${act.activityName}', '${act.act_id}')">
                    <div class="stu_act_status"></div>
                    <div class="stu_act_info">
                        <div class="stu_act_name">${act.activityName}</div>
                        <div class="stu_act_meta">${act.startDate} · 已结束</div>
                    </div>
                </div>`;
        });
    }

    container.innerHTML = html;
	
    // 5. ✅ 核心修复：默认选中逻辑
    if (!maintainState) {
        // 原有的自动选择逻辑
        let defaultAct = ongoing.length > 0 ? ongoing[0] : (ended.length > 0 ? ended[0] : null);
        if (defaultAct) {
            selectStuActivity(defaultAct.activityName, defaultAct.act_id);
        }
    }
	
}

/**
 * 辅助：计算剩余天数
 */
function calculateDaysLeft(endDateStr) {
    const diff = new Date(endDateStr) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * 切换活动 (严格通过 ID 匹配)
 * @param {string} name - 活动名称 (仅用于显示)
 * @param {string|number} id - 活动唯一ID (核心判断依据)
 */
function selectStuActivity(name, id) {
    // 1. 记录当前全局 ID
    window.currentActivityId = id; 
    
    const targetIdStr = String(id);

    const allItems = document.querySelectorAll('.stu_act_item');
    allItems.forEach(el => {
        const elId = el.getAttribute('data-id');
        if (elId === targetIdStr) {
            el.classList.add('active'); // 只有 ID 匹配的才高亮
        } else {
            el.classList.remove('active'); // 其他的移除
        }
    });

    // 3. 自动收起面板
    const panel = document.getElementById('stu_right_panel');
    if (panel) panel.classList.remove('is-picking');

    // 4. 更新顶部标题 (可选)
    const titleEl = document.querySelector('.stu_current_name');
    if (titleEl) titleEl.innerText = name;

    console.log(`已切换活动: [${name}] ID:${id}`);
	
	const sel = window.currentLeftSelection;
    if (sel) {
        // 使用当前选中的人/小组/班级 + 新的活动ID(已存入全局) 重新渲染
        renderStudentGrid(sel.type, sel.name, sel.context);
    }
    
}

/**
 * 尝试刷新学生端视图 (仅在班级匹配时触发)
 * @param {Object} targetAct - 被操作的活动对象
 */
function syncStudentView(targetAct) {
    // 1. 获取学生端当前的班级筛选值
    const stuSelect = document.getElementById('stu_class_slc');
    if (!stuSelect) return; 
    const currentStuClass = stuSelect.value;

    // 2. 【第一道关卡】班级一致性检查
    if (currentStuClass !== 'all' && currentStuClass !== targetAct.className) {
        console.log("班级不匹配，学生端不刷新" + targetAct.className);
        return;
    }

    // 3. 记录当前学生端选中的 ID
    const oldStuId = window.currentActivityId; 

    // 4. 刷新右侧活动列表 & 智能决策
    if (typeof renderStudentActivityPanel === 'function') {
        
        // ✅ 核心修复逻辑在这里：
        if (!oldStuId) {
            // 情况 A：之前是“暂无活动” (ID为空)
            // 策略：传 false，允许 renderStudentActivityPanel 内部执行“默认选中第一个”的逻辑
            // 效果：自动选中新活动，标题变更为活动名，中间网格显示
            console.log("从无到有，自动选中默认活动");
            renderStudentActivityPanel(false); 
        } else {
            // 情况 B：之前已有选中的活动
            // 策略：传 true (maintainState)，禁止它自动乱选，我们要自己控制
            console.log("已有活动，保持静默刷新");
            renderStudentActivityPanel(true);
        }
    }

    // 5. 【第二道关卡】恢复选中状态 (仅针对情况 B)
    if (oldStuId) {
        // 恢复列表高亮
        const targetEl = document.querySelector(`.stu_act_item[data-id="${oldStuId}"]`);
        if (targetEl) targetEl.classList.add('active');

        // 如果修改的正好是当前看的活动，强制刷新中间网格
        if (String(oldStuId) === String(targetAct.act_id)) {
            console.log("⚠️ 正在浏览的活动被修改，强制刷新中间舞台！");
            document.querySelector('.stu_current_name').innerText = targetAct.activityName;
            
            // 确保 currentLeftSelection 存在才调用
            if (window.currentLeftSelection) {
                renderStudentGrid(
                    window.currentLeftSelection.type, 
                    window.currentLeftSelection.name,
                    window.currentLeftSelection.context
                );
            }
        }
    }
}