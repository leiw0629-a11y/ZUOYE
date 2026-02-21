/**
 * 打开奖励弹窗
 * @param {string} tabType 'consecutive' 或 'cumulative'
 */
function openRewardModal(tabType) {
    const modal = document.getElementById('clsr_reward_modal');
    if (modal) {
        modal.style.display = 'flex'; // 显示弹窗
        switchRewardTab(tabType);     // 自动切换到对应 Tab
    }
}

/**
 * 切换奖励 Tab 并执行渲染
 */
function switchRewardTab(tabType) {
    // 1. 切换 Tab 高亮样式
    document.getElementById('clsr_tab_con').classList.toggle('active', tabType === 'consecutive');
    document.getElementById('clsr_tab_cum').classList.toggle('active', tabType === 'cumulative');
    
    // 2. 切换容器可见性
    const conContent = document.getElementById('clsr_content_con');
    const cumContent = document.getElementById('clsr_content_cum');
    conContent.style.display = tabType === 'consecutive' ? 'grid' : 'none';
	cumContent.style.display = tabType === 'cumulative' ? 'grid' : 'none';

    // 3. 取出数据开始渲染
    const targetContainer = tabType === 'consecutive' ? conContent : cumContent;
    const data = window.currentClassRewardData?.[tabType];

    if (!data || data.tiers.length === 0) {
        targetContainer.innerHTML = `<div style="text-align:center; padding: 50px; color:#999;">暂无相关奖励配置或记录</div>`;
        return;
    }

    // 4. 生成卡片 HTML
    let html = '';
    data.tiers.forEach(tier => {
        // 生成学生小药丸
        let stuHtml = '';
        if (tier.achievedStudents.length === 0) {
            stuHtml = `<span style="font-size:12px; color:#BCAAA4;">暂无学生达标</span>`;
        } else {
            tier.achievedStudents.forEach(stuName => {
                stuHtml += `<span class="clsr_stu_pill">${stuName}</span>`;
            });
        }

        html += `
        <div class="clsr_tier_card">
            <div class="clsr_tier_header">
                <div class="clsr_tier_target_wrap">
                    <div class="clsr_tier_target">${tier.targetText}</div>
                    <div class="clsr_tier_act_info">${tier.actName} · ${tier.actInfo}</div>
                </div>
                <div class="clsr_tier_prize">
                    学生: ${tier.prizeStudent}<br><strong>需发: ${tier.prizeTeacher}</strong>
                </div>
            </div>
            <div class="clsr_tier_students">
                ${stuHtml}
            </div>
        </div>`;
    });

    targetContainer.innerHTML = html;
}