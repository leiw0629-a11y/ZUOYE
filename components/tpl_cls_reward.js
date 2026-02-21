window.AppTemplates = window.AppTemplates || {};

// ✅ 撤销日志弹窗视图 (ID: view-undo-log)
window.AppTemplates.clsReward = `
<div id="clsr_reward_modal" class="clsr_modal_overlay" style="display: none;">
    <div class="clsr_modal_box">
        
        <div class="clsr_modal_header">
            <div class="clsr_header_title">🏆 班级奖励光荣榜</div>
            <div class="clsr_close_btn" onclick="document.getElementById('clsr_reward_modal').style.display='none'">×</div>
        </div>

        <div class="clsr_tabs_wrapper">
            <div class="clsr_tab active" id="clsr_tab_con" onclick="switchRewardTab('consecutive')">🔥 连签奖励</div>
            <div class="clsr_tab" id="clsr_tab_cum" onclick="switchRewardTab('cumulative')">🎁 累计奖励</div>
        </div>

        <div id="clsr_content_con" class="clsr_list_scroll">
            
            <div class="clsr_tier_card">
                <div class="clsr_tier_header">
					<div class="clsr_tier_target_wrap">
						<div class="clsr_tier_target">连签 7 天</div>
						<div class="clsr_tier_act_info">春季百日挑战 · 02-01~04-12</div>
					</div>
					<div class="clsr_tier_prize">
						学生: 大礼包<br><strong>需发: 棒棒糖</strong>
					</div>
				</div>
                <div class="clsr_tier_students">
                    <span class="clsr_stu_pill">张三</span><span class="clsr_stu_pill">李四</span>
                    <span class="clsr_stu_pill">王五</span><span class="clsr_stu_pill">赵六</span>
                    <span class="clsr_stu_pill">钱七</span><span class="clsr_stu_pill">孙八</span>
                    <span class="clsr_stu_pill">周九</span><span class="clsr_stu_pill">吴十</span>
                    <span class="clsr_stu_pill">郑十一</span><span class="clsr_stu_pill">王大拿</span>
                    <span class="clsr_stu_pill">刘强东</span><span class="clsr_stu_pill">马云</span>
                    <span class="clsr_stu_pill">太多了1</span><span class="clsr_stu_pill">太多了2</span>
                </div>
            </div>

            <div class="clsr_tier_card">
                <div class="clsr_tier_header">
					<div class="clsr_tier_target_wrap">
						<div class="clsr_tier_target">连签 7 天</div>
						<div class="clsr_tier_act_info">春季百日挑战 · 02-01~04-12</div>
					</div>
					<div class="clsr_tier_prize">
						学生: 大礼包<br><strong>需发: 棒棒糖</strong>
					</div>
				</div>
                <div class="clsr_tier_students">
                    <span class="clsr_stu_pill">欧阳锋</span><span class="clsr_stu_pill">洪七公</span>
                </div>
            </div>

            <div class="clsr_tier_card">
                <div class="clsr_tier_header">
					<div class="clsr_tier_target_wrap">
						<div class="clsr_tier_target">连签 7 天</div>
						<div class="clsr_tier_act_info">春季百日挑战 · 02-01~04-12</div>
					</div>
					<div class="clsr_tier_prize">
						学生: 大礼包<br><strong>需发: 棒棒糖</strong>
					</div>
				</div>
                <div class="clsr_tier_students">
                    <span style="font-size:12px; color:#BCAAA4;">暂无学生达标</span>
                </div>
            </div>

            <div class="clsr_tier_card">
                <div class="clsr_tier_header">
					<div class="clsr_tier_target_wrap">
						<div class="clsr_tier_target">连签 7 天</div>
						<div class="clsr_tier_act_info">春季百日挑战 · 02-01~04-12</div>
					</div>
					<div class="clsr_tier_prize">
						学生: 大礼包<br><strong>需发: 棒棒糖</strong>
					</div>
				</div>
                <div class="clsr_tier_students">
                    <span style="font-size:12px; color:#BCAAA4;">虚位以待</span>
                </div>
            </div>

        </div>

        <div id="clsr_content_cum" class="clsr_list_scroll" style="display: none;">
            <div class="clsr_tier_card">
                <div class="clsr_tier_header">
					<div class="clsr_tier_target_wrap">
						<div class="clsr_tier_target">连签 7 天</div>
						<div class="clsr_tier_act_info">春季百日挑战 · 02-01~04-12</div>
					</div>
					<div class="clsr_tier_prize">
						学生: 大礼包<br><strong>需发: 棒棒糖</strong>
					</div>
				</div>
                <div class="clsr_tier_students">
                    <span class="clsr_stu_pill">张三疯</span>
                </div>
            </div>
            </div>

    </div>
</div>
`;