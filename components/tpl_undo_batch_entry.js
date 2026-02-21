window.AppTemplates = window.AppTemplates || {};

// ✅ 后台端视图 (ID: view-admin-undo)
// 包含完整的 D1-D28 配置状态 (没有星星/炸弹) - 撤销/修改版
window.AppTemplates.undoBatchEntry = `
<div id="undo_batch-modal" class="undo_batch-overlay" style="display: none;">
    
    <div class="undo_batch-layout-container">
        
        <div class="undo_batch-header-card">
            <div class="undo_batch-header-left">
				<div class="uLog_title-group">
				<span class="uLog_class-gradient" id="undo_className_title">三年二班</span>
				<span class="uLog_vertical-line"></span>
				<span class="uLog_page-name">撤销作业</span>
			</div>
    
			
			<div class="uLog_date-picker" style="position: relative; cursor: pointer;">
                    <span class="uLog_date-text" id="undo_date_display">📅 加载中...</span>
                    <span class="uLog_date-arrow">▼</span>
                    
                    <input type="date" 
                           id="undo_date_input"
                           style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                           onclick="this.showPicker()" 
                           onchange="undoUpdateDateDisplay(this)"
                    >
                </div>
			</div>
            <div class="undo_batch-header-right">
                <button class="undo_batch-btn-close" onclick="closeUndoBatchModal()">✖</button>
            </div>
        </div>

        <div class="undo_batch-body-split">
            
            <div class="undo_batch-sidebar-card" id="undo_batch-sidebar">
    <div class="undo_batch-fusion-header">
        <div class="undo_batch-title-trigger" onclick="undoToggleBatchPicker()">
            <h3 class="undo_batch-current-name" id="undo_batch-curr-name">全班活动</h3><span class="undo_batch-arrow-icon">⌄</span>
        </div>
    </div>

    <div class="undo_batch-sidebar-stack">
        
        <div class="undo_batch-panel-view" id="undo_batch-view-subjects">
            <div class="undo_batch-subject-list" id="undo_batch_subject_list_container">
                <div class="undo_batch-subject-item undo_active">
                    <span>📖 语文作业</span>
                </div>
                <div class="undo_batch-subject-item">
                    <span>📐 数学作业</span>
                </div>
                <div class="undo_batch-subject-item">
                    <span>🔤 英语作业</span>
                </div>
                <div class="undo_batch-subject-item">
                    <span>🔬 科学实验</span>
                </div>
            </div>
        </div>

        <div class="undo_batch-panel-view undo_batch-picker-view" id="undo_batch-view-activities">
            
            <div class="undo_batch-picker-list-content" id="undo_batch_activity_list_container">
                <div class="undo_batch-act-item undo_active" onclick="undoSelectBatchActivity(this,  '全班活动')">
                    <div class="undo_batch-act-status undo_ongoing"></div>
                    <div class="undo_batch-act-info">
                        <div class="undo_batch-act-name">全班活动</div>
                        <div class="undo_batch-act-meta">进行中</div>
                    </div>
                </div>

                <div class="undo_batch-act-item" onclick="undoSelectBatchActivity(this,  '寒假数学口算营')">
                    <div class="undo_batch-act-status undo_ongoing"></div>
                    <div class="undo_batch-act-info">
                        <div class="undo_batch-act-name">寒假数学口算营</div>
                        <div class="undo_batch-act-meta">进行中</div>
                    </div>
                </div>

                <div class="undo_batch-act-item" onclick="undoSelectBatchActivity(this, '21天英语晨读')">
                    <div class="undo_batch-act-status undo_ongoing"></div>
                    <div class="undo_batch-act-info">
                        <div class="undo_batch-act-name">21天英语晨读</div>
                        <div class="undo_batch-act-meta">进行中 </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
<div class="undo_batch-main-card">
                
                <div class="undo_batch-toolbar">
                    <div class="undo_batch-toolbar-left">
						<div id="undo_batch_toolbar_subject_name" style="color:#5D4037; font-weight:900; font-size:18px;">暂无活动</div>
					</div>
                    <div id="undo_batch_attendance_hd1" class="undo_batch-attendance-bar">
						<span class="undo_att-item" id="undo_batch-student-count">全班40</span>
						<span class="undo_att-divider">/</span>
						<span class="undo_att-item undo_active" id="undo_batch-expected-count">已交0</span>
						<span class="undo_att-divider">/</span>
						<span class="undo_att-item undo_danger" id="undo_batch-actual-count">撤销0</span>
					</div>
                    <div id="undo_batch_attendance_hd2" style="display:flex; gap:10px; align-items:center;">
						<label class="undo_batch-checkbox-wrapper">
							<input type="checkbox" id="undo_btn-select-all" onchange="undo_toggleBatchSelectAll(this.checked)">
							<span>全选</span>
						</label>
                        <button class="undo_batch-btn-confirm" onclick="undoFinishBatchEntry()">
                            确定撤销
                        </button>
                    </div>
                </div>

                <div class="undo_batch-scroll-area" id="undo_batch-student-container">
                    <div class="undo_batch-student-capsule">李明</div>
                    <div class="undo_batch-student-capsule">王芳</div>
                    <div class="undo_batch-student-capsule undo_active">孙悦</div>
                    <div class="undo_batch-student-capsule">周涛</div>
                    <div class="undo_batch-student-capsule undo_active">陈曦</div>
                    <div class="undo_batch-student-capsule">张伟</div>
                    <div class="undo_batch-student-capsule">刘洋</div>
                    <div class="undo_batch-student-capsule">赵强</div>
                    <div class="undo_batch-student-capsule">钱多多</div>
                    <div class="undo_batch-student-capsule">孙小美</div>
                    <div class="undo_batch-student-capsule">欧阳娜娜</div>
                </div>
            </div>
        </div> 
    </div> 
</div>
`;