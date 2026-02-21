window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.groupInfo = `
<div id="gi_overlay" class="gi_overlay" style="display: none;">
    
    <div class="gi_layout_wrapper">
        
        <div class="gi_col_left">
            
            <div class="gi_card gi_stats_panel">
                <div class="gi_card_header_row">
                    <span class="gi_h_title" id="gi_header_groupname">小组名称</span>
                    <span class="gi_h_date" id="gi_header_date">2026-01-01</span>
                </div>
                
                <div class="gi_dashboard">
                    <div class="gi_big_data">
                        <div class="gi_percent_txt" id="gi_stat_rate">0%</div>
                        <div class="gi_percent_lbl">提交率</div>
                    </div>
                    <div class="gi_v_line"></div>
                    <div class="gi_small_data">
                        <div class="gi_s_row">
                            <span class="gi_s_lbl">应交</span>
                            <span class="gi_s_val" id="gi_stat_total">0</span>
                        </div>
                        <div class="gi_s_row">
                            <span class="gi_s_lbl">实交</span>
                            <span class="gi_s_val success" id="gi_stat_actual">0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="gi_card gi_list_panel">
                <div class="gi_list_header">
                    <span class="gi_group_title" id="gi_group_title">小组成员</span>
                </div>
                
                <div class="gi_list_scroll_area">
                    </div>
            </div>
        </div>

        <div class="gi_col_right">
            <div class="gi_card gi_detail_panel">
                <div class="gi_detail_header">
                    <div class="gi_dh_left">
                        <span class="gi_dh_name">姓名</span>
                    </div>
                    <button class="gi_close_btn" onclick="toggleGiPopup(false)">×</button>
                </div>

                <div class="gi_detail_scroll">
                    </div>
            </div>
        </div>

    </div>
</div>
`;