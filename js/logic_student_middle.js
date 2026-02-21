/**
 * 渲染网格 (学生端核心视图 - 修正版：保留请假逻辑)
 * @param {string} type - 'stu' | 'grd' | 'cls'
 * @param {string} name - 学生名
 * @param {string} context - 班级名
 */
function renderStudentGrid(type, name, context) {
    const container = document.getElementById('grid-container-student');
    if (!container) return;
    const actId = window.currentActivityId || window.currentBatchActId;
    
    // --- 空状态处理 ---
    if (!actId) {
        // (保持原有的空状态代码不变)
        const titleEl = document.getElementById('studentTitle');
        if (titleEl) titleEl.innerText = `${name} - (暂无活动)`;
        container.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: #B0BEC5;">
                <div style="font-size: 80px; margin-bottom: 20px;">🏖️</div>
                <div style="font-size: 18px; font-weight: bold;">当前无活动</div>
            </div>`;
        return; 
    }

    // 更新标题 (保持不变)
    const currentAct = (window.activityList || []).find(a => String(a.act_id) === String(actId));
    const actName = currentAct ? currentAct.activityName : '';
    const titleEl = document.getElementById('studentTitle');
    if (titleEl) {
        if (type === 'stu') titleEl.innerText = `${name} - ${actName}`;
        else if (type === 'grd') titleEl.innerText = `${context} ${name} - ${actName}`;
        else titleEl.innerText = `${name} - ${actName}`;
    }

    const dayDataList = window.activityInfo[actId];
    if (!dayDataList || dayDataList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: #B0BEC5;">
                <div style="font-size: 80px; margin-bottom: 20px;">🏖️</div>
                <div style="font-size: 18px; font-weight: bold;">暂无活动详情数据</div>
            </div>`;
        return;
    }

    container.innerHTML = ""; 
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const targetStudentName = (type === 'stu') ? name : null;

    // --- 核心渲染循环 ---
    dayDataList.forEach((day, index) => {
        let renderConfig = null;
		// ⭐ 修改 1: 计算周几 和 日期格式
        const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekMap[new Date(day.date).getDay()];
        const dayLabel = day.date.slice(5); // 改为 "MM-DD"

        // 1. Layer 1: 静态状态 (休息/未来)
        renderConfig = getStaticDayStatus(day, today);

        // 2. 业务逻辑 (如果静态没命中，且是具体学生)
        if (!renderConfig && targetStudentName) {
            
            // --- Layer 2: 尝试判定奖励 (仅针对奖励日) ---
            if (day.dayType === 2) {
                // 如果全勤判定成功，返回金牌配置；如果失败返回 null，继续往下走
                renderConfig = getRewardDayStatus(dayDataList, index, actId, targetStudentName);
            }

            // --- Layer 3: 常规/请假 状态判定 (兜底) ---
            if (!renderConfig) {
                const exemptList = day.exemptStudents || [];
                
                // 恢复原有的分流逻辑
                if (exemptList.includes(targetStudentName)) {
                    // A. VIP通道 (请假逻辑：只显蓝/绿)
                    renderConfig = getExemptDayStatus(day, actId, targetStudentName);
                } else {
                    // B. 普通通道 (铁面逻辑：红/黄/绿)
                    renderConfig = getBusinessDayStatus(day, actId, targetStudentName);
                }
            }
        }

        // 3. 兜底空对象
        if (!renderConfig) {
             renderConfig = {
                cellClass: "grid-cell",
                icon: "",
                statusText: "",
                holidayBadge: ""
            };
        }
		
        // 4. Layer 4: 今天高亮
        if (day.date === today) {
            renderConfig.cellClass += " is-today";
        }

       // --- 修改开始 ---
		// 1. 判断是否允许点击 (非锁定 且 非休息日)
		const isInteractive = renderConfig.type !== 'locked' && renderConfig.type !== 'holiday';

		// 2. 根据判断生成 onclick 字符串
		const clickAction = isInteractive 
			? `onclick="handleCellClick('stu', '${name}', '${context}', '${day.date}', '${actId}')"` 
			: '';
		
		// 3. 拼接 HTML (注意 ${clickAction} 的位置)
		container.innerHTML += `
            <div class="${renderConfig.cellClass}" ${clickAction}>
                <span class="day-label">${dayLabel}</span>
                ${renderConfig.holidayBadge}
                <div class="cell-icon">${renderConfig.icon}</div>
                <div class="cell-status-text">${renderConfig.statusText}</div>
                <div class="cell-date">${weekDay}</div>
            </div>`;
		// --- 修改结束 ---
    });

    // 更新完成度 (绿色+金色都算完成)
    const total = dayDataList.length;
    const doneCount = container.querySelectorAll('.done, .reward').length;
    const progressTag = document.querySelector('.progress-tag');
    if (progressTag) progressTag.innerText = `完成度 ${doneCount}/${total}`;
}

/**
 * 渲染聚合视图 (小组/班级) - 修正版：奖励日也要查缺勤
 */
function renderAggregateGrid(type, targetName) {
    const container = document.getElementById('grid-container-student');
    if (!container) return;

    const actId = window.currentActivityId;
    const selectEl = document.getElementById('stu_class_slc');
    const currentClass = selectEl ? selectEl.value : '';
    
    // 更新标题
    const titleEl = document.getElementById('studentTitle');
    const currentAct = (window.activityList || []).find(a => String(a.act_id) === String(actId));
    const actName = currentAct ? currentAct.activityName : (actId ? '' : '(暂无活动)');

    if (titleEl) {
        if (type === 'grd') titleEl.innerText = `${currentClass} · ${targetName} - ${actName}`;
        else titleEl.innerText = `${currentClass} - ${actName}`;
    }

    if (!actId) {
        // (保持之前的空状态代码不变...)
        container.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: #B0BEC5;">
                <div style="font-size: 80px; margin-bottom: 20px;">🏖️</div>
                <div style="font-size: 18px; font-weight: bold;">当前无活动</div>
            </div>`;
        return;
    }

    // 筛选成员
    let members = [];
    const allStudents = window.students || [];
    if (type === 'cls') {
        members = allStudents.filter(s => s.className === currentClass);
    } else if (type === 'grd') {
        members = allStudents.filter(s => s.className === currentClass && s.groupName === targetName);
    }

    const dayDataList = window.activityInfo[actId];
    if (!dayDataList || dayDataList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 400px; color: #B0BEC5;">
                <div style="font-size: 80px; margin-bottom: 20px;">🏖️</div>
                <div style="font-size: 18px; font-weight: bold;">暂无活动详情数据</div>
            </div>`;
        return;
    }

    container.innerHTML = ""; 
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // --- 核心渲染循环 ---
    dayDataList.forEach((day, index) => {
        // ⭐ 修改 1: 计算周几 和 日期格式
        const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekMap[new Date(day.date).getDay()];
        const dayLabel = day.date.slice(5); // 改为 "MM-DD"
        let renderConfig = null;

        // 1. Layer 1: 静态状态 (休息/未来)
        renderConfig = getStaticDayStatus(day, today);

        if (!renderConfig) {
            // 2. Layer 2: 业务聚合状态 (先铁面无私地算账)
            //    结果可能是：红(缺交) / 黄(待录入) / 蓝(全请假) / 绿(全完成)
            renderConfig = getAggregateDayStatus(day, actId, members);

            // 3. Layer 3: 奖励日特效升级 (UI Logic)
            //    逻辑：只有当"全员完成(Green)" 且 "是奖励日" 时，才升级为金色奖励
            //    意味着：如果有红(缺交)，这里 renderConfig.type 是 'danger'，不会进入此判断 -> 依然显红！
            if (renderConfig.type === 'done' && day.dayType === 2) {
                renderConfig = {
                    type: 'reward',
                    cellClass: "grid-cell reward", 
                    icon: "🎁",      // 全员拿到奖励
                    statusText: "全员达成",
                    holidayBadge: ""
                };
            }
        }

        // 兜底
        if (!renderConfig) {
             renderConfig = { cellClass: "grid-cell", icon: "", statusText: "", holidayBadge: "" };
        }
		
        // 4. Layer 4: 今天高亮
        if (day.date === today) {
            renderConfig.cellClass += " is-today";
        }

        // --- 修改开始 ---
		// 1. 判断是否允许点击
		const isInteractive = renderConfig.type !== 'locked' && renderConfig.type !== 'holiday';

		// 2. 准备参数
		const clickName = (type === 'cls') ? 'ALL' : targetName;

		// 3. 根据判断生成 onclick 字符串
		const clickAction = isInteractive 
			? `onclick="handleCellClick('${type}', '${clickName}', '${currentClass}', '${day.date}', '${actId}')"` 
			: '';

		// 4. 拼接 HTML
		container.innerHTML += `
            <div class="${renderConfig.cellClass}" ${clickAction}>
                <span class="day-label">${dayLabel}</span>
                ${renderConfig.holidayBadge}
                <div class="cell-icon">${renderConfig.icon}</div>
                <div class="cell-status-text">${renderConfig.statusText}</div>
                <div class="cell-date">${weekDay}</div>
            </div>`;
		// --- 修改结束 ---
    });

    // 统计逻辑 (把 reward 也算进完成)
    const doneCount = container.querySelectorAll('.done, .reward').length;
    const progressTag = document.querySelector('.progress-tag');
    if (progressTag) progressTag.innerText = `全员达成 ${doneCount} 天`;
}

/**
 * 辅助函数 1：获取日期静态状态
 * 处理：休息日、未开启
 */
function getStaticDayStatus(day, today) {
    if (day.dayType === 0) {
        return {
            type: 'holiday',
            cellClass: "grid-cell holiday stu-holiday-readonly",
            icon: "🏖️",
            statusText: "", 
            holidayBadge: '<div class="holiday-badge">休</div>'
        };
    } else if (day.date > today) {
        // 新增：如果是未来的奖励日 -> 画饼
        if (day.dayType === 2) {
            return {
                type: 'locked',
                cellClass: "grid-cell locked", 
                icon: "🎁",
                statusText: "待领取",
                holidayBadge: ""
            };
        }
        return {
            type: 'locked',
            cellClass: "grid-cell locked",
            icon: "🔒",
            statusText: "未开启",
            holidayBadge: ""
        };
    }
    return null;
}

/**
 * Layer 2: 奖励日状态判定 (全勤回溯 - 严格版)
 * 逻辑：
 * 1. 必须没有“待录入”的任务 (否则应该显黄)
 * 2. 从第1天到今天，所有必做任务必须全齐 (否则显红/蓝/绿)
 * 3. 只有满足以上所有条件，才显金 (🏆)
 */
function getRewardDayStatus(allDays, currentIndex, actId, studentName) {
    const isBatched = (val) => String(val) === 'true';

    // -----------------------------------------------------------
    // 🛑 关卡 1：检查“今天”是否有“待录入” (防止抢跑)
    // -----------------------------------------------------------
    // 如果今天还有老师没发布的任务(false)，必须显示“待录入(黄)”，不能给奖杯
    const currentDay = allDays[currentIndex];
    const currentTasks = currentDay.tasks || [];
    const hasUnbatchedToday = currentTasks.some(t => !isBatched(t.isBatch));
    
    if (hasUnbatchedToday) {
        return null; // 返回空 -> 外部会降级调用 getBusinessDayStatus -> 显示黄色 ⏳
    }

    // -----------------------------------------------------------
    // 🛑 关卡 2：全勤回溯 (检查历史 + 今天的所有必做任务)
    // -----------------------------------------------------------
    // 遍历从第 1 天 (i=0) 到 今天 (i=currentIndex)
    for (let i = 0; i <= currentIndex; i++) {
        const checkDay = allDays[i];
        
        // 跳过休息日
        if (checkDay.dayType === 0) continue; 

        const tasks = checkDay.tasks || [];
        // 找出当天的必做任务
        const requiredTasks = tasks.filter(t => isBatched(t.isBatch));
        
        if (requiredTasks.length > 0) {
            // 获取那天的提交记录
            const dailySubs = (window.submissionData[actId] && window.submissionData[actId][checkDay.date]) || [];
            const mySubs = dailySubs.filter(r => r.name === studentName);
            
            // 检查是否全对
            const isDayFinished = requiredTasks.every(reqTask => {
                return mySubs.some(sub => 
                    sub.subject === reqTask.subject && 
                    sub.task === reqTask.content
                );
            });

            // ❌ 只要有一天（包括今天）没做完，全勤挑战失败
            if (!isDayFinished) {
                return null; 
                // 返回空 -> 外部会降级调用 getBusinessDayStatus / getExemptDayStatus
                // 结果：如果今天没做完 -> 红/蓝；如果今天做完了但以前缺过 -> 绿
            }
        }
    }

    // -----------------------------------------------------------
    // ✅ 关卡 3：通关 (所有日子都查过了，完美)
    // -----------------------------------------------------------
    return {
        type: 'reward',
        cellClass: "grid-cell reward",
        icon: "🏆",
        statusText: "全勤奖励",
        holidayBadge: ""
    };

}

/**
 * Layer 3: 普通业务状态 (铁面无私版)
 * 逻辑：红(缺交) > 黄(待录入) > 绿(完成)
 */
function getBusinessDayStatus(day, actId, studentName) {
    const tasks = day.tasks || [];
    const isBatched = (val) => String(val) === 'true';

    // 1. 准备数据
    const allDailySubs = (window.submissionData[actId] && window.submissionData[actId][day.date]) || [];
    const mySubs = allDailySubs.filter(r => r.name === studentName);

    // ------------------------------------------------------------
    // 🛑 优先级 1：红色判断 (Danger - 缺交)
    // 逻辑：不管是请假还是生病，只要老师发布了(isBatch=true)，没交就是红。
    // ------------------------------------------------------------
    const requiredTasks = tasks.filter(t => isBatched(t.isBatch));
    
    const hasMissingTask = requiredTasks.some(reqTask => {
        const isSubmitted = mySubs.some(sub => 
            sub.subject === reqTask.subject && 
            sub.task === reqTask.content
        );
        return !isSubmitted; 
    });

    if (hasMissingTask) {
        return {
            type: 'danger',
            cellClass: "grid-cell danger",
            icon: "💣", // 或者 ❌
            statusText: "缺交",
            holidayBadge: ""
        };
    }

    // ------------------------------------------------------------
    // ⏳ 优先级 2：黄色判断 (Warning - 待录入)
    // 逻辑：所有必做任务都交了(或者没有必做)，但有任务老师还没录入。
    // ------------------------------------------------------------
    const hasUnbatched = tasks.some(t => !isBatched(t.isBatch));

    if (hasUnbatched) {
        return {
            type: 'warning',
            cellClass: "grid-cell warning",
            icon: "⏳",
            statusText: "待录入",
            holidayBadge: ""
        };
    }

    // ------------------------------------------------------------
    // ✅ 优先级 3：绿色判断 (Done - 已完成)
    // 逻辑：必做全交了，也没什么待录入的了。
    // ------------------------------------------------------------
    return {
        type: 'done',
        cellClass: "grid-cell done",
        icon: "🌟",
        statusText: "已完成",
        holidayBadge: ""
    };
}

/**
 * 计算聚合状态 (短板效应 + 剔除请假)
 * @param {Object} day - 日期对象
 * @param {string} actId - 活动ID
 * @param {Array} members - 需要计算的学生对象列表
 */
function getAggregateDayStatus(day, actId, members) {
    const tasks = day.tasks || [];
    const exemptList = day.exemptStudents || [];
    const isBatched = (val) => String(val) === 'true';

    // 1. 【剔除请假】计算有效考勤人员
    // 如果某个学生在当天的 exemptStudents 名单里，他不参与“短板”计算
    const effectiveMembers = members.filter(m => !exemptList.includes(m.studentName));

    // 2. 【全员请假】判定
    if (effectiveMembers.length === 0) {
        return {
            type: 'exempt',
            cellClass: "grid-cell exempt",
            icon: "☕",
            statusText: "全员请假",
            holidayBadge: ""
        };
    }

    // 准备数据：获取当天的所有提交
    const dailySubs = (window.submissionData[actId] && window.submissionData[actId][day.date]) || [];
    
    // 找出必做任务
    const requiredTasks = tasks.filter(t => isBatched(t.isBatch));

    // 3. 【短板判定 - 红色】(Danger)
    // 逻辑：只要有 任意一个有效成员 缺交了 任意一个必做任务 -> 红
    if (requiredTasks.length > 0) {
        const hasMissing = effectiveMembers.some(student => {
            // 检查该学生是否完成了所有必做任务
            const studentSubs = dailySubs.filter(sub => sub.name === student.studentName);
            
            const isStudentDone = requiredTasks.every(reqTask => {
                return studentSubs.some(sub => 
                    sub.subject === reqTask.subject && 
                    sub.task === reqTask.content
                );
            });
            
            return !isStudentDone; // 如果没做完，返回 true (代表有缺失)
        });

        if (hasMissing) {
            return {
                type: 'danger',
                cellClass: "grid-cell danger",
                icon: "💣",
                statusText: "缺交", // 这里可以扩展，例如显示 "缺3人"
                holidayBadge: ""
            };
        }
    }

    // 4. 【等待判定 - 黄色】(Warning)
    // 逻辑：(前提是必做都做完了) 只要有任务老师还在录入中 -> 黄
    const hasUnbatched = tasks.some(t => !isBatched(t.isBatch));
    if (hasUnbatched) {
        return {
            type: 'warning',
            cellClass: "grid-cell warning",
            icon: "⏳",
            statusText: "待录入",
            holidayBadge: ""
        };
    }

    // 5. 【全员通关 - 绿色】(Done)
    return {
        type: 'done',
        cellClass: "grid-cell done",
        icon: "🌟",
        statusText: "全员完成",
        holidayBadge: ""
    };
}

/**
 * 统一处理格子点击事件 (路由函数)
 * @param {string} type - 'stu'(个人) | 'grd'(小组) | 'cls'(班级)
 * @param {string} name - 具体名称 (学生名 / 小组名 / 'ALL')
 * @param {string} context - 上下文 (班级名)
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @param {string} actId - 活动ID
 */
function handleCellClick(type, name, context, date, actId) {
    if (!actId) return;

    // 调试演示：根据不同类型弹窗
    if (type === 'stu') {
        // alert(`【个人点击】\n班级：${context}\n姓名：${name}\n日期：${date}\n活动ID：${actId}`);
		toggleSiPopup(true, name, date, actId);
        // TODO: 这里调用显示个人详情弹窗的逻辑
    } 
    else if (type === 'grd') {
        // TODO: 这里调用显示小组列表弹窗的逻辑
		toggleGiPopup(true, name, context, date, actId);
    } 
    else if (type === 'cls') {
        // alert(`【班级点击】\n班级：${context}\n范围：全班\n日期：${date}\n活动ID：${actId}`);
		toggleCiPopup(true, actId, date);
    }
}

/**
 * 业务状态处理 A：请假/免做学生 (VIP通道) - 修复版
 * 逻辑：只有当“老师全录入”且“学生全做完”才给绿，其他情况一律蓝
 */
function getExemptDayStatus(day, actId, studentName) {
    const tasks = day.tasks || [];
    
    // 1. 准备数据
    const allDailySubs = (window.submissionData[actId] && window.submissionData[actId][day.date]) || [];
    const mySubs = allDailySubs.filter(r => r.name === studentName);
    const isBatched = (val) => String(val) === 'true';

    // 2. 检查是否有“未发布/未录入”的任务
    // 如果有任何科目老师还没录入(isBatch=false)，请假人只能看蓝色，不能给绿色误导
    const hasUnbatched = tasks.some(t => !isBatched(t.isBatch));
    if (hasUnbatched) {
        return {
            type: 'exempt',
            cellClass: "grid-cell exempt",
            icon: "☕",
            statusText: "请假",
            holidayBadge: ""
        };
    }

    // 3. 检查必做任务
    const requiredTasks = tasks.filter(t => isBatched(t.isBatch));

    // 🚨 关键修复：如果当天根本没有必做任务（比如全是 false 或空），不能算“已完成”，只能算“请假”
    if (requiredTasks.length === 0) {
        return {
            type: 'exempt',
            cellClass: "grid-cell exempt",
            icon: "☕",
            statusText: "请假",
            holidayBadge: ""
        };
    }

    // 4. 检查是否全部完成
    const isAllFinished = requiredTasks.every(reqTask => {
        return mySubs.some(sub => 
            sub.subject === reqTask.subject && 
            sub.task === reqTask.content
        );
    });

    if (isAllFinished) {
        // 🌟 只有全部做完，且老师全部录入，才给绿
        return {
            type: 'done',
            cellClass: "grid-cell done",
            icon: "🌟",
            statusText: "已完成",
            holidayBadge: ""
        };
    } else {
        // ☕ 缺交任何一科，因为有免死金牌，显示请假
        return {
            type: 'exempt',
            cellClass: "grid-cell exempt",
            icon: "☕",
            statusText: "请假",
            holidayBadge: ""
        };
    }
}