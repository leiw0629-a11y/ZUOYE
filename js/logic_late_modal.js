/* 打开补交弹窗 */
function openLateModal() {
	
	const modal = document.getElementById('late-modal');
	if (modal) {
		modal.style.display = 'flex'; // 改回 flex 布局以保持居中
	}
	document.getElementById('late_task_container').innerHTML = ''; // 清空右侧作业卡片
    document.getElementById('late_student_list').innerHTML = '';   // 清空左侧学生列表
    document.getElementById('late-student-name').innerText = '';   // 清空中间的学生姓名标题
	document.getElementById('late_student_num').innerText= '无补交人员';
	const className = document.getElementById("stu_class_slc")?.value;
	if (!className) return;
	
	document.getElementById("late_class_name").textContent = className;
	
	const normalSet = getNormalLateStudents(className);
	
	const exemptSet = getExemptLateStudents(className, normalSet);
	const finalArr = mergeLateSetsToArray(normalSet, exemptSet);
	
	// 注意：mergeLateSetsToArray 返回的是 Array
	document.getElementById("late_student_num").textContent = "待补交 (" + finalArr.length + "人)";
	renderLateStudentListUI(finalArr);
}

/* 关闭补交弹窗 */
function closeLateModal() {
	const modal = document.getElementById('late-modal');
	if (modal) {
		modal.style.display = 'none'; // 隐藏
	}
}

/**
 * 4) 渲染左侧列表 UI（默认选中第一个 + 绑定点击）
 * 依赖：#late_student_list, #late_student_num
 * @param {string[]} nameArr
 */
function renderLateStudentListUI(nameArr) {
  const listEl = document.getElementById("late_student_list");
  if (!listEl) return;

  listEl.innerHTML = "";

  const arr = Array.isArray(nameArr) ? nameArr.slice() : [];
  // === ⭐⭐⭐ 新增：处理“没有人”的情况，并强制清空右侧 ⭐⭐⭐ ===
  if (arr.length === 0) {
      // 1. 左侧显示“暂无”
      listEl.innerHTML = '<div style="padding:10px; color:#999; text-align:center;">暂无补交人员</div>';
      
      // 2. 更新上方人数统计
      const numEl = document.getElementById("late_student_card");
      if (numEl) numEl.textContent = "待补交 (0人)";
      // 3. 核心修复：清空右侧残留的旧作业数据
      const rightContainer = document.getElementById('late_task_container');
      if (rightContainer) rightContainer.innerHTML = '';
      
      const titleEl = document.getElementById('late-student-name');
      if (titleEl) titleEl.innerText = ''; 
      
      const selectAllBox = document.getElementById('late_select_all');
      if (selectAllBox) selectAllBox.checked = false;

      return; // 结束函数，不再往下执行
  }
  // ========================================================
  // 按中文首字母排序
  arr.sort((a, b) => a.localeCompare(b, 'zh-CN'));

  arr.forEach((name, idx) => {
    const item = document.createElement("div");
    item.className = "late-student-item";
    if (idx === 0) item.classList.add("active"); // 默认选中第一个
    item.textContent = name;

    // 绑定点击事件（右侧渲染在 onLateStudentClick 里做）
    item.onclick = function () {
      onLateStudentClick(this);
    };

    listEl.appendChild(item);
  });
	// ✅ 自动触发第一个人的右侧渲染
  const firstItem = listEl.querySelector(".late-student-item");
  if (firstItem) {
    onLateStudentClick(firstItem);
  }
  const numEl = document.getElementById("late_student_num");
  if (numEl) numEl.textContent = "待补交 (" + arr.length + "人)";
}

/**
 * 1) 今日正常缺交名单（只看今天的 batch tasks）
 * @param {string} className
 * @param {string} today YYYY-MM-DD
 * @returns {Set<string>} 学生姓名集合
 */
// ====== 兼容你最新 tasks 结构：不再依赖 isBatch ======
// 只要这天 dayType=0（休息）就跳过；否则 tasks 全部参与缺交判定
function getNormalLateStudents(className) {
    const normalLateSet = new Set();
    const maxDays = window.defaultConfig?.maxMakeupDays ?? 1; // 获取最大追溯天数
	
    // 1. 获取班级下的所有活动
    const classActivities = (window.activityList || []).filter(
        act => act.className === className
    );
    if (!classActivities.length) return normalLateSet;

    // 2. 准备学生名单（为了性能，我们先拿到所有学生，下面直接遍历）
    const classStudents = (window.students || []).filter(
        s => s.className === className
    );
	
    // 3. 开始遍历：活动 -> 日期 -> 学生
    // 这种层级最适合做“短路”优化，因为最内层是学生
    
    classActivities.forEach(activity => {
        const actId = activity.act_id;
        const actInfo = window.activityInfo?.[actId];
        if (!actInfo) return;
		
        // 遍历该活动下的每一天
        actInfo.forEach(dayInfo => {
            // --- A. 快速过滤无效日期 ---
            
            // 1. 休息日没作业，直接跳过
            if (dayInfo.dayType === 0) return;
			
            // 2. 检查是否有 Batch 任务（如果没有批量任务，那天就不需要查缺交）
            const tasks = dayInfo.tasks || [];
            // 优化：先看一眼有没有 isBatch=true 的任务，没有就别往下走了
            const hasBatchTask = tasks.some(t => String(t.isBatch) === 'true');
            if (!hasBatchTask) return;
			// 没问题
            // 3. ⭐ 时间窗口检查 ⭐
            const daysPassed = getUsedMakeupDays(dayInfo.date, actInfo);
            // 如果是未来(-1) 或者 或者 过去的天数 >= 配置的天数 (例如: 1 >= 1，昨天就被拦住了)
            if (daysPassed === -1 || daysPassed >= maxDays) return;

            // --- B. 准备数据对比 ---
            
            // 获取这一天该活动的实际提交记录
            const daySubs = window.submissionData?.[actId]?.[dayInfo.date] || [];

            // --- C. 遍历学生（核心短路逻辑）---
            
            classStudents.forEach(stu => {
                const stuName = stu.studentName;

                // ⭐ 极致优化：如果这个学生已经在名单里了，直接跳过！
                // 这意味着我们不需要再查他的其他日期、其他作业了。
                if (normalLateSet.has(stuName)) return;

                // 检查这一天的所有任务
                for (const task of tasks) {
                    if (String(task.isBatch) !== 'true') continue;

                    const subject = task.subject || "";
                    const content = task.content || "";

                    // 在提交记录里找
                    const hasSubmitted = daySubs.some(sub => {
                        if (sub.name !== stuName) return false;
                        if ((sub.subject || "") !== subject) return false;
                        const subTask = sub.task || "";
                        return content ? subTask === content : true;
                    });

                    // 只要发现一个没交
                    if (!hasSubmitted) {
                        normalLateSet.add(stuName);
                        break; // 停止查该学生的当前天任务（因为已经进名单了）
                               // 配合最外层的 normalLateSet.has 判断，实际上也停止了查该学生的其他天
                    }
                }
            });
        });
    });
	
    return normalLateSet;
}

/**
 * 2) 请假欠补名单（扫历史 exemptStudents，不限日期；仍只看 batch tasks）
 * 说明：如果学生已在 normalLateSet 中，直接跳过（左侧已显示，无需重复算）
 * @param {string} className
 * @param {Set<string>} normalLateSet
 * @returns {Set<string>} 学生姓名集合
 */
function getExemptLateStudents(className, normalLateSet) {
  const exemptLateSet = new Set();

  const classActivities = (window.activityList || []).filter(
    act => act.className === className
  );
  if (!classActivities.length) return exemptLateSet;

  classActivities.forEach(activity => {
    const actId = activity.act_id;
    const actInfo = window.activityInfo?.[actId];
    if (!actInfo) return;

    actInfo.forEach(dayInfo => {
      const dateStr = dayInfo.date;

      const exemptList = dayInfo.exemptStudents || [];
      if (!exemptList.length) return;

      const tasks = dayInfo.tasks || [];
      if (!tasks.length) return;

      const daySubs = window.submissionData?.[actId]?.[dateStr] || [];

      exemptList.forEach(stuName => {
        // 已在正常缺交名单里的，不再算请假欠补
        if (normalLateSet && normalLateSet.has(stuName)) return;
        if (exemptLateSet.has(stuName)) return;

        // 👉 与右侧一致：逐 task 判断，只要发现一个未交即可
        for (const task of tasks) {
          if (String(task.isBatch) !== 'true') continue;

          const subject = task.subject || "";
          const content = task.content || "";

          const hasSubmitted = daySubs.some(sub => {
            if (sub.name !== stuName) return false;
            if ((sub.subject || "") !== subject) return false;

            const subTask = sub.task || "";
            return content ? subTask === content : true;
          });

          // 发现一个未交 task → 记为请假欠补
          if (!hasSubmitted) {
            exemptLateSet.add(stuName);
            break; // short-circuit
          }
        }
      });
    });
  });

  return exemptLateSet;
}

/**
 * 3) 合并去重：normal + exempt -> Array
 * @param {Set<string>} normalLateSet
 * @param {Set<string>} exemptLateSet
 * @returns {string[]} 最终名单数组
 */
function mergeLateSetsToArray(normalLateSet, exemptLateSet) {
  const merged = new Set();
  if (normalLateSet) normalLateSet.forEach(n => merged.add(n));
  if (exemptLateSet) exemptLateSet.forEach(n => merged.add(n));
  return Array.from(merged);
}
let taskMap = new Map();

function onLateCardClick(el) {
	// 1. 找到父级卡片
    const card = el.closest('.late-card');

    if (el.checked) {
        card.classList.add('selected');
        
        // (可选优化：如果所有子选项都手动勾上了，顺便把全选框也勾上)
        const allBoxes = document.querySelectorAll('#late_task_container .late-card-check');
        const checkedBoxes = document.querySelectorAll('#late_task_container .late-card-check:checked');
        const allCheck = document.querySelector('.late-checkbox-all input');
        if (allCheck && allBoxes.length === checkedBoxes.length) {
            allCheck.checked = true;
        }

    } else {
        card.classList.remove('selected');

        // =========== 🟢 新增：只要取消了一个，全选框就必须取消 ===========
        const allCheck = document.querySelector('.late-checkbox-all input');
        if (allCheck) {
            allCheck.checked = false;
        }
        // ============================================================
    }

    // 2. 更新统计
    updateSelectedStats();
}

function onLateStudentClick(el) {
  taskMap = new Map();
  document
    .querySelectorAll("#late_student_list .late-student-item")
    .forEach(item => item.classList.remove("active"));

  el.classList.add("active");

  const studentName = el.textContent.trim();
  document.getElementById("late-student-name").textContent = studentName;

  const box = document.getElementById("late_task_container");
  if (!box) return;

  box.innerHTML = "";

  // 各自拿数据
  const normalTasks = getNormalLateTasks(studentName);
  const exemptTasks = getExemptLateTasks(studentName);

  // 合并 + 去重
  const finalTasks = dedupeLateTasks([
    ...normalTasks,
    ...exemptTasks
  ]);
  finalTasks.sort((a, b) => b.date.localeCompare(a.date));
  // 渲染
  finalTasks.forEach(task => {
	  box.insertAdjacentHTML("beforeend", buildLateCardHTML(task));

	  const cardEl = box.lastElementChild; // ✅ 真正的 DOM
	  const checkbox = cardEl.querySelector(".late-card-check"); // 获取复选框

		// =========== 🟢 新增下面这段代码 ===========
		cardEl.onclick = function(e) {
			// 1. 如果点的是“立即补交”按钮，或者是复选框自己，就什么都不做（避免冲突）
			if (e.target.closest('.late-card-footer') || e.target === checkbox) return;

			// 2. 否则手动切换勾选状态
			checkbox.checked = !checkbox.checked;
			
			// 3. 触发变色逻辑
			onLateCardClick(checkbox);
		};
		// =========== 🟢 新增结束 ===========
	  cardEl
		.querySelector(".late-card-footer")
		.onclick = () => handleLateSubmit(task);
	  cardEl.querySelector(".late-card-check").onclick = function() { onLateCardClick(this); };
	  taskMap.set(cardEl, task);
	});
	 
  document.getElementById("late_student_card").innerText= "待补交("+finalTasks.length+")";
  // 1. 获取全选复选框
  const allCheck = document.querySelector('.late-checkbox-all input');
  
  if (allCheck) {
      // 2. 切换学生时，强制把全选框取消勾选 (重置状态)
      allCheck.checked = false;

      // 3. 绑定点击事件
      allCheck.onclick = function() {
          const isChecked = this.checked; // 获取全选框当前是勾还是不勾
          
          // 获取当前所有卡片里的复选框
          const cardChecks = document.querySelectorAll('#late_task_container .late-card-check');
          
          cardChecks.forEach(check => {
              check.checked = isChecked; // 1. 同步勾选状态
              onLateCardClick(check);    // 2. 触发变色函数 (让卡片变黄/变白)
          });
      };
  }
  updateSelectedStats();
}

// ====== 本地日期 YYYY-MM-DD（不要用 toISOString）======
function getLateLocalYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
	正常补交
*/
function getNormalLateTasks(studentName) {
  const className = document.getElementById("stu_class_slc")?.value;
  if (!className) return [];

  // 获取配置：默认为1 (代表仅限今天)
  const maxDays = window.defaultConfig?.maxMakeupDays ?? 1; 

  const result = [];

  // 1. 获取班级活动
  const activities = (window.activityList || []).filter(
    a => a.className === className 
    // a.isEnd !== true // (可选：如果你希望已结束的活动也能补交，就不要这行；如果要屏蔽已结束活动，就加上)
  );

  activities.forEach(activity => {
    const actId = activity.act_id;
    const actInfo = window.activityInfo?.[actId];
    if (!actInfo) return;

    // === ⭐ 核心修改：遍历所有日期，而不是只看今天 ===
    actInfo.forEach(dayInfo => {
        // 1. 休息日没作业，直接跳过
        if (dayInfo.dayType === 0) return;

        // 2. 检查该日是否有 Batch 任务 (没有批量任务的日期不需补交)
        const tasks = dayInfo.tasks || [];
        if (!tasks.some(t => t.isBatch === true)) return;

        // 3. 计算距离今天过了几天
        const daysPassed = getUsedMakeupDays(dayInfo.date, actInfo);

        // 4. 判定有效期
        // 逻辑：
        // 如果是未来 (-1) -> 跳过
        // 如果 daysPassed >= maxDays -> 跳过 (例如设置1，昨天是1，1>=1 成立，昨天被拦截，只剩今天)
        if (daysPassed === -1 || daysPassed >= maxDays) return;

        // --- 以下为原有的查重逻辑，保持不变 ---
        
        // 获取那一天的提交记录
        const subs = window.submissionData?.[actId]?.[dayInfo.date] || [];

        tasks.forEach(task => {
            // 安全兜底
            if (task.isBatch !== true) return;

            const subject = task.subject || "";
            const content = task.content || "";

            const hasSubmitted = subs.some(sub => {
                if (sub.name !== studentName) return false;
                if ((sub.subject || "") !== subject) return false;
                const subTask = sub.task || "";
                return content ? subTask === content : true;
            });

            // 没交 -> 加入结果数组
            if (!hasSubmitted) {
                result.push({
                    act_id: actId,
                    date: dayInfo.date, // 这里的 date 是任务原本的日期 (如 9月30日)
                    subject,
                    content,
                    activity
                });
            }
        });
    });
  });

  // 按日期倒序排列 (让最新的任务显示在最上面，旧任务在下面)
  // 如果想按时间正序，把 b 和 a 换个位置即可
  result.sort((a, b) => b.date.localeCompare(a.date));

  return result;
}

// 请假补交
function getExemptLateTasks(studentName) {
  const className = document.getElementById("stu_class_slc")?.value;
  if (!className) return [];

  const result = [];

  const activities = (window.activityList || []).filter(
    a => a.className === className && a.isEnd !== true
  );

  activities.forEach(activity => {
    const actId = activity.act_id;
    const actInfo = window.activityInfo?.[actId];
    if (!actInfo) return;

    actInfo.forEach(dayInfo => {
      if (dayInfo.dayType === 0) return;
      if (!(dayInfo.exemptStudents || []).includes(studentName)) return;

      const date = dayInfo.date;
      const subs = window.submissionData?.[actId]?.[date] || [];

      (dayInfo.tasks || []).forEach(task => {
        // 安全兜底
        if (task.isBatch !== true) return;

        const subject = task.subject || "";
        const content = task.content || "";

        const hasSubmitted = subs.some(sub => {
          if (sub.name !== studentName) return false;
          if ((sub.subject || "") !== subject) return false;
          const subTask = sub.task || "";
          return content ? subTask === content : true;
        });

        if (!hasSubmitted) {
          result.push({
            act_id: actId,
            date,
            subject,
            content,
            activity
          });
        }
      });
    });
  });

  return result;
}

// 去重
function dedupeLateTasks(taskArr) {
  const map = new Map();

  taskArr.forEach(t => {
    const key = `${t.act_id}|${t.date}|${t.subject}|${t.content}`;
    if (!map.has(key)) {
      map.set(key, t);
    }
  });

  return Array.from(map.values());
}

// 拼接
function buildLateCardHTML(task) {
  const { activity, date, subject, content } = task;

  const title = activity.activityName || "";
  const range = activity.startDate && activity.endDate
    ? `${activity.startDate}~${activity.endDate}`
    : "";

  const tag = content ? `${subject}·${content}` : subject;

  return `
    <div class="late-card"
         data-act-id="${task.act_id}"
         data-date="${date}"
         data-subject="${subject}"
         data-content="${content}">
      <div class="late-card-header">
        <input type="checkbox" class="late-card-check">
        <div class="late-card-title">${title}</div>
      </div>
      <div class="late-card-body">
        <div class="late-range-text">${range}</div>
        <div class="late-clean-row">
          <span class="late-date-text">${date}</span>
        </div>
        <div class="late-tag-subject">${tag}</div>
      </div>
      <div class="late-card-footer">
        <span>立即补交</span>
      </div>
    </div>
  `;
}

/**
 * 单个任务补交逻辑
 * 修复：增加查重逻辑，防止因双击或UI延迟导致的重复录入
 */
function handleLateSubmit(task, isSilent = false) {
    const nameEl = document.getElementById("late-student-name");
    const studentName = nameEl ? nameEl.innerText.trim() : "";
    
    if (!studentName) {
        if(!isSilent) alert("无法获取学生姓名，请先选择学生！");
        return;
    }

    const actId = task.act_id;
    const dateKey = task.date;

    // 1. 确保数据结构存在
    if (typeof submissionData === 'undefined') return;
    if (!submissionData[actId]) submissionData[actId] = {};
    if (!submissionData[actId][dateKey]) submissionData[actId][dateKey] = [];

    // ============================================================
    // 🛡️🛡️🛡️ 核心修复：写入前的“最后一道防线” 🛡️🛡️🛡️
    // ============================================================
    const currentRecords = submissionData[actId][dateKey];
    
    // 检查是否已经存在：同一个人、同一个科目、同一个任务内容
    // 注意：补交时 task.content 可能对应记录里的 task 字段
    const isDuplicate = currentRecords.some(record => 
        record.name === studentName && 
        record.subject === (task.subject || "") &&
        (record.task || "") === (task.content || "")
    );

    if (isDuplicate) {
        console.warn(`[Late] 拦截到重复提交: ${studentName} - ${task.subject}`);
        // 如果是静默批量提交，默默跳过即可
        // 如果是手动点击，可以提示一下，或者直接假装成功刷新UI
        if (!isSilent) {
             checkAndRefreshUI(studentName);
        }
        return; 
    }
    // ============================================================

    const now = new Date();
    const finishTime = getLateLocalYMD(now) + " " + 
                       String(now.getHours()).padStart(2, '0') + ":" + 
                       String(now.getMinutes()).padStart(2, '0') + ":" + 
                       String(now.getSeconds()).padStart(2, '0');

    const newRecord = {
        "name": studentName,
        "subject": task.subject || "",
        "task": task.content || "",
        "isLate": true,
        "finishTime": finishTime,
        "note": "",
        "score": ""
    };

    submissionData[actId][dateKey].push(newRecord);

    // 调试与保存
    console.log("补交写入成功:", newRecord);
    saveData(); 

    // 如果是单个点击（非静默），提交完立刻刷新
    if (!isSilent) {
		showToastHTML(`
            <div class="cm-toast-title">补交成功！</div>
        `);
        checkAndRefreshUI(studentName); 
		switchBackgroundToStudent();
		isBatchOrLateStuReview();
    }
}

function handleBatchSubmit() {
    const checkedBoxes = document.querySelectorAll('#late_task_container .late-card-check:checked');

    if (checkedBoxes.length === 0) {
        alert("请先选择要补交的作业！");
        return;
    }

    if (!confirm(`确定要批量补交选中的 ${checkedBoxes.length} 项作业吗？`)) {
        return;
    }

    let successCount = 0;
    // 获取当前正在操作的学生名字
    const nameEl = document.getElementById("late-student-name");
    const studentName = nameEl ? nameEl.innerText.trim() : "";

    checkedBoxes.forEach(checkbox => {
        const cardEl = checkbox.closest('.late-card');
        const task = taskMap.get(cardEl);
        
        if (task) {
            // 开启静默模式提交，不弹窗，不刷新
            handleLateSubmit(task, true);
            successCount++;
        }
    });	
	
	saveData();
	// 提示成功 (可选，根据你的UI风格决定是否需要 alert)
	if (typeof showToastHTML === 'function') {
		switchBackgroundToStudent();
		isBatchOrLateStuReview();
        showToastHTML(`
            <div class="cm-toast-title">成功批量补交 ${successCount} 项作业！</div>
        `);
    } else {
		switchBackgroundToStudent();
		isBatchOrLateStuReview();
        alert(`成功批量补交 ${successCount} 项作业！`);
    }
	
    if (studentName) {
        checkAndRefreshUI(studentName);
    }
}

/**
 * 新增核心逻辑：判断刷新右边还是左边
 * 对应你的思路：提交后检查该学员是否还有未完成项
 */
function checkAndRefreshUI(studentName) {
    // 1. 重新计算该学生剩余的任务 (这是最准确的，比数 DOM 靠谱)
    const normalTasks = getNormalLateTasks(studentName);
    const exemptTasks = getExemptLateTasks(studentName);
    
    // 合并去重后的剩余数量
    const remainingTasks = dedupeLateTasks([...normalTasks, ...exemptTasks]);

    if (remainingTasks.length > 0) {
        // === 情况 A: 还有作业没交 ===
        const activeItem = document.querySelector("#late_student_list .late-student-item.active");
        if (activeItem) {
            onLateStudentClick(activeItem); 
        }
    } else {
        // === 情况 B: 全部交完了 ===
        openLateModal();
    }
}

/**
 * 统计当前选中的任务数量，并更新界面文字
 */
function updateSelectedStats() {
    // 1. 获取所有被勾选的复选框
    const count = document.querySelectorAll('#late_task_container .late-card-check:checked').length;
    
    // 2. 找到 ID 为 late_student_change 的元素并修改值
    const spanEl = document.getElementById('late_student_change');
    if (spanEl) {
        spanEl.innerText = "已选: " + count;
    }
}

/**
 * 辅助函数：计算 targetDate 距离今天消耗了多少个“有效补交额度”
 * @param {string} targetDate - 任务日期 "YYYY-MM-DD"
 * @param {Array} dayList - 该活动下的所有日期配置 (window.activityInfo[actId])
 * @returns {number} 消耗天数 (-1代表未来, 0代表今天, >0代表过去的天数)
 */
function getUsedMakeupDays(targetDate, dayList) {
    const today = getLateLocalYMD();
    if (targetDate > today) return -1; // 未来的任务
    if (targetDate === today) return 0; // 今天的任务
	
    // 统计从 targetDate(不含) 到 today(含) 之间，有多少个“非休息日”
    let usedDays = 0;
    
    // 我们只需要遍历那些“在目标日期之后”且“不晚于今天”的日子
    for (const dayItem of dayList) {
        const d = dayItem.date;
        if (d > targetDate && d <= today) {
            // ⭐ 核心：只有非休息日(dayType!=0)才消耗额度
            // 如果是休息日，usedDays 不增加，相当于时间“冻结/顺延”了
            if (dayItem.dayType !== 0) {
                usedDays++;
            }
        }
    }
    return usedDays;
}