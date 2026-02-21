window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.admin_Global = `
	<!-----------------全局活动结束 ----------------------------->
	<div class="layout-container" id="view-global" style="display:none;">
		<div class="sidebar panel-base">
			<div class="sidebar-container">
				<div class="sidebar-mode-switch">
					<div class="mode-switch-box">
						<div class="mode-btn" id="global-btn-subject" onclick="switchViewMode('subject')" >科目活动</div>
						<div class="mode-btn active" id="global-btn-global" onclick="switchViewMode('global')">全局活动</div>
					</div>
				</div>
				<div class="admin-tools-row">
					<select class="admin-select" id="global_class_slc" onchange="onAdminGlobalClassChange()">
						<option value="all">全部班级</option>
						<option value="class1">一年一班</option>
						<option value="class2">一年二班</option>
					</select>

					<div style="position:relative; flex:1; display:flex; align-items:center;">
						<input type="text" 
						   class="admin-search-input" 
						   placeholder="🔍 搜索活动"  
						   id="global_search_inp" 
						   oninput="refreshGlobalView()"> <span class="admin-search-clear" 
						  id="global_search_clear"
						  onclick="document.getElementById('global_search_inp').value=''; refreshGlobalView();">✕</span>
					</div>
				</div>
				<div class="sidebar-tabs" id="global_tab_container">
					<div class="tab-btn active" id="global-tab-running" onclick="switchGlobalStatusTab(false, this)" >进行中</div>
					<div class="tab-btn" id="global-tab-ended" onclick="switchGlobalStatusTab(true, this)">已结束</div>
				</div>
				
				<div class="list-content" id="global_activity_list" style="background:#FFF;">
					<!--左侧活动列表区间-->
				</div>

				<div class="add-btn-area">
					<button class="btn-add-dashed" onclick="startNewGlobalActivity()">+ 发布全局活动任务</button>
				</div>
			</div>
		</div>

		<div class="main-area panel-base">
		
			<div class="main-top-bar" style="min-height: 60px;">
				<div style="display:flex; align-items:center; gap:10px;">
					<span id="global-main-title" style="font-size:18px; font-weight:800; color:var(--text-main);">寒假数学大闯关 (配置中)</span>
				</div>
				<div class="admin-toolbar-right">
        
					<div class="filter-group" id="filter_group">
						<button class="btn-filter active" onclick="switchGlobalFilter('all', this)">全部活动</button>
						<button class="btn-filter" onclick="switchGlobalFilter('selected', this)">已选活动</button>
						<button class="btn-filter" onclick="switchGlobalFilter('unselected', this)">未选活动</button>
					</div>

					<div class="toolbar-divider"></div>

					<button class="btn-reward-settings" id="btn_reward_settings" onclick="openRewardSettings()">
						🎁奖励设置
					</button>
				</div>
			</div>
			

			<div class="grid-container" id="global-card-gallery">
				<div class="admin-map-gallery" id="activity_map">
				
				
					<div class="global-card">
						<div class="gc-header">
							<div class="gc-class-info">三年二班</div>
							<div class="gc-tag-joined"></div>
						</div>

						<div class="gc-body">
							<div class="gc-row">
								<span class="gc-label">活动名称</span>
								<span class="gc-value-title">寒假数学大作战</span>
							</div>
							<div class="gc-row">
								<span class="gc-label">活动时间</span>
								<span class="gc-value">2026.01.01 ~ 02.01</span>
							</div>
							<div class="gc-row">
								<span class="gc-label">参与科目</span>
								<span class="gc-value">全科</span>
							</div>
							<div class="gc-row">
								<span class="gc-label">活动状态</span>
								<span class="gc-value status-text-active">进行中</span>
							</div>
						</div>

						<div class="gc-footer">
							<button class="btn-remove-card" onclick="alert('移出')">🗑️ 移出活动</button>
						</div>
					</div>
					<div class="global-card">
						<div class="gc-header">
							<div class="gc-class-info">三年二班</div>
							<div class="gc-tag-joined"></div>
						</div>

						<div class="gc-body">
							<div class="gc-row">
								<span class="gc-label">名称</span>
								<span class="gc-value-title">寒假数学大作战</span>
							</div>
							<div class="gc-row">
								<span class="gc-label">时间</span>
								<span class="gc-value">2026.01.01 ~ 02.01</span>
							</div>
							<div class="gc-row">
								<span class="gc-label">科目</span>
								<span class="gc-value">全科</span>
							</div>
							<div class="gc-row">
								<span class="gc-label">状态</span>
								<span class="gc-value status-text-active">进行中</span>
							</div>
						</div>

						<div class="gc-footer">
							<button class="btn-remove-card" onclick="alert('移出')">🗑️ 移出活动</button>
						</div>
					</div>
					
					
					
					

				</div>
				
				
				</div>
			</div>

			<div class="right-panel panel-base" style="background: #FFFBF7;">
				<div class="panel-header" style="height: 50px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
					
					<span style="font-size:16px; font-weight:800; color:#5D4037;">
						活动设置
					</span>
					
					<div id="global-btn-cancel" onclick="cancelNewGlobalActivity()"
						 style="cursor:pointer; display:none; font-size:18px; color:#999;"
						 title="取消新建" >
						 ❌
					</div>
				</div>
				
				<div id="global-empty-right" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#BCAAA4;">
					<div style="font-size:40px; margin-bottom:15px; opacity:0.6;">⚙️</div>
					<div style="font-size:13px;">当前未选择活动</div>
					<div style="font-size:12px; margin-top:5px; opacity:0.8;">请点击左侧"发布新活动"</div>
				</div>			
				

				<div id="global-form-container" style="flex:1; overflow-y:auto; padding:20px; display:none;">
					
					<div class="form-group">
					<label class="admin_global_label">🏫选择班级</label>
					<select class="input-base" style="font-weight:bold; color:#37474F;" id="global-class-select">
						<option value="class_1">一年级(1)班</option>
						<option value="class_2">一年级(2)班</option>
					</select>
				</div>
					
				<div class="form-group">
					<label class="admin_global_label">🚩冒险活动名称</label>
					<input type="text" class="input-base" id="global-title" placeholder="例如：寒假数学大闯关">
				</div>
				
				<div class="form-group">
					<div class="admin_global_header_row">
						<label class="admin_global_label" style="margin:0;">📈 累计活动</label>
					</div>

					<div id="accumulate-activity-container" class="admin_global_task_list admin_global_task_list_small">
						<div class="task-capsule-item">
							<span class="task-capsule-text">累计打卡7天</span>
						</div>
					</div>
				</div>

				<div class="form-group">
					<div class="admin_global_header_row">
						<label class="admin_global_label" style="margin:0;">📅 续签活动</label>
					</div>

					<div id="continuous-activity-container" class="admin_global_task_list admin_global_task_list_small">
						<div class="task-capsule-item">
							<span class="task-capsule-text">累计打卡7天</span>
						</div>
						</div>
				</div>
				
				<div class="form-group">
					<div class="admin_global_header_row">
						<label class="admin_global_label" style="margin:0;">📦已选科目活动</label>
						<div style="font-size: 11px; color: #999;">
							已选 <span id="sub-activity-count" style="color:#FF9800; font-weight:bold;">0</span> 个任务
						</div>
					</div>

					<div id="sub-activity-container" class="admin_global_task_list">
						<div class="task-capsule-item">
							<span class="task-capsule-text">第1关：10以内加减法混合运算</span>
						</div>
						<div class="task-capsule-item">
							<span class="task-capsule-text">第2关：背诵唐诗三首</span>
						</div>
					</div>
				</div>

				
				<div class="info-box">
					<strong>配置提示：只需要选择班级和活动名</strong><br>
				</div>
			</div>
			<div id="global-action-area" class="action-area" style="background:transparent; display:none;">
				<div id="global-mode-create">
					<button id="action-btns-global" class="btn-full btn-save" onclick="saveGlobalActivity()">新建管理活动</button>
				</div>
				<div id="global-mode-edit" style="display:none; gap:10px;">
					<button class="btn-full" style="flex:1; background:#42A5F5; color:white;" onclick="saveGlobalEdit()">修改配置</button>
					<button class="btn-full" style="flex:1; background:#EF5350; color:white;" onclick="endGlobalActivity()">结束活动</button>
				</div>
			</div>
		</div>
	</div>
	<!-----------------全局活动结束 ----------------------------->
`;