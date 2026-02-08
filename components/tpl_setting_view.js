window.AppTemplates = window.AppTemplates || {};

// ✅ 学生端视图 (ID: view-student)
// 包含完整的 D1-D28 学生数据
window.AppTemplates.settingView = `
<div class="set_modal_overlay" id="globalSettingModal">
    <div class="set_modal_box">
        
        <div class="set_modal_header">
            <div class="set_header_title">
                <span class="set_icon">⚙️</span> 全局参数设置 
                <a href="#" class="set_link_help">[使用帮助]</a>
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