window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.classInfo = `
<div id="ci_overlay" class="ci_overlay" style="display: none;">
    
    <div class="ci_layout_wrapper">
        
        <div class="ci_col_left">
            
            <div class="ci_card ci_stats_panel">
                <div class="ci_card_header_row">
                    <span class="ci_h_title" id="ci_header_classname">三年二班</span>
                    <span class="ci_h_date" id="ci_header_date">2026-02-09</span>
                </div>
                
                <div class="ci_dashboard">
                    <div class="ci_big_data">
                        <div class="ci_percent_txt" id="ci_stat_rate">90%</div>
                        <div class="ci_percent_lbl">提交率</div>
                    </div>
                    <div class="ci_v_line"></div>
                    <div class="ci_small_data">
                        <div class="ci_s_row">
                            <span class="ci_s_lbl">应交</span>
                            <span class="ci_s_val" id="ci_stat_total">40</span>
                        </div>
                        <div class="ci_s_row">
                            <span class="ci_s_lbl">实交</span>
                            <span class="ci_s_val success" id="ci_stat_actual">36</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ci_card ci_list_panel">
                <div class="ci_list_header">
                    <span id="ci_list_title">待补交人员 (17人)</span>
                </div>
                
                <div class="ci_list_scroll_area" id="ci_unfinished_list">
                    <button class="ci_st_btn active">
                        安以轩
                    </button>
                    
                    <button class="ci_st_btn">丁禹兮</button>
                    <button class="ci_st_btn">东方不败</button>
                    <button class="ci_st_btn">公孙策</button>
                    <button class="ci_st_btn">令狐冲</button>
                    <button class="ci_st_btn">慕容云海</button>
                    <button class="ci_st_btn">欧阳娜</button>
                    <button class="ci_st_btn">乔振宇</button>
                    <button class="ci_st_btn">任嘉伦</button>
                    <button class="ci_st_btn">上官婉儿</button>
                    <button class="ci_st_btn">司马相如</button>
                    <button class="ci_st_btn">尉迟敬德</button>
                    <button class="ci_st_btn">长孙无忌</button>
                </div>
            </div>
        </div>

        <div class="ci_col_right">
            <div class="ci_card ci_detail_panel">
                
                <div class="ci_detail_header">
                    <div class="ci_dh_left">
                        <span class="ci_dh_name" id="ci_detail_name">安以轩</span>
                    </div>
                    <button class="ci_close_btn" onclick="document.getElementById('ci_overlay').style.display='none'">×</button>
                </div>

                <div class="ci_detail_scroll" id="ci_detail_container">
                    
                    <div class="ci_task_item">
                        <div class="ci_task_main">
                            <div class="ci_tm_top">
                                <span class="ci_tm_title">数学</span>
                            </div>
                            <div class="ci_tm_desc">口算练习 20 道 (演示已完成)</div>
                        </div>
                        <div class="ci_capsule done">已完成</div>
                    </div>

                    <div class="ci_task_item">
                        <div class="ci_task_main">
                            <div class="ci_tm_top">
                                <span class="ci_tm_title">英语</span>
                            </div>
                            <div class="ci_tm_desc">背诵 Unit 5 单词 (演示缺交)</div>
                        </div>
                        <div class="ci_capsule missing">缺交</div>
                    </div>

                     <div class="ci_task_item">
                        <div class="ci_task_main">
                            <div class="ci_tm_top">
                                <span class="ci_tm_title">体育</span>
                            </div>
                            <div class="ci_tm_desc">跳绳 500 个 (演示录入中)</div>
                        </div>
                        <div class="ci_capsule input">老师录入中</div>
                    </div>
                     <div class="ci_task_item">
                        <div class="ci_task_main">
                            <div class="ci_tm_top">
                                <span class="ci_tm_title">美术</span>
                            </div>
                            <div class="ci_tm_desc">画一只小猫 (演示请假)</div>
                        </div>
                        <div class="ci_capsule leave">请假</div>
                    </div>
                    
                </div>
            </div>
        </div>

    </div>
</div>
`;