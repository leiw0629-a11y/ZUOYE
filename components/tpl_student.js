window.AppTemplates = window.AppTemplates || {};

// ✅ 学生端视图 (ID: view-student)
// 包含完整的 D1-D28 学生数据
window.AppTemplates.student = `
<div class="layout-container" id="view-student">
    
    <div class="sidebar panel-base">
        <div class="sidebar-container">
			<div class="stu_tools_row">
                 <select class="stu_select" id="stu_class_slc" onchange="handleClassChange()">
                    <option value="all">全部班级</option>
                 </select>
                 <div style="position:relative; flex:1; display:flex; align-items:center;">
    <input id="stu_search_inp" type="text" class="stu_search_input" placeholder="🔍搜索" 
           style="width:100%; padding-right:25px; box-sizing:border-box;" 
           oninput="handleSearch(this.value)">
           
    <span id="stu_search_clear" onclick="clearSearch()" 
          style="position:absolute; right:8px; top:50%; transform:translateY(-50%); 
                 color:#FF5252; cursor:pointer; font-weight:bold; font-size:14px; display:none; z-index:10;">
        ✕
    </span>
</div>
            </div>
            <div class="stu_tabs_container">
                <div id="stu_tab_student" class="stu_tab_item active" onclick="handleStuTab('stu_tab_student')">👤学生</div>
                <div class="stu_tab_divider"></div>
                <div id="stu_tab_group" class="stu_tab_item" onclick="handleStuTab('stu_tab_group')">🛡️小组</div>
				<div class="stu_tab_divider"></div>
				<div id="stu_tab_class" class="stu_tab_item" onclick="handleStuTab('stu_tab_class')">🏫班级</div>
            </div>
            <div class="list-content" id="stu_class_list">
                
            </div>
		<div id="stu_student_list" class="list-content" style="display:none;"></div>
		<div id="stu_group_list" class="list-content" style="display:none;"></div>
        </div>
		
    </div>

    <div class="main-area panel-base">
        <div class="main-top-bar">
            <div style="display:flex; align-items:center; gap:10px;">
                <span id="studentTitle" style="font-size:18px; font-weight:800; color:var(--text-main);">王芳的冒险进度</span>
                <span class="progress-tag">完成度 15/28</span>
            </div>
        </div>

        <div class="grid-container" id="grid-container-student">
            <div class="grid-cell done"><span class="day-label">D1</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D2</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D3</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell danger"><span class="day-label">D4</span><div class="cell-icon">💣</div><div class="cell-status-text">缺交</div></div>
            <div class="grid-cell holiday"><span class="day-label">D5</span><div class="holiday-badge">休</div><div class="cell-icon">🏖️</div><div class="cell-status-text">免打卡</div></div>
            <div class="grid-cell done"><span class="day-label">D6</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D7</span><div class="cell-icon">🎁</div><div class="cell-status-text">已领奖</div></div>

            <div class="grid-cell done"><span class="day-label">D8</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D9</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D10</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D11</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D12</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell danger"><span class="day-label">D13</span><div class="cell-icon">💣</div><div class="cell-status-text">缺交</div></div>
            <div class="grid-cell done"><span class="day-label">D14</span><div class="cell-icon">🎁</div><div class="cell-status-text">已领奖</div></div>

            <div class="grid-cell locked"><span class="day-label">D15</span><div class="cell-icon">🔒</div><div class="cell-status-text">未开启</div></div>
            <div class="grid-cell locked"><span class="day-label">D16</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D17</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D18</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D19</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D20</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D21</span><div class="cell-icon">🔒</div></div>

            <div class="grid-cell locked"><span class="day-label">D22</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D23</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D24</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D25</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D26</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D27</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D28</span><div class="cell-icon">🏆</div><div class="cell-status-text">终极大奖</div></div>
        </div>
    </div>

    <div class="right-panel panel-base" id="stu_right_panel">
	
    <div class="stu_header_wrap variant_fusion">
    <div class="stu_title_trigger" onclick="toggleStuActivityPicker()">
        <span class="stu_title_icon">📅</span>
        <h3 class="stu_current_name">秋季学霸计划</h3>
        <span class="stu_arrow_icon">⌄</span>
    </div>
</div>

    <div class="stu_panel_stack">
        
        <div class="stu_sub_panel" id="stu_panel_data">
            
            <div id="view_layer_personal" class="stu_layer_view active">
                
                <div class="layer-header">
                    <div class="alert-card">
                        <div class="alert-num" id="stur_p_missing_count">2</div>
                        <div class="alert-label">累计未交(次)</div>
                    </div>
                    
                    <div class="achievement-row">
                        <div class="achieve-badge">
                            <span class="badge-text">连签 <strong id="stur_p_streak_count">-1</strong>天</span>
                        </div>
                        <div class="achieve-badge">
                            <span class="badge-text">累计 <strong id="stur_p_total_done">-1</strong>天</span>
                        </div>
                    </div>
                </div>

                <div class="layer-body">
                    <div class="section-title">缺交作业清单</div>
                    <div class="scroll-list-content" id="stur_p_missing_list">
                        <div class="missing-item">
                            <div class="m-date">1月15日 数学 应用题</div>
                            <div class="m-tag">缺交</div>
                        </div>
                        <div class="missing-item">
                            <div class="m-date">1月24日 语文 作文</div>
                            <div class="m-tag">缺交</div>
                        </div>
						<div class="missing-item">
                            <div class="m-date">1月15日 数学 应用题</div>
                            <div class="m-tag">缺交</div>
                        </div>
                    </div>
                </div>

                <div class="layer-footer">
                    <div class="copy-box" id="stur_p_copy_content">
                        <strong>💬 沟通预览:</strong><br>
                        "家长您好，王芳同学Day4和Day13暂未提交，请督促..."
                    </div>
                    <button class="btn-full" onclick="copyNotice()">一键复制并提醒家长</button>
                </div>
            </div>

            <div id="view_layer_group" class="stu_layer_view" style="display:none;">
				<div class="layer-header">
					<div class="alert-card" style="background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);">
						<div class="alert-num" id="grdr_g_missing_total">5</div>
						<div class="alert-label">小组累计缺交(人次)</div>
					</div>
				</div>

				<div class="layer-body">
					<div class="section-title">组员详情</div>
					<div class="scroll-list-content">
						<table class="sir_group_table">
							<thead>
								<tr>
									<th style="padding-left: 8px;">姓名</th>
									<th style="text-align: center;">缺交</th>
									<th>完成度</th>
								</tr>
							</thead>
							<tbody id="grdr_g_table_body">
								<tr>
									<td>
										<div class="sir_user_info">
											<div class="sir_name_text">王芳</div>
										</div>
									</td>
									<td style="text-align: center;">
										<span class="sir_missing_badge">2</span>
									</td>
									<td>
										<div class="sir_progress_wrapper">
											<div class="sir_progress_track">
												<div class="sir_progress_fill" style="width: 85%;"></div>
											</div>
											<span class="sir_progress_num">85%</span>
										</div>
									</td>
								</tr>
								
								<tr>
									<td>
										<div class="sir_user_info">
											<div class="sir_name_text">李雷</div>
										</div>
									</td>
									<td style="text-align: center;">
										<span class="sir_missing_zero">-</span>
									</td>
									<td>
										<div class="sir_progress_wrapper">
											<div class="sir_progress_track">
												<div class="sir_progress_fill full" style="width: 100%;"></div>
											</div>
											<span class="sir_progress_num">100%</span>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="layer-footer">
					<div class="copy-box" id="grdr_g_copy_content">
						<strong>📢 小组广播预览:</strong><br>
						"加油！咱们组还差 5 人次就全员通关啦..."
					</div>
					<button class="btn-full">一键提醒全组</button>
				</div>

			</div>

            <div id="view_layer_class" class="stu_layer_view" style="display:none;">
    
    <div class="layer-header">
    <div class="alert-card" style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);">
        <div id="clsr_c_missing_total" class="alert-num">0</div>
        <div class="alert-label">班级累计缺交(人次)</div>
    </div>
	<div class="achievement-row">
		<div class="achieve-badge cir_reward_badge" onclick="openRewardModal('consecutive')">
			<span class="badge-icon">🔥</span>
			<span class="badge-text">连签奖励 <strong id="cir_reward_con_count">0</strong>次</span>
		</div>
		<div class="achieve-badge cir_reward_badge" onclick="openRewardModal('cumulative')">
			<span class="badge-icon">🎁</span>
			<span class="badge-text">累计奖励 <strong id="cir_reward_cum_count">0</strong>次</span>
		</div>
	</div>
    </div>

<div class="layer-body">
    <div class="section-title">全班进度一览</div>
    <div class="scroll-list-content">
        <table class="sir_group_table">
            <thead>
                <tr>
                    <th style="padding-left: 8px;">姓名</th>
                    <th style="text-align: center;">缺交</th>
                    <th>完成度</th>
                </tr>
            </thead>
            <tbody id="clsr_c_table_body">
                </tbody>
        </table>
    </div>
</div>

<div class="layer-footer">
    <div id="clsr_c_copy_content" class="copy-box">
        <strong>📢 班级广播预览:</strong><br>
        ...
    </div>
    <button class="btn-full" onclick="alert('已复制到剪贴板！')">一键发送班级群</button>
</div>

</div>

        </div>

    </div>

        <div class="stu_sub_panel stu_picker_view" id="stu_panel_activities">
            <div class="stu_activity_scroller">
                <div class="stu_picker_search">
                    <input type="text" placeholder="搜索活动..." class="stu_mini_search">
                </div>

                <div class="stu_act_item active" onclick="selectStuActivity('寒假数学口算营')">
                    <div class="stu_act_status ongoing"></div>
                    <div class="stu_act_info">
                        <div class="stu_act_name">寒假数学口算营</div>
                        <div class="stu_act_meta">24人参与 · 剩余12天</div>
                    </div>
                </div>

                <div class="stu_act_item" onclick="selectStuActivity('21天英语晨读')">
                    <div class="stu_act_status ongoing"></div>
                    <div class="stu_act_info">
                        <div class="stu_act_name">21天英语晨读</div>
                        <div class="stu_act_meta">18人参与 · 剩余5天</div>
                    </div>
                </div>

                <div class="stu_act_divider">已结束</div>

                <div class="stu_act_item ended" onclick="selectStuActivity('秋季学霸养成计划')">
                    <div class="stu_act_status"></div>
                    <div class="stu_act_info">
                        <div class="stu_act_name">秋季学霸养成计划</div>
                        <div class="stu_act_meta">2025-12-30 结营</div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>


</div>
`;