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

/**
 * 1. 渲染学生列表 (对应 stu_tab_student)
 */
function renderCmStudentList(classStr) {
    const listContainer = document.getElementById('stu_class_list');
    if (!listContainer) return;

    // 过滤数据
    const data = (window.students || []).filter(s => s.className === classStr).sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'));

    if (data.length === 0) {
        // 假设 renderEmptyState 是你外部已有的函数
        if (typeof renderEmptyState === 'function') {
            renderEmptyState(listContainer, "暂无学生数据，请先新建");
        } else {
            listContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#ccc;">暂无学生数据，请先新建</div>`;
        }
        return;
    }

    // =========== 🟢 [新增] 局部内联计算缺交次数，不改动任何外部函数 ===========
    const missingMap = {};
    // 1. 初始化每个人的缺交为 0
    data.forEach(s => missingMap[s.studentName] = 0);

    // 2. 获取该班级所有历史必做任务 (调用你已有的辅助函数)
    const allTasks = typeof getGlobalClassTasks === 'function' ? getGlobalClassTasks(classStr) : [];
    
    if (allTasks.length > 0) {
        // 3. 核心遍历：借用你写好的高效聚合逻辑
        allTasks.forEach(task => {
            const dailySubs = window.submissionData?.[task.actId]?.[task.date] || [];
            
            // 建立当天的完成者名单 Set
            const finishers = new Set();
            dailySubs.forEach(sub => {
                if (sub.subject === task.subject && sub.task === task.content) {
                    finishers.add(sub.name);
                }
            });

            // 检查当前列表里的学生，没在完成名单里的，缺交 +1
            data.forEach(m => {
                if (!finishers.has(m.studentName)) {
                    missingMap[m.studentName]++;
                }
            });
        });
    }
    // =========== 🟢 [新增结束] ===========
	data.sort((a, b) => missingMap[b.studentName] - missingMap[a.studentName]);
    let html = "";
	const currentSelectedName = window.currentLeftSelection ? window.currentLeftSelection.name : null;
    let hasActiveItem = false; // 标记是否找到了当前选中者
    data.forEach((item, index) => {
        const itemId = `stu_item_s_${index}`;
        const avatar = item.avatar || "🐯";
        //判断这个人是不是刚才正在看的人
        const isActive = (item.studentName === currentSelectedName);
        if (isActive) hasActiveItem = true;
        // 从刚算好的 map 里直接取值
        const missingCount = missingMap[item.studentName] || 0; 

        html += `
            <div id="${itemId}" class="stu_list_item ${isActive ? 'active' : ''}" onclick="handleStuItem('${itemId}', 'stu', '${item.studentName}', '${item.className}')">
                <div class="avatar-circle">${avatar}</div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:14px; display:flex; justify-content:space-between; align-items: center;">
                        <span>${item.studentName}</span>
                        ${missingCount > 0 ? `<span style="background:#FF5252; color:white; font-size:10px; padding:2px 6px; border-radius:10px; margin-left: 4px;">缺${missingCount}</span>` : ''}
                    </div>
                </div>
            </div>`;
    });

    listContainer.innerHTML = html;
    
    // 关键：只有在没找到当前选中者时（比如首次进来），才默认触发点击第一项
    if (!hasActiveItem && data.length > 0) {
        if (typeof handleStuItem === 'function') {
            handleStuItem('stu_item_s_0', 'stu', data[0].studentName, data[0].className);
        }
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

function handleStuTab(tabId) {
    // 1. 视觉切换
    document.querySelectorAll('.stu_tab_item').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // 2. 更新状态并重新渲染
    window.currentStuTab = tabId;
    renderStudentAllList();
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

function renderEmptyState(container, message) {
    container.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:200px; color:#CFD8DC;">
            <div style="font-size:40px; margin-bottom:10px;">☕</div>
            <div style="font-size:13px;">${message}</div>
        </div>
    `;
}