
/**
 * 数据结构
 * @param {string} actId - 活动ID
 * @param {string} dateStr - 日期 "2026-01-31"
 * @param {string} studentName - 学生姓名 "孙悦"
 * @param {string} subjectName - 科目 "语文"
 * @param {string} taskName - 任务详情 (可选，没有传空字符串)
 * @param {boolean} isLate - 是否补交标记
 * @param {string} note - 暂时留空
 * @param {string} score - 暂时留空
 */
 
/** 全局存储对象
window.submissionData = {
  
  第一层 key: act_id (活动唯一ID)
  "act_170670001": { 
    
    第二层 key: date (日期字符串 YYYY-MM-DD)
    "2026-01-31": [
      
      第三层: 当天、该活动下的所有提交记录
      {
        "name": "张三",          // [核心] 学生姓名
        "subject": "数学",       // [核心] 科目
        "task": "口算20道",      // [核心] 细分任务 (若无细分则为空字符串 "")
        "isLate": false,        // [状态] true=补交, false=按时
        "finishTime": 2026-01-05 23:23:23, // [数据] 实际操作的时间戳
        "note": "",             // [预留] 备注
        "score": ""             // [预留] 分数
      },
      ... 其他学生的记录
    ],
    
    ... 其他日期的记录
    "2026-02-01": [] 
  }
};
*/

// 全局变量，记录当前选中的是第几个任务，方便修改状态
window.currentTaskIndex = -1; 
// 全局变量，记录当前选中的任务日期，方便定位
window.currentTaskDate = ""; 
// 请假人员名单
window.currentBatchExemptList = window.currentBatchExemptList || [];

// 切换视图状态
function toggleBatchPicker() {
    const sidebar = document.getElementById('batch-sidebar');
    sidebar.classList.toggle('is-picking');
}

function selectBatchActivity(el, name, actId) {
	
	const selectAllBtn = document.getElementById('btn-select-all');
    if (selectAllBtn) selectAllBtn.checked = false;
	
    // 1. UI 选中态
    document.querySelectorAll('.batch-act-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    document.getElementById('batch-curr-name').innerText = name;
    window.currentBatchActId = actId;

    // 2. 关闭选择面板
    toggleBatchPicker();
    
    // 3. 🚀 核心联动：重新渲染该活动的科目
    renderBatchSubjects(actId); 
}

// 打开批量录入弹窗
function openBatchModal() {
    const modal = document.getElementById('batch-modal');
    const classSelect = document.getElementById('stu_class_slc'); 
    const className = classSelect ? classSelect.value : '未选择班级';
    
    document.getElementById('batch_header_class_name').innerText = className;
	// renderBatchClassStudents(className);
	
	renderBatchActivities(className);

    modal.style.display = 'flex';
}

function renderBatchActivities(className) {
    const container = document.getElementById('batch_activity_list_container');
    container.innerHTML = ''; // 清空

    // 1. 获取本地时间字符串 (YYYY-MM-DD)
    // 这样能确保和你录入的 startDate (也是字符串) 进行精准对比
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
  
	
    const validActivities = window.activityList.filter(act => {
    
    if (act.className !== className) return false;
    if (act.isEnd) return false;
    
    // 3. 【核心修正】开始时间判定
	// 直接比较字符串: "2026-02-01" <= "2026-02-08"
	// 这样可以彻底规避 new Date() 带来的时区干扰
	return act.startDate <= todayStr;
});
	
    // 2. 渲染逻辑
    if (validActivities.length > 0) {
        validActivities.forEach((act, index) => {
            // ✅ 修改点：不再计算剩余天数，直接拼接日期范围
            const dateRange = `${act.startDate} ~ ${act.endDate}`;

            // ⚠️注意：onclick 中传了 act_id
            const itemHtml = `
                <div class="batch-act-item ${index === 0 ? 'active' : ''}" 
                     onclick="selectBatchActivity(this, '${act.activityName}', '${act.act_id}')">
                    <div class="batch-act-status ongoing"></div>
                    <div class="batch-act-info">
                        <div class="batch-act-name">${act.activityName}</div>
                        <div class="batch-act-meta">${dateRange}</div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
        });

        // 3. 默认选中第一个
        const firstAct = validActivities[0];
        document.getElementById('batch-curr-name').innerText = firstAct.activityName;
        window.currentBatchActId = firstAct.act_id;
        
        // 🚀 核心联动：渲染该活动的科目
        renderBatchSubjects(firstAct.act_id);
        
        // 确保侧边栏显示的是科目列表
        document.getElementById('batch-sidebar').classList.remove('is-picking');

    } else {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">无进行中活动</div>`;
        document.getElementById('batch-curr-name').innerText = '无活动';
        document.getElementById('batch_subject_list_container').innerHTML = '';
		document.getElementById('batch-student-container').innerHTML = '';
        window.currentBatchActId = null;
    }
}

function renderBatchSubjects(actId) {
    const container = document.getElementById('batch_subject_list_container');
    container.innerHTML = '';
    document.getElementById('batch-student-container').innerHTML = '';
	// --- 1. 新增：获取当前班级名称 (用于重新渲染学生) ---
    const classNameEl = document.getElementById('batch_header_class_name');
    const currentClassName = classNameEl ? classNameEl.innerText : '';
    // const dateDisplay = document.querySelector('.batch-date-text');

    // 1. 获取活动数据
    const actDays = window.activityInfo[actId];
    if (!actDays) {
        container.innerHTML = `<div style="padding:10px; color:#999;">未找到活动数据</div>`;
        return;
    }

    // 2. 【核心修改】直接锁定今天，不再回溯
    // 获取当前的 YYYY-MM-DD 字符串
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
	const dateDisplay = document.getElementById('batch_task_date_display');
	const weekDay = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()]; // 获取星期几
	dateDisplay.innerText = `${y}年${parseInt(m)}月${parseInt(d)}日 (周${weekDay}) 应交作业`;
	dateDisplay.style.color = "#5D4037";
	
    // 直接在数据中查找“今天”的配置
    // 如果你的逻辑是“只要今天有配置且不是休息日”，可以保留 dayType 判断
    // 但通常“今天”有数据就应该显示，哪怕是空的
    const targetDayData = actDays.find(item => item.date === todayStr);
	
    // 3. 渲染逻辑
	if (targetDayData && targetDayData.tasks && targetDayData.tasks.length > 0) {
		// --- 2. 新增：如果有任务，确保学生列表存在 (防止之前被清空) ---
        if(currentClassName) {
             renderBatchClassStudents(currentClassName);
        }
        
		// 保存当前操作的日期，为了后面保存数据用
		window.currentTaskDate = targetDayData.date; 

		renderBatchLeaveInfo(targetDayData.exemptStudents);
		resetBatchSelection();
		// 1. 分离任务：未完成(active) 和 已完成(done)
		const activeTasks = [];
		const doneTasks = [];

		targetDayData.tasks.forEach((task, index) => {
			// 给每个任务临时绑定原始索引，方便后续定位修改
			task._originIndex = index; 
			
			if (task.isBatch === true) {
				doneTasks.push(task);
			} else {
				activeTasks.push(task);
			}
		});

        // 2. 定义渲染单个Item的辅助函数
        const createItemHtml = (task, isDone, isFirstActive) => {
		const displayName = task.content ? `${task.subject} ${task.content}` : task.subject;
		const icon = task.subject.includes('数学') ? '📐' : 
					 task.subject.includes('英语') ? '🔤' : '📖';
		
		const activeClass = (!isDone && isFirstActive) ? 'active' : '';
		const doneClass = isDone ? 'done' : '';

		// --- ⬇️ 新增代码开始 ⬇️ ---
		// 如果已完成，添加 tooltip 属性
		const tooltipAttr = isDone ? 'data-tooltip="今日已录入，补交请去【补交窗口】"' : '';
		// --- ⬆️ 新增代码结束 ⬆️ ---
		
		return `
			<div class="batch-subject-item ${activeClass} ${doneClass}" 
				 ${tooltipAttr} 
				 onclick="selectBatchSubject(this, ${task._originIndex}, ${isDone}, '${displayName}')">
				<span>${icon} ${displayName} ${isDone ? '(已录)' : ''}</span>
			</div>
		`;
	};

        // 3. 先渲染未完成的
        if (activeTasks.length > 0) {
            activeTasks.forEach((task, i) => {
                container.insertAdjacentHTML('beforeend', createItemHtml(task, false, i === 0));
            });
            // 默认选中第一个未完成的任务
            // 初始化选中状态
            window.currentTaskIndex = activeTasks[0]._originIndex;
			const firstTask = activeTasks[0];
			const firstTaskName = firstTask.content 
				? `${firstTask.subject} ${firstTask.content}` 
				: firstTask.subject;
			const titleEl = document.getElementById('batch_toolbar_subject_name');
			if(titleEl) titleEl.innerText = firstTaskName;
        }

        // 4. 后渲染已完成的 (沉底)
        doneTasks.forEach(task => {
            container.insertAdjacentHTML('beforeend', createItemHtml(task, true, false));
        });

        if (activeTasks.length === 0 && doneTasks.length > 0) {
            // 如果全是已完成的
            window.currentTaskIndex = -1; // 没有可操作的任务
            // 可以在右侧显示“今日任务全部录入完毕”
        }

    } else {
        // ⬇️⬇️⬇️ 3. 修改 else 分支：清空列表和状态 ⬇️⬇️⬇️
        container.innerHTML = `<div style="padding:10px; color:#999;">无作业任务</div>`;
        
        // 修改标题
        const titleEl = document.getElementById('batch_toolbar_subject_name');
        if (titleEl) titleEl.innerText = "暂无活动";

        // 【关键修复】清空右侧学生容器
        const studentContainer = document.getElementById('batch-student-container'); 
        if (studentContainer) studentContainer.innerHTML = ''; 

        // 【关键修复】清空人数统计
        const countSpan = document.getElementById('batch-student-count');
        if (countSpan) countSpan.innerText = '';
        
        renderBatchLeaveInfo([]); 
        resetBatchSelection();
    }
}

function renderBatchClassStudents(className) {
    // 1. 获取容器和计数器对象 (ID加了 batch- 前缀)
    const container = document.getElementById('batch-student-container'); 
    const countSpan = document.getElementById('batch-student-count'); 

    if (!container) return;

    // 清空现有内容
    container.innerHTML = '';

    // 2. 筛选学生
    // window.students 结构: [{ className, groupName, studentName }, ...]
    const students = window.students || [];
    const classStudents = students.filter(s => s.className === className).sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'));
	
    // 3. 更新人数统计
    if (countSpan) {
        countSpan.innerText = `全班${classStudents.length}`;
    }
	classStudents.sort((a, b) => a.studentName.localeCompare(b.studentName, 'zh-CN'));
    // 4. 渲染胶囊
    if (classStudents.length > 0) {
        classStudents.forEach(stu => {
            const capsule = document.createElement('div');
            // 保持原有css类名
            capsule.className = 'batch-student-capsule'; 
            capsule.innerText = stu.studentName;
            
            // 动态绑定点击事件：切换 active 状态
            capsule.onclick = function() {
                this.classList.toggle('active');
                updateBatchActualCount(); 
            };

            container.appendChild(capsule);
        });
    } else {
        container.innerHTML = `<div style="padding:10px; color:#999; width:100%; text-align:center;">暂无学生数据</div>`;
    }
}


/**
 * @param {HTMLElement} el 点击的元素
 * @param {number} taskIndex 任务在数组中的原始索引
 * @param {boolean} isDone 是否已完成
 */
function selectBatchSubject(el, taskIndex, isDone, fullName) {
    if (isDone) {
        return; 
    }

    // 1. UI 变色
    document.querySelectorAll('.batch-subject-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    // 2. 更新全局索引
    window.currentTaskIndex = taskIndex;
    const titleEl = document.getElementById('batch_toolbar_subject_name');
    if (titleEl) titleEl.innerText = fullName;
    

    resetBatchSelection();
}

// 关闭弹窗
function closeBatchModal() {
	document.getElementById('batch-modal').style.display = 'none';
}

/**
 * 渲染请假/免做人员信息
 * @param {Array<string>} exemptList - 请假学生姓名数组
 */
function renderBatchLeaveInfo(exemptList) {
	window.currentBatchExemptList = exemptList || [];
    const container = document.getElementById('batch-leave-container');
    const countSpan = document.getElementById('batch-leave-count');
    const listContainer = document.getElementById('batch-leave-list');
    const divider = document.getElementById('batch-leave-divider');

    // 容错处理
    if (!container || !countSpan || !listContainer || !divider) return;

    if (window.currentBatchExemptList.length > 0) {
        container.style.display = ''; 
        divider.style.display = '';
        countSpan.innerText = `请假${window.currentBatchExemptList.length}`;
        listContainer.innerHTML = ''; 
        window.currentBatchExemptList.forEach(name => {
            const span = document.createElement('span');
            span.innerText = name;
            listContainer.appendChild(span);
        });
    } else {
        container.style.display = 'none';
        divider.style.display = 'none';
    }
	updateBatchExpectedCount();
}

/**
 * 🚀 新增：全选/取消全选逻辑
 * @param {boolean} isChecked - 复选框是否被勾选
 */
function toggleBatchSelectAll(isChecked) {
    const container = document.getElementById('batch-student-container');
    if (!container) return;

    const capsules = container.querySelectorAll('.batch-student-capsule');
    const exemptList = window.currentBatchExemptList || [];

    capsules.forEach(capsule => {
        const studentName = capsule.innerText.trim();

        // 如果学生在请假名单中，跳过不处理（或强制移除选中态）
        if (exemptList.includes(studentName)) {
            capsule.classList.remove('active'); 
            return;
        }

        // 普通学生根据全选按钮状态切换
        if (isChecked) {
            capsule.classList.add('active');
        } else {
            capsule.classList.remove('active');
        }
    });
	updateBatchActualCount();
}

/**
 * 🚀 新增：更新实交人数统计及样式
 * 逻辑：实交人数 >= (全班人数 - 请假人数) ? 变绿 : 变红
 */
function updateBatchActualCount() {
    // 1. 获取显示组件
    const actualEl = document.getElementById('batch-actual-count');
    const totalEl = document.getElementById('batch-student-count');
    if (!actualEl || !totalEl) return;
    // 2. 获取数据
    // 从 "全班40" 中截取数字
    const totalCount = parseInt(totalEl.innerText.replace('全班', '')) || 0;
    // 获取请假人数
    const exemptCount = (window.currentBatchExemptList || []).length;
    // 获取当前页面上选中的胶囊数量
    const selectedCount = document.querySelectorAll('.batch-student-capsule.active').length;

    // 3. 更新文本
    actualEl.innerText = `实交${selectedCount}`;

    // 4. 更新样式 (判断逻辑)
    // 目标及格线 = 总人数 - 请假人数
    const targetThreshold = totalCount - exemptCount;

    if (selectedCount >= targetThreshold) {
        // 达标：变绿 (active)
        actualEl.classList.remove('danger');
        actualEl.classList.add('active');
    } else {
        // 未达标：变红 (danger)
        actualEl.classList.remove('active');
        actualEl.classList.add('danger');
    }
}

/**
 * 🚀 新增：通用重置函数
 * 作用：清空全选框、清空学生选中态、重置实交人数
 */
function resetBatchSelection() {
    // 1. 重置全选框
    const selectAllBtn = document.getElementById('btn-select-all');
    if (selectAllBtn) selectAllBtn.checked = false;

    // 2. 移除所有胶囊的选中态
    document.querySelectorAll('.batch-student-capsule').forEach(capsule => {
        capsule.classList.remove('active');
    });

    // 3. 立即重置“实交”统计 (归零)
    updateBatchActualCount();
}

function updateBatchExpectedCount() {
    const totalEl = document.getElementById('batch-student-count');
    const expectedEl = document.getElementById('batch-expected-count');
    
    if (!totalEl || !expectedEl) return;

    // 1. 获取全班人数 (从 "全班40" 中提取数字)
    const totalCount = parseInt(totalEl.innerText.replace(/[^\d]/g, '')) || 0;
    // 2. 获取请假人数
    const exemptCount = (window.currentBatchExemptList || []).length;
    // 3. 计算应交 (防止负数)
    const expectedCount = Math.max(0, totalCount - exemptCount);

    // 4. 更新文本
    expectedEl.innerText = `应交${expectedCount}`;
}

/**
 * 提交批量录入
 * 修复：增加防重逻辑，防止同一人同一任务被重复写入
 */
function finishBatchEntry() {
    // --- 1. 获取上下文变量 ---
    const actId = window.currentBatchActId; // 活动ID
    const dateStr = window.currentTaskDate; // 日期 YYYY-MM-DD
    const taskIdx = window.currentTaskIndex; // 任务索引

    // 防御性检查
    if (!actId || !dateStr || taskIdx === undefined || taskIdx === -1) {
        alert("请先选择一个作业任务");
        return;
    }

    // --- 2. 获取任务详情 ---
    const actData = window.activityInfo[actId];
    const dayData = actData.find(item => item.date === dateStr);
    if (!dayData) {
        alert("未找到当日活动数据");
        return;
    }
    const currentTaskObj = dayData.tasks[taskIdx];
    
    // 提取任务特征，用于后续比对
    const targetSubject = currentTaskObj.subject;
    const targetContent = currentTaskObj.content || "";

    // --- 3. 获取选中的学生名单 ---
    const selectedCapsules = document.querySelectorAll('#batch-student-container .batch-student-capsule.active');
    if (selectedCapsules.length === 0) {
        alert('没有选中任何学生，请选择后再提交');
        return;
    }
    const selectedNames = Array.from(selectedCapsules).map(el => el.innerText.trim());

    // --- 4. 准备数据容器 ---
    if (!window.submissionData) window.submissionData = {};
    if (!window.submissionData[actId]) window.submissionData[actId] = {};
    if (!window.submissionData[actId][dateStr]) window.submissionData[actId][dateStr] = [];

    // 获取当前已有的所有记录（用于查重）
    const existingRecords = window.submissionData[actId][dateStr];

    // --- 5. 生成提交记录并写入 (核心修复区域) ---
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    let addedCount = 0; // 记录实际新增的数量

    selectedNames.forEach(name => {
        // 🛑 查重逻辑 🛑
        // 检查数组里是否已经有一条记录同时满足：同一个学生、同一个科目、同一个任务内容
        const isDuplicate = existingRecords.some(record => 
            record.name === name &&
            record.subject === targetSubject &&
            (record.task || "") === targetContent
        );

        if (isDuplicate) {
            // 如果已存在，直接跳过，不要 push
            console.log(`[Batch] 跳过重复记录: ${name} - ${targetSubject}`);
            return; 
        }

        // 只有不重复才生成新记录
        const record = {
            "name": name,
            "subject": targetSubject,
            "task": targetContent,
            "isLate": false,
            "finishTime": timeStr,
            "note": "",
            "score": ""
        };
        
        window.submissionData[actId][dateStr].push(record);
        addedCount++;
    });

    // --- 6. 标记任务状态 ---
    // 只要有录入行为（或者本来就是追加录入），就标记为已完成
    currentTaskObj.isBatch = true; 

    // --- 7. 刷新界面 & 反馈 ---
    renderBatchSubjects(actId);
    
    // 提示
    if (addedCount > 0) {
        showToastHTML(`
            <div class="cm-toast-title">成功录入 ${addedCount} 人</div>
        `);
    } else {
        // 如果 addedCount 为 0，说明选中的人都已经录入过了
        showToastHTML(`
            <div class="cm-toast-title">选中的学生已存在，无新增</div>
        `);
    }
    saveData();
	switchBackgroundToStudent();
	isBatchOrLateStuReview();
}
