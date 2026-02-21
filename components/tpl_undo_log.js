window.AppTemplates = window.AppTemplates || {};

// ✅ 撤销日志弹窗视图 (ID: view-undo-log)
window.AppTemplates.undoLogModal = `
<div id="uLog_modal" class="uLog_overlay" style="display: none;">
    
    <div class="uLog_layout-container">
        
        <div class="undo_batch-header-card">
            <div class="undo_batch-header-left">
				<div class="uLog_title-group">
				<span class="uLog_class-gradient" id="ulog_className_title">三年二班</span>
				<span class="uLog_vertical-line"></span>
				<span class="uLog_page-name">撤销日志</span>
			</div>
    
			
			<div class="uLog_date-picker" style="position: relative; cursor: pointer;">
				<span class="uLog_date-text" id="uLog_date_display">📅 加载中...</span>
				<span class="uLog_date-arrow">▼</span>
                
                <input type="date" 
                       id="uLog_date_input"
                       style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                       onclick="this.showPicker()" 
                       onchange="uLog_updateDate(this)"
                >
			</div>
			</div>
            <div class="undo_batch-header-right">
                <button class="undo_batch-btn-close" onclick="uLog_closeModal()">✖</button>
            </div>
        </div>

        <div class="uLog_body-split">
            
            <div class="uLog_sidebar-card">
                <div class="uLog_sidebar-header">
                    <span class="uLog_static-title">全班活动</span>
                </div>

                <div class="uLog_sidebar-list" id="uLog_active_list">
				
                    <div class="uLog_item active">
        <div class="uLog_item-top">
            <span class="uLog_item-name">测试滚动条</span>
            <span class="uLog_status-dot"></span>
        </div>
        <div class="uLog_item-bottom">
            <span class="uLog_subject-tag">全科</span>
            <span class="uLog_item-date">02-04 ~ 02-15</span>
        </div>
    </div>

    <div class="uLog_item">
        <div class="uLog_item-top">
            <span class="uLog_item-name">语文阅读打卡</span>
            <span class="uLog_status-dot"></span>
        </div>
        <div class="uLog_item-bottom">
            <span class="uLog_subject-tag">语文</span>
            <span class="uLog_item-date">02-10 ~ 02-20</span>
        </div>
    </div>
					
					
					
                </div>
            </div>

            <div class="uLog_main-card">
                
                <div class="uLog_table-container">
                    <table class="uLog_table">
                        <thead>
    <tr>
        <th style="width: 15%;">姓名</th>
        
        <th style="width: 22%;">提交日期</th>
        
        <th style="width: 8%;">科目</th>
        
        <th style="width: 30%;">内容</th>
        
        <th style="width: 25%;">撤销时间</th>
    </tr>
</thead>
                        <tbody id="uLog_table_body">
                            <tr>
                                <td>张小明</td>
                                <td>2026-02-06</td>
                                <td>语文</td>
                                <td class="uLog_col-content" title="背诵《静夜思》视频上传">背诵《静夜思》视频上传</td>
                                <td class="uLog_col-time">2026-02-06 14:23:05</td>
                            </tr>
                            <tr>
                                <td>李红</td>
                                <td>2026-02-06</td>
                                <td>数学</td>
                                <td class="uLog_col-content">口算第15页拍照</td>
                                <td class="uLog_col-time">2026-02-06 14:25:12</td>
                            </tr>
                             <tr>
                                <td>王五</td>
                                <td>2026-02-05</td>
                                <td>英语</td>
                                <td class="uLog_col-content">Unit 1 单词抄写</td>
                                <td class="uLog_col-time">2026-02-06 09:10:45</td>
                            </tr>
                             <tr>
                                <td>赵六</td>
                                <td>2026-02-05</td>
                                <td>全科</td>
                                <td class="uLog_col-content">所有作业打包</td>
                                <td class="uLog_col-time">2026-02-05 18:00:01</td>
                            </tr>
                             <tr>
                                <td>孙七</td>
                                <td>2026-02-04</td>
                                <td>科学</td>
                                <td class="uLog_col-content">植物生长记录表</td>
                                <td class="uLog_col-time">2026-02-05 16:30:22</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div> 
    </div> 
</div>
`;