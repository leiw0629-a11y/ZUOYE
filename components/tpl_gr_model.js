window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.grModal = `
<div class="gr_modal_overlay" id="gr_reward_modal">
    <div class="gr_modal_box">
        <div class="gr_modal_header">
            <div class="gr_modal_title">
                <span style="font-size:20px;">🎁</span> 奖励配置中心
            </div>
            <div onclick="closeRewardSettings()" style="cursor:pointer; padding:5px; font-size:18px; color:#999;">✕</div>
        </div>

        <div class="gr_modal_body">
            
            <div class="gr_section_card">
                <div class="gr_section_tip" style="background:#E0F7FA; color:#006064;">
                    <span>📅</span> 
                    <strong>续签奖励 (连续打卡)</strong> 
                    <span style="font-weight:400; font-size:12px; margin-left:10px; opacity:0.8;">
                        学生连续完成任务可获得的奖励，中断则重置。
                    </span>
                </div>
                
                <div class="gr_config_row">
                    <label class="gr_switch">
                        <input type="checkbox" checked id="continue_enable_1">
                        <span class="gr_slider"></span>
                    </label>
                    <span class="gr_level_label">第 1 关</span>
                    <div class="gr_input_group">
                        <input type="number" class="gr_input_mini" id="continue_days_1" placeholder="目标天数 (如3)">
                        <input type="text"   class="gr_input_mini" id="continue_show_1" placeholder="展示名称 (如 神秘大奖)">
                        <input type="text"   class="gr_input_mini" id="continue_real_1" placeholder="真实内容 (如 免作业)">
                    </div>
                </div>

                <div class="gr_config_row">
                    <label class="gr_switch">
                        <input type="checkbox" id="continue_enable_2">
                        <span class="gr_slider"></span>
                    </label>
                    <span class="gr_level_label">第 2 关</span>
                    <div class="gr_input_group">
                        <input type="number" class="gr_input_mini" id="continue_days_2" placeholder="目标天数 (如7)">
                        <input type="text"   class="gr_input_mini" id="continue_show_2" placeholder="展示名称">
                        <input type="text"   class="gr_input_mini" id="continue_real_2" placeholder="真实内容">
                    </div>
                </div>

                <div class="gr_config_row">
                    <label class="gr_switch">
                        <input type="checkbox" id="continue_enable_3">
                        <span class="gr_slider"></span>
                    </label>
                    <span class="gr_level_label">第 3 关</span>
                    <div class="gr_input_group">
                        <input type="number" class="gr_input_mini" id="continue_days_3" placeholder="目标天数 (如21)">
                        <input type="text"   class="gr_input_mini" id="continue_show_3" placeholder="展示名称">
                        <input type="text"   class="gr_input_mini" id="continue_real_3" placeholder="真实内容">
                    </div>
                </div>
            </div>

            <div class="gr_section_card">
                <div class="gr_section_tip" style="background:#FFF3E0; color:#E65100; border-bottom-color:#FFE0B2;">
                    <span>📈</span> 
                    <strong>累计奖励 (里程碑)</strong> 
                    <span style="font-weight:400; font-size:12px; margin-left:10px; opacity:0.8;">
                        学生累计打卡天数达到目标即可获得，不会重置。
                    </span>
                </div>
                
                <div class="gr_config_row">
                    <label class="gr_switch">
                        <input type="checkbox" checked id="total_enable_1">
                        <span class="gr_slider"></span>
                    </label>
                    <span class="gr_level_label">第 1 关</span>
                    <div class="gr_input_group">
                        <input type="number" class="gr_input_mini" id="total_days_1" placeholder="累计天数 (如10)">
                        <input type="text"   class="gr_input_mini" id="total_show_1" placeholder="展示名称">
                        <input type="text"   class="gr_input_mini" id="total_real_1" placeholder="真实内容">
                    </div>
                </div>

                <div class="gr_config_row">
                    <label class="gr_switch">
                        <input type="checkbox" id="total_enable_2">
                        <span class="gr_slider"></span>
                    </label>
                    <span class="gr_level_label">第 2 关</span>
                    <div class="gr_input_group">
                        <input type="number" class="gr_input_mini" id="total_days_2" placeholder="累计天数 (如30)">
                        <input type="text"   class="gr_input_mini" id="total_show_2" placeholder="展示名称">
                        <input type="text"   class="gr_input_mini" id="total_real_2" placeholder="真实内容">
                    </div>
                </div>

                <div class="gr_config_row">
                    <label class="gr_switch">
                        <input type="checkbox" id="total_enable_3">
                        <span class="gr_slider"></span>
                    </label>
                    <span class="gr_level_label">第 3 关</span>
                    <div class="gr_input_group">
                        <input type="number" class="gr_input_mini" id="total_days_3" placeholder="累计天数 (如100)">
                        <input type="text"   class="gr_input_mini" id="total_show_3" placeholder="展示名称">
                        <input type="text"   class="gr_input_mini" id="total_real_3" placeholder="真实内容">
                    </div>
                </div>
            </div>

        </div>

        <div class="gr_modal_footer">
            <button class="btn-primary" id="btn_save_reward" onclick="saveRewardSettings()">保存奖励设置</button>
        </div>
    </div>
</div>
`;