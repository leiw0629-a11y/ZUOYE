
// 点击“新建全局活动”时触发，初始化右侧表单
function startNewGlobalActivity() {
    // --- A. 获取 DOM 元素 ---
    const formContainer = document.getElementById('global-form-container'); 
    const actionArea = document.getElementById('global-action-area');       
    const createMode = document.getElementById('global-mode-create');       
    const editMode = document.getElementById('global-mode-edit');           
    const emptyRight = document.getElementById('global-empty-right'); 
    const cancelBtn = document.getElementById('global-btn-cancel'); // 右上角的取消X号
	// title按钮一栏
	const filterGroup = document.getElementById('filter_group');
    const rewardBtn = document.getElementById('btn_reward_settings');
    const divider = document.querySelector('.toolbar-divider'); // 可选：中间那条竖线如果不隐藏会很怪，建议顺手也藏了
	
    // ============================================================
	// 移出左侧列表active样式
	document.querySelectorAll('.activity-card.active').forEach(el => {
        el.classList.remove('active');
    });
	if (filterGroup) filterGroup.style.display = 'none';
	if (rewardBtn)   rewardBtn.style.display = 'none';
	if (divider)     divider.style.display = 'none'; // 可选
    // --- B. 视图切换 (UI Logic) ---
    // 1. 隐藏右侧空状态
    if (emptyRight) emptyRight.style.display = 'none';

    // 2. 显示表单容器和底部按钮区
    if (formContainer) formContainer.style.display = 'block';
    if (actionArea) actionArea.style.display = 'flex';

    // 3. 切换按钮模式：显示“新建”，隐藏“编辑”
    if (createMode) createMode.style.display = 'block';
    if (editMode) editMode.style.display = 'none';
    
    // 4. 显示右上角的取消按钮 (对应 HTML 中的 global-btn-cancel)
    if (cancelBtn) cancelBtn.style.display = '';

    // --- C. 数据重置 (Data Reset) - 你要求的三个步骤 ---
	
	const classSelect = document.getElementById('global-class-select');
    if (classSelect) {
        classSelect.value = '';      // 清空之前的选择
        classSelect.disabled = false; // ✅ 关键：一定要解锁，不然用户点不了！
    }

    // 1. 填充班级下拉框 (调用你提供的工具函数)
    // 确保 renderAdminClassSelect 已经在当前作用域可访问
    if (typeof renderAdminClassSelect === 'function') {
        renderAdminClassSelect('global-class-select');
    }

    // 2. 清空活动标题
    const titleInput = document.getElementById('global-title');
    if (titleInput) {
        titleInput.value = '';
    }

    // 3. 清空容器内容 (累计活动 & 续签活动)
    const accContainer = document.getElementById('accumulate-activity-container');
    const contContainer = document.getElementById('continuous-activity-container');
    
    // 这里将其 innerHTML 设为空字符串即可移除里面的 task-capsule-item
    if (accContainer) accContainer.innerHTML = '';
    if (contContainer) contContainer.innerHTML = '';

    // (可选补充) 为了保险起见，建议也清空下方的“已选科目活动”和计数器，防止残留
    const subContainer = document.getElementById('sub-activity-container');
    const subCount = document.getElementById('sub-activity-count');
    if (subContainer) subContainer.innerHTML = ''; 
    if (subCount) subCount.innerText = '0';
	// 4. 设置顶部标题
    const mainTitle = document.getElementById('global-main-title');
    if (mainTitle) mainTitle.innerText = '活动配置中';

    // 5. 清空左侧列表并显示提示
    const activityMap = document.getElementById('activity_map');
    if (activityMap) {
        activityMap.innerHTML = `
            <div style="grid-column:1/-1; height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#CFD8DC;">
                <div style="font-size:40px; margin-bottom:15px; opacity:0.5;">📝</div>
                <div style="font-size:14px;">请在右侧完善活动信息</div>
            </div>`;
    }
    console.log('✅ 全局活动新建模式初始化完成');
	

    // ... 中间代码不变 ...
    
    // 4. 显示右上角的取消按钮
    if (cancelBtn) {
        cancelBtn.style.display = 'block';
        
        // ✅ 【新增】强制 JS 绑定，确保事件生效
        // 这样做即使 HTML 里的 onclick 丢了，这里也会补回来
        cancelBtn.onclick = function() {
            cancelNewGlobalActivity();
        };
    }
}

// 保存新的全局活动到数组中。
function saveGlobalActivity() {
    // --- 1. 准备辅助函数与时间 ---
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    // 生成 ID 后缀 (YYYYMMDDHHmmss)
    const timeStr = now.getFullYear() +
                    pad(now.getMonth() + 1) +
                    pad(now.getDate()) +
                    pad(now.getHours()) +
                    pad(now.getMinutes()) +
                    pad(now.getSeconds());
    
    // 生成创建时间字符串 (YYYY-MM-DD HH:mm:ss)
    const createTimeStr = now.getFullYear() + '-' + 
                          pad(now.getMonth() + 1) + '-' + 
                          pad(now.getDate()) + ' ' + 
                          pad(now.getHours()) + ':' + 
                          pad(now.getMinutes()) + ':' + 
                          pad(now.getSeconds());

    // --- 2. 获取表单数据 ---
    const classSelect = document.getElementById('global-class-select');
    const titleInput = document.getElementById('global-title');
	
    
    // 获取选中的班级名称 (显示文本) 和 ID
    // 注意：根据你的数据结构，className 存的是中文名 "三年二班"
    const selectedOption = classSelect.options[classSelect.selectedIndex];
    const classNameText = selectedOption ? selectedOption.text : "";
    const classIdValue = selectedOption ? selectedOption.value : "";
    const actNameValue = titleInput.value.trim();
    
    // 🛑【新增】校验逻辑：如果是空的，或者是默认提示，就拦截
    if (!actNameValue || !classIdValue || classIdValue === '' || classSelect.value.includes('全部班级')) {
        alert("⚠️ 请先选择班级并输入活动名称！");
        return; // 直接结束，不往下执行保存
    }

    // --- 3. 构建活动对象 ---
    const newActivity = {
        "globalActId": "global_act_" + timeStr,
        "actName": actNameValue,
        "className": classNameText, // 存班级名
        "classId": classIdValue,    // 建议顺手存个ID，方便后续逻辑
        "isEnd": false,
        "createTime": createTimeStr,
        
        // 核心逻辑：新建时这三项留空，等待后续配置
        "subActivityIds": [],
        "consecutiveRules": [],
        "cumulativeRules": []
    };

    // 将新活动加入数组 (通常新建的放最前或最后，这里Push进去，渲染插到最前)
    window.globalActivityList.push(newActivity);
	saveData();
	// 赋值给全局id默认选中该ID活动
	window.currentGlobalActId = newActivity.globalActId;
	
	// --- 【新增】UI样式同步：强制左侧 Tab 切换回 "进行中" ---
    window.currentGlobalIsEndFilter = false; // 重置过滤器状态
    const tabContainer = document.getElementById('global_tab_container');
    if (tabContainer) {
        const tabs = tabContainer.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        // 假设第一个按钮是"进行中"，给它加上 active
        if (tabs[0]) tabs[0].classList.add('active');
    }

	
	refreshGlobalView();
	showToastHTML(`<div class="cm-toast-title">新建全局活动成功！</div>`);
    // 2. 渲染中间列表 (默认显示全部)
    renderCandidateActivities('all');
	// --- 【新增】UI样式同步：强制切换 Tab 高亮到 "全部" ---
    // 获取那组按钮
    const filterBtns = document.querySelectorAll('.filter-group .btn-filter');
    
    // 先移除所有按钮的 active 样式
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    // 再给第1个按钮(下标0)加上 active，因为它对应 "全部活动"
    if (filterBtns.length > 0) {
        filterBtns[0].classList.add('active');
    }
}

// ==========================================
// 1. 新增：下拉框变更事件处理函数
// ==========================================
function onAdminGlobalClassChange() {
    refreshGlobalView();
}

/**
 * 刷新全局活动左侧列表视图
 * 逻辑：读取班级筛选 -> 过滤数据 -> 排序 -> 渲染列表 -> 默认选中第一个
 */
function refreshGlobalView() {
    // 1. 获取筛选条件（下拉框值）
    const classSelect = document.getElementById('global_class_slc');
    // 如果还没渲染下拉框，默认 'all'
    const filterClass = classSelect ? classSelect.value : 'all'; 
	
	const searchInput = document.getElementById('global_search_inp');
	
	const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
	const clearBtn = document.getElementById('global_search_clear');
	
	const actionArea = document.getElementById('global-action-area');
    const formContainer = document.getElementById('global-form-container');
    const emptyRight = document.getElementById('global-empty-right');
	
	// 🌟【新增】获取当前的状态过滤设置，默认为 false (进行中)
    const filterIsEnd = (typeof window.currentGlobalIsEndFilter !== 'undefined') ? window.currentGlobalIsEndFilter : false;
	// 【新增】控制 X 按钮的显示/隐藏
    if (clearBtn) {
        // 如果搜索框有内容，就显示(block)；如果没内容，就隐藏(none)
        clearBtn.style.display = searchText.length > 0 ? 'block' : 'none';
    }
    // 2. 数据处理：过滤 + 排序
    let list = window.globalActivityList || [];
    // ✅ 修改：合并班级和搜索词的过滤逻辑
    list = list.filter(item => {
        // 1. 班级匹配
        const matchClass = (filterClass === 'all') || (item.className === filterClass);
        // 2. 搜索词匹配
        const matchSearch = (searchText === '') || (item.actName.toLowerCase().includes(searchText));
        
        // 🌟【新增】状态匹配：比较 item.isEnd 和当前选中的 Tab 状态
        // 这里的 !!item.isEnd 是为了确保它是布尔值
        const matchStatus = (!!item.isEnd === filterIsEnd);
        
        return matchClass && matchSearch && matchStatus;
    });

    // 2.2 排序：按创建时间倒序（最新的在前面）
    // 假设 createTime 格式为 "2026-02-04 23:23:23" 这种标准格式
    list.sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime);
    });

	// --- ⬇️ 新增代码开始 ⬇️ ---
    const filterGroup = document.getElementById('filter_group');
    const rewardBtn = document.getElementById('btn_reward_settings');
    const divider = document.querySelector('.toolbar-divider'); // 可选：中间那条竖线如果不隐藏会很怪，建议顺手也藏了
    // --- ⬆️ 新增代码结束 ⬆️ ---

    const listContainer = document.getElementById('global_activity_list');
    if (!listContainer) return;

    // --- 空状态处理 ---
    if (list.length === 0) {
        // 1. 左侧：显示无数据提示
        listContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #999; font-size: 13px;">
                该班级下暂无全局活动
            </div>`;

        // 3. 中间：清空列表内容
        const activityMap = document.getElementById('activity_map');
        if (activityMap) {
             activityMap.innerHTML = `
                <div style="grid-column:1/-1; height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#CFD8DC;">
                    <div style="font-size:40px; margin-bottom:15px; opacity:0.5;">📭</div>
                    <div style="font-size:14px;">暂无活动数据</div>
                </div>`;
        }

        // 4. 右侧：强制切回空状态（隐藏表单，显示空提示图标）
        const cancelBtn = document.getElementById('global-btn-cancel'); // 右上角取消按钮
		if (actionArea) actionArea.style.display = 'none';
		
		if (filterGroup) filterGroup.style.display = 'none';
        if (rewardBtn)   rewardBtn.style.display = 'none';
        if (divider)     divider.style.display = 'none'; // 可选
        if (formContainer) formContainer.style.display = 'none';
        if (actionArea) actionArea.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        // 显示“请点击左侧发布新活动”的那个空状态占位
        if (emptyRight) emptyRight.style.display = 'flex'; 

        return;
    }
	if (actionArea) actionArea.style.display = '';
	if (filterGroup) filterGroup.style.display = ''; // 恢复默认 CSS (flex)
	if (rewardBtn)   rewardBtn.style.display = '';   // 恢复默认 CSS
	if (divider)     divider.style.display = '';     // 恢复默认 CSS
	
    // 3. 构建 HTML
    let html = '';
    list.forEach(act => {
        const uniqueKey = act.globalActId;
        
        // 状态逻辑：已结束显示灰色，进行中显示绿色
        const statusColor = act.isEnd ? '#B0BEC5' : '#4CAF50'; 
        
        // 徽章逻辑：显示关联了多少个子活动
        const subCount = act.subActivityIds ? act.subActivityIds.length : 0;
        const badgeText = `已选 ${subCount} 个活动`;
		// ✅ 修改点 1：在这里判断是否为当前选中项，如果是，加上 active 类
        const isActive = (uniqueKey === window.currentGlobalActId) ? 'active' : '';
        // 您的 HTML 模板 (已修改 onclick 为 loadGlobalActivity)
        html += `
        <div class="activity-card" 
             data-key="${uniqueKey}" 
             onclick="loadGlobalActivity('${uniqueKey}')" 
             style="position: relative; padding: 12px 10px; cursor:pointer; ">
            
            <div title="状态" style="position: absolute; top: 8px; right: 8px; width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColor};"></div>
            
            <div class="act-title" style="margin-bottom: 6px; padding-right: 10px; line-height: 1.2;">
                <span style="font-size: 14px; font-weight: bold; color: #5D4037;">${act.actName}</span>
                <span style="font-size: 12px; color: #999; margin-left: 6px;">${act.className}</span>
            </div>
            
            <div class="act-meta">
                <span style="background:#E8EAF6; color:#3F51B5; font-size:11px; padding:1px 5px; border-radius:3px; font-weight: bold;">${badgeText}</span>
            </div>
        </div>
        `;
    });

    // 4. 插入 DOM
    listContainer.innerHTML = html;
	// 检查当前记录的 ID 是否还在列表中 (防止被筛选掉了)
    const currentExists = list.find(item => item.globalActId === window.currentGlobalActId);
    if (window.currentGlobalActId && currentExists) {
        // 如果当前有选中的，且还在列表里，就重新加载它 (这就相当于模拟点击)
        loadGlobalActivity(window.currentGlobalActId);
    } else if (list.length > 0) {
        // 否则才默认选中第一个
        loadGlobalActivity(list[0].globalActId);
    }
}

/**
 * 加载单个全局活动详情
 * 功能：高亮列表、回显标题、展示只读奖励、渲染中间已选卡片
 * @param {String} globalActId - 全局活动唯一ID
 */
function loadGlobalActivity(globalActId) {
    // ----------------------------------------------------
    // 1. 核心判断：是“切换新活动”还是“刷新当前活动”？
    // ----------------------------------------------------
    // 注意：必须在更新 window.currentGlobalActId 之前判断
    const isSwitching = (globalActId !== window.currentGlobalActId);

    // ----------------------------------------------------
    // UI 重置逻辑 (保持不变)
    // ----------------------------------------------------
    const createMode = document.getElementById('global-mode-create');
    const editMode = document.getElementById('global-mode-edit');
    if (createMode) createMode.style.display = 'none';
    if (editMode) editMode.style.display = 'block';

    const cancelBtn = document.getElementById('global-btn-cancel');
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    const emptyRight = document.getElementById('global-empty-right');
    const formContainer = document.getElementById('global-form-container');
    const actionArea = document.getElementById('global-action-area');
    if (emptyRight) emptyRight.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';
    if (actionArea) actionArea.style.display = 'flex';

    // ----------------------------------------------------
    // 2. 数据锚点同步
    // ----------------------------------------------------
    window.currentGlobalActId = globalActId; // 更新全局 ID

    const actData = window.globalActivityList.find(
        item => item.globalActId === globalActId
    );
    if (!actData) {
        console.error("未找到活动数据:", globalActId);
        return;
    }

    // 设置顶部主标题
    const mainTitle = document.getElementById('global-main-title');
    if (mainTitle) {
        mainTitle.innerText = `${actData.actName} (${actData.className})`;
    }

    // 左侧列表高亮
    const listContainer = document.getElementById('global_activity_list');
    if (listContainer) {
        listContainer.querySelectorAll('.activity-card')
            .forEach(card => card.classList.remove('active'));

        const targetCard = listContainer.querySelector(
            `.activity-card[data-key="${globalActId}"]`
        );
        if (targetCard) targetCard.classList.add('active');
    }

    // 渲染右侧表单
    renderRightPanelForm(actData);

    // ----------------------------------------------------
    // 3. 智能 Tab 决策 (这是你需求的核心实现)
    // ----------------------------------------------------
    let filterType = 'selected'; // 默认值

    if (isSwitching) {
        // 场景 A：切换了活动 -> 强制重置为“已选活动”
        console.log("切换活动，重置为已选视图");
        filterType = 'selected';
        window.currentGlobalFilterType = 'selected'; 
    } else {
        // 场景 B：同一个活动刷新 -> 保持当前用户的 Tab 状态
        // 如果之前没有记录状态，兜底用 selected
        filterType = window.currentGlobalFilterType || 'selected';
        console.log("刷新当前活动，保持视图:", filterType);
    }

    // ----------------------------------------------------
    // 4. 渲染中间区域
    // ----------------------------------------------------
    if (typeof renderCandidateActivities === 'function') {
        renderCandidateActivities(filterType);
    }

    // ----------------------------------------------------
    // 5. 同步中间筛选按钮的高亮状态
    // ----------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-group .btn-filter');
    if (filterBtns && filterBtns.length > 0) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        // 映射关系：all -> 0, selected -> 1, unselected -> 2
        // 注意：根据你的 HTML 顺序调整索引
        let activeIdx = 1; // 默认 selected (第2个按钮)
        
        if (filterType === 'all') activeIdx = 0;
        if (filterType === 'unselected') activeIdx = 2;
        
        if (filterBtns[activeIdx]) {
            filterBtns[activeIdx].classList.add('active');
        }
    }
}

// 辅助函数，用于在右侧面板回显表单数据
function renderRightPanelForm(actData) {
    const emptyRight   = document.getElementById('global-empty-right');
    const formContainer = document.getElementById('global-form-container');
    const actionArea   = document.getElementById('global-action-area');
    const cancelBtn    = document.getElementById('global-btn-cancel');
	
    if (emptyRight)   emptyRight.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';
    if (actionArea)   actionArea.style.display = 'flex';
    if (cancelBtn)    cancelBtn.style.display = 'none';

    // 4. --- 右侧表单回显 ---
    const titleInput = document.getElementById('global-title');
    if (titleInput) {
        titleInput.value = actData.actName || '';
        
        // ✅ 修改逻辑：根据 isEnd 状态动态控制禁用和样式
        if (actData.isEnd) {
            titleInput.disabled = true;                // 禁用输入
            titleInput.style.backgroundColor = '#F5F5F5'; // 背景变灰
            titleInput.style.cursor = 'not-allowed';   // 鼠标样式变为禁止
        } else {
            titleInput.disabled = false;               // 启用输入
            titleInput.style.backgroundColor = '#FFFFFF'; // 恢复白底
            titleInput.style.cursor = 'text';          // 恢复文字输入光标
        }
    }
	
    // ✅ 注意：这里是右侧表单的班级下拉框，不是左侧筛选
    const classSelect = document.getElementById('global-class-select');
    if (classSelect) {
        classSelect.value = actData.classId || actData.className;
        classSelect.disabled = true;
    }
	
	// ==========================================
    // 1. 回填“累计活动” (Cumulative Rules)
    // ==========================================
    const accContainer = document.getElementById('accumulate-activity-container');
    if (accContainer) {
        // 清空现有内容
        accContainer.innerHTML = ''; 
        
        // 防御性检查：确保 cumulativeRules 存在且是数组
        const accRules = actData.cumulativeRules || [];
        
        if (accRules.length === 0) {
            accContainer.innerHTML = '<div style="font-size:12px; color:#999; padding:5px;">暂无配置</div>';
        } else {
            accRules.forEach((rule, index) => {
                // 拼接文案：第1关 累计10天 奖励肯德基
                const text = `第${index + 1}关 累计${rule.target}天 奖励${rule.teacherView}`;
                
                // 生成HTML
                const itemHtml = `
                    <div class="task-capsule-item">
                        <span class="task-capsule-text">${text}</span>
                    </div>
                `;
                accContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    }
	
	// ==========================================
    // 2. 回填“续签活动” (Consecutive Rules)
    // ==========================================
    const conContainer = document.getElementById('continuous-activity-container');
    if (conContainer) {
        conContainer.innerHTML = '';
        const conRules = actData.consecutiveRules || [];

        if (conRules.length === 0) {
            conContainer.innerHTML = '<div style="font-size:12px; color:#999; padding:5px;">暂无配置</div>';
        } else {
            conRules.forEach((rule, index) => {
                // 拼接文案：第1关 连续7天 奖励肯德基
                const text = `第${index + 1}关 连续${rule.target}天 奖励${rule.teacherView}`;
                
                const itemHtml = `
                    <div class="task-capsule-item">
                        <span class="task-capsule-text">${text}</span>
                    </div>
                `;
                conContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    }
	
	// ==========================================
    // 3. 回填“已选科目活动” (Subject Activities)
    // ==========================================
    const subContainer = document.getElementById('sub-activity-container');
    const subCountSpan = document.getElementById('sub-activity-count');
    
    // 确保全局活动列表存在，防止报错
    window.activityList = window.activityList || []; 

    if (subContainer) {
        subContainer.innerHTML = '';
        const subIds = actData.subActivityIds || [];

        // 更新右上角的数量统计
        if (subCountSpan) {
            subCountSpan.innerText = subIds.length;
        }

        if (subIds.length === 0) {
            subContainer.innerHTML = '<div style="font-size:12px; color:#999; padding:5px;">未选择科目活动</div>';
        } else {
            subIds.forEach((id, index) => {
                // 在 window.activityList 中查找对应的 name
                const targetAct = window.activityList.find(item => item.act_id === id);
                // 如果找到了显示名字，找不到显示ID做兜底
                const name = targetAct ? targetAct.activityName : '未知活动';
                
                // 按要求只显示名称（为了整齐，我加了序号 "1. 名称"，如果你只要名称，可以把 index+1 去掉）
                const text = `${index + 1}. ${name}`; 

                const itemHtml = `
                    <div class="task-capsule-item">
                        <span class="task-capsule-text">${text}</span>
                    </div>
                `;
                subContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    }

    // 5. --- 底部按钮模式切换（并排显示修复） ---
    const btnCreate = document.getElementById('global-mode-create');
    const btnEdit   = document.getElementById('global-mode-edit');

    if (btnCreate) btnCreate.style.display = 'none';
    // 处理编辑区域按钮
    if (btnEdit) {
        btnEdit.style.display = 'flex';  
        btnEdit.style.gap = '10px';

        // ✅ 核心修改：判断活动是否已结束
        if (actData.isEnd) {
            // 🛑 场景1：活动已结束 -> 替换为你提供的灰色按钮代码
            btnEdit.innerHTML = `<button class="btn-full" style="background:#E0E0E0; color:#999; cursor:not-allowed; border:none; width:100%;" disabled>活动已结束</button>`;
        } else {
            // 🟢 场景2：活动进行中 -> 必须还原原本的两个功能按钮
            // (这段 HTML 来自你的 tpl 文件，确保样式和事件与之前一致)
            btnEdit.innerHTML = `
                <button class="btn-full" style="flex:1; background:#42A5F5; color:white;" onclick="saveGlobalEdit()">修改配置</button>
                <button class="btn-full" style="flex:1; background:#EF5350; color:white;" onclick="endGlobalActivity()">结束活动</button>
            `;
        }
    }
}

/**
 * 渲染中间的备选活动列表
 * @param {String} filterType - 筛选类型: 'all'(全部), 'selected'(已选), 'unselected'(未选)
 */
function renderCandidateActivities(filterType = 'all') {
    const container = document.getElementById('activity_map');
    if (!container) return console.error("找不到容器: activity_map");

    // 1. 获取当前上下文 (通过全局变量抓取)
    if (!window.currentGlobalActId) return; // 如果没有选中任何全局活动，不渲染
    container.innerHTML = '';
    const globalAct = window.globalActivityList.find(item => item.globalActId === window.currentGlobalActId);
    if (!globalAct) return;

    // 2. 准备数据
    // 目标班级 (如果是 'all' 或 '全部班级'，则不限制)
    const targetClass = globalAct.className; 
    const isGlobalClass = (targetClass === 'all' || targetClass === '全部班级');
    
    // 当前已选的子活动ID列表
    const selectedIds = globalAct.subActivityIds || [];
    
    // 获取所有科目活动源数据
    const allSubjectActs = window.activityList || [];

    // 3. 筛选数据
    const filteredList = allSubjectActs.filter(act => {
        // A. 班级过滤：必须是同班级，或者全局活动是面向全校的
        if (!isGlobalClass && act.className !== targetClass) {
            return false; 
        }

        // B. 状态过滤 (Tab切换逻辑)
        const isSelected = selectedIds.includes(act.act_id);
        if (filterType === 'selected') return isSelected;     // 只看已选
        if (filterType === 'unselected') return !isSelected;  // 只看未选
        return true; // 'all' 显示所有
    });

    // 4. 生成 HTML
    let html = '';
    if (filteredList.length === 0) {
       html = `
            <div style="grid-column:1/-1; height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#CFD8DC;">
                <div style="font-size:40px; margin-bottom:15px; opacity:0.5;">📝</div>
                <div style="font-size:14px;">还没有添加活动哦</div>
            </div>`;
    } else {
        filteredList.forEach(act => {
            // -------------------------------------------------
            // 1. 【新增】核心查重逻辑：检查该科目是否被“别人”占用了
            // -------------------------------------------------
            let isOccupied = false;
			let occupiedByName = ''; // 👈 新增：用来存那个占用了它的活动名
            if (window.globalActivityList) {
                // 遍历所有全局活动
                for (let g of window.globalActivityList) {
                    // 排除当前正在编辑的这个全局活动
                    if (g.globalActId !== window.currentGlobalActId) {
                        // 如果别的活动里包含了这个科目ID，说明被占用了
                        if (g.subActivityIds && g.subActivityIds.includes(act.act_id)) {
                            isOccupied = true;
							occupiedByName = g.actName;
                            break; // 只要找到一个占用的，就不用继续找了
                        }
                    }
                }
            }

            // -------------------------------------------------
            // 2. 准备数据和样式
            // -------------------------------------------------
            const isJoined = selectedIds.includes(act.act_id);
            const joinedTag = isJoined ? '<div class="gc-tag-joined"></div>' : ''; 
            
            // 状态文字颜色
            const statusClass = act.isEnd ? 'status-text-gray' : 'status-text-active'; 
            const statusText = act.isEnd ? '已结束' : '进行中';
            
            // 科目显示
            const subjectDisplay = (act.subject === 'all' || !act.subject) ? '全科' : act.subject;
			
            // 按钮逻辑
            let btnHtml = '';
            if (!globalAct.isEnd) {
                if (isJoined) {
                    btnHtml = `<button class="btn-remove-card" onclick="removeFromGlobal('${act.act_id}', event)">🗑️移出活动</button>`;
                } else if (isOccupied) {
                     // 🔒 如果被占用，按钮显示为灰色不可点，或者直接不显示按钮，这里为了提示明显，给个禁用的按钮
                     btnHtml = `<button class="btn-remove-card" style="cursor:not-allowed; color:#ccc;" disabled>已被【${occupiedByName || '其他活动'}】关联</button>`;
                } else {
                    btnHtml = `<button class="btn-remove-card" style="background-color:#E3F2FD; color:#1976D2;" onclick="addToGlobal('${act.act_id}', event)">➕加入活动</button>`;
                }
            }

            // -------------------------------------------------
            // 3. 组装卡片 (已加入锁头代码)
            // -------------------------------------------------
            // 如果被占用，给最外层加 is-occupied 类，方便 CSS 变灰
            const occupiedClass = isOccupied ? 'is-occupied' : '';
            // 如果被占用，插入锁头 HTML
            const lockHtml = isOccupied ? '<div class="lock-watermark">🔒</div>' : '';

            html += `
                <div class="global-card ${occupiedClass}">
                    ${lockHtml}
                    
                    <div class="gc-header">
                        <div class="gc-class-info">${act.className}</div>
                        ${joinedTag}
                    </div>

                    <div class="gc-body">
                        <div class="gc-row">
                            <span class="gc-label">活动名称</span>
                            <span class="gc-value-title">${act.activityName}</span>
                        </div>
                        <div class="gc-row">
                            <span class="gc-label">活动时间</span>
                            <span class="gc-value">${act.startDate || '--'} ~ ${act.endDate || '--'}</span>
                        </div>
                        <div class="gc-row">
                            <span class="gc-label">活动科目</span>
                            <span class="gc-value">${subjectDisplay}</span>
                        </div>
                        <div class="gc-row">
                            <span class="gc-label">活动状态</span>
                            <span class="gc-value ${statusClass}">${statusText}</span>
                        </div>
                    </div>

                    <div class="gc-footer">
                        ${btnHtml}
                    </div>
                </div>
            `;
        });
    }

    // 5. 渲染上墙
    container.innerHTML = html;
}

/**
 * 切换全局活动筛选 Tab 的点击事件处理
 * @param {String} filterType - 筛选类型: 'all', 'selected', 'unselected'
 * @param {HTMLElement} btnEl - 被点击的按钮元素(this)
 */
function switchGlobalFilter(filterType, btnEl) {
	window.currentGlobalFilterType = filterType;
    // 1. 样式处理：移除同组其他按钮的 active 类，给当前按钮添加 active
    // 获取父容器，确保只操作这一组按钮
    const parentGroup = btnEl.parentElement; 
    if (parentGroup) {
        const buttons = parentGroup.querySelectorAll('.btn-filter');
        buttons.forEach(btn => btn.classList.remove('active'));
    }
    
    // 激活当前按钮
    btnEl.classList.add('active');
    renderCandidateActivities(filterType);
}

// 将某个科目活动加入到当前全局活动中。
function addToGlobal(actId){
	if (!window.currentGlobalActId) {
        console.warn("当前没有选中的全局活动 (window.currentGlobalActId 为空)");
        return;
    }

	// ============================================================
    // 🛑 新增：冲突检测逻辑
    // ============================================================
    const conflictAct = window.globalActivityList.find(item => {
        // 1. 排除当前正在编辑的这个全局活动
        if (item.globalActId === window.currentGlobalActId) return false;
        
        // 2. 排除已结束的活动 (item.isEnd 为 true)
        if (item.isEnd) return false; 

        // 3. 检查目标活动的子列表里有没有这个 ID
        return item.subActivityIds && item.subActivityIds.includes(actId);
    });

    if (conflictAct) {
        alert(`无法添加！\n该科目活动已存在于进行中的全局活动：\n【${conflictAct.actName}】\n\n请先将其从该活动中移出。`);
        return; // ⛔️ 直接中断，不执行后面的添加代码
    }
    // ============================================================

    // 1. 在列表中找到当前正在操作的那个全局活动对象
    const currentGlobalAct = window.globalActivityList.find(item => item.globalActId === window.currentGlobalActId);

    if (currentGlobalAct) {
        // 确保 subActivityIds 数组存在
        if (!Array.isArray(currentGlobalAct.subActivityIds)) {
            currentGlobalAct.subActivityIds = [];
        }
        // 2. 避免重复添加 (只有当数组里没有这个ID时才push)
        if (!currentGlobalAct.subActivityIds.includes(actId)) {
            currentGlobalAct.subActivityIds.push(actId);
            console.log(`[成功] 已将子活动 ${actId} 加入全局活动 ${window.currentGlobalActId}`);
        } else {
            console.log(`[跳过] 子活动 ${actId} 已经在列表中了`);
        }
    } else {
        console.error("未在 globalActivityList 中找到 ID 为 " + window.currentGlobalActId + " 的活动");
    }
	saveData();
	showToastHTML(`<div class="cm-toast-title">添加成功！</div>`);
	refreshGlobalView();
}
// 将某个科目活动从当前全局活动中移出。
function removeFromGlobal(actId) {
	if (!window.currentGlobalActId) return;

    // 1. 找到当前对象
    const currentGlobalAct = window.globalActivityList.find(item => item.globalActId === window.currentGlobalActId);

    if (currentGlobalAct && Array.isArray(currentGlobalAct.subActivityIds)) {
        // 2. 查找该 actId 在数组中的索引
        const index = currentGlobalAct.subActivityIds.indexOf(actId);
        
        // 3. 如果存在，则删除
        if (index > -1) {
            currentGlobalAct.subActivityIds.splice(index, 1);
            console.log(`[成功] 已将子活动 ${actId} 移出全局活动`);
        }
    }
	saveData();
	showToastHTML(`<div class="cm-toast-title">移出成功！</div>`);
	refreshGlobalView();
}

function cancelNewGlobalActivity() {
	refreshGlobalView();
}

/**
 * 切换左侧列表的状态 Tab (进行中 / 已结束)
 * @param {Boolean} isEnd - false:进行中, true:已结束
 * @param {HTMLElement} btn - 点击的按钮元素
 */
function switchGlobalStatusTab(isEnd, btn) {
    // 1. 更新全局过滤状态变量
    window.currentGlobalIsEndFilter = isEnd;
    // 2. UI 切换高亮类 active
    const container = document.getElementById('global_tab_container');
    if (container) {
        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
    }
    // 给当前点击的按钮加上 active
    if (btn) btn.classList.add('active');

    // 3. 刷新列表显示
    refreshGlobalView();
}

// 保存修改配置（仅修改活动名称）
function saveGlobalEdit() {
    // 1. 获取当前正在编辑的 ID
    const currentId = window.currentGlobalActId;
    if (!currentId) {
        alert("未找到当前编辑的活动 ID");
        return;
    }
    // 2. 获取输入框的值
    const nameInput = document.getElementById('global-title');
    const newName = nameInput.value.trim();
    if (!newName) {
        alert("活动名称不能为空！");
        return;
    }
    const isDuplicate = window.globalActivityList.some(item => {
        return item.actName === newName && 
               item.globalActId !== currentId && 
               item.isEnd === false;
    });
    if (isDuplicate) {
        alert("该活动名称已存在（进行中），请使用其他名称！");
        return;
    }
    // 3. 找到原数据对象并修改
    const targetActivity = window.globalActivityList.find(item => item.globalActId === currentId);
    if (targetActivity) {
        targetActivity.actName = newName; // 更新名称
        // 4. 保存并刷新视图
        saveData();           // 保存到本地存储（假设你有这个通用方法）
        refreshGlobalView();  // 刷新左侧列表和界面
        showToastHTML(`<div class="cm-toast-title">修改配置成功！</div>`);
    } else {
        console.error("未在列表中找到 ID 为 " + currentId + " 的数据");
    }
}

// 结束当前活动
function endGlobalActivity() {
    const currentId = window.currentGlobalActId;
    if (!currentId) return;

    // 1. 二次确认（防止手滑）
    if (!confirm("确定要【结束】当前活动吗？\n\n注意：\n1. 结束后活动将归档，无法再编辑。\n2. 学生端将无法再看到此活动。")) {
        return;
    }

    // 2. 查找并修改数据
    const targetActivity = window.globalActivityList.find(item => item.globalActId === currentId);
    if (targetActivity) {
        // --- 核心动作 ---
        targetActivity.isEnd = true; 
        saveData(); // 保存到本地存储
        alert("操作成功！活动已结束。");
        // 3. 核心体验优化：自动切换到“已结束”列表
        // 这样用户能立刻看到刚刚结束的活动躺在列表里
        
        const endedTabBtn = document.getElementById('global-tab-ended'); // ⚠️ 请确认这里是你“已结束”按钮的ID
        
        if (endedTabBtn) {
            // 模拟点击：这会自动触发 switchGlobalTab 逻辑，刷新列表为“已结束”状态
            endedTabBtn.click(); 
        } else {
            // 如果找不到按钮（以防万一），就手动刷新当前视图，至少保证数据不出错
            console.warn("未找到 ID 为 global-tab-ended 的按钮，无法自动切换 Tab");
            refreshGlobalView();
        }
        // 4. (可选) 可以在这里把右侧清空，或者什么都不做让它保留
        // 通常切换 Tab 后，右侧会变空，这符合预期。
    } else {
        alert("未找到该活动数据，操作失败。");
    }
}