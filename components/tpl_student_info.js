window.AppTemplates = window.AppTemplates || {};

// ✅ 学生端视图 (ID: view-student)
// 包含完整的 D1-D28 学生数据
window.AppTemplates.studentInfo = `
<div id="si_popup_overlay" class="si_overlay" style="display: none;">
    <div class="si_modal">
        
        <div class="si_header">
            <div class="si_header_text">
                <span class="si_date" id="si_date">日期未知</span>
                <span class="si_divider">|</span>
                <span class="si_student" id="si_student_name">匿名同学</span>
            </div>
            <button class="si_close_btn" onclick="toggleSiPopup(false)">X</button>
        </div>

        <div class="si_body">
            
            <div class="si_item">
                <div class="si_item_left">
                    <div class="si_subject_row">
                        <span class="si_subject_name">数学</span>
                    </div>
                    <div class="si_desc" >口算练习 20 道 (演示已完成)</div>
                </div>
                <div class="si_capsule si_status_done">已完成</div>
            </div>

            <div class="si_item">
                <div class="si_item_left">
                    <div class="si_subject_row">
                        <span class="si_subject_name">英语</span>
                    </div>
                    <div class="si_desc">背诵 Unit 5 单词 (演示缺交)</div>
                </div>
                <div class="si_capsule si_status_missing">缺交</div>
            </div>

            <div class="si_item">
                <div class="si_item_left">
                    <div class="si_subject_row">
                        <span class="si_subject_name">体育</span>
                    </div>
                    <div class="si_desc">跳绳 500 个 (演示录入中)</div>
                </div>
                <div class="si_capsule si_status_input">老师录入中</div>
            </div>

            <div class="si_item">
                <div class="si_item_left">
                    <div class="si_subject_row">
                        <span class="si_subject_name">美术</span>
                    </div>
                    <div class="si_desc">画一只小猫 (演示请假)</div>
                </div>
                <div class="si_capsule si_status_leave">请假</div>
            </div>

            <div class="si_item" style="border-bottom: none;">
                <div class="si_item_left">
                    <div class="si_subject_row">
                        <span class="si_subject_name">科学</span>
                    </div>
                    <div class="si_desc">观察植物生长 (超长文本测试超长文本测试)</div>
                </div>
                <div class="si_capsule si_status_done">已完成</div>
            </div>

        </div>

        <div class="si_footer">
            如有疑问，请及时联系老师核对
        </div>

    </div>
</div>
`;