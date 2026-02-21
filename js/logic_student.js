
window.currentStuTab = 'stu_tab_student'; // 默认选中“学生”Tab
window.currentActivityId = window.currentActivityId || []; // 活动id
window.currentLeftSelection = window.currentLeftSelection || {};

/**
	点击左侧触发中间和右侧更新的路由函数
*/
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
            handleStuItem(targetId,'cls',targetClass);
            
            // (可选) 自动滚动到该位置，体验更好
            const itemEl = document.getElementById(targetId);
            if (itemEl) itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
	renderStudentActivityPanel();
}

function handleStuItem(activeId, type, extra1, extra2) {
    // 1. 原有的高亮逻辑 (UI)
    document.querySelectorAll('.stu_list_item').forEach(item => {
        item.classList.remove('active');
    });
    const target = document.getElementById(activeId);
    if (target) {
        target.classList.add('active');
    }

	// --- ✅ 核心修改：保存当前选中的参数到全局变量 ---
    window.currentLeftSelection = {
        type: type,
        name: extra1,
        context: extra2
    };

    // 2. 如果是班级列表项，同步下拉框 (保持原有逻辑)
    if (activeId.startsWith('stu_item_c_')) {
        const index = activeId.split('_')[3]; 
        const classes = window.classes || [];
        if (classes[index]) {
            const selectEl = document.getElementById('stu_class_slc');
            if (selectEl) {
                selectEl.value = classes[index].className;
                renderStudentActivityPanel();
				renderAggregateGrid(type, extra1);
				updateRightPanel(type);
				return;
            }
        }
    }

    // --- ✅ 核心修改：根据类型分发视图 ---
    if (type === 'stu') {
        // 个人视图 (保持不变)
        renderStudentGrid(type, extra1, extra2);
    } else if (type === 'grd' || type === 'cls') {
        // 🚀 新增：聚合视图 (小组/班级)
        // 注意：班级/小组视图通常只依赖 type 和 name，context (class) 会从下拉框再次确认
        renderAggregateGrid(type, extra1);
    }
	updateRightPanel(type);
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
            // --- ✅ 修复开始：同样需要分流 ---
            if (window.currentLeftSelection) {
                const sel = window.currentLeftSelection;
                if (sel.type === 'stu') {
                    renderStudentGrid(sel.type, sel.name, sel.context);
                } else if (sel.type === 'grd' || sel.type === 'cls') {
                    renderAggregateGrid(sel.type, sel.name);
                }
				updateRightPanel(sel.type);
            }
        }
    }
}

/**
 * 切换右侧面板视图
 * @param {string} type - 'stu' | 'grd' | 'cls'
 */
function updateRightPanel(type) {
    // 1. 获取三个层级的 DOM
    const personalLayer = document.getElementById('view_layer_personal');
    const groupLayer = document.getElementById('view_layer_group');
    const classLayer = document.getElementById('view_layer_class');

    // 2. 先全部隐藏
    if (personalLayer) personalLayer.style.display = 'none';
    if (groupLayer) groupLayer.style.display = 'none';
    if (classLayer) classLayer.style.display = 'none';

    // 3. 根据类型显示对应层级
    if (type === 'stu') {
        if (personalLayer) personalLayer.style.display = 'flex'; // 注意是用flex布局
        const sel = window.currentLeftSelection;
		if (sel && sel.name) {
			updatePersonalData(sel.name, sel.context); // sel.context 就是班级名
		}
    } 
    else if (type === 'grd') {
        if (groupLayer) groupLayer.style.display = 'flex';
        const sel = window.currentLeftSelection;
		if (sel && sel.name) {
			// 对于小组视图，sel.name 是小组名，sel.context 是班级名
			updateGroupData(sel.name, sel.context); 
		}
    } 
    else if (type === 'cls') {
        if (classLayer) classLayer.style.display = 'flex';
		const sel = window.currentLeftSelection;
        const targetClass = sel ? (sel.name || sel.context) : '';
		if (targetClass) {
			updateClassData(targetClass);
		}
    }
	
}

/**
 * ✅ 核心奖励结算引擎 (终极版：动态时间墙 + 不可能奖励剔除)
 * @param {string} className 班级名称
 */
function calculateClassRewards(className) {
    const result = {
        consecutive: { totalCount: 0, tiers: [] }, 
        cumulative: { totalCount: 0, tiers: [] }   
    };

    const classStudents = (window.students || []).filter(s => s.className === className);
    if (classStudents.length === 0) return result;

    // 1. 获取今天的标准格式
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${dayStr}`;

    // ================= 1. 计算单活动续签奖励 =================
    const singleActs = (window.activityList || []).filter(a => a.className === className);
    singleActs.forEach(act => {
        // 确立单活动时间墙：如果是已结束，取结束日期（但不能超过今天）；如果是进行中，就是今天
        let actWall = today;
        if (act.isEnd) {
            actWall = act.manualEndDate || act.endDate || today;
            if (actWall > today) actWall = today;
        }

        const actDays = window.activityInfo[act.act_id] || [];
        const sortedDays = [...actDays].sort((a, b) => a.date.localeCompare(b.date));
        
        let studentStreakActive = {};
        classStudents.forEach(s => studentStreakActive[s.studentName] = true);

        sortedDays.forEach(day => {
            // A. 作业核对：只核对时间墙之内（含当天）的作业
            if (day.date <= actWall) {
                const tasks = (day.tasks || []).filter(t => String(t.isBatch) === 'true');
                if (tasks.length > 0) {
                    const dailySubs = window.submissionData[act.act_id]?.[day.date] || [];
                    classStudents.forEach(stu => {
                        if (!studentStreakActive[stu.studentName]) return; 
                        let isPerfect = true;
                        tasks.forEach(task => {
                            const isDone = dailySubs.some(sub => 
                                sub.name === stu.studentName && sub.subject === task.subject && sub.task === task.content
                            );
                            if (!isDone) isPerfect = false;
                        });
                        if (!isPerfect) studentStreakActive[stu.studentName] = false; 
                    });
                }
            }

            // B. 奖励卡片渲染判断
            if (String(day.dayType) === '2' && day.rewardData) {
                // 🔴 体验优化：如果活动已结束，且这个奖励日在结束日之后 -> 永远不可能达到，直接丢弃！
                if (act.isEnd && day.date > actWall) return; 

                // 如果奖励日在墙外（说明活动还在进行，只是时间没到），显示空名单
                const achieved = day.date > actWall ? [] : classStudents
                    .filter(stu => studentStreakActive[stu.studentName])
                    .map(stu => stu.studentName);
                
                result.consecutive.tiers.push({
                    targetText: `连签至 ${day.date.slice(5)}`, 
                    actName: act.activityName,
                    actInfo: `${act.startDate} ~ ${act.endDate}`,
                    prizeStudent: day.rewardData.studentView || '神秘大礼包',
                    prizeTeacher: day.rewardData.teacherView || '无',
                    achievedStudents: achieved
                });
                result.consecutive.totalCount += achieved.length;
            }
        });
    });

    // ================= 2. 计算全局活动奖励 =================
    const globalActs = (window.globalActivityList || []).filter(g => g.className === className);
    
    globalActs.forEach(gAct => {
        // 确立全局活动时间墙
        let gActWall = today;
        if (gAct.isEnd) {
            gActWall = gAct.endDate || today;
            if (gActWall > today) gActWall = today;
        }

        const subIds = gAct.subActivityIds || [];
        if (subIds.length === 0) return;

        const tasksByDate = {};
        subIds.forEach(actId => {
            // 为了严谨，顺便获取一下子活动的自身时间墙
            const subAct = window.activityList.find(a => a.act_id === actId);
            if (!subAct) return;
            let subActWall = today;
            if (subAct.isEnd) {
                subActWall = subAct.manualEndDate || subAct.endDate || today;
                if (subActWall > today) subActWall = today;
            }
            
            // 最终墙：全局墙和子活动墙，谁更早听谁的
            const finalWall = gActWall < subActWall ? gActWall : subActWall;

            const actDays = window.activityInfo[actId] || [];
            actDays.forEach(day => {
                // 拦截：超过有效边界日期的任务，全部丢弃，不再输送给全局池
                if (day.date > finalWall) return;

                const tasks = (day.tasks || []).filter(t => String(t.isBatch) === 'true');
                if (tasks.length > 0) {
                    if (!tasksByDate[day.date]) tasksByDate[day.date] = [];
                    tasks.forEach(t => tasksByDate[day.date].push({ actId, subject: t.subject, content: t.content }));
                }
            });
        });

        const sortedDates = Object.keys(tasksByDate).sort(); 
        const maxPossibleDays = sortedDates.length; // 该全局活动“目前为止”或“到死为止”总共产生任务的天数
        
        const stuStats = {};
        classStudents.forEach(stu => {
            stuStats[stu.studentName] = { currentStreak: 0, maxStreak: 0, totalDone: 0 };
        });

        // 推演历史
        sortedDates.forEach(date => {
            const daysTasks = tasksByDate[date];
            classStudents.forEach(stu => {
                let isPerfect = true;
                daysTasks.forEach(task => {
                    const dailySubs = window.submissionData[task.actId]?.[date] || [];
                    const isDone = dailySubs.some(sub => 
                        sub.name === stu.studentName && sub.subject === task.subject && sub.task === task.content
                    );
                    if (!isDone) isPerfect = false;
                });

                if (isPerfect) {
                    stuStats[stu.studentName].totalDone++;
                    stuStats[stu.studentName].currentStreak++;
                    if (stuStats[stu.studentName].currentStreak > stuStats[stu.studentName].maxStreak) {
                        stuStats[stu.studentName].maxStreak = stuStats[stu.studentName].currentStreak;
                    }
                } else {
                    stuStats[stu.studentName].currentStreak = 0; 
                }
            });
        });

        // 结算 全局续签
        (gAct.consecutiveRules || []).forEach(rule => {
            const target = parseInt(rule.target, 10);
            
            // 体验优化：如果全局活动已死，且设定的目标天数 > 实际存活总天数 -> 永远不可能达成，直接丢弃卡片！
            if (gAct.isEnd && target > maxPossibleDays) return;

            const achieved = classStudents
                .filter(stu => stuStats[stu.studentName].maxStreak >= target)
                .map(stu => stu.studentName);
            
            result.consecutive.tiers.push({
                targetText: `连签${target}天`,
                actName: gAct.actName,
                actInfo: gAct.isEnd ? `已结束全局挑战` : `进行中全局挑战`,
                prizeStudent: rule.studentView || '大礼包',
                prizeTeacher: rule.teacherView || '无',
                achievedStudents: achieved
            });
            result.consecutive.totalCount += achieved.length;
        });

        // 结算 全局累计
        (gAct.cumulativeRules || []).forEach(rule => {
            const target = parseInt(rule.target, 10);
            
            // 体验优化：同理，目标累计天数 > 存活总天数，丢弃卡片
            if (gAct.isEnd && target > maxPossibleDays) return;

            const achieved = classStudents
                .filter(stu => stuStats[stu.studentName].totalDone >= target)
                .map(stu => stu.studentName);
            
            result.cumulative.tiers.push({
                targetText: `累计全勤 ${target} 天`,
                actName: gAct.actName,
                actInfo: gAct.isEnd ? `已结束全局挑战` : `进行中全局挑战`,
                prizeStudent: rule.studentView || '大礼包',
                prizeTeacher: rule.teacherView || '无',
                achievedStudents: achieved
            });
            result.cumulative.totalCount += achieved.length;
        });
    });

    return result;
}