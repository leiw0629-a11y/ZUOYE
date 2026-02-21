window.AppTemplates = window.AppTemplates || {};

// ✅ 后台端视图 (ID: view-admin)
// 包含完整的 D1-D28 配置状态 (没有星星/炸弹)
window.AppTemplates.batchEntry = `
<div id="batch-modal" class="batch-overlay" style="display: none;">
    
    <div class="batch-layout-container">
        
        <div class="batch-header-card">
            <div class="batch-header-left">
				<div class="uLog_title-group">
				<span class="uLog_class-gradient" id="batch_header_class_name">三年二班</span>
				<span class="uLog_vertical-line"></span>
				<span class="uLog_page-name">作业录入</span>
			</div>
				<div class="batch-date-wrapper" style="pointer-events: none; border: none; background: transparent;">
					<span class="batch-date-text" id="batch_task_date_display">
						2026年1月31日
					</span>
				</div>
			</div>
            <div class="batch-header-right">
                <button class="batch-btn-close" onclick="closeBatchModal()">✖</button>
            </div>
        </div>
		
		
        <div class="batch-body-split">
            
            <div class="batch-sidebar-card" id="batch-sidebar">
    <div class="batch-fusion-header">
        <div class="batch-title-trigger" onclick="toggleBatchPicker()">
            <h3 class="batch-current-name" id="batch-curr-name">全班活动</h3><span class="batch-arrow-icon">⌄</span>
        </div>
    </div>

    <div class="batch-sidebar-stack">
        
        <div class="batch-panel-view" id="batch-view-subjects">
            <div class="batch-subject-list" id="batch_subject_list_container">
                <div class="batch-subject-item active">
                    <span>📖 语文作业</span>
                </div>
                <div class="batch-subject-item">
                    <span>📐 数学作业</span>
                </div>
                <div class="batch-subject-item">
                    <span>🔤 英语作业</span>
                </div>
                <div class="batch-subject-item">
                    <span>🔬 科学实验</span>
                </div>
            </div>
        </div>

        <div class="batch-panel-view batch-picker-view" id="batch-view-activities">
            <div class="batch-picker-search">
                
            </div>
            
            <div class="batch-picker-list-content" id="batch_activity_list_container">
                <div class="batch-act-item active" onclick="selectBatchActivity(this,  '全班活动')">
                    <div class="batch-act-status ongoing"></div>
                    <div class="batch-act-info">
                        <div class="batch-act-name">全班活动</div>
                        <div class="batch-act-meta">进行中 · 剩余16天</div>
                    </div>
                </div>

                <div class="batch-act-item" onclick="selectBatchActivity(this,  '寒假数学口算营')">
                    <div class="batch-act-status ongoing"></div>
                    <div class="batch-act-info">
                        <div class="batch-act-name">寒假数学口算营</div>
                        <div class="batch-act-meta">进行中 · 剩余12天</div>
                    </div>
                </div>

                <div class="batch-act-item" onclick="selectBatchActivity(this, '21天英语晨读')">
                    <div class="batch-act-status ongoing"></div>
                    <div class="batch-act-info">
                        <div class="batch-act-name">21天英语晨读</div>
                        <div class="batch-act-meta">进行中 · 剩余5天</div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
<div class="batch-main-card">
                
                <div class="batch-toolbar">
                    <div class="batch-toolbar-left">
						<div id="batch_toolbar_subject_name" style="color:#5D4037; font-weight:900; font-size:18px;">暂无活动</div>
					</div>
                    <div id="batch_attendance_hd1" class="batch-attendance-bar">
						<span class="att-item" id="batch-student-count">全班40</span>
						<span class="att-divider">/</span>
						<div id="batch-leave-container" class="att-item leave tooltip-container">
							<span id="batch-leave-count">请假2</span>
							<div class="tooltip-content">
								<div class="tooltip-title">今日请假</div>
								<div id="batch-leave-list" class="tooltip-list">
									<span>张三</span>
									<span>李四</span>
									<span>王五</span>
									<span>赵六</span>
								</div>
							</div>
						</div>
						<span class="att-divider" id="batch-leave-divider">/</span>
						<span class="att-item active" id="batch-expected-count">应交0</span>
						<span class="att-divider">/</span>
						<span class="att-item danger" id="batch-actual-count">实交0</span>
					</div>
                    <div id="batch_attendance_hd2" style="display:flex; gap:10px; align-items:center;">
						<label class="batch-checkbox-wrapper">
							<input type="checkbox" id="btn-select-all" onchange="toggleBatchSelectAll(this.checked)">
							<span>全选</span>
						</label>
                        <button class="batch-btn-confirm" onclick="finishBatchEntry()">
                            完成录入
                        </button>
                    </div>
                </div>

                <div class="batch-scroll-area" id="batch-student-container">
                    <div class="batch-student-capsule">李明</div>
                    <div class="batch-student-capsule">王芳</div>
                    <div class="batch-student-capsule active">孙悦</div>
                    <div class="batch-student-capsule">周涛</div>
                    <div class="batch-student-capsule active">陈曦</div>
                    <div class="batch-student-capsule">张伟</div>
                    <div class="batch-student-capsule">刘洋</div>
                    <div class="batch-student-capsule">赵强</div>
                    <div class="batch-student-capsule">钱多多</div>
                    <div class="batch-student-capsule">孙小美</div>
                    <div class="batch-student-capsule">欧阳娜娜</div>
                </div>
            </div>
        </div> 
    </div> 
</div>
`;