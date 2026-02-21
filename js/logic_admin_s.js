
// 刷新科目活动主视图（读取数据并渲染列表）
function refreshAdminView() {
	
    if (!window.activityList || window.activityList.length === 0) {
        renderAdminEmptyState();
        return;
    }
	
    // 1. 渲染列表
    const tabs = document.getElementById('admin_tab_container').querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    
    // === 修复开始：根据当前的 currentAdminTab 变量来决定高亮哪个按钮 ===
    let activeIndex = 0; // 默认为 0 (ongoing)
    if (currentAdminTab === 'unstart') activeIndex = 1;
    else if (currentAdminTab === 'ended') activeIndex = 2;
    
    if(tabs[activeIndex]) tabs[activeIndex].classList.add('active');

    renderAdminActivityList(); 
	
    const currentKey = window.currentAdminActivityKey;
    
    const targetCard = currentKey ? document.querySelector(`#view-admin .list-content .activity-card[data-key="${currentKey}"]`) : null;
	
    if (currentKey && targetCard) {
        loadActivity(currentKey); 
    } else {
        autoSelectFirstItem();
    }
	
}

/**
 * 渲染左侧活动列表 (管理员版)
 * 依赖变量：currentAdminTab ('ongoing', 'unstart', 'ended')
 */
function renderAdminActivityList() {
    const listContainer = document.getElementById('admin_activity_list');
    if (!listContainer) return;

    listContainer.innerHTML = ""; 
    // 🟢 新代码 (替换):
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	const selectedClass = document.getElementById('admin_class_slc').value;
	
	// === 新增：获取搜索框的值 ===
    const searchInput = document.getElementById('admin_search_inp');
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
	
    const filteredList = window.activityList.filter(item => {
        // A. 状态判定 (保持原逻辑)
        const isEnded = item.isEnd;
        const isStarted = today >= item.startDate;
        let statusMatch = false;

        if (currentAdminTab === 'ongoing') statusMatch = isStarted && !isEnded;
        else if (currentAdminTab === 'unstart') statusMatch = today < item.startDate;
        else if (currentAdminTab === 'ended') statusMatch = isEnded;

        // B. ⭐ 班级判定 (新增逻辑)
        let classMatch = true;
        // 如果选的不是'all'，也不是空，且班级名称不一致，则不匹配
        if (selectedClass && selectedClass !== 'all') {
            // 注意：这里假设下拉框value和item.className是一样的（如"一年一班"）
            // 如果你的下拉框value是id，这里请改成 item.classId === selectedClass
            classMatch = (item.className === selectedClass);
        }

		// C. ⭐⭐⭐ 新增：搜索判定 ⭐⭐⭐
        let searchMatch = true;
        if (searchValue) {
            // 匹配 item.activityName，转为小写比较以忽略大小写
            searchMatch = item.activityName && item.activityName.toLowerCase().includes(searchValue);
        }

        // 必须三个条件都满足
        return statusMatch && classMatch && searchMatch;
    });
	
	filteredList.sort((a, b) => b.act_id.localeCompare(a.act_id));
    // 2. 空状态处理 (如果是因为搜索导致为空，也可以在这里单独处理提示，目前沿用通用空状态)
    if (filteredList.length === 0) {
        // --- 保持原有的列表提示逻辑 ---
        if (searchValue) {
             listContainer.innerHTML = `
                <div style="padding: 40px 10px; text-align: center; color: #B0BEC5;">
                    <div style="font-size: 24px; margin-bottom: 8px; opacity: 0.6;">🔍</div>
                    <div style="font-size: 12px;">未找到包含 "${searchInput.value}" 的活动</div>
                </div>`;
        } else {
            renderAdminEmptyStateInList(); 
        }

        // --- 👇 新增/修改了下面这些清空逻辑 👇 ---
        
        // A. 清空选中的 Key
        // window.currentAdminActivityKey = null; 

        // B. 清空中间标题
        const mainTitle = document.getElementById('admin-main-title');
        if (mainTitle) mainTitle.innerText = "☁️ 暂无活动";

        // C. 清空中间大网格 (Grid)
        const gridContainer = document.getElementById('grid-container-admin');
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; color:#CFD8DC;">
                    <div style="font-size: 50px; margin-bottom: 10px; opacity: 0.5;">📭</div>
                    <div style="font-size:14px;">暂无匹配的活动</div>
                </div>`;
        }

        // D. 隐藏批量操作按钮
        exitBatchMode();
        const batchBtn = document.getElementById('btn-batch-toggle');
        if(batchBtn) batchBtn.style.display = 'none';

        // E. 右侧面板切换为空白
        toggleRightPanel('empty');

        return; // 结束函数
    }
    // 3. 渲染列表
    filteredList.forEach(item => {
        const uniqueKey = getActivityKey(item); // 调用 script.js 的通用方法
        const isActive = (uniqueKey === window.currentAdminActivityKey) ? 'active' : '';
        
        // 状态圆点颜色
        let statusColor = item.isEnd ? '#B0BEC5' : (today < item.startDate ? '#B0BEC5' : '#4CAF50');

        // 构建 Badge (保持你原有逻辑)
        let badgeText = item.subject === 'all' ? '全科' : item.subject;
        // 如果 subject 是对象处理一下，这里简化展示
        if(typeof item.subject === 'object') badgeText = item.subject.name || item.subject.key;
        
        const dateRange = `${item.startDate.slice(5)}~${item.endDate.slice(5)}`;

        listContainer.innerHTML += `
        <div class="activity-card ${isActive}" 
             data-key="${uniqueKey}" 
             onclick="loadActivity('${uniqueKey}')" 
             style="position: relative; padding: 12px 10px;">
            
            <div title="状态" style="position: absolute; top: 8px; right: 8px; width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor};"></div>
            
            <div class="act-title" style="margin-bottom: 6px; padding-right: 10px; line-height: 1.2;">
                <span style="font-size: 14px; font-weight: bold; color: #5D4037;">${item.activityName}</span>
                <span style="font-size: 12px; color: #999; margin-left: 6px;">${item.className}</span>
            </div>
            
            <div class="act-meta">
                <span style="background:#E8EAF6; color:#3F51B5; font-size:11px; padding:1px 5px; border-radius:3px; font-weight: bold;">${badgeText}</span>
                <span style="font-size: 11px; color: #B0BEC5; margin-left: 4px;">${dateRange}</span>
            </div>
        </div>`;
    });
	// 1. 尝试找到当前记录的 Key 对应的卡片
    const currentKey = window.currentAdminActivityKey;
    const activeCard = currentKey ? listContainer.querySelector(`.activity-card[data-key="${currentKey}"]`) : null;

    if (searchValue) {
        // 【搜索模式】：直接选中第一个结果，给用户最新反馈
        autoSelectFirstItem();
    } else {
        // 【非搜索模式】（包括点击X清空后）：
        if (activeCard) {
            // A. 如果之前的活动还在列表里（比如点了X回来），手动触发一次加载，恢复中间和右侧
            loadActivity(currentKey);
        } else {
            // B. 如果之前的活动不在了（或者本来就没选），默认选中第一个
            autoSelectFirstItem();
        }
    }
}

// 切换左侧列表的 Tab（进行中/未开始/已结束）
function switchAdminTab(tabType, btn) {
    currentAdminTab = tabType;
    const allTabs = document.getElementById('admin_tab_container').querySelectorAll('.tab-btn');
    allTabs.forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else {
        const indexMap = { 'ongoing': 0, 'unstart': 1, 'ended': 2 };
        if (allTabs[indexMap[tabType]]) allTabs[indexMap[tabType]].classList.add('active');
    }
    renderAdminActivityList();
    autoSelectFirstItem();
}

// 渲染右侧大屏的空状态（当没有选中活动时）
function renderAdminEmptyState() {
    const listContent = document.getElementById('admin_activity_list');
	
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

// 渲染左侧列表的空状态（当没有搜索结果时）
function renderAdminEmptyStateInList() {
    const listContainer = document.getElementById('admin_activity_list');
    let tipText = "暂无进行中的活动";
    if(currentAdminTab === 'unstart') tipText = "暂无未开始的活动";
    if(currentAdminTab === 'ended') tipText = "暂无已结束的活动";

    listContainer.innerHTML = `
        <div style="padding: 40px 10px; text-align: center; color: #B0BEC5;">
            <div style="font-size: 24px; margin-bottom: 8px; opacity: 0.6;">📭</div>
            <div style="font-size: 12px;">${tipText}</div>
        </div>`;
}

// 自动选中列表中的第一个活动
function autoSelectFirstItem() {
    const firstCard = document.getElementById('admin_activity_list').querySelector('.activity-card');
    if (firstCard) {
        loadActivity(firstCard.getAttribute('data-key'));
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
// 初始化搜索框的监听事件
function initAdminSearch() {
    const searchInput = document.getElementById('admin_search_inp');
    const clearBtn = document.getElementById('admin_search_clear');

    if (searchInput) {
        // 监听输入事件：每次按键都会触发
        searchInput.addEventListener('input', function() {
            // 控制清除按钮的显示/隐藏（可选优化）
            if (clearBtn) {
                clearBtn.style.display = this.value ? 'block' : 'none'; // CSS建议配合修改，或者直接忽略这行
            }
            // 核心：输入时重新渲染列表
            renderAdminActivityList();
        });
    }

    if (clearBtn) {
        // 监听清除按钮
        clearBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = ''; // 清空输入框
                renderAdminActivityList(); // 恢复列表
            }
        });
    }
}

// ==========================================
// 1. 新增：下拉框变更事件处理函数
// ==========================================
function onAdminClassChange() {
    // 重新渲染左侧列表（render函数内部会自动获取当前下拉框的值）
    renderAdminActivityList();
    
    // 渲染完后，自动选中列表里的第一个活动
    autoSelectFirstItem();
}

// 加载单个活动详情到右侧面板
function loadActivity(key) {
    // 1. 退出批量模式，更新全局 Key
    exitBatchMode();
    window.currentAdminActivityKey = key; 
    
    // ==========================================
    // ✅ 核心修改：通过 ID 查找活动对象
    // ==========================================
    const currentActivity = window.activityList.find(item => item.act_id === key);
    
    //以此为基础进行防御性编程
    if (!currentActivity) {
        console.error("加载失败：找不到活动 ID", key);
        return;
    }

    const batchBtn = document.getElementById('btn-batch-toggle');
    if(batchBtn) batchBtn.style.display = 'block';

    // 2. 渲染网格 (Key 现在是 ID，直接去 Info 里取数据即可)
    renderGrid(key);
    
    // 3. 更新主标题 (从对象中获取名称和班级)
    const mainTitle = document.getElementById('admin-main-title');
    if(mainTitle) mainTitle.innerText = `${currentActivity.activityName} (${currentActivity.className})`;

    // 4. 左侧列表高亮
    document.getElementById('admin_activity_list').querySelectorAll('.activity-card').forEach(card => card.classList.remove('active'));
    // 注意：这里依赖 renderAdminActivityList 渲染时 data-key 已经是 act_id 了
    const targetCard = document.querySelector(`#view-admin .list-content .activity-card[data-key="${key}"]`);
    if(targetCard) targetCard.classList.add('active');

    // 5. 切换右侧面板
    toggleRightPanel('form');
    const cancelBtn = document.getElementById('btn-cancel-create');
    if(cancelBtn) cancelBtn.style.display = 'none';
    
    document.getElementById('btn-mode-create').style.display = 'none';
    document.getElementById('btn-mode-edit').style.display = 'flex';

    // 6. 回显表单数据
    fillFormData(key);

    // ==========================================
    // 7. 锁定逻辑 (班级和科目永远不可修改)
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
    // 8. 按钮状态 (根据 isEnd 判断)
    // ==========================================
    const btnEditArea = document.getElementById('btn-mode-edit');

    const otherInputs = [
        document.getElementById('setting-act-name'),
        document.getElementById('setting-duration'),
        document.getElementById('startDateInput'),
        document.querySelector('.toggle-row input[type="checkbox"]')
    ];

    if (currentActivity.isEnd) {
        // --- 已结束 ---
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
        // --- 进行中 ---
        if (batchBtn) {
            batchBtn.disabled = false;
            batchBtn.style.opacity = "1";
            batchBtn.style.cursor = "pointer";
        }
        if (btnEditArea) {
             btnEditArea.innerHTML = `
                <button class="btn-full" style="flex:1; background:#42A5F5; color:white;" onclick="saveEditedActivity()">修改配置</button>
                <button class="btn-full" style="flex:1; background:#EF5350; color:white;" onclick="endCurrentActivity()">结束活动</button>
            `;
        }
        otherInputs.forEach(el => { if(el) el.disabled = false; });
    }
}

// 将活动数据回显到表单输入框中
function fillFormData(key) {
    if (!key || !window.activityList) return;

    // ==========================================
    // ✅ 核心修改：通过 ID 查找
    // ==========================================
    const activity = window.activityList.find(item => item.act_id === key);
    
    if (!activity) return;

    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');
    const nameInput = document.getElementById('setting-act-name');
    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput'); 
    const durationInput = document.getElementById('setting-duration');

    // 下拉框回显逻辑
    if (classSelect) {
        // 尝试直接赋值
        classSelect.value = activity.className; 
        // 如果 value 对不上（有时候 className 是中文，value 是英文 ID），则尝试通过 text 匹配
        if (classSelect.selectedIndex === -1) {
            for (let i = 0; i < classSelect.options.length; i++) {
                if (classSelect.options[i].text === activity.className) {
                    classSelect.selectedIndex = i; break;
                }
            }
        }
    }
    
    if (subjectSelect) subjectSelect.value = activity.subject;
    if (nameInput) nameInput.value = activity.activityName;
    if (startInput) startInput.value = activity.startDate;
    if (endInput) endInput.value = activity.endDate; 
    
    // 时长回显逻辑
    if (durationInput) {
        if (activity.totalDays) {
            durationInput.value = activity.totalDays;
        } else {
            // 兼容旧数据计算
            const start = new Date(activity.startDate);
            const end = new Date(activity.endDate);
            const diffDays = (end - start) / (1000 * 60 * 60 * 24) + 1; 
            durationInput.value = Math.round(diffDays);
        }
    }
}
// 渲染 28 天打卡网格
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
		// ⭐ 新增：计算周几
        const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekMap[new Date(day.date).getDay()];
        // ⭐ 修改：HTML 模板部分
        gridContainer.innerHTML += `
            <div class="grid-cell ${extraClass}" data-date="${day.date}" onclick="openDayConfig('${day.date}')">
                <span class="day-label">${day.date.slice(5)}</span>
                
                ${badgeHtml}
                <div class="cell-icon">${icon}</div>
                <div class="cell-status-text" style="font-size:12px;">${statusText}</div>
                
                <div class="cell-date">${weekDay}</div>
            </div>`;
    });
}

// 控制右侧编辑面板的显示/隐藏
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

// 点击“新建活动”按钮，重置表单进入新建模式
function createNewActivity() {
	// 1. 隐藏常规标题，显示切换器
    document.getElementById('header-default-title').style.display = 'none';
    document.getElementById('btn-cancel-create').style.display = 'block';
    // 1. 保存现场
    lastSelectedActivityKey = window.currentAdminActivityKey;
    window.currentAdminActivityKey = null;

    // 2. UI 重置
    document.getElementById('admin_activity_list').querySelectorAll('.activity-card').forEach(card => card.classList.remove('active'));
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
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const startInput = document.getElementById('startDateInput');
    const endInput = document.getElementById('endDateInput');
    if(startInput) { startInput.value = today; startInput.min = today; }
    if(endInput) endInput.value = "";

    // 5. 按钮状态
    document.getElementById('btn-mode-create').style.display = 'block';
    document.getElementById('btn-mode-edit').style.display = 'none';
}

/**
 * 新建活动保存
 */
function saveAndExit() {
    // 1. 获取 DOM 元素
    const classSelect = document.getElementById('setting-class-id');
    const subjectSelect = document.getElementById('setting-act-subject');
    const nameInput = document.getElementById('setting-act-name');
    const startInput = document.getElementById('startDateInput');
    const durationInput = document.getElementById('setting-duration');
    const autoRestSwitch = document.querySelector('.toggle-row input[type="checkbox"]');

    // 2. 基础验证
    if (!classSelect.value) { alert("请选择班级！"); return; }
    if (!subjectSelect.value) { alert("请选择所属科目！"); return; }
    if (!nameInput.value.trim()) { alert("请输入活动名称！"); return; }
    if (!startInput.value) { alert("请选择开始日期！"); return; }

    let duration = parseInt(durationInput.value);
    if (!duration || duration <= 0) { alert("请输入有效的活动天数！"); return; }

    const className = classSelect.options[classSelect.selectedIndex].text;
    const activityName = nameInput.value.trim();

    // ==========================================
    // ✅ 核心修改 1：生成唯一 act_id
    // 格式：act_20260131235954
    // ==========================================
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = now.getFullYear() +
                    pad(now.getMonth() + 1) +
                    pad(now.getDate()) +
                    pad(now.getHours()) +
                    pad(now.getMinutes()) +
                    pad(now.getSeconds());
    
    const newActId = `act_${timeStr}`;

    // 3. 重名检查 (逻辑升级：只检查“未结束”的活动)
    // 如果已有同名活动但状态是 isEnd=true (已结束)，则允许重名
    const isDuplicate = window.activityList.some(item => 
        item.className === className && 
        item.activityName === activityName && 
        !item.isEnd // ✅ 关键：只有“没结束”的才会冲突
    );

    if (isDuplicate) {
        alert(`【${className}】当前有一个正在进行或未开始的“${activityName}”活动！\n\n请修改名称，或者先结束旧活动。`);
        return;
    }

    // 4. 计算结束日期
    const startDate = new Date(startInput.value);
    const endDateObj = new Date(startDate);
    endDateObj.setDate(startDate.getDate() + duration - 1);
    // ✅ 替换为 (手动拼接本地时间)：
	const yEnd = endDateObj.getFullYear();
	const mEnd = String(endDateObj.getMonth() + 1).padStart(2, '0');
	const dEnd = String(endDateObj.getDate()).padStart(2, '0');
	const endDateStr = `${yEnd}-${mEnd}-${dEnd}`;

    // ==========================================
    // ✅ 核心修改 2：存入 List 时带上 act_id
    // ==========================================
	const newActivity = {
		act_id: newActId, 
		className: className,
		activityName: activityName,
		subject: subjectSelect.value,
		startDate: startInput.value,
		totalDays: duration,
		endDate: endDateStr,
		isEnd: false,
		manualEndDate: null
	};
	
    window.activityList.push(newActivity);

    // 5. 生成天数数据 (调用通用函数，保持逻辑不变)
    const daysArray = [];
    const isAutoRest = autoRestSwitch ? autoRestSwitch.checked : false;

    for (let i = 0; i < duration; i++) {
        const currDate = new Date(startDate);
        currDate.setDate(startDate.getDate() + i);
        // ✅ 替换为：
		const y = currDate.getFullYear();
		const m = String(currDate.getMonth() + 1).padStart(2, '0');
		const d = String(currDate.getDate()).padStart(2, '0');
		const dateStr = `${y}-${m}-${d}`;
        // 调用公共生成函数
        daysArray.push(generateDayData(dateStr, isAutoRest, subjectSelect.value));
    }

    // ==========================================
    // ✅ 核心修改 3：存入 Info，Key 使用 ID
    // ==========================================
    window.activityInfo[newActId] = daysArray;
    
    // 更新全局 Key
    window.currentAdminActivityKey = newActId; 
	showToastHTML(`<div class="cm-toast-title">新活动创建成功！</div>`);
    if(typeof saveData === 'function') saveData(); 
    
    refreshAdminView();
    loadActivity(newActId); // 传入 ID 进行加载
	
	syncStudentView(newActivity);
	// 1. 隐藏顶部的 "全局/科目" 切换按钮
    const headerSwitch = document.getElementById('header-create-switch');
    if (headerSwitch) headerSwitch.style.display = 'none';

    // 2. 恢复显示 "活动设置" 默认标题
    const headerTitle = document.getElementById('header-default-title');
    if (headerTitle) headerTitle.style.display = 'block';
}
// 执行具体的“修改保存”逻辑
function saveEditedActivity() {
    // 1. 获取当前 ID
    const currentId = window.currentAdminActivityKey; // 此时它是 act_2026...
    
    // 2. 查找原始对象
    const targetItem = window.activityList.find(item => item.act_id === currentId);

    if (!currentId || !window.activityInfo[currentId] || !targetItem) {
        alert("保存失败：数据同步错误，请刷新页面重试。");
        return;
    }

    // 3. 获取表单数据
    const nameInput = document.getElementById('setting-act-name');
    const startInput = document.getElementById('startDateInput');
    const durationInput = document.getElementById('setting-duration');
    const autoRestSwitch = document.querySelector('.toggle-row input[type="checkbox"]');

    if (!nameInput.value.trim() || !startInput.value || !durationInput.value) {
        alert("请完善活动信息！");
        return;
    }

    const newActivityName = nameInput.value.trim();
    const newStartDate = startInput.value;
    const newDuration = parseInt(durationInput.value); 
    const isAutoRest = autoRestSwitch ? autoRestSwitch.checked : false; 

    // 4. 重名检查 (逻辑升级：只检查“未结束”的活动)
    // 逻辑：同班级 + 同名字 + ID不是自己 + 状态没结束
    const isDuplicate = window.activityList.some(item => 
        item.className === targetItem.className && 
        item.activityName === newActivityName && 
        item.act_id !== currentId && 
        !item.isEnd // ✅ 关键：只有“没结束”的才会冲突
    );

    if (isDuplicate) {
        alert(`当前班级下已存在名为“${newActivityName}”的活动（进行中或未开始），请换个名字！`);
        return;
    }

    // 5. 计算新的结束日期
    const startDateObj = new Date(newStartDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + newDuration - 1);
    const yEnd = endDateObj.getFullYear();
	const mEnd = String(endDateObj.getMonth() + 1).padStart(2, '0');
	const dEnd = String(endDateObj.getDate()).padStart(2, '0');
	const newEndDateStr = `${yEnd}-${mEnd}-${dEnd}`;

    // ==========================================
    // 6. 重建日期数据 (Info)
    // ==========================================
    
    // 备份旧数据的 Map，以便复用已有的打卡记录
    const oldDataMap = {};
    window.activityInfo[currentId].forEach(day => { oldDataMap[day.date] = day; });

    const newDaysArray = [];
    const currentSubject = targetItem.subject; // 从对象直接取，不依赖 DOM

    for (let i = 0; i < newDuration; i++) {
        const currDate = new Date(startDateObj);
        currDate.setDate(startDateObj.getDate() + i);
        const y = currDate.getFullYear();
		const m = String(currDate.getMonth() + 1).padStart(2, '0');
		const d = String(currDate.getDate()).padStart(2, '0');
		const dateStr = `${y}-${m}-${d}`;

        if (oldDataMap[dateStr]) {
            // ✅ 旧日期：保留原样 (包括打卡记录、奖励等)
            newDaysArray.push(oldDataMap[dateStr]);
        } else {
            // ✅ 新日期：生成默认结构
            newDaysArray.push(generateDayData(dateStr, isAutoRest, currentSubject));
        }
    }

    // ==========================================
    // 7. 保存更新 (直接修改，无需迁移 Key)
    // ==========================================

    // 更新详情数据
    window.activityInfo[currentId] = newDaysArray;

    // 更新列表元数据 (引用修改，无需 push/splice)
    targetItem.activityName = newActivityName;
    targetItem.startDate = newStartDate;
    targetItem.totalDays = newDuration;
    targetItem.endDate = newEndDateStr;
    // targetItem.act_id, className, subject 保持不变

    showToastHTML(`<div class="cm-toast-title">修改配置成功！</div>`);
    if(typeof saveData === 'function') saveData(); 
    
    refreshAdminView(); 
    loadActivity(currentId);
	
	syncStudentView(targetItem);
}

// 取消新建或取消编辑，恢复到上一个状态
function cancelCreate() {
	// 1. 恢复常规标题，隐藏切换器
    document.getElementById('header-default-title').style.display = 'block';
    document.getElementById('btn-cancel-create').style.display = 'none';
    if (lastSelectedActivityKey) {
        loadActivity(lastSelectedActivityKey);
    } else {
        refreshAdminView();
    }
}

// 手动结束当前活动
function endCurrentActivity() {
    const currentId = window.currentAdminActivityKey;
    if (!currentId) { alert("未选择任何活动！"); return; }
    
    const confirmEnd = confirm("⚠️ 确定要提前结束当前活动吗？\n\n1. 结束后的活动将立即移至【已结束】列表。\n2. 学生端将显示为已结束状态。\n3. 此操作不可撤销。");
    if (!confirmEnd) return;

    // ✅ 核心修复：直接通过 ID 查找
    const targetActivity = window.activityList.find(item => item.act_id === currentId);

    if (targetActivity) {
        targetActivity.isEnd = true;
        const now = new Date();
		targetActivity.manualEndDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        if (typeof saveData === 'function') saveData(); 
        
        alert("✅ 活动已成功结束！");
        
        // 切换到已结束 Tab 并刷新
        switchAdminTab('ended', null); 
        // 重新加载该活动（此时它已在Ended列表里）
        loadActivity(currentId);
		
		syncStudentView(targetActivity);
    } else {
        alert("❌ 错误：在列表中未找到该活动数据，请刷新页面重试。");
    }
}

// 检查所有活动是否过期并更新状态
function checkAndUpdateActivityStatus() {
    if (!window.activityList) return false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let hasChange = false;
    window.activityList.forEach(item => {
        if (!item.isEnd && item.endDate && today > item.endDate) {
            item.isEnd = true;
            hasChange = true;
        }
    });
    return hasChange;
}

// 开启/关闭批量管理模式
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
// 退出批量模式
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

// 点击网格单元格时的选中/取消逻辑
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
                    defaultTasks.push({ subject: subjKey, content: "", isBatch: false });
                });
            }
        } else {
            defaultTasks.push({ subject: subjectVal, content: "", isBatch: false});
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