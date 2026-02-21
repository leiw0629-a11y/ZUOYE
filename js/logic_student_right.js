/**
 * 渲染个人数据面板 (核心入口 - 修正版：累计天数逻辑)
 * @param {string} studentName 学生姓名
 * @param {string} className 班级名称
 */
function updatePersonalData(studentName, className) {
    // 1. 获取该班级所有历史必做任务 (按时间倒序)
    const allTasks = getGlobalClassTasks(className);
    // =========== 🟢 [新增] 无数据处理开始 ===========
    if (allTasks.length === 0) {
        // 重置数字
        const elMissing = document.getElementById('stur_p_missing_count');
        const elStreak = document.getElementById('stur_p_streak_count');
        const elTotal = document.getElementById('stur_p_total_done');
        if (elMissing) elMissing.innerText = '-';
        if (elStreak) elStreak.innerText = '-';
        if (elTotal) elTotal.innerText = '-';

        // 清空列表显示提示
        const elList = document.getElementById('stur_p_missing_list');
        if (elList) elList.innerHTML = `<div style="text-align:center; padding:30px; color:#ccc;">暂无活动数据</div>`;

        // 重置文案
        const elCopy = document.getElementById('stur_p_copy_content');
        if (elCopy) elCopy.innerHTML = `<strong>💬沟通预览:</strong><br><span style="color:#999">暂无数据</span>`;
        
        return; // ⛔ 结束函数
    }
    // =========== 🟢 [新增] 无数据处理结束 ===========
    // 2. 准备统计容器
    let stats = {
        missingCount: 0,    // 累计未交(次) - 保持不变，精确到作业
        totalDoneDays: 0,   // 累计完成(天) - 🌟 逻辑修改：完美的一天才算1
        streakDays: 0,      // 连签天数
        missingList: [],    // 缺交详情列表
        lastMissingDate: null 
    };

    // 3. 预处理：将任务按日期分组
    // 结构: { '2026-02-12': [task1, task2], '2026-02-11': [task3] }
    const tasksByDate = {};
    allTasks.forEach(task => {
        if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
        tasksByDate[task.date].push(task);
    });

    // 4. 核心遍历：按日期判定 (日期已在 getGlobalClassTasks 中排好序)
    const activeDates = Object.keys(tasksByDate).sort().reverse(); // 降序：最近的在前面

    let isStreaking = true; // 连签标记位

    activeDates.forEach(date => {
        const daysTasks = tasksByDate[date];
        let dayIsPerfect = true; // 假设今天很完美

        // 检查当天的每个任务
        daysTasks.forEach(task => {
            const dailySubs = window.submissionData[task.actId]?.[date] || [];
            
            // 只要有一条记录匹配科目和内容，就算做完
            const isTaskDone = dailySubs.some(sub => 
                sub.name === studentName && 
                sub.subject === task.subject && 
                sub.task === task.content
            );

            if (!isTaskDone) {
                dayIsPerfect = false;     // 只要缺一个，今天就不完美
                stats.missingCount++;     // 缺交次数+1
                stats.missingList.push(task); // 加入缺交清单
                
                // 记录最近缺交日期
                if (!stats.lastMissingDate) stats.lastMissingDate = date;
            }
        });

        // 🌟 只有当天所有任务都做完了，"累计完成"才+1
        if (dayIsPerfect) {
            stats.totalDoneDays++;
            
            // 计算连签：如果还在连签状态中，就+1
            if (isStreaking) {
                stats.streakDays++;
            }
        } else {
            // 一旦断了，连签终止
            isStreaking = false;
        }
    });

    // ================= 5. 渲染 DOM =================
    
    // A. 数字更新
    const elMissing = document.getElementById('stur_p_missing_count');
    const elStreak = document.getElementById('stur_p_streak_count');
    const elTotal = document.getElementById('stur_p_total_done');
    
    if (elMissing) elMissing.innerText = stats.missingCount;
    if (elStreak) elStreak.innerText = stats.streakDays;
    
    // 🌟 这里顺便把“次”改成“天”，防止UI误导
    if (elTotal) {
        elTotal.innerText = stats.totalDoneDays;
        // 尝试找到旁边的文本节点修改单位 (父元素的 innerHTML 替换)
        // 假设 HTML 结构是 <span class="badge-text">累计 <strong id="...">0</strong> 次</span>
        // 我们直接操作 parentHTML 可能比较暴力，建议手动改 HTML 或者这里只改数字
        // 为了保险，这里只改数字。建议你去 tpl_student.js 把 "次" 改成 "天"
    }

    // B. 列表渲染 (只显示最近 50 条)
    const elList = document.getElementById('stur_p_missing_list');
    if (elList) {
        if (stats.missingList.length === 0) {
            elList.innerHTML = `<div style="text-align:center; padding:20px; color:#999;">🎉 太棒了，作业全齐！</div>`;
        } else {
            let html = '';
            stats.missingList.slice(0, 50).forEach(task => {
                const dateObj = new Date(task.date);
                const dateStr = `${dateObj.getMonth()+1}月${dateObj.getDate()}日`;
                
                html += `
                <div class="missing-item">
                    <div class="m-date">${dateStr} ${task.subject} ${task.content}</div>
                    <div class="m-tag">缺交</div>
                </div>`;
            });
            elList.innerHTML = html;
        }
    }

    // C. 话术生成
    const elCopy = document.getElementById('stur_p_copy_content');
    if (elCopy) {
        let msg = '';
        if (stats.missingCount === 0) {
            msg = `家长您好，${studentName}同学近期表现非常优秀，所有作业均已完成（累计打卡 ${stats.totalDoneDays} 天），请继续保持！🌹`;
        } else {
            const shortDate = stats.lastMissingDate ? stats.lastMissingDate.slice(5) : '';
            msg = `家长您好，${studentName}同学近期累计缺交作业 ${stats.missingCount} 次，最近一次是 ${shortDate}，请督促孩子及时补齐。`;
        }
        
        elCopy.innerHTML = `
            <strong>💬 沟通预览:</strong><br>
            "${msg}"
        `;
        elCopy.dataset.text = msg;
    }
}

/**
 * 辅助工具：获取某班级所有历史必做任务 (标准答案卡)
 * 返回结构: [ { actId, date, subject, content }, ... ] (按时间倒序)
 */
function getGlobalClassTasks(className) {
    let tasks = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    // 1. 遍历所有活动
    (window.activityList || []).forEach(act => {
        // 过滤条件：班级匹配 + 已开始
        if (act.className !== className) return;
        if (act.startDate > today) return;

        const dayData = window.activityInfo[act.act_id];
        if (!dayData) return;

        // 2. 遍历活动里的每一天
        dayData.forEach(day => {
            // 过滤条件：日期已过/是今天
            if (day.date > today) return;

            // 3. 提取必做任务 (isBatch === 'true')
            (day.tasks || []).forEach(t => {
                if (String(t.isBatch) === 'true') {
                    tasks.push({
                        actId: act.act_id,
                        actName: act.activityName,
                        date: day.date,
                        subject: t.subject,
                        content: t.content
                    });
                }
            });
        });
    });

    // 4. 按日期倒序排列 (最近的在前面)
    return tasks.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 渲染小组数据面板 (核心入口)
 * @param {string} groupName 小组名称
 * @param {string} className 班级名称
 */
function updateGroupData(groupName, className) {
    // 1. 获取班级所有必做任务 (分母)
    const allTasks = getGlobalClassTasks(className);
    const totalTaskCount = allTasks.length;
	// =========== 🟢 [新增] 无数据处理开始 ===========
    if (totalTaskCount === 0) {
        // 重置总数
        const elTotal = document.getElementById('grdr_g_missing_total');
        if (elTotal) elTotal.innerText = '-';

        // 清空表格
        const elTbody = document.getElementById('grdr_g_table_body');
        if (elTbody) elTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px; color:#ccc;">暂无活动数据</td></tr>`;

        // 重置文案
        const elCopy = document.getElementById('grdr_g_copy_content');
        if (elCopy) elCopy.innerHTML = `<strong>📢 小组广播预览:</strong><br><span style="color:#999">暂无数据</span>`;

        return; // ⛔ 结束函数
    }
    // =========== 🟢 [新增] 无数据处理结束 ===========
    // 2. 获取该小组的所有成员
    const members = (window.students || []).filter(s => 
        s.className === className && s.groupName === groupName
    );

    // 3. 初始化统计容器
    // 结构: { '王芳': { name: '王芳', missing: 0 } }
    let memberStats = {};
    members.forEach(m => {
        memberStats[m.studentName] = { 
            name: m.studentName, 
            missing: 0,
            avatar: m.avatar || "🛡️" // 防止头像为空
        };
    });

    let groupTotalMissing = 0; // 小组总缺交

    // 4. 核心计算：遍历任务 -> 遍历组员
    // 效率优化：外层循环任务，内层直接查作业
    allTasks.forEach(task => {
        const dailySubs = window.submissionData[task.actId]?.[task.date] || [];
        
        // 建立当天的完成者名单 Set (查询速度 O(1))
        const finishers = new Set();
        dailySubs.forEach(sub => {
            if (sub.subject === task.subject && sub.task === task.content) {
                finishers.add(sub.name);
            }
        });

        // 检查每个组员
        members.forEach(m => {
            // 如果不在完成名单里 -> 缺交 +1
            if (!finishers.has(m.studentName)) {
                memberStats[m.studentName].missing++;
                groupTotalMissing++;
            }
        });
    });

    // 5. 排序：缺交最多的排前面 (降序)
    const sortedMembers = Object.values(memberStats).sort((a, b) => b.missing - a.missing);

    // ================= 6. 渲染 DOM =================

    // A. 更新总数
    const elTotal = document.getElementById('grdr_g_missing_total');
    if (elTotal) elTotal.innerText = groupTotalMissing;

    // B. 更新表格
    const elTbody = document.getElementById('grdr_g_table_body');
    if (elTbody) {
        let html = '';
        sortedMembers.forEach(stat => {
            // 计算完成率
            // 如果 totalTaskCount 为 0，完成率默认 100%
            const doneCount = Math.max(0, totalTaskCount - stat.missing);
            const rate = totalTaskCount > 0 
                ? Math.round((doneCount / totalTaskCount) * 100) 
                : 100;
            
            // 样式处理：全勤显示 "-"，有缺交显示红色数字
            const missingBadge = stat.missing > 0 
                ? `<span class="sir_missing_badge">${stat.missing}</span>`
                : `<span class="sir_missing_zero">-</span>`;
            
            // 进度条颜色：100% 绿色，否则默认色
            const barClass = rate === 100 ? 'sir_progress_fill full' : 'sir_progress_fill';

            html += `
                <tr>
                    <td>
                        <div class="sir_user_info">
                            <div class="sir_name_text">${stat.name}</div>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        ${missingBadge}
                    </td>
                    <td>
                        <div class="sir_progress_wrapper">
                            <div class="sir_progress_track">
                                <div class="${barClass}" style="width: ${rate}%;"></div>
                            </div>
                            <span class="sir_progress_num">${rate}%</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        elTbody.innerHTML = html;
    }

    // C. 更新广播预览
    const elCopy = document.getElementById('grdr_g_copy_content');
    if (elCopy) {
        let msg = '';
        if (groupTotalMissing === 0) {
            msg = `🎉【${groupName}】太棒了！全员全勤，所有作业已全部完成！大家继续保持！`;
        } else {
            // 找出缺交最多的同学名字（排在第一个的）
            const topMissingName = sortedMembers[0].name;
            msg = `【${groupName}】当前累计缺交 ${groupTotalMissing} 人次。加油补齐作业，争取全员通关！`;
        }

        elCopy.innerHTML = `
            <strong>📢小组广播预览:</strong><br>
            "${msg}"
        `;
        elCopy.dataset.text = msg;
    }
}

/**
 * 渲染班级数据面板 (核心入口)
 * @param {string} className 班级名称
 */
function updateClassData(className) {
    // 1. 获取标准任务池 (分母)
    const allTasks = getGlobalClassTasks(className);
    const totalTaskCount = allTasks.length;
	// =========== 🟢 [新增] 无数据处理开始 ===========
    if (totalTaskCount === 0) {
		
        // 重置总数
        const elTotal = document.getElementById('clsr_c_missing_total');
        if (elTotal) elTotal.innerText = '-';

        // 清空表格
        const elTbody = document.getElementById('clsr_c_table_body');
        if (elTbody) elTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px; color:#ccc;">暂无活动数据</td></tr>`;

        // 重置文案
        const elCopy = document.getElementById('clsr_c_copy_content');
        if (elCopy) elCopy.innerHTML = `<strong>📢 班级广播预览:</strong><br><span style="color:#999">暂无数据</span>`;

        return; // ⛔ 结束函数
    }
    // =========== 🟢 [新增] 无数据处理结束 ===========
    // 2. 获取全班学生 (只过滤班级)
    const members = (window.students || []).filter(s => s.className === className);

    // 3. 初始化统计
    let memberStats = {};
    members.forEach(m => {
        memberStats[m.studentName] = { 
            name: m.studentName, 
            missing: 0,
            avatar: m.avatar || "🏫"
        };
    });

    let classTotalMissing = 0; // 班级总缺交

    // 4. 核心计算 (复用高效逻辑：外层任务 -> 内层作业)
    allTasks.forEach(task => {
        const dailySubs = window.submissionData[task.actId]?.[task.date] || [];
        
        // 生成完成者名单 Set
        const finishers = new Set();
        dailySubs.forEach(sub => {
            if (sub.subject === task.subject && sub.task === task.content) {
                finishers.add(sub.name);
            }
        });

        // 检查全班每个人
        members.forEach(m => {
            if (!finishers.has(m.studentName)) {
                memberStats[m.studentName].missing++;
                classTotalMissing++;
            }
        });
    });

    // 5. 排序：缺交大户排前面
    const sortedMembers = Object.values(memberStats).sort((a, b) => b.missing - a.missing);

    // ================= 6. 渲染 DOM =================

    // A. 更新总数
    const elTotal = document.getElementById('clsr_c_missing_total');
    if (elTotal) elTotal.innerText = classTotalMissing;

    // B. 更新表格
    const elTbody = document.getElementById('clsr_c_table_body');
    if (elTbody) {
        let html = '';
        sortedMembers.forEach(stat => {
            const doneCount = Math.max(0, totalTaskCount - stat.missing);
            const rate = totalTaskCount > 0 
                ? Math.round((doneCount / totalTaskCount) * 100) 
                : 100;
            
            const missingBadge = stat.missing > 0 
                ? `<span class="sir_missing_badge">${stat.missing}</span>`
                : `<span class="sir_missing_zero">-</span>`;
            
            const barClass = rate === 100 ? 'sir_progress_fill full' : 'sir_progress_fill';

            html += `
                <tr>
                    <td>
                        <div class="sir_user_info">
                            <div class="sir_name_text">${stat.name}</div>
                        </div>
                    </td>
                    <td style="text-align: center;">${missingBadge}</td>
                    <td>
                        <div class="sir_progress_wrapper">
                            <div class="sir_progress_track">
                                <div class="${barClass}" style="width: ${rate}%;"></div>
                            </div>
                            <span class="sir_progress_num">${rate}%</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        elTbody.innerHTML = html;
    }

    // C. 更新广播话术
    const elCopy = document.getElementById('clsr_c_copy_content');
    if (elCopy) {
        let msg = '';
        if (classTotalMissing === 0) {
            msg = `🎉【${className}】全体起立！全班所有同学已完成全部作业！大家太棒了！👏👏👏`;
        } else {
            // 计算整体完成率
            const totalActs = members.length * totalTaskCount;
            const totalDone = totalActs - classTotalMissing;
            const classRate = totalActs > 0 ? Math.round((totalDone / totalActs) * 100) : 100;

            msg = `截止目前【${className}】整体完成率 ${classRate}%。\n累计缺交 ${classTotalMissing}人次。`;
        }

        elCopy.innerHTML = `
            <strong>📢 班级广播预览:</strong><br>
            <div style="font-size:12px; color:#666; margin-top:4px; white-space: pre-wrap;">${msg}</div>
        `;
        elCopy.dataset.text = msg;
    }
	
	// ================= 7. 结算并渲染奖励数据 =================
    // 1. 调用结算引擎
    const rewardData = calculateClassRewards(className);
    
    // 2. 将数据存入全局，供弹窗渲染时使用
    window.currentClassRewardData = rewardData;

    // 3. 动态更新面板上的徽章数字 (使用精准 ID 匹配)
    const elConCount = document.getElementById('cir_reward_con_count');
    const elCumCount = document.getElementById('cir_reward_cum_count');
    
    if (elConCount) elConCount.innerText = rewardData.consecutive.totalCount;
    if (elCumCount) elCumCount.innerText = rewardData.cumulative.totalCount;
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
            <div class="stu_picker_search" style="display:flex; align-items:center; gap:8px;">
                <input type="text" placeholder="搜索活动..." class="stu_mini_search" style="flex:1;">
                <span onclick="toggleStuActivityPicker()" style="font-size:14px; color:#999; cursor:pointer; white-space:nowrap; padding:4px;">取消</span>
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
            if (sel.type === 'stu') {
                renderStudentGrid(sel.type, sel.name, sel.context);
            } else if (sel.type === 'grd' || sel.type === 'cls') {
                renderAggregateGrid(sel.type, sel.name);
            }
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
        <div class="stu_picker_search" style="display:flex; align-items:center; gap:8px;">
            <div style="flex:1; display:flex; position:relative; align-items:center;">
                <input type="text" id="stu_act_search_input" placeholder="搜索活动..." class="stu_mini_search" oninput="handleActivitySearch(this.value)" style="width:100%; padding-right:25px;">
                <span id="stu_act_search_clear" onclick="clearActivitySearch()" style="position:absolute; right:8px; color:#FF5252; cursor:pointer; font-weight:bold; font-size:16px; display:none;">×</span>
            </div>
            <span onclick="toggleStuActivityPicker()" style="font-size:14px; color:#999; cursor:pointer; white-space:nowrap; padding:4px;">取消</span>
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

// 最终简化版：只负责展开/收起面板 + 智能恢复视图
function toggleStuActivityPicker() {
    const panel = document.getElementById('stu_right_panel');
    
    // 1. 执行切换
    panel.classList.toggle('is-picking');
    
    // 2. 判断当前状态 (是刚打开 还是 刚关闭?)
    const isPickerOpen = panel.classList.contains('is-picking');
    
    if (isPickerOpen) {
        // Case A: 打开面板 -> 聚焦搜索框
        setTimeout(() => {
            const input = panel.querySelector('.stu_mini_search'); 
            if(input) input.focus();
        }, 300); 
    } else {
        // Case B: 关闭面板 (点击取消) -> 恢复正确的底层视图
        // 关键逻辑：根据当前选中的类型 (stu/grd/cls) 来决定显示哪个 view_layer
        
        const sel = window.currentLeftSelection || {};
        const currentType = sel.type || 'stu'; // 如果没有记录，默认回学生视图

        console.log("关闭活动面板，恢复视图类型:", currentType);

        // 调用 logic_student.js 里的路由函数，确保显示正确的 DIV (view_layer_group 等)
        if (typeof updateRightPanel === 'function') {
            updateRightPanel(currentType);
        }
    }
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
        // ✅ 修正：根据 type 类型路由到不同的渲染函数
        if (sel.type === 'stu') {
            renderStudentGrid(sel.type, sel.name, sel.context);
        } else if (sel.type === 'grd' || sel.type === 'cls') {
            // 注意：renderAggregateGrid 只需要两个参数 (type, targetName)
            renderAggregateGrid(sel.type, sel.name);
        }
		updateRightPanel(sel.type);
    }
}

/**
 * 搜索活动列表 (纯前端 DOM 过滤)
 */
function handleActivitySearch(keyword) {
    keyword = keyword.trim().toLowerCase(); // 忽略大小写和首尾空格
    
    const items = document.querySelectorAll('.stu_act_item');
    const clearBtn = document.getElementById('stu_act_search_clear');

    // 1. 控制红 X 的显示与隐藏
    if (clearBtn) {
        clearBtn.style.display = keyword.length > 0 ? 'block' : 'none';
    }

    // 2. 遍历隐藏/显示活动项目
    items.forEach(item => {
        const nameEl = item.querySelector('.stu_act_name');
        if (nameEl) {
            const name = nameEl.innerText.toLowerCase();
            // 如果包含关键字，恢复默认的 display (通常是 flex)，否则隐藏
            if (name.includes(keyword)) {
                item.style.display = ''; // 清除内联样式，恢复 CSS 默认布局
            } else {
                item.style.display = 'none';
            }
        }
    });

    // 3. (细节优化) 处理“已结束”分割线的显示
    // 如果搜索结果中没有“已结束”的活动，就把那条分割线也藏起来，避免页面难看
    const endedDivider = document.querySelector('.stu_act_divider');
    if (endedDivider) {
        const endedItems = document.querySelectorAll('.stu_act_item.ended');
        let hasVisibleEnded = false;
        endedItems.forEach(item => {
            if (item.style.display !== 'none') hasVisibleEnded = true;
        });
        endedDivider.style.display = hasVisibleEnded ? 'block' : 'none';
    }
}

/**
 * 点击红 X 清空搜索框
 */
function clearActivitySearch() {
    const input = document.getElementById('stu_act_search_input');
    if (input) {
        input.value = '';
        handleActivitySearch(''); // 传空字符串，触发重置显示所有
        input.focus(); // 交互优化：清空后光标自动留给输入框
    }
}