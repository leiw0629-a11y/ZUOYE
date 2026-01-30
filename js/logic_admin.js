// ==========================================
// 班主任/管理员控制台核心逻辑
// ==========================================

// 当前选中的活动Key (ClassName_ActivityName)
let currentAdminActivityId = null;
window.currentAdminActivityKey = null; // 全局Key
let lastSelectedActivityKey = null;    // 取消新建时回退用

// 状态管理
let currentAdminTab = 'ongoing';
window.isBatchMode = false;
window.batchSelectedDates = new Set(); 

// ================= 1. 视图切换与初始化 =================

function toggleSettings() {
    const studentView = document.getElementById('view-student');
    const adminView = document.getElementById('view-admin');
    
    if (studentView.style.display !== 'none') {
        studentView.style.display = 'none'; 
        adminView.style.display = 'flex';   
        document.body.classList.add('mode-admin');
        initDropdowns();
        refreshAdminView(); 
    } else {
        studentView.style.display = 'flex';
        adminView.style.display = 'none';   
        document.body.classList.remove('mode-admin');
    }
}

function refreshAdminView() {
    if (!window.activityList || window.activityList.length === 0) {
        renderEmptyState();
    } else {
        currentAdminTab = 'ongoing';
        // 重置Tab样式
        const tabs = document.querySelectorAll('#view-admin .sidebar-tabs .tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        if(tabs[0]) tabs[0].classList.add('active'); 

        renderActivityList(); 
        autoSelectFirstItem();
    }
}

// ================= 2. 界面渲染 (Empty & List) =================

function renderEmptyState() {
    const listContent = document.querySelector('#view-admin .list-content');
    if (listContent) {
        listContent.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: #999;">
                <div style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;">📂</div>
                <div style="font-size: 13px;">暂无活动记录</div>
                <div style="font-size: 11px; margin-top:5px; color:#CCC;">请点击下方按钮新建</div>
            </div>`;
    }
    const gridContainer = document.getElementById('grid-container-admin');
    const mainTitle = document.getElementById('admin-main-title');
    if (mainTitle) mainTitle.innerText = "☁️ 暂未选择活动";
    if (gridContainer) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; color:#B0BEC5;">
                <div style="font-size: 60px; margin-bottom: 20px;">🚩</div>
                <h3 style="margin:0; color:#78909C;">欢迎来到班主任控制台</h3>
                <p style="font-size:13px; margin-top:10px;">左侧暂无活动，请先点击 <b>"+ 发布新活动任务"</b></p>
            </div>`;
    }
    toggleRightPanel('empty');
}

function renderActivityList() {
    const listContainer = document.querySelector('#view-admin .list-content');
    if (!listContainer) return;

    // 自动过期检测
    if (checkAndUpdateActivityStatus()) {
        if(typeof saveData === 'function') saveData(); 
    }

    listContainer.innerHTML = ""; 
    const today = new Date().toISOString().split('T')[0]; 

    const filteredList = window.activityList.filter(item => {
        const isEnded = item.isEnd;
        const isStarted = today >= item.startDate;

        if (currentAdminTab === 'ongoing') return isStarted && !isEnded;
        if (currentAdminTab === 'unstart') return today < item.startDate;
        if (currentAdminTab === 'ended') return isEnded;
        return false;
    });

    if (filteredList.length === 0) {
        renderEmptyStateInList();
        return;
    }

    filteredList.forEach(item => {
        const uniqueKey = `${item.className}_${item.activityName}`;
        const isActive = (uniqueKey === window.currentAdminActivityKey) ? 'active' : '';
        
        let statusColor = '#81C784'; 
        if (item.isEnd) statusColor = '#FF5252'; 
        else if (today < item.startDate) statusColor = '#B0BEC5'; 

        // Badge处理
        let badgesHtml = "";
        const badgeStyle = "background:#E8EAF6; color:#3F51B5;margin-right: 3px; font-size:11px; padding:1px 5px; border-radius:3px; font-weight: bold;";
        if (window.subject && Array.isArray(window.subject)) {
            if (item.subject === 'all') {
                badgesHtml = `<span style="${badgeStyle}">全科</span>`; 
            } else {
                const target = window.subject.find(s => (s.key || s.id || s) === item.subject);
                const txt = target ? (target.name || target.key || target) : item.subject;
                badgesHtml = `<span style="${badgeStyle}">${txt}</span>`;
            }
        } else {
            badgesHtml = `<span style="${badgeStyle}">${item.subject}</span>`;
        }
        
        const dateRange = `${item.startDate.slice(5)}~${item.endDate.slice(5)}`;

        listContainer.innerHTML += `
        <div class="activity-card ${isActive}" 
             data-key="${uniqueKey}" 
             onclick="loadActivity('${uniqueKey}')"
             style="position: relative; padding: 12px 10px;">
            <div title="状态" style="position: absolute; top: 8px; right: 8px; width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor};"></div>
            <div class="act-title" style="margin-bottom: 6px; padding-right: 10px; line-height: 1.2;">
                <span style="font-size: 14px; font-weight: bold; color: #333;">${item.activityName}</span>
                <span style="font-size: 12px; color: #999; margin-left: 6px;">${item.className}</span>
            </div>
            <div class="act-meta" >
                <div style="display:flex; flex-wrap:wrap;">${badgesHtml}</div>
                <span style="font-size: 11px; color: #B0BEC5; margin-left: 4px;">${dateRange}</span>
            </div>
        </div>`;
    });
}

function renderEmptyStateInList() {
    const listContainer = document.querySelector('#view-admin .list-content');
    let tipText = "暂无进行中的活动";
    if(currentAdminTab === 'unstart') tipText = "暂无未开始的活动";
    if(currentAdminTab === 'ended') tipText = "暂无已结束的活动";

    listContainer.innerHTML = `
        <div style="padding: 40px 10px; text-align: center; color: #B0BEC5;">
            <div style="font-size: 24px; margin-bottom: 8px; opacity: 0.6;">📭</div>
            <div style="font-size: 12px;">${tipText}</div>
        </div>`;
}

// ================= 3. 活动加载与创建 (核心逻辑) =================

function createNewActivity() {
    // 1. 保存现场
    lastSelectedActivityKey = window.currentAdminActivityKey;
    window.currentAdminActivityKey = null;

    // 2. UI 重置
    document.querySelectorAll('#view-admin .list-content .activity-card').forEach(card => card.classList.remove('active'));
    const mainTitle = document.getElementById('admin-main-title');
    if (mainTitle) mainTitle.innerText = "创建新活动";
    
    const gridContainer = document.getElementById('grid-container-admin');
    if (gridContainer) {
        gridContainer.innerHTML = `
            <div style="grid-column:1/-1; height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#CFD8DC;">
                <div style="font-size:40px; margin-bottom:15px; opacity:0.5;">📝</div>
                <div style="font-size:14px;">请在右侧完善活动信息</div>
            </div>`;
    }

    toggleRightPanel('form');
    const cancelBtn = document.getElementById('btn-cancel-create');
    if(cancelBtn) cancelBtn.style.display = 'block';

    initDropdowns(); 
    
    // 3. ✅ 解锁班级和科目
    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');
    if (classSelect) {
        classSelect.disabled = false;
        classSelect.style.backgroundColor = ""; 
        classSelect.style.cursor = "default";
    }
    if (subjectSelect) {
        subjectSelect.disabled = false;
        subjectSelect.style.backgroundColor = ""; 
        subjectSelect.style.cursor = "default";
    }
    // 解锁其他
    document.getElementById('setting-act-name').disabled = false;
    document.getElementById('setting-duration').disabled = false;
    document.getElementById('startDateInput').disabled = false;
    const autoRest = document.querySelector('.toggle-row input[type="checkbox"]');
    if(autoRest) autoRest.disabled = false;

    // 4. 重置表单值
    document.getElementById('setting-act-name').value = "";
    document.getElementById('setting-duration').value = ""; 
    const today = new Date().toISOString().split('T')[0];
    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');
    if(startInput) { startInput.value = today; startInput.min = today; }
    if(endInput) endInput.value = "";

    // 5. 按钮状态
    document.getElementById('btn-mode-create').style.display = 'block';
    document.getElementById('btn-mode-edit').style.display = 'none';
}

function loadActivity(key) {
    exitBatchMode();
    window.currentAdminActivityKey = key; 
    
    const batchBtn = document.getElementById('btn-batch-toggle');
    if(batchBtn) batchBtn.style.display = 'block';

    renderGrid(key);
    
    const [cls, act] = key.split('_');
    const mainTitle = document.getElementById('admin-main-title');
    if(mainTitle) mainTitle.innerText = `${act} (${cls})`;

    // 左侧高亮
    document.querySelectorAll('#view-admin .list-content .activity-card').forEach(card => card.classList.remove('active'));
    const targetCard = document.querySelector(`#view-admin .list-content .activity-card[data-key="${key}"]`);
    if(targetCard) targetCard.classList.add('active');

    // 右侧面板
    toggleRightPanel('form');
    const cancelBtn = document.getElementById('btn-cancel-create');
    if(cancelBtn) cancelBtn.style.display = 'none';
    
    document.getElementById('btn-mode-create').style.display = 'none';
    document.getElementById('btn-mode-edit').style.display = 'flex';

    fillFormData(key);

    // ==========================================
    // ✅ 核心：永远锁死班级和科目 (修改模式下)
    // ==========================================
    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');

    if (classSelect) {
        classSelect.disabled = true; 
        classSelect.style.backgroundColor = "#F5F5F5"; 
        classSelect.style.cursor = "not-allowed"; 
    }
    if (subjectSelect) {
        subjectSelect.disabled = true;
        subjectSelect.style.backgroundColor = "#F5F5F5";
        subjectSelect.style.cursor = "not-allowed";
    }

    // ==========================================
    // 根据状态处理剩余控件
    // ==========================================
    const [clsName, actName] = key.split('_');
    const currentActivity = window.activityList.find(item => 
        item.className === clsName && item.activityName === actName
    );
    const btnEditArea = document.getElementById('btn-mode-edit');

    const otherInputs = [
        document.getElementById('setting-act-name'),
        document.getElementById('setting-duration'),
        document.getElementById('startDateInput'),
        document.querySelector('.toggle-row input[type="checkbox"]')
    ];

    if (currentActivity && currentActivity.isEnd) {
        // --- 活动已结束：全锁 ---
        if (batchBtn) {
            batchBtn.disabled = true; 
            batchBtn.style.opacity = "0.5"; 
            batchBtn.style.cursor = "not-allowed";
        }
        if (btnEditArea) {
            btnEditArea.innerHTML = `<button class="btn-full" style="background:#E0E0E0; color:#999; cursor:not-allowed; border:none;" disabled>活动已结束</button>`;
        }
        otherInputs.forEach(el => { if(el) el.disabled = true; });

    } else {
        // --- 进行中：解锁允许修改的项 ---
        if (batchBtn) {
            batchBtn.disabled = false;
            batchBtn.style.opacity = "1";
            batchBtn.style.cursor = "pointer";
        }
        if (btnEditArea) {
             // 注意：这里 onclick 绑定了 saveEditedActivity
             btnEditArea.innerHTML = `
                <button class="btn-full" style="flex:1; background:#42A5F5; color:white;" onclick="saveEditedActivity()">修改配置</button>
                <button class="btn-full" style="flex:1; background:#EF5350; color:white;" onclick="endCurrentActivity()">结束活动</button>
            `;
        }
        otherInputs.forEach(el => { if(el) el.disabled = false; });
    }
}

function cancelCreate() {
    if (lastSelectedActivityKey) {
        loadActivity(lastSelectedActivityKey);
    } else {
        refreshAdminView();
    }
}

// ================= 4. 数据生成与保存 (新建 & 修改) =================

/**
 * 辅助函数：生成某一天的默认数据
 */
function generateDayData(dateStr, isAutoRest, subjectVal) {
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); 

    let dayType = 1;
    if (isAutoRest && (dayOfWeek === 0 || dayOfWeek === 6)) {
        dayType = 0;
    }

    let defaultTasks = [];
    if (dayType !== 0) {
        if (subjectVal === 'all') {
            if (window.subject && Array.isArray(window.subject)) {
                window.subject.forEach(sub => {
                    let subjKey = (typeof sub === 'object') ? (sub.key || sub.id || sub.name) : sub;
                    defaultTasks.push({ subject: subjKey, content: "" });
                });
            }
        } else {
            defaultTasks.push({ subject: subjectVal, content: "" });
        }
    }

    return {
        date: dateStr,
        dayType: dayType,
        tasks: defaultTasks,
        exemptStudents: [],
        rewardData: null
    };
}

/**
 * 新建活动保存
 */
function saveAndExit() {
    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');
    const nameInput = document.getElementById('setting-act-name');
    const startInput = document.getElementById('startDateInput');
    const durationInput = document.getElementById('setting-duration');
    const autoRestSwitch = document.querySelector('.toggle-row input[type="checkbox"]');

    if (!classSelect.value) { alert("请选择班级！"); return; }
    if (!subjectSelect.value) { alert("请选择所属科目！"); return; }
    if (!nameInput.value.trim()) { alert("请输入活动名称！"); return; }
    if (!startInput.value) { alert("请选择开始日期！"); return; }

    let duration = parseInt(durationInput.value);
    if (!duration || duration <= 0) { alert("请输入有效的活动天数！"); return; }

    const className = classSelect.options[classSelect.selectedIndex].text;
    const activityName = nameInput.value.trim();
    const uniqueKey = `${className}_${activityName}`;

    if (window.activityList.some(item => item.className === className && item.activityName === activityName)) {
        alert(`【${className}】已经存在名为“${activityName}”的活动了，请换个名字！`);
        return;
    }

    const startDate = new Date(startInput.value);
    const endDateObj = new Date(startDate);
    endDateObj.setDate(startDate.getDate() + duration - 1);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    window.activityList.push({
        className: className,
        activityName: activityName,
        subject: subjectSelect.value,
        startDate: startInput.value,
        totalDays: duration,
        endDate: endDateStr,
        isEnd: false,
        manualEndDate: null
    });

    const daysArray = [];
    const isAutoRest = autoRestSwitch ? autoRestSwitch.checked : false;

    for (let i = 0; i < duration; i++) {
        const currDate = new Date(startDate);
        currDate.setDate(startDate.getDate() + i);
        const dateStr = currDate.toISOString().split('T')[0];
        // 调用公共生成函数
        daysArray.push(generateDayData(dateStr, isAutoRest, subjectSelect.value));
    }

    window.activityInfo[uniqueKey] = daysArray;
    window.currentAdminActivityKey = uniqueKey; 
    
    alert("🎉 新活动创建成功！");
    if(typeof saveData === 'function') saveData(); 
    
    refreshAdminView();
    loadActivity(uniqueKey);
}

/**
 * 修改活动保存 (核心)
 */
function saveEditedActivity() {
    const oldKey = window.currentAdminActivityKey;
    
    // 1. 先找到原始的 List 数据对象
    // 这是修复 Bug 的关键：从数据源获取班级和科目，而不是从可能出错的下拉框获取
    const originalListItem = window.activityList.find(item => 
        `${item.className}_${item.activityName}` === oldKey
    );

    if (!oldKey || !window.activityInfo[oldKey] || !originalListItem) {
        alert("保存失败：数据同步错误，请刷新页面重试。");
        return;
    }

    const nameInput = document.getElementById('setting-act-name');
    const startInput = document.getElementById('startDateInput');
    const durationInput = document.getElementById('setting-duration');
    const autoRestSwitch = document.querySelector('.toggle-row input[type="checkbox"]');

    if (!nameInput.value.trim() || !startInput.value || !durationInput.value) {
        alert("请完善活动信息！");
        return;
    }

    // 2. === 获取数据 ===
    
    // 【关键修复】直接使用原始数据中的 班级 和 科目 (因为它们被锁定了，不允许改)
    // 这样由于下拉框匹配失败导致的 "--请选择班级--" Bug 就永远不会发生了
    const currentClassName = originalListItem.className; 
    const currentSubject = originalListItem.subject;     
    
    // 可变数据从 DOM 获取
    const newActivityName = nameInput.value.trim();
    const newStartDate = startInput.value;
    const newDuration = parseInt(durationInput.value); 
    const isAutoRest = autoRestSwitch ? autoRestSwitch.checked : false; 

    // 计算结束日期
    const startDateObj = new Date(newStartDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + newDuration - 1);
    const newEndDateStr = endDateObj.toISOString().split('T')[0];

    // 3. === 处理 Info 数据 (日期合并) ===
    
    // 构建 Old Map
    const oldDataMap = {};
    window.activityInfo[oldKey].forEach(day => { oldDataMap[day.date] = day; });

    const newDaysArray = [];

    for (let i = 0; i < newDuration; i++) {
        const currDate = new Date(startDateObj);
        currDate.setDate(startDateObj.getDate() + i);
        const dateStr = currDate.toISOString().split('T')[0];

        if (oldDataMap[dateStr]) {
            // ✅ 旧日期：保留原样
            newDaysArray.push(oldDataMap[dateStr]);
        } else {
            // ✅ 新日期：生成默认
            newDaysArray.push(generateDayData(dateStr, isAutoRest, currentSubject));
        }
    }

    const newKey = `${currentClassName}_${newActivityName}`;

    // 4. === 保存并更新 ===

    // 更新 Info (Key迁移)
    if (newKey !== oldKey) {
        if (window.activityInfo[newKey]) {
            alert(`修改失败：本班级已存在名为【${newActivityName}】的活动！`);
            return;
        }
        window.activityInfo[newKey] = newDaysArray;
        delete window.activityInfo[oldKey]; 
    } else {
        window.activityInfo[newKey] = newDaysArray;
    }

    // 更新 List (直接更新引用对象)
    originalListItem.activityName = newActivityName;
    originalListItem.startDate = newStartDate;
    originalListItem.totalDays = newDuration;
    originalListItem.endDate = newEndDateStr;
    // 注意：这里不需要更新 className 和 subject，因为它们本来就没变

    window.currentAdminActivityKey = newKey; 
    alert("✅ 修改配置成功！");
    
    if(typeof saveData === 'function') saveData(); 
    
    refreshAdminView(); 
    loadActivity(newKey);
}

// ================= 5. 网格与表单辅助 =================

function renderGrid(key) {
    const gridContainer = document.getElementById('grid-container-admin');
    const daysData = window.activityInfo[key];
    if (!gridContainer || !daysData) return;

    gridContainer.innerHTML = ""; 

    daysData.forEach((day, index) => {
        let icon = "", statusText = "", extraClass = "", badgeHtml = ""; 
        
        if (day.dayType === 0) { 
            icon = "🏖️"; extraClass = "holiday"; badgeHtml = `<div class="holiday-badge">休</div>`;
        } else if (day.dayType === 2) { 
            icon = "🎁"; extraClass = "reward"; 
            statusText = day.tasks && day.tasks.length ? "有奖励任务" : "奖励";
        } else {
            if (day.tasks && day.tasks.length > 0) {
                icon = "📝"; extraClass = "done"; 
                // 简易显示科目统计
                const subjectCounts = {};
                day.tasks.forEach(t => { subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1; });
                statusText = Object.keys(subjectCounts).map(s => subjectCounts[s] > 1 ? `${s}*${subjectCounts[s]}` : s).join(" ");
            } else {
                icon = "☁️"; statusText = "暂无作业"; extraClass = "pending"; 
            }
        }

        gridContainer.innerHTML += `
            <div class="grid-cell ${extraClass}" data-date="${day.date}" onclick="openDayConfig('${day.date}')">
                <span class="day-label">D${index + 1}</span>
                ${badgeHtml}
                <div class="cell-icon">${icon}</div>
                <div class="cell-status-text" style="font-size:12px;">${statusText}</div>
                <div class="cell-date">${day.date.slice(5)}</div>
            </div>`;
    });
}

function fillFormData(key) {
    if (!key || !window.activityList) return;
    const [clsName, actName] = key.split('_');
    const activity = window.activityList.find(item => item.className === clsName && item.activityName === actName);
    if (!activity) return;

    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');
    const nameInput = document.getElementById('setting-act-name');
    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput'); 
    const durationInput = document.getElementById('setting-duration');

    if (classSelect) {
        for (let i = 0; i < classSelect.options.length; i++) {
            if (classSelect.options[i].text === activity.className) {
                classSelect.selectedIndex = i; break;
            }
        }
    }
    if (subjectSelect) subjectSelect.value = activity.subject;
    if (nameInput) nameInput.value = activity.activityName;
    if (startInput) startInput.value = activity.startDate;
    if (endInput) endInput.value = activity.endDate; 
    
    if (durationInput) {
        if (activity.totalDays) {
            durationInput.value = activity.totalDays;
        } else {
            const start = new Date(activity.startDate);
            const end = new Date(activity.endDate);
            const diffDays = (end - start) / (1000 * 60 * 60 * 24) + 1; 
            durationInput.value = Math.round(diffDays);
        }
    }
}

function initDropdowns() {
    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');

    if (classSelect) {
        classSelect.innerHTML = `<option value="">--请选择班级--</option>`; 
        if (window.classes && Array.isArray(window.classes)) {
            window.classes.forEach(cls => {
                let val, txt;
                if (typeof cls === 'object' && cls !== null) {
                    txt = cls.className || cls.name || "未知班级";
                    val = cls.className || cls.id || txt;
                } else { val = cls; txt = cls; }
                classSelect.innerHTML += `<option value="${val}">${txt}</option>`;
            });
        }
    }

    if (subjectSelect) {
        subjectSelect.innerHTML = `<option value="">--请选择科目--</option>`;
        if (window.subject && Array.isArray(window.subject)) {
            if (window.subject.length > 1) subjectSelect.innerHTML += `<option value="all">全部科目</option>`;
            window.subject.forEach(sub => {
                let val, txt;
                if (typeof sub === 'object' && sub !== null) {
                    val = sub.name || sub.key || sub.id; txt = sub.name || sub.key;
                } else { val = sub; txt = sub; }
                subjectSelect.innerHTML += `<option value="${val}">${txt}</option>`;
            });
        }
    }
}

function calcEndDate() {
    const startInput = document.getElementById('startDateInput');
    const durationInput = document.getElementById('setting-duration'); 
    const endInput = document.getElementById('endDateInput');

    if (startInput && startInput.value && durationInput && durationInput.value) {
        const days = parseInt(durationInput.value);
        if (days > 0) {
            const date = new Date(startInput.value);
            date.setDate(date.getDate() + days - 1);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            endInput.value = `${y}-${m}-${d}`;
        } else { endInput.value = ""; }
    } else { if(endInput) endInput.value = ""; }
}

// ================= 6. 其他辅助 (Tab, Batch, End) =================

function switchAdminTab(tabType, btn) {
    currentAdminTab = tabType;
    const allTabs = document.querySelectorAll('#view-admin .sidebar-tabs .tab-btn');
    allTabs.forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else {
        const indexMap = { 'ongoing': 0, 'unstart': 1, 'ended': 2 };
        if (allTabs[indexMap[tabType]]) allTabs[indexMap[tabType]].classList.add('active');
    }
    renderActivityList();
    autoSelectFirstItem();
}

function checkAndUpdateActivityStatus() {
    if (!window.activityList) return false;
    const today = new Date().toISOString().split('T')[0];
    let hasChange = false;
    window.activityList.forEach(item => {
        if (!item.isEnd && item.endDate && today > item.endDate) {
            item.isEnd = true;
            hasChange = true;
        }
    });
    return hasChange;
}

function autoSelectFirstItem() {
    const firstCard = document.querySelector('#view-admin .list-content .activity-card');
    if (firstCard) {
        const key = firstCard.getAttribute('data-key');
        if (window.currentAdminActivityKey !== key) loadActivity(key);
    } else {
        window.currentAdminActivityKey = null; 
        const mainTitle = document.getElementById('admin-main-title');
        if (mainTitle) mainTitle.innerText = "☁️ 暂无活动";
        const gridContainer = document.getElementById('grid-container-admin');
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; color:#CFD8DC;">
                    <div style="font-size: 50px; margin-bottom: 10px; opacity: 0.5;">📭</div>
                    <div style="font-size:14px;">当前列表下暂无活动</div>
                </div>`;
        }
        exitBatchMode();
        const batchBtn = document.getElementById('btn-batch-toggle');
        if(batchBtn) batchBtn.style.display = 'none';
        toggleRightPanel('empty');
    }
}

function toggleRightPanel(state) {
    const emptyView = document.getElementById('admin-empty-right');
    const formView = document.getElementById('admin-form-container');
    const actionArea = document.getElementById('admin-action-area');

    if (state === 'empty') {
        if(emptyView) emptyView.style.display = 'flex';
        if(formView) formView.style.display = 'none';
        if(actionArea) actionArea.style.display = 'none';
    } else if (state === 'form') {
        if(emptyView) emptyView.style.display = 'none';
        if(formView) formView.style.display = 'block';
        if(actionArea) actionArea.style.display = 'block';
    }
}

// 批量操作相关
function toggleBatchMode() {
    const bar = document.getElementById('batch-action-bar');
    const gridContainer = document.getElementById('grid-container-admin');
    if (bar && gridContainer) {
        bar.classList.add('active');
        gridContainer.classList.add('batch-mode');
        window.isBatchMode = true;
        window.batchSelectedDates.clear(); 
        updateBatchCount(); 
    }
}
function exitBatchMode() {
    const bar = document.getElementById('batch-action-bar');
    const gridContainer = document.getElementById('grid-container-admin');
    if (bar && gridContainer) {
        bar.classList.remove('active');
        gridContainer.classList.remove('batch-mode');
        gridContainer.querySelectorAll('.batch-selected').forEach(cell => cell.classList.remove('batch-selected'));
    }
    window.isBatchMode = false;
    window.batchSelectedDates.clear();
    updateBatchCount();
}
function toggleBatchCell(dateStr) {
    const cell = document.querySelector(`.grid-cell[data-date="${dateStr}"]`);
    if (!cell) return;
    if (window.batchSelectedDates.has(dateStr)) {
        window.batchSelectedDates.delete(dateStr);
        cell.classList.remove('batch-selected');
    } else {
        window.batchSelectedDates.add(dateStr);
        cell.classList.add('batch-selected');
    }
    updateBatchCount();
}
function updateBatchCount() {
    const countEl = document.getElementById('batch-count');
    if (countEl) countEl.innerText = window.batchSelectedDates.size;
}

function endCurrentActivity() {
    if (!window.currentAdminActivityKey) { alert("未选择任何活动！"); return; }
    const confirmEnd = confirm("⚠️ 确定要提前结束当前活动吗？\n\n1. 结束后的活动将立即移至【已结束】列表。\n2. 学生端将显示为已结束状态。\n3. 此操作不可撤销。");
    if (!confirmEnd) return;

    const keyParts = window.currentAdminActivityKey.split('_');
    const targetClassName = keyParts[0]; 
    const targetActivityName = keyParts.slice(1).join('_'); 

    const targetActivity = window.activityList.find(item => item.className === targetClassName && item.activityName === targetActivityName);

    if (targetActivity) {
        targetActivity.isEnd = true;
        targetActivity.manualEndDate = new Date().toISOString().split('T')[0];
        if (typeof saveData === 'function') saveData(); 
        alert("✅ 活动已成功结束！");
        switchAdminTab('ended', null); 
        loadActivity(window.currentAdminActivityKey);
    } else {
        alert("❌ 错误：在列表中未找到该活动数据，请刷新页面重试。");
    }
}