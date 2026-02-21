window.AppTemplates = window.AppTemplates || {};

// ✅ 学生端视图 (ID: view-student)
// 包含完整的 D1-D28 学生数据
window.AppTemplates.settingView = `
<div class="set_modal_overlay" id="globalSettingModal">
    <div class="set_modal_box">
        
        <div class="set_modal_header">
            <div class="set_header_title">
                <span class="set_icon">⚙️</span> 全局参数设置 
                <div style="position: relative; display: inline-block; margin-left: 10px;">
                    <a href="javascript:void(0)" 
                       onclick="document.getElementById('global_help_popup').style.display='block'"
                       style="font-size: 14px; color: #1976D2; text-decoration: underline; cursor: pointer; font-weight: normal;">
                       [使用帮助]
                    </a>
                    
                    <div id="global_help_popup" 
                         onmouseleave="this.style.display='none'"
                         style="display: none; 
                                position: absolute; 
                                left: 0; 
                                top: 25px; 
                                width: 380px; 
                                padding: 15px; 
                                background-color: #FFF8E1; 
                                border: 1px solid #FFE0B2; 
                                border-radius: 8px; 
                                box-shadow: 0 4px 15px rgba(0,0,0,0.15); 
                                z-index: 1000; 
                                font-size: 13px; 
                                line-height: 1.6; 
                                color: #5D4037;
                                text-align: left;
                                font-weight: normal;
                                cursor: default;">
                        
                        <div style="margin-bottom: 12px; color: #1565C0; font-weight: bold; background: #E3F2FD; padding: 10px; border-radius: 6px; border: 1px solid #BBDEFB;">
                            🚀 快速上手 5 步曲：<br>
                            <span style="font-weight: normal; color: #0D47A1; display: inline-block; margin-top: 4px;">
                                1️⃣ <b>参数设置：</b>设定双重密码及补交期限。<br>
                                2️⃣ <b>建班建人：</b>创建班级，录入学生名单。<br>
                                3️⃣ <b>发布活动：</b>建立日常打卡/作业活动。<br>
                                4️⃣ <b>高效批改：</b>课代表或老师一键录入记录。<br>
                                5️⃣ <b>学情分析：</b>随时查看多维度图表数据。
                            </span>
                        </div>

                        <strong style="color: #E65100; font-size: 14px;">💡 避坑与答疑</strong><hr style="margin: 8px 0; border: 0; border-top: 1px dashed #FFCC80;">
                        
                        <div style="margin-bottom: 8px;">
                            <b>🔒 账号权限（重要）：</b><br>
                            用【学生密码】登录时，会自动隐藏设置面板，防止误删！老师请使用专属密码解锁所有功能。
                        </div>
                        <div style="margin-bottom: 8px;">
                            <b>💾 数据存在哪？防丢失必看：</b><br>
                            所有数据全部保存在<b>您的浏览器本地</b>。建议定期点击【💾保存】下载备份至电脑。如果不小心清空了浏览器，只要有备份文件就能一键【📂导入】全盘恢复！
                        </div>
                        <div>
                            <b>⚠️ 删除预警：</b><br>
                            系统不支持直接删除“活动”。注意：如果您删除了“班级”，<span style="color: #D32F2F; font-weight: bold;">与其相关的所有作业记录和活动都会被永久清除</span>
                        </div>
                        <div style="margin-top: 10px; text-align: right; color: #999; font-size: 12px;">
                            (鼠标移出此区域自动关闭) ↘
                        </div>
                    </div>
                </div>
                </div>
            <div class="set_close_btn" onclick="document.getElementById('globalSettingModal').style.display='none'">×</div>
        </div>

        <div class="set_modal_body">
            
            <div class="set_col_left">
                <div class="set_section_title">
                    <span class="set_icon">⚖️</span> 基础配置
                </div>

                <div class="set_form_container">
                    <div class="set_form_row">
						<label>学生用密码</label>
						<div class="set_pwd_wrapper">
							<input type="password" class="input-base set_input_short" placeholder="学生用密码" id="set_student_pass" style="padding-right: 30px;">
							<span class="set_eye_icon" onclick="togglePwd(this)">👁️</span>
						</div>
					</div>

					<div class="set_form_row">
						<label>老师用密码</label>
						<div class="set_pwd_wrapper">
							<input type="password" class="input-base set_input_short" placeholder="老师用密码" id="set_teacher_pass" style="padding-right: 30px;">
							<span class="set_eye_icon" onclick="togglePwd(this)">👁️</span>
						</div>
					</div>
					<div class="set_form_row">
                        <label>作业补交日</label>
                        <input type="number" class="input-base set_input_short" placeholder="作业最大补交天数" id="set_makeup_days">
                    </div>
                    <div class="set_form_row">
                        <label>记录撤销日</label>
                        <input type="number" class="input-base set_input_short" placeholder="作业最大撤销天数" id="set_undo_days">
                    </div>
                </div>

                <div class="set_warning_box">
                    💡 <strong>注意：</strong> 学生用密码看不到基础设置和活动设置按钮，作业补交日指几天内的作业可以补交(设置1代表仅限今天)记录撤销日指可以撤销几天内的作业录入记录
                </div>
            </div>

            <div class="set_vertical_divider"></div>

            <div class="set_col_right">
                <div class="set_section_title">
                    <span class="set_icon">📑</span> 科目管理
                </div>

                <div class="set_subject_display_area" id="set_subject_list">
                    <div class="set_tag_item">语文 <span class="set_del">×</span></div>
                    <div class="set_tag_item">数学 <span class="set_del">×</span></div>
                    <div class="set_tag_item">英语 <span class="set_del">×</span></div>
                    <div class="set_tag_item">日常 <span class="set_del">×</span></div>
                    <div class="set_tag_item">体育 <span class="set_del">×</span></div>
                </div>

                <div class="set_input_area_wrapper">
                    <div class="set_input_label">➕ 批量添加科目</div>
                    <textarea class="input-base set_textarea" placeholder="在此输入科目名称，每行一个（点下方保存生效）"></textarea>
                </div>

                <div class="set_hint_text" id="set_subject_input">
                    注：输入框里一行写一个科目。上方胶囊点一下就能直接改名，点×就是删除。
                </div>
            </div>

        </div>

        <div class="set_modal_footer">
            <button class="set_btn_save_big" onclick='saveGlobalSettings()'>应用并保存</button>
        </div>

    </div>
</div>
`;