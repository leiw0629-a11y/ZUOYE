function openRewardSettings() {
	const modal = document.getElementById('gr_reward_modal');
    if (!modal) {
        // 如果页面没有弹窗HTML，尝试从模板加载（防御性编程）
        if (window.AppTemplates && window.AppTemplates.grModal) {
            const div = document.createElement('div');
            div.innerHTML = window.AppTemplates.grModal;
            document.body.appendChild(div);
            // 重新获取
            return window.openRewardSettings();
        } else {
            console.error('错误：未找到弹窗 HTML 且无模板。');
            return;
        }
    }

    // A. 获取当前活动数据
    if (!window.currentGlobalActId) {
        alert("系统错误：未选中任何全局活动 (ID丢失)");
        return;
    }
    
    const act = window.globalActivityList.find(item => item.globalActId === window.currentGlobalActId);
    if (!act) {
        alert("系统错误：找不到对应的活动数据");
        return;
    }
	// ⚠️ 注意：请确认下方 'btn_save_reward' 是你 HTML 中保存按钮的真实 ID
    const saveBtn = document.getElementById('btn_save_reward'); 
    
    if (saveBtn) {
        if (act.isEnd) {
            // 如果已结束：禁用按钮，样式变灰
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';       // 透明度降低
            saveBtn.style.cursor = 'not-allowed'; // 鼠标变成禁止符号
            saveBtn.title = "活动已结束，无法修改奖励配置"; // 鼠标悬停提示
        } else {
            // 如果进行中：启用按钮，恢复样式
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
            saveBtn.title = ""; 
        }
    }
    // B. 回显数据到 UI
    // 1. 续签奖励 (Consecutive) - 前缀 continue
    _renderRewardSection('continue', act.consecutiveRules || []);
    
    // 2. 累计奖励 (Cumulative) - 前缀 total
    _renderRewardSection('total', act.cumulativeRules || []);

    // C. 显示动画
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * 内部函数：渲染某一区块 (续签 或 累计)
 * @param {String} prefix - ID前缀 ('continue' 或 'total')
 * @param {Array} rules - 规则数组
 */
function _renderRewardSection(prefix, rules) {
    // 循环处理 1 到 3 关
    for (let i = 1; i <= 3; i++) {
        // 获取DOM元素
        const elEnable = document.getElementById(`${prefix}_enable_${i}`);
        const elDays   = document.getElementById(`${prefix}_days_${i}`);
        const elShow   = document.getElementById(`${prefix}_show_${i}`);
        const elReal   = document.getElementById(`${prefix}_real_${i}`);

        if (!elEnable) continue; // 防御性检查

        // 获取对应索引的数据 (第1关对应数组下标0)
        const ruleData = rules && rules[i - 1]; // 增加 rules 判空防止报错

        if (ruleData) {
            // 场景A：有数据 -> 填充并打开开关
            elEnable.checked = true;
            elDays.value = ruleData.target;
            elShow.value = ruleData.studentView;
            elReal.value = ruleData.teacherView;
        } else {
            // 场景B：无数据 -> 这里的逻辑变更了
            // 无论是不是第1关，只要没数据，统统关闭开关并清空内容
            elEnable.checked = false;
            
            elDays.value = '';
            elShow.value = '';
            elReal.value = '';
        }
    }
}

    // 关闭弹窗
function closeRewardSettings() {
	const modal = document.getElementById('gr_reward_modal');
	if (modal) {
		// 1. 移除 class 触发离场动画
		modal.classList.remove('show');
		
		// 2. 等待动画结束（300ms）后隐藏元素
		setTimeout(() => {
			modal.style.display = 'none';
		}, 300); 
	}
}

    // 保存数据：自动抓取所有输入框的值
function saveRewardSettings() {
	// A. 基础检查
    if (!window.currentGlobalActId) return alert("保存失败：未锁定当前活动ID");
    
    const act = window.globalActivityList.find(item => item.globalActId === window.currentGlobalActId);
    if (!act) return alert("保存失败：源数据不存在");

    try {
        // B. 提取并校验数据
        // 1. 提取续签配置
        const newConsecutive = _collectRewardSection('continue', '续签奖励');
        // 2. 提取累计配置
        const newCumulative = _collectRewardSection('total', '累计奖励');

        // C. 写入数据 (更新全局对象)
        act.consecutiveRules = newConsecutive;
        act.cumulativeRules = newCumulative;
		
		saveData();
        // D. 成功反馈
		showToastHTML(`
		<div class="cm-toast-title">配置已保存！</div>
		`);
		// 重新渲染右侧
		renderRightPanelForm(act);
        closeRewardSettings();

    } catch (error) {
        // 捕获校验抛出的错误
        alert(error.message);
    }
}

/**
 * 内部函数：收集并校验某一区块的数据
 * @param {String} prefix - ID前缀 ('continue' 或 'total')
 * @param {String} sectionName - 报错时显示的中文名称
 * @returns {Array} 整理好的规则数组
 */
function _collectRewardSection(prefix, sectionName) {
    let resultList = [];
    let lastDays = 0; // 用于校验天数递增

    for (let i = 1; i <= 3; i++) {
        const isEnabled = document.getElementById(`${prefix}_enable_${i}`).checked;
        
        if (isEnabled) {
            // 1. 获取值
            const valDays = document.getElementById(`${prefix}_days_${i}`).value.trim();
            const valShow = document.getElementById(`${prefix}_show_${i}`).value.trim();
            const valReal = document.getElementById(`${prefix}_real_${i}`).value.trim();

            // 2. 非空校验
            if (!valDays || !valShow || !valReal) {
                throw new Error(`【${sectionName}】第 ${i} 关信息填写不完整，请补充或关闭该关卡。`);
            }

            // 3. 数字校验
            const numDays = parseInt(valDays, 10);
            if (isNaN(numDays) || numDays <= 0) {
                throw new Error(`【${sectionName}】第 ${i} 关的天数必须是正整数。`);
            }

            // 4. 逻辑校验：必须大于上一关
            // 注意：如果是数组的第一项(resultList.length === 0)，不需要对比上一项，但必须大于0
            if (resultList.length > 0) {
                if (numDays <= lastDays) {
                    throw new Error(`【${sectionName}】逻辑错误：第 ${i} 关的天数 (${numDays}) 不能小于或等于上一关 (${lastDays})。`);
                }
            }

            // 5. 存入临时变量，准备下一轮对比
            lastDays = numDays;

            // 6. 构造对象推入数组
            resultList.push({
                target: numDays,
                studentView: valShow,
                teacherView: valReal
            });
        }
        // 如果开关关闭 (else)，直接跳过，不做任何处理 (相当于删除/忽略)
    }

    return resultList;
}