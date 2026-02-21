window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.analysis = `
<div class="layout-container" id="view-analysis" style="display:none; height: 100%;">
    
    <div class="sidebar panel-base">
        <div class="sidebar-container">
            <div class="stu_tools_row">
                 <select class="stu_select" id="chart_class_slc" onchange="renderChartAllList()">
                    <option value="all">全部班级</option>
                 </select>
                 <div style="position:relative; flex:1; display:flex; align-items:center;">
                    <input type="text" id="chart_search_inp" class="stu_search_input" oninput="handleChartSearch(this.value)" placeholder="🔍搜索" style="width:100%;">
					<span id="chart_search_clear"
						  style="position:absolute; right:8px; top:50%; transform:translateY(-50%); 
								 color:#FF5252; cursor:pointer; font-weight:bold; font-size:14px; display:none; z-index:10;" onclick="clearChartSearch()">
						✕
					</span>
                </div>
            </div>
            
            <div class="chart_tabs_container">
                <div class="chart_tab_item active" id="chart_tab_student" onclick="handleChartTab('chart_tab_student')">👤学生</div>
                <div class="chart_tab_divider" ></div>
                <div class="chart_tab_item" id="chart_tab_group" onclick="handleChartTab('chart_tab_group')">🛡️小组</div>
                <div class="chart_tab_divider"></div>
                <div class="chart_tab_item" id="chart_tab_class" onclick="handleChartTab('chart_tab_class')">🏫班级</div>
            </div>

            <div class="list-content" id="chart_class_list">
                <div class="chart_stu_item active">
                    <div class="avatar-circle" style="background:#FFE0B2;">🐯</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px; display:flex; justify-content:space-between;">
                            于朦胧TEST
                        </div>
                    </div>
                </div>
                <div class="chart_stu_item">
                    <div class="avatar-circle" style="background:#E1BEE7;">🐰</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px;">余文乐</div>
                    </div>
                </div>
                <div class="chart_stu_item">
                    <div class="avatar-circle" style="background:#C5CAE9;">🦊</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px;">严浩翔</div>
                    </div>
                </div>
                 <div class="chart_stu_item">
                    <div class="avatar-circle" style="background:#B2DFDB;">🐸</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px;">温如玉</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="main-area panel-base" style="display:flex; flex-direction:column; background:#FFFBF7; flex:1;">
        
        <div class="main-top-bar">
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="font-size:18px; font-weight:800; color:var(--text-main); display:flex; align-items:center; gap:8px;">
                    📊 数据分析
                </span>
				<div class="chart_time_wrapper" style="position: relative;">
                    <select id="chartTimeSelect" class="chart_filter_badge_select" style="min-width:105px; height:28px;" onchange="CharthandleTimeChange()">
                        <option value="all">🕒全部时间</option>
                        <option value="week">📅近一周</option>
                        <option value="month" selected>🌙近一月</option>
                        <option value="year">⭐近一年</option>
                        <option value="custom">⚙️自定义...</option>
                    </select>
                    
                    <div id="chartDateArea" class="Chart_custom_date_popup" 
                         style="display: none; position: absolute; top: 115%; left: 0; background: #fff; padding: 8px 10px; border-radius: 8px; border: 1px solid #FFCCBC; box-shadow: 0 4px 15px rgba(230, 81, 0, 0.15); z-index: 100; white-space: nowrap;">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <input type="date" onclick="this.showPicker()" id="startDate" class="chart_date_input" style="width:105px; padding:2px; border:1px solid #ddd; border-radius:4px;">
                            <span style="color:#ccc">-</span>
                            <input type="date" onclick="this.showPicker()" id="endDate" class="chart_date_input" style="width:105px; padding:2px; border:1px solid #ddd; border-radius:4px;">
                            <button class="action-btn" style="padding:2px 8px; font-size:12px; white-space:nowrap; cursor:pointer;" onclick="chartCustomDate()">确定</button>
                        </div>
                    </div>
                </div>
                <button class="btn-primary" style="background:#4CAF50; height:28px;" onclick="exportCombinedChart()">
                    📥导出合并图
                </button>
				<button class="btn-white" style="border:1px solid #DDD;" onclick="closeAnalysisView()">
                🔙返回
            </button>
            </div>
        </div>

        <div class="chart_stats_row">
            <div class="chart_stat_card">
				<div class="chart_stat_icon">👥</div>
				<div class="chart_stat_info">
					<div class="chart_stat_label" id="chart_stat_label_1">所属小组</div>
					<div class="chart_stat_value" id="chart_stat_value_1">XX小组</div>
				</div>
			</div>
			<div class="chart_stat_card">
				<div class="chart_stat_icon" style="background:#FFF3E0; color:#FF9800;">⚠️</div>
				<div class="chart_stat_info">
					<div class="chart_stat_label">累计缺交</div>
					<div class="chart_stat_value" id="chart_stat_value_2">0次</div>
				</div>
			</div>
			<div class="chart_stat_card">
				<div class="chart_stat_icon" style="background:#E3F2FD; color:#2196F3;">📊</div>
				<div class="chart_stat_info">
					<div class="chart_stat_label">作业完成度</div>
					<div class="chart_stat_value" id="chart_stat_value_3">0%</div>
				</div>
			</div>
        </div>

        <div class="chart_main_container">
            <div class="chart_box">
                <div class="chart_header">
                    <span class="chart_title">热点图</span>
                    <button class="chart_save_btn" onclick="exportHeatmap()">保存图片</button>
                </div>
                <div class="chart_content">
                    <div id="chart_heatmap_container" style="width: 100%; height: 100%;"></div>
                </div>
            </div>

            <div class="chart_box">
                <div class="chart_header">
                    <span class="chart_title">趋势图</span>
                    <button class="chart_save_btn" onclick="exportLineChart()">保存图片</button>
                </div>
                <div class="chart_content">
                    <div id="chart_line_container" style="width:100%; height:100%;"></div>
                </div>
            </div>
        </div>

    </div>
</div>
`;