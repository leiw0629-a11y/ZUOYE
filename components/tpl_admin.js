window.AppTemplates = window.AppTemplates || {};

// ✅ 后台端视图 (ID: view-admin)
// 包含完整的 D1-D28 配置状态 (没有星星/炸弹)
window.AppTemplates.adminMain = `
<div class="layout-container" id="view-admin" style="display:none;">
    
    <div class="sidebar panel-base">
        <div class="sidebar-container">
            <div class="sidebar-tabs">
				<div class="tab-btn active" onclick="switchAdminTab('ongoing', this)">进行中</div>
				<div class="tab-btn" onclick="switchAdminTab('unstart', this)">未开始</div>
                <div class="tab-btn" onclick="switchAdminTab('ended', this)">已结束</div>
            </div>
            
            <div class="list-content" style="background:#FFF;">
                
            </div>

            <div class="add-btn-area">
                <button class="btn-add-dashed" onclick="createNewActivity()">+ 发布新活动任务</button>
            </div>
        </div>
    </div>

    <div class="main-area panel-base">
        <div class="main-top-bar" style="min-height: 60px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <span id="admin-main-title" style="font-size:18px; font-weight:800; color:var(--text-main);">寒假数学大闯关 (配置中)</span>
            </div>
            <button id="btn-batch-toggle" class="btn-white" onclick="toggleBatchMode()" >🛠️批量操作</button>
        </div>

        <div class="grid-container" id="grid-container-admin">
            
        </div>
		<div id="batch-action-bar" class="batch-bar">
            <div style="font-size: 14px; white-space: nowrap;">
                已选择 <span id="batch-count" style="color: #4CAF50; font-weight: bold; font-size: 16px;">0</span> 天
            </div>
            
            <div style="display: flex; gap: 15px;">
                <button class="btn-tool" style="background: #4CAF50;" onclick="openBatchConfig()" >批量修改设置</button>
                <button class="btn-tool cancel" onclick="exitBatchMode()" >退出批量模式</button>
            </div>
        </div>
    </div>

    <div class="right-panel panel-base" style="background: #FFFBF7;">
        <div class="panel-header">
			<span>🛠活动设置</span>
			
			<div id="btn-cancel-create" 
				 onclick="cancelCreate()" 
				 style="cursor:pointer; display:none; font-size:18px; color:#999;"
				 title="取消新建">
				 ❌
			</div>
		</div>
        
        <div id="admin-empty-right" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#BCAAA4;">
            <div style="font-size:40px; margin-bottom:15px; opacity:0.6;">⚙️</div>
            <div style="font-size:13px;">当前未选择活动</div>
            <div style="font-size:12px; margin-top:5px; opacity:0.8;">请点击左侧"发布新活动"</div>
        </div>

        <div id="admin-form-container" style="flex:1; overflow-y:auto; padding:20px; display:none;">
            
            <div class="form-group">
                <label>🏫 选择班级</label>
                <select id="setting-class-id" class="input-base" style="font-weight:bold; color:#37474F;">
                    <option value="">-- 请选择班级 --</option>
                    <option value="class_3_2" selected>三年二班</option>
                    <option value="class_3_3">三年三班</option>
                </select>
            </div>

            <div class="form-group">
                <label>📚 所属科目</label>
                <select id="setting-act-subject" class="input-base" style="font-weight:bold; color:#37474F;">
                    <option value="">-- 请选择科目 --</option> <option value="math">📐 数学冒险</option>
                    <option value="chinese">📖 语文冒险</option>
                    <option value="english">🔤 英语冒险</option>
                    <option value="all">综合 (全科作业)</option>
                </select>
            </div>

            <div class="form-group">
                <label>🏝️ 冒险活动名称</label>
                <input id="setting-act-name" type="text" class="input-base" placeholder="例如：寒假数学大闯关">
            </div>

            <div class="form-group">
                <label>📅冒险周期</label>
                
                <input type="text" 
				   inputmode="numeric" 
				   id="setting-duration" 
				   class="input-base" 
				   placeholder="自定义天数" 
				   maxlength="3"
				   oninput="this.value=this.value.replace(/\D/g,''); if(this.value==='0') this.value=''; calcEndDate()"
				   style="flex:1; margin:0; height:34px; padding:0 10px; font-size:12px; border-radius:8px; min-width:0;">

                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <span style="font-size:10px; color:#999; display:block; margin-bottom:4px;">开始日期</span>
                        <input type="date" 
						   id="startDateInput" 
						   class="input-base" 
						   style="width:100%; box-sizing: border-box; cursor: pointer;" 
						   onchange="calcEndDate()" 
						   onclick="this.showPicker()">
                    </div>
                    <div>
                        <span style="font-size:10px; color:#999; display:block; margin-bottom:4px;">结束日期 (自动计算)</span>
                        <input type="date" id="endDateInput" class="input-base" style="width:100%; box-sizing: border-box; background:#F5F5F5; color:#888;" readonly>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <div class="toggle-row">
                    <div>
                        <div style="font-size:13px; font-weight:800; color:var(--text-sub);">周末自动休息</div>
                        <div style="font-size:10px; color:#999;">周六日自动标记为"休"</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            

            <div class="info-box">
                🔒 <strong>配置提示：</strong><br>
                修改上方信息将实时保存。<br>
                配置完成后请点击下方按钮。
            </div>
        </div>

        <div id="admin-action-area" class="action-area" style="background:transparent; display:none;">
            
            <div id="btn-mode-create">
                <button class="btn-full btn-save" onclick="saveAndExit()">保存并创建</button>
            </div>

            <div id="btn-mode-edit" style="display:none; gap:10px;">
                <button class="btn-full" style="flex:1; background:#42A5F5; color:white;" onclick="alert('暂未实现修改')">修改配置</button>
                <button class="btn-full" style="flex:1; background:#EF5350; color:white;" onclick="endCurrentActivity()">结束活动</button>
            </div>

        </div>
    </div>
</div>
`;