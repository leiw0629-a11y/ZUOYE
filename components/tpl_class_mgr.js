window.AppTemplates = window.AppTemplates || {};

// 班级管理

window.AppTemplates.class_mgr = `
<!-- ================== 班级管理 模态框 HTML ================== -->
<div class="cm-overlay" id="modal-cm">
    <div class="cm-container">
        
        <!-- 1. 顶部标题栏 -->
        <div class="cm-header">
            <div class="cm-header-title">
                <span>🏫班级档案管理</span>
            </div>
            <!-- 关闭按钮 id="btn-close-cm" -->
            <button class="cm-btn-close" id="btn-close-cm">×</button>
        </div>

        <!-- 2. 下方主要内容区 -->
			<div class="cm-body">
				<!-- 左侧：导航菜单 -->
				<div class="cm-sidebar">
					<div class="cm-sidebar-label">管理菜单</div>
					
					<!-- 给班级列表加 id -->
					<div class="cm-menu-item active" onclick="showClassManager()"  id="menu-class-list">
						<span class="cm-menu-icon">📋</span>
						<span>班级列表</span>
					</div>

					<!-- 给新建班级加 id -->
					<div class="cm-menu-item" onclick="showNewClassView()" id="menu-new-class">
						<span class="cm-menu-icon-plus">🏫</span>
						<span>新建班级</span>
					</div>
					<!-- 底部小贴士 -->
					<div class="cm-tips-card">
						<div class="cm-tips-title">💡 小贴士</div>
						<ul class="cm-tips-list">
							<li>新生请去管理页录入</li>
							<li>分组前请先建班</li>
						</ul>
					</div>
				</div>

            <!-- 右侧：数据列表 -->
            <div class="cm-content"> 
			<!-- ================== 1. 班级列表视图 (默认显示) ================== -->
			<div id="view-class-list">
				<!-- 班级列表不需要顶部的返回条，直接开始表格 -->
				<div class="cm-table-wrapper">
					<!-- 表头 -->
					<div class="cm-table-header">
						<div class="cm-col-c1">班级名称</div>
						<div class="cm-col-c2">人数</div>
						<div class="cm-col-c3">状态</div>
						<div class="cm-col-c4">操作</div>
					</div>

					<!-- 列表内容 -->
					<div class="cm-table-body">
						<!-- 示例班级 1 -->
						<div class="cm-row">
							<div class="cm-col-c1">三年二班</div>
							<div class="cm-col-c2">9人</div>
							<div class="cm-col-c3"><span class="cm-status-badge">进行中</span></div>
							<div class="cm-col-c4">
								<!-- 点击这个按钮切换到学生列表 -->
								<button class="cm-btn-icon cm-btn-cyan btn-goto-student">🎓学生</button>
								<button class="cm-btn-icon cm-btn-orange btn-goto-group">🧩分组</button>
								<button class="cm-btn-icon-only">🗑️</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- ================== 2. 学生列表视图 (默认隐藏) ================== -->
			<!-- 注意：这里把原本的学生列表代码包裹起来了，并加了 style="display:none" -->
			<div id="view-student-list" style="display: none; flex-direction: column; height: 100%;">
				
				<!-- 内容区顶部：面包屑与操作 -->
				<div class="cm-content-top">
					<!-- 给返回按钮加了个 id="btn-back-to-class" -->
					<button class="cm-btn-back" id="btn-back-to-class">◀ 返回列表</button>
					<h2 class="cm-class-name">三年二班</h2> <!-- 这里可以通过JS动态修改 -->
					<button class="cm-btn-add" onclick="openAddStudentModal();">+新增学生</button>
				</div>

				<!-- 表格容器 (保持你原有的结构) -->
				<div class="cm-table-wrapper">
					<div class="cm-table-header">
						<div class="cm-col-name">姓名</div>
						<div class="cm-col-group">所属分组</div>
						<div class="cm-col-action">操作</div>
					</div>

					<div class="cm-table-body">
						<!-- 原有的学生行... -->
						<div class="cm-row">
							<div class="cm-col-name">李明</div>
							<div class="cm-col-group"><span class="cm-tag cm-tag-orange">飞虎队</span></div>
							<div class="cm-col-action">
								<button class="cm-btn-opt cm-btn-blue">改名</button>
								<button class="cm-btn-opt cm-btn-red">移除</button>
							</div>
						</div>
						<!-- 更多学生... -->
					</div>
				</div>
			</div>
			
	   
	   
			<div id="view-group-list" style="display: none; flex-direction: column; height: 100%;">
				
				<!-- 顶部操作栏 -->
				<div class="cm-content-top">
					<button class="cm-btn-back" id="btn-back-from-group">◀返回列表</button>
					<h2 class="cm-class-name">分组管理</h2>
					<button class="cm-btn-add-group">+ 新建小组</button>
				</div>

				<!-- 分组卡片容器区域 -->
				<div class="cm-group-body">
					
					<!-- 小组卡片 1 -->
					<div class="cm-group-card">
						<div class="cm-group-header">
							<div class="cm-group-title">
								<span class="cm-shield-icon">🛡️</span> 飞虎队
							</div>
							<button class="cm-btn-icon-only" style="width:24px; height:24px; font-size:12px;">🗑️</button>
						</div>
						<div class="cm-group-content">
							<div class="cm-member-list">
								<div class="cm-member-chip">李明 <span class="cm-chip-close">×</span></div>
								<div class="cm-member-chip">孙悦 <span class="cm-chip-close">×</span></div>
								<div class="cm-member-chip">刘洋 <span class="cm-chip-close">×</span></div>
								<div class="cm-member-chip">吴斌 <span class="cm-chip-close">×</span></div>
							</div>
							<button class="cm-btn-dashed-add">+ 添加组员</button>
						</div>
					</div>

					<!-- 小组卡片 2 -->
					<div class="cm-group-card">
						<div class="cm-group-header">
							<div class="cm-group-title">
								<span class="cm-shield-icon" style="color:#2196F3;">🛡️</span> 雄鹰队
							</div>
							<button class="cm-btn-icon-only" style="width:24px; height:24px; font-size:12px;">🗑️</button>
						</div>
						<div class="cm-group-content">
							<div class="cm-member-list">
								<div class="cm-member-chip">王芳 <span class="cm-chip-close">×</span></div>
								<div class="cm-member-chip">周涛 <span class="cm-chip-close">×</span></div>
								<div class="cm-member-chip">张敏 <span class="cm-chip-close">×</span></div>
								<div class="cm-member-chip">郑婷 <span class="cm-chip-close">×</span></div>
							</div>
							<button class="cm-btn-dashed-add">+ 添加组员</button>
						</div>
					</div>

					<!-- 未分组区域 (样式稍有不同) -->
					<div class="cm-group-card cm-card-gray">
						<div class="cm-group-header">
							<div class="cm-group-title" style="color:#757575;">
								<span>👻</span> 未分组
							</div>
						</div>
						<div class="cm-group-content" style="min-height: 60px;">
							<div class="cm-member-list">
								<span class="cm-text-gray">陈琳</span>
							</div>
						</div>
					</div>

				</div>
			</div>
	
			<!-- ================== 4. 新建班级视图 (默认隐藏) ================== -->
			<div id="view-new-class" style="display: none; flex-direction: column; height: 100%;">

        <!-- 表单主体区域 -->
        <div class="cm-form-body">
            
            <!-- 1. 班级名称 -->
            <div class="cm-form-group">
                <label class="cm-label">🏫 班级名称 <span style="color:#FF5252">*</span></label>
                <input type="text" class="cm-input" id="cm-class-name" placeholder="必填，例：四年三班">
            </div>

            <!-- 2. 初始名单 -->
            <div class="cm-form-group" style="flex: 1; display: flex; flex-direction: column;">
                <div class="cm-label-row">
                    <label class="cm-label">📝 学生名单 <span style="font-weight:normal; color:#999; font-size:13px;">(必填)</span></label>
                    <button class="cm-btn-import-txt">📂 导入 TXT</button>
                </div>
                <textarea class="cm-textarea" id="cm-student-list" placeholder="张三&#10;李四&#10;..."></textarea>
            </div>

            <!-- 3. 底部大按钮 -->
            <div style="margin-top: 20px; text-align: center;">
                <button class="cm-btn-create-big" onclick="onClickCreateClass()">💾 立即创建</button>
            </div>

        </div>
    </div>
	   
			</div>
    </div>
</div>
	</div>
	
	<div id="modal-step1-name" class="cm-overlay" style="display: none; z-index: 2000; background: rgba(0,0,0,0.5);">
    <div class="cm-dialog-box" style="width: 400px; background: #fff; border-radius: 12px; padding: 20px; text-align: center;">
        <h3 style="color: #555; margin-bottom: 20px;">✨ 新建小组</h3>
        
        <input type="text" id="inp-new-group-name" placeholder="请输入小组名称 (如: 飞虎队)" 
               style="width: 100%; padding: 12px; border: 1px solid #ffbcbc; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px; color: #333;">
        
        <div style="margin-top: 25px; display: flex; justify-content: space-between;">
            <button onclick="closeStepModal('modal-step1-name')" 
                    style="width: 45%; padding: 10px; border-radius: 20px; border: 1px solid #ddd; background: #f5f5f5; color: #666; cursor: pointer;">取消</button>
            <button onclick="nextStepSelectStudent()" 
                    style="width: 45%; padding: 10px; border-radius: 20px; border: none; background: #FF7D55; color: #fff; cursor: pointer; font-weight: bold;">确认创建</button>
        </div>
    </div>
</div>

<div id="modal-step2-member" class="cm-overlay" style="display: none; z-index: 2001; background: rgba(0,0,0,0.5);">
    <div class="cm-dialog-box" style="width: 550px; background: #fff; border-radius: 12px; padding: 0; overflow: hidden; display: flex; flex-direction: column; max-height: 80vh;">
        
        <div style="padding: 15px 20px; border-bottom: 1px dashed #eee; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span id="step2-group-title" style="font-size: 18px; font-weight: bold; color: #FF7D55;">小组名</span>
                <span style="font-size: 12px; color: #999; margin-left: 5px;">(仅显示“未分组”的学员)</span>
            </div>
            <span onclick="closeStepModal('modal-step2-member')" style="cursor: pointer; color: #999;">×</span>
        </div>

        <div id="step2-student-list" style="padding: 10px; overflow-y: auto; flex: 1;">
            </div>

        <div style="padding: 15px 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between;">
            <button onclick="closeStepModal('modal-step2-member')" 
                    style="width: 45%; padding: 10px; border-radius: 20px; border: 1px solid #ddd; background: #fff; color: #666; cursor: pointer;">取消</button>
            <button onclick="confirmCreateGroupFinal()" 
                    style="width: 45%; padding: 10px; border-radius: 20px; border: none; background: #FF7D55; color: #fff; cursor: pointer; font-weight: bold;">确认添加</button>
        </div>
    </div>
</div>

<div id="modal-add-student" class="cm-overlay" style="display: none; z-index: 2005;">
    <div class="cm-dialog-box" style="width: 440px; height: 300px; background: #fff; border-radius: 16px; padding: 0; display: flex; flex-direction: column; overflow: hidden; position: relative;">
        
        <div style="padding: 15px 20px; border-bottom: 1px dashed #eee; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 18px; font-weight: 800; color: #5D4037; display: flex; align-items: center; gap: 8px;">
                <span>👨‍🎓</span> 录入学生
            </div>
            <span onclick="closeAddStudentModal()" style="cursor: pointer; color: #ccc; font-size: 22px; font-weight: bold; line-height: 1;">×</span>
        </div>

        <div style="flex: 1; padding: 20px; display: flex; flex-direction: column;">
            <textarea id="inp-student-names" placeholder="请输入学生姓名&#10;支持批量粘贴&#10;一行一个名字" 
                style="flex: 1; width: 100%; height: 120px; border: 1px solid #FFCCBC; border-radius: 8px; padding: 12px; font-size: 14px; outline: none; resize: none; box-sizing: border-box; line-height: 1.6; color: #555;"></textarea>
            
            <div style="text-align: right; font-size: 12px; color: #999; margin-top: 8px;">
                * 多个名字请换行分隔
            </div>
        </div>

        <div style="padding: 0 20px 20px 20px; display: flex; justify-content: space-between; gap: 15px;">
            <button onclick="closeAddStudentModal()" 
                    style="flex: 1; height: 44px; border-radius: 22px; border: 1px solid #ddd; background: #f5f5f5; color: #666; font-weight: bold; cursor: pointer;">
                取消
            </button>
            <button onclick="confirmAddStudent()" 
                    style="flex: 1; height: 44px; border-radius: 22px; border: none; background: linear-gradient(90deg, #FF8A65, #FF7043); color: white; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(255, 112, 67, 0.3);">
                确认添加
            </button>
        </div>

    </div>
</div>
`;