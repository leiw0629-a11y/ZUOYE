

function openDayConfig(dateStr) {
    if (window.isBatchMode) {
        toggleBatchCell(dateStr); 
        return; 
    }
    
    // 1. 获取 ID
    const currentId = window.currentAdminActivityKey;
    if (!currentId || !window.activityInfo[currentId]) {
        alert("数据异常：未找到活动数据，请刷新重试！");
        return;
    }

    // 2. ✅ 获取活动实体对象 (这是获取班级名的唯一正确方式)
    const currentActivity = window.activityList.find(item => item.act_id === currentId);
    if (!currentActivity) {
        alert("错误：在列表中找不到当前活动详情");
        return;
    }

    const daysData = window.activityInfo[currentId];
    const index = daysData.findIndex(d => d.date === dateStr);

    if (index === -1) {
        return;
    }

    window.currentEditingDayIndex = index;
    window.isBatchMode = false; 

    if (typeof ensureModalInDOM === 'function') ensureModalInDOM();
    if (typeof switchModalPanel === 'function') switchModalPanel('rules');

    const titleEl = document.getElementById('modalTitle');
    if(titleEl) titleEl.innerText = `⚙️ Day ${index + 1} (${dateStr})`;

    const dayData = daysData[index];
    
    // ✅ 核心修复：直接从对象取班级名，而不是 split 字符串
    const className = currentActivity.className;

    // ================== 数据回显 ==================

    // DayType
    const radios = document.querySelectorAll('input[name="dayType"]');
    radios.forEach(r => r.checked = false);
    const targetRadio = document.querySelector(`input[name="dayType"][value="${dayData.dayType}"]`);
    if(targetRadio) targetRadio.checked = true;

    if (typeof toggleRestModeUI === 'function') toggleRestModeUI(dayData.dayType === 0);
    
    radios.forEach(radio => {
        radio.onchange = function() {
            const isRest = (this.value == "0"); 
            if (typeof toggleRestModeUI === 'function') toggleRestModeUI(isRest);
            if (isRest && typeof switchModalPanel === 'function') switchModalPanel('rules'); 
        };
    });

    // 奖品
    const rewardInputs = document.querySelectorAll('.dm-reward-box input[type="text"]');
    if (dayData.dayType === 2 && dayData.rewardData) {
        if(rewardInputs[0]) rewardInputs[0].value = dayData.rewardData.studentView || "";
        if(rewardInputs[1]) rewardInputs[1].value = dayData.rewardData.teacherView || "";
    } else {
        if(rewardInputs[0]) rewardInputs[0].value = "神秘大奖✨";
        if(rewardInputs[1]) rewardInputs[1].value = "";
    }

    // 科目和名单
    if (typeof renderSubjectPanel === 'function') renderSubjectPanel(dayData.tasks);
    
    // ✅ 传入正确的 className
    if (typeof renderModalStudentList === 'function') renderModalStudentList(className, dayData.exemptStudents);

    // 显示弹窗
    const modal = document.getElementById('gridModal');
    if (modal) modal.style.display = 'flex';

    // ✅ 按钮状态 (也是通过 currentActivity 判断)
    const saveBtn = document.querySelector('.dm-btn-save');
    if (saveBtn) {
        if (currentActivity.isEnd) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = "活动已结束";
            saveBtn.style.backgroundColor = "#CCCCCC"; 
            saveBtn.style.cursor = "not-allowed";   
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = "💾保存配置";
            saveBtn.style.backgroundColor = ""; 
            saveBtn.style.cursor = "pointer";
        }
    }
}

function openBatchConfig() {
    // 1. 校验是否选择了日期
    if (window.batchSelectedDates.size === 0) {
        alert("请先点击格子选择日期！");
        return;
    }

    const currentId = window.currentAdminActivityKey;
    if (!currentId) return;

    const currentActivity = window.activityList.find(item => item.act_id === currentId);
    if (!currentActivity) {
        console.error("数据错乱：找不到活动对象");
        return;
    }
    const className = currentActivity.className;

    // 2. 确保弹窗存在
    if (typeof ensureModalInDOM === 'function') {
        ensureModalInDOM();
    }

    // 3. 重置为 "规则设置" 面板
    if (typeof switchModalPanel === 'function') {
        switchModalPanel('rules');
    }

    // 4. 设置标题
    const titleEl = document.getElementById('modalTitle');
    if(titleEl) titleEl.innerText = `⚙️ 批量修改 (已选 ${window.batchSelectedDates.size} 天)`;

    // ================== 5. 强制重置表单状态 (不回填，只重置) ==================

    // A. 规则：默认选中 "普通作业日" (value=1)
    const radios = document.querySelectorAll('input[name="dayType"]');
    radios.forEach(r => r.checked = false);
    const normalRadio = document.querySelector(`input[name="dayType"][value="1"]`);
    if(normalRadio) normalRadio.checked = true;

    // UI 联动：确保不是休息日的状态
    if (typeof toggleRestModeUI === 'function') {
        toggleRestModeUI(false); 
    }

    // B. 奖品：清空输入框
    const rewardInputs = document.querySelectorAll('.dm-reward-box input[type="text"]');
    rewardInputs.forEach(input => input.value = "");

    // C. 科目：【关键】传入空数组，依靠 renderSubjectPanel 内部的 isBatchMode 判断来全开开关
    if (typeof renderSubjectPanel === 'function') {
        renderSubjectPanel([]); 
    }

    // D. 名单：传入空数组 []，renderModalStudentList 会默认显示所有人为“正常”(绿色)
    if (typeof renderModalStudentList === 'function') {
        renderModalStudentList(className, []);
    }

    // 6. 显示弹窗
    const modal = document.getElementById('gridModal');
    if (modal) modal.style.display = 'flex';
}

function renderModalStudentList(className, exemptStudents) {
    // 1. 找到容器并清空
    const container = document.querySelector('.dm-grid-container');
    if (!container) return; // 基础防呆，防止页面没加载完报错
    container.innerHTML = ""; 

	const searchInput = document.querySelector('.dm-search-input');
    if (searchInput) {
        searchInput.value = ""; // 清空文字
    }

    // 2. 准备数据 (做最基础的数据容错，防止 undefined 报错)
    const safeExemptList = exemptStudents || [];
    const targetClass = String(className).trim(); 
    const sourceData = window.students || []; // 即使没数据也给个空数组，保证 filter 不报错

    // 3. 核心筛选
    const classStudents = sourceData.filter(s => {
        return String(s.className || "").trim() === targetClass;
    }).sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'));

    // 4. 遍历生成卡片
    // (如果筛选结果为空，forEach 自动不执行，无需额外判断)
    classStudents.forEach(stu => {
        const name = stu.studentName;
        
        // 判断状态
        const isExempt = safeExemptList.includes(name);
        const activeClass = isExempt ? 'excluded' : 'active';
        const statusText = isExempt ? '请假' : '正常';
        const avatarChar = name ? name[0] : "生";

        const html = `
            <div class="dm-stu-card ${activeClass}" onclick="toggleStudentStatus(this)">
                <div class="dm-avatar">${avatarChar}</div>
                <div class="dm-stu-info">
                    <div class="dm-name">${name}</div>
                    <div class="dm-status">${statusText}</div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderSubjectPanel(tasks) {
    // 1. 找到容器
    const container = document.querySelector('.dm-subject-list');
    if (!container) return;
    
    container.innerHTML = ""; // 清空

    // ================== A. 新增：筛选科目逻辑 ==================
    
    const currentId = window.currentAdminActivityKey;
    if (!currentId) return;
    
    const currentActivity = window.activityList.find(item => item.act_id === currentId);

    if (!currentActivity) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">活动数据异常</div>`;
        return;
    }

    // A2. 确定要渲染的科目列表
    let subjectsToRender = [];

    if (!window.subject || window.subject.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">请先在设置中配置科目</div>`;
        return;
    }

    if (currentActivity.subject === 'all') {
        // --- 情况1: 全科 ---
        // 显示所有全局科目
        subjectsToRender = window.subject;
    } else {
        // --- 情况2: 单科 ---
        // 只筛选出当前活动对应的那个科目
        const targetSub = window.subject.find(sub => {
            const sKey = (typeof sub === 'object') ? (sub.key || sub.id || sub.name) : sub;
            return sKey === currentActivity.subject;
        });

        // 如果找到了完整定义对象就用对象的，找不到就用字符串兜底
        if (targetSub) {
            subjectsToRender = [targetSub];
        } else {
            // 容错：万一全局设置里删了这科，但活动还留着
            subjectsToRender = [currentActivity.subject];
        }
    }

    // ================== B. 遍历渲染 (逻辑基本不变，只是源换成了 subjectsToRender) ==================
	const isBatch = window.isBatchMode === true;
     subjectsToRender.forEach(sub => {
        // 解析 Key 和 显示名称
        let displayTxt, storageKey;
        if (typeof sub === 'object' && sub !== null) {
            displayTxt = sub.name || sub.key; 
            storageKey = sub.name || sub.key || sub.id; 
        } else {
            displayTxt = sub;
            storageKey = sub;
        }

        let hasTask, val1, val2, val3;

        if (isBatch) {
            // ✅ 批量模式：强制开启开关，但内容留空
            hasTask = true; 
            val1 = "";
            val2 = "";
            val3 = "";
        } else {
            // 普通模式：根据 tasks 数据回显
            const myTasks = tasks.filter(t => t.subject === storageKey);
            hasTask = myTasks.length > 0;
            val1 = myTasks[0] ? myTasks[0].content : "";
            val2 = myTasks[1] ? myTasks[1].content : "";
            val3 = myTasks[2] ? myTasks[2].content : "";
        }
        
        // 准备 UI 状态
        const checkedAttr = hasTask ? 'checked' : '';
        const disabledClass = hasTask ? '' : 'disabled'; 
        const disabledAttr = hasTask ? '' : 'disabled';  

        // --- 生成 HTML ---
        const rowHtml = `
            <div class="dm-subject-row ${disabledClass}" data-key="${storageKey}">
                <div class="dm-subject-ctrl">
                    <label class="dm-switch">
                        <input type="checkbox" ${checkedAttr} onchange="toggleSubjectInputs(this)">
                        <span class="dm-slider"></span>
                    </label>
                    <span class="dm-subj-name">${displayTxt}</span>
                </div>
                <div class="dm-subject-inputs">
                    <input type="text" class="dm-input-mini" placeholder="作业项 1" value="${val1}" ${disabledAttr}>
                    <input type="text" class="dm-input-mini" placeholder="作业项 2" value="${val2}" ${disabledAttr}>
                    <input type="text" class="dm-input-mini" placeholder="作业项 3" value="${val3}" ${disabledAttr}>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', rowHtml);
    });
}



/**
 * 辅助：关闭弹窗
 * (此函数名对应 tpl_modal.js 中的 onclick="closeGridModal()")
 */
function closeGridModal() {
    const modal = document.getElementById('gridModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // 可以在这里做一些清理工作，比如清空当前索引
    // window.currentEditingDayIndex = null; 
}

/**
 * 辅助：将 tpl_modal.js 中的字符串注入到 body 中
 * 保证页面里只有一个 id="gridModal"
 */
function ensureModalInDOM() {
    // 如果页面上已经有弹窗了，就不重复添加
    if (document.getElementById('gridModal')) {
        return;
    }

    // 检查模板是否加载
    if (!window.AppTemplates || !window.AppTemplates.modalPopup) {
        alert("错误：未找到模态框模板，请检查 tpl_modal.js 是否引入！");
        return;
    }

    // 将模板字符串插入到 body 最后
    document.body.insertAdjacentHTML('beforeend', window.AppTemplates.modalPopup);
}

// 预留：切换面板的函数 (tpl_modal.js 中绑定的 onclick)
function switchModalPanel(panelId) {
    // 1. 处理左侧导航激活态 (UI 变色)
    document.querySelectorAll('.dm-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById('nav-btn-' + panelId);
    if(activeBtn) activeBtn.classList.add('active');

    // 2. 处理右侧面板显示 (核心修复)
    document.querySelectorAll('.dm-panel').forEach(panel => {
        // A. 移除激活类
        panel.classList.remove('active'); 
        // B. ✅【关键修复】强制隐藏所有面板，防止旧面板残留
        panel.style.display = 'none'; 
    });
    
    // 3. 显示目标面板
    const targetPanel = document.getElementById('panel-' + panelId);
    if(targetPanel) {
        targetPanel.classList.add('active'); 
        targetPanel.style.display = 'block'; // 显示当前选中的
    }
}

function autoSelectReward() {
    const rewardRadio = document.getElementById('cfg-dt-reward');
    if (rewardRadio) {
        rewardRadio.checked = true;
    }
}

/**
 * 需求2：科目开关切换
 * 效果：取消时整行变灰(disabled)，开启时变亮
 */
function toggleSubjectInputs(checkbox) {
    // 1. 找到当前行
    const row = checkbox.closest('.dm-subject-row');
    if (!row) return;

    // 2. 找到行内所有的文本框
    const inputs = row.querySelectorAll('input[type="text"]');

    if (checkbox.checked) {
        // -> 打开：移除灰色，启用输入框
        row.classList.remove('disabled'); 
        inputs.forEach(input => input.disabled = false);
    } else {
        // -> 关闭：添加灰色，禁用输入框
        row.classList.add('disabled');
        inputs.forEach(input => {
            input.disabled = true;
            // 可选：关闭时是否清空输入框？
            // input.value = ""; // 如果你想关闭时保留内容以便后悔，就注释掉这行
        });
    }
}

/**
 * 需求3：学生状态切换
 * 效果：点击卡片，在 正常(active) 和 请假(excluded) 之间切换
 */
function toggleStudentStatus(card) {
    const statusText = card.querySelector('.dm-status');

    // 如果当前是正常状态，切换为请假
    if (card.classList.contains('active')) {
        card.classList.remove('active');
        card.classList.add('excluded'); // 变灰
        if(statusText) statusText.innerText = "请假";
    } 
    // 如果当前是请假状态，切换为正常
    else {
        card.classList.remove('excluded');
        card.classList.add('active');   // 变绿
        if(statusText) statusText.innerText = "正常";
    }
}

function saveGridConfig() {
    // 1. 获取当前活动Key
    const key = window.currentAdminActivityKey;
    if (!key || !window.activityInfo[key]) {
        console.error("保存失败：丢失活动数据");
        return;
    }

    const daysData = window.activityInfo[key];

    // ================== A. 从弹窗 DOM 中提取数据 ==================
    
    // 1. DayType (规则)
    let newDayType = 1;
    const selectedRadio = document.querySelector('input[name="dayType"]:checked');
    if (selectedRadio) {
        newDayType = parseInt(selectedRadio.value);
    }

    let newRewardData = null;
    let newTasksFromUI = []; // 临时存放UI数据，不包含 isBatch
    let newExemptList = [];

    // 2. 提取详细数据
    if (newDayType !== 0) {
        // --- 提取奖品 ---
        if (newDayType === 2) {
            const rewardInputs = document.querySelectorAll('.dm-reward-box input[type="text"]');
            newRewardData = {
                studentView: rewardInputs[0] ? rewardInputs[0].value.trim() : "神秘大奖",
                teacherView: rewardInputs[1] ? rewardInputs[1].value.trim() : ""
            };
        }

        // --- 提取科目作业 (仅提取 subject 和 content) ---
        const rows = document.querySelectorAll('.dm-subject-list .dm-subject-row');
        rows.forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            const subjKey = row.getAttribute('data-key');
            
            // 只有当开关被【勾选】时，才保存该科目
            if (checkbox && checkbox.checked && subjKey) {
                let hasCustomInput = false; 
                const inputs = row.querySelectorAll('.dm-subject-inputs input');
                
                inputs.forEach(input => {
                    const val = input.value.trim();
                    if (val) {
                        newTasksFromUI.push({ subject: subjKey, content: val });
                        hasCustomInput = true;
                    }
                });
                
                // 开关开了但没填内容，存占位符
                if (!hasCustomInput) {
                    newTasksFromUI.push({ subject: subjKey, content: "" });
                }
            }
        });

        // --- 提取请假名单 ---
        const excludedCards = document.querySelectorAll('#panel-attendance .dm-stu-card.excluded');
        excludedCards.forEach(card => {
            const nameEl = card.querySelector('.dm-name');
            if (nameEl) {
                newExemptList.push(nameEl.innerText.trim());
            }
        });
    }

    // ================== ✅ 核心修改：定义合并函数 ==================
    // 作用：将 UI 的新内容与旧数据的 isBatch 字段合并
    const mergeWithOldIsBatch = (uiTasks, oldTasks) => {
        return uiTasks.map(uiTask => {
            // 在旧数据中找同一个科目的任务
            const oldTask = oldTasks ? oldTasks.find(t => t.subject === uiTask.subject) : null;
            // 如果找到了，保留原来的 isBatch；没找到(可能是新加的科目)则给默认值 "false"
            const preservedIsBatch = (oldTask && oldTask.isBatch) ? oldTask.isBatch : "false";
            
            return {
                subject: uiTask.subject,
                content: uiTask.content,
                isBatch: preservedIsBatch // 👈 关键：原封不动保留
            };
        });
    };

    // ================== B. 判断模式进行保存 ==================

    if (window.isBatchMode) {
        if (window.batchSelectedDates.size === 0) {
            alert("未选择任何日期");
            return;
        }
        // 遍历所有选中的日期
        window.batchSelectedDates.forEach(dateStr => {
            // 在原数据中找到对应的那一天
            const targetDay = daysData.find(d => d.date === dateStr);
            
            if (targetDay) {
                targetDay.dayType = newDayType;

                if (newDayType === 0) {
                    targetDay.tasks = [];
                    targetDay.exemptStudents = [];
                    targetDay.rewardData = null;
                } else {
                    // ✅ 使用合并函数：保留 targetDay 原有的 isBatch
                    targetDay.tasks = mergeWithOldIsBatch(newTasksFromUI, targetDay.tasks);
                    
                    targetDay.exemptStudents = JSON.parse(JSON.stringify(newExemptList));
                    targetDay.rewardData = newRewardData ? JSON.parse(JSON.stringify(newRewardData)) : null;
                }
            }
        });

        exitBatchMode();

    } else {
        const dayIndex = window.currentEditingDayIndex;
        if (dayIndex === null) return;

        const dayData = daysData[dayIndex];
        
        dayData.dayType = newDayType;
        if (newDayType === 0) {
            dayData.tasks = [];
            dayData.exemptStudents = [];
            dayData.rewardData = null;
        } else {
            // ✅ 使用合并函数：保留 dayData 原有的 isBatch
            dayData.tasks = mergeWithOldIsBatch(newTasksFromUI, dayData.tasks);
            
            dayData.exemptStudents = newExemptList;
            dayData.rewardData = newRewardData;
        }
    }

    // ================== C. 收尾工作 ==================
    saveData();       
    renderGrid(key);  
    closeGridModal(); 
    showToastHTML(`
            <div class="cm-toast-title">修改成功</div>
        `);
    const currentActObj = window.activityList.find(item => item.act_id === key);
    if (currentActObj) {
        syncStudentView(currentActObj);
    }
}

/**
 * 辅助：根据是否休息日，控制导航栏按钮的状态
 * @param {Boolean} isRest - true=休息日, false=其他
 */
function toggleRestModeUI(isRest) {
    // 1. 根据你的 tpl_modal.js 文件，ID 确定是这两个：
    const btnSubject = document.getElementById('nav-btn-subjects');   // 科目作业按钮
    const btnAttend = document.getElementById('nav-btn-attendance');  // 请假管理按钮

    // 2. 统一控制开关
    if (isRest) {
        // -> 休息日：全部变灰禁用
        if (btnSubject) btnSubject.classList.add('disabled');
        if (btnAttend) btnAttend.classList.add('disabled');
    } else {
        // -> 工作日：恢复正常
        if (btnSubject) btnSubject.classList.remove('disabled');
        if (btnAttend) btnAttend.classList.remove('disabled');
    }
}

/**
 * ✅ 新增：学生名单搜索过滤
 * 触发方式：tpl_modal.js 中的 input oninput 事件
 */
function filterStudentList(input) {
    // 1. 获取输入内容并去除首尾空格
    const searchText = input.value.trim();
    
    // 2. 获取所有学生卡片
    const cards = document.querySelectorAll('.dm-grid-container .dm-stu-card');

    // 3. 遍历判断
    cards.forEach(card => {
        const nameEl = card.querySelector('.dm-name');
        if (nameEl) {
            const name = nameEl.innerText;
            
            // 简单包含匹配 (如果需要支持拼音首字母搜索需要引入额外库，这里仅做汉字匹配)
            if (name.includes(searchText)) {
                // 匹配成功：显示 (移除行内 display:none，恢复 CSS 定义的 display:flex)
                card.style.display = ''; 
            } else {
                // 匹配失败：隐藏
                card.style.display = 'none';
            }
        }
    });
}