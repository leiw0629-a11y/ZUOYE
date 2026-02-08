// 替换旧的 togglePwd 函数
function togglePwd(el) {
    // 找到当前小眼睛前面的那个 input 兄弟元素
    var input = el.previousElementSibling;
    
    if (input.type === "password") {
        input.type = "text"; // 显示密码
        el.textContent = "🙈"; // 换图标
    } else {
        input.type = "password"; // 隐藏密码
        el.textContent = "👁️"; // 换回图标
    }
}

/* 打开设置弹窗 */
/**
 * 打开全局设置弹窗并回显数据 (ID版本)
 */
function openGlobalSettings() {
   // 1. 准备弹窗 (如果不存在则创建)
    let modal = document.getElementById('globalSettingModal');
    if (!modal) {
        if (!window.AppTemplates?.settingView) return alert("模板加载失败");
        document.body.insertAdjacentHTML('beforeend', window.AppTemplates.settingView);
        modal = document.getElementById('globalSettingModal');
        
        // 绑定保存按钮事件
        modal.querySelector('.set_btn_save_big').onclick = saveGlobalSettings;
    }

    // 2. 获取配置 (如果为空则给默认值)
    const config = window.defaultConfig || {};
    const subjects = window.subject || [];

    // 定义一个万能小帮手：只要给 ID 和 值，它就自动填进去
    const fill = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || ""; // 如果值是空的，就填空字符串
    };

    // 只需要这一行一个，清清爽爽
    fill('set_student_pass', config.studentPass);
    fill('set_teacher_pass', config.teacherPass);
    fill('set_makeup_days',  config.maxMakeupDays);
    fill('set_undo_days',    config.maxUndoDays);

    // ==========================================

    // 3. 渲染科目列表
    if (typeof renderSubjectList === 'function') {
        renderSubjectList(subjects);
    }

    // 4. 显示
    modal.style.display = 'flex';
}

/**
 * (配套) 保存设置的函数
 * 因为你的 HTML 里只有按钮样式，没有写 onclick，建议加上这个
 */
function saveGlobalSettings() {
   // 1. 获取左侧 4 个配置输入框的值
    const sPass = document.getElementById('set_student_pass').value;
    const tPass = document.getElementById('set_teacher_pass').value;
    const mDays = document.getElementById('set_makeup_days').value;
    const uDays = document.getElementById('set_undo_days').value;

    // 2. 更新全局配置对象 (window.defaultConfig)
    window.defaultConfig = window.defaultConfig || {};
    window.defaultConfig.studentPass = sPass;
    window.defaultConfig.teacherPass = tPass;
    // 注意：天数需要转为数字，如果用户没填或填错了，默认给 0 或保持原样
    window.defaultConfig.maxMakeupDays = mDays ? parseInt(mDays) : 0;
    window.defaultConfig.maxUndoDays = uDays ? parseInt(uDays) : 0;

    // 3. 处理批量添加科目逻辑
    // 找到那个没有 ID 的 textarea (通过类名查找)
    const subjectInput = document.querySelector('.set_textarea');
    let duplicateMsg = ""; // 用于记录重复的科目名称
    
    if (subjectInput && subjectInput.value.trim() !== "") {
        // 确保 subject 数组存在
        window.subject = window.subject || [];
        
        // 按换行符分割，并去除每一行的空格
        const newSubjects = subjectInput.value.split('\n').map(s => s.trim()).filter(s => s !== "");

        newSubjects.forEach(subName => {
            // 核心判定：如果有重复的，记录下来；没有重复的，才添加
            if (window.subject.includes(subName)) {
                duplicateMsg += `【${subName}】`;
            } else {
                window.subject.push(subName);
            }
        });
    }

    // 4. 永久保存数据
    if (typeof saveData === 'function') {
        saveData();
    }

    // 5. 刷新界面 (更新科目列表显示，并清空输入框)
    if (typeof renderSubjectList === 'function') {
        renderSubjectList(window.subject);
    }
    if (subjectInput) subjectInput.value = ""; // 清空输入框

    // 6. 弹窗提示结果
    document.getElementById('globalSettingModal').style.display = 'none'; // 先关闭设置窗
    
    if (duplicateMsg) {
        // 如果有重复的，提示保存成功但有部分重复
		showToastHTML(`
            <div class="cm-toast-title">设置保存成功！\n\n 科目已存在，未重复添加：\n</div>
        `);
    } else {
        // 一切正常
		showToastHTML(`
            <div class="cm-toast-title">设置保存成功！</div>
        `);
    }
}

/**
 * 单独提取渲染科目的逻辑，方便后续删除或修改后重新调用
 */
function renderSubjectList(subjectArray) {
    const listContainer = document.getElementById('set_subject_list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; // 清空当前

    // 渲染列表
    const htmlContent = subjectArray.map(sub => `
        <div class="set_tag_item">
            ${sub} 
            <span class="set_del" onclick="removeSubject('${sub}')">×</span>
        </div>
    `).join('');

    listContainer.innerHTML = htmlContent;
}