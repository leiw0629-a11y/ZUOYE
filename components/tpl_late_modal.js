window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.lateModal = `

<div id="late-modal" class="late-overlay">
    
    <div class="late-layout-container">
        
		<div class="undo_batch-header-card">
            <div class="undo_batch-header-left">
				<div class="uLog_title-group">
				<span class="uLog_class-gradient" id="late_class_name">三年二班</span>
				<span class="uLog_vertical-line"></span>
				<span class="uLog_page-name">作业补交</span>
			</div>
			</div>
            <div class="undo_batch-header-right">
                <button class="late-close-btn" onclick="closeLateModal()">✖</button>
            </div>
        </div>
		
        <div class="late-body">
            
            <div class="late-sidebar">
                <div class="late-sidebar-header" id="late_student_num">待补交人员 (8)</div>
                <div class="late-student-list" id="late_student_list">
                    <div class="late-student-item active">李明</div>
                    <div class="late-student-item">王芳</div>
                    <div class="late-student-item">张伟</div>
                    <div class="late-student-item">欧阳娜娜</div>
                    <div class="late-student-item">刘洋</div>
                    <div class="late-student-item">陈曦</div>
                    <div class="late-student-item">赵强</div>
                    <div class="late-student-item">钱多多</div>
                </div>
            </div>

            <div class="late-main">
                
                <div class="late-toolbar" >
                    <div class="late-student-name" id="late-student-name">李明</div>

                    <div class="late-stats-bar">
                        <span class="stat-pending" id="late_student_card">待补交: 5</span>
                        <span style="color:#DDD">|</span>
                        <span class="stat-done" id="late_student_change">已选: 0</span>
                    </div>

                    <div class="late-actions">
                        <label class="late-checkbox-all">
                            <input type="checkbox"> 全选
                        </label>
                        <button class="late-btn-submit-all" onclick="handleBatchSubmit()">
                            ✨完成补交
                        </button>
                    </div>
                </div>

                <div class="late-grid-area" id="late_task_container">
                    
                    <div class="late-card">
                        <div class="late-card-header">
                            <input type="checkbox" class="late-card-check">
                            <div class="late-card-title">第一单元混合运算练习卷A</div>
                        </div>
                        <div class="late-card-body">
							<div class="late-range-text">2026-01-01~2026-01-31</div>

							<div class="late-clean-row">
								<span class="late-date-text">2026-01-28</span>
							</div>

							<div class="late-tag-subject">数学·应用题</div>
						</div>
                        <div class="late-card-footer">
                            <span>立即补交</span>
                        </div>
                    </div>

                    <div class="late-card selected"> 
						<div class="late-card-header">
                            <input type="checkbox" class="late-card-check" checked>
                        <div class="late-card-title">周末口算大挑战 (100题)</div>
                        </div>
                        <div class="late-card-body">
							<div class="late-range-text">2026-01-01~2026-01-31</div>

							<div class="late-clean-row">
								<span class="late-date-text">2026-01-28</span>
							</div>

							<div class="late-tag-subject">数学 · 应用题</div>
						</div>
                        <div class="late-card-footer">
                            <span>立即补交</span>
                        </div>
                    </div>

                    <div class="late-card">
                        <div class="late-card-header">
                            <input type="checkbox" class="late-card-check">
                            <div class="late-card-title">整理错题本 (第10-15页)</div>
                        </div>
                        <div class="late-card-body">
							<div class="late-range-text">2026-01-01~2026-01-31</div>

							<div class="late-clean-row">
								<span class="late-date-text">2026-01-28</span>
							</div>

							<div class="late-tag-subject">数学 · 应用题</div>
						</div>
                        <div class="late-card-footer">
                            <span>立即补交</span>
                        </div>
                    </div>

                     <div class="late-card">
                        <div class="late-card-header">
                            <input type="checkbox" class="late-card-check">
                            <div class="late-card-title">应用题专项训练</div>
                        </div>
                        <div class="late-card-body">
							<div class="late-range-text">2026-01-01~2026-01-31</div>

							<div class="late-clean-row">
								<span class="late-date-text">2026-01-28</span>
							</div>

							<div class="late-tag-subject">数学 · 应用题</div>
						</div>
                        <div class="late-card-footer">
                            <span>立即补交</span>
                        </div>
                    </div>

                </div>
            </div>
        </div> 
    </div> 
</div>
`;