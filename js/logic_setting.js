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

    listContainer.innerHTML = ''; 

    // onblur: 鼠标点到外面去时触发修改
    // onkeydown: 按下回车键时主动触发失去焦点，从而执行修改
    const htmlContent = subjectArray.map(sub => `
        <div class="set_tag_item">
            <input type="text" class="set_tag_input" value="${sub}" data-old-value="${sub}" 
                   onblur="handleSubjectEdit(this)" 
                   onkeydown="if(event.key === 'Enter') this.blur();" />
            <span class="set_del" onclick="removeSubject('${sub}')">×</span>
        </div>
    `).join('');

    listContainer.innerHTML = htmlContent;
}

/**
 * 逻辑一：删除科目 (轻量级：只删配置，不删历史)
 */
function removeSubject(subName) {
    // 增加一个二次确认，防止老师手抖点错
    if (!confirm(`确定要移除科目【${subName}】吗？\n注：这不会删除该科目以前的作业记录。`)) {
        return;
    }
    
    // 1. 从全局 subject 数组中过滤掉这个科目
    window.subject = window.subject.filter(s => s !== subName);
    
    // 2. 重新渲染列表
    renderSubjectList(window.subject);
    
    // 3. 永久保存数据
    if (typeof saveData === 'function') saveData();
    
    showToastHTML(`<div class="cm-toast-title">已移除科目：${subName}</div>`);
}

/**
 * 逻辑二：修改科目 (重量级：深度遍历，全局替换)
 */
function handleSubjectEdit(inputEl) {
    const oldVal = inputEl.getAttribute('data-old-value');
    const newVal = inputEl.value.trim();

    // 情况 A：没修改或者改成了空，直接恢复原状
    if (newVal === '' || newVal === oldVal) {
        inputEl.value = oldVal;
        return;
    }

    // 情况 B：改成了已经存在的名字（避免重复）
    if (window.subject.includes(newVal)) {
        alert(`科目【${newVal}】已经存在了！`);
        inputEl.value = oldVal;
        return;
    }

    // 情况 C：正常修改，进行深度更新提示
    if (!confirm(`确定要把【${oldVal}】改为【${newVal}】吗？\n注意：系统将同步更新所有历史作业中的科目名称！`)) {
        inputEl.value = oldVal;
        return;
    }

    // --- 开始深度替换 ---

    // 1. 更新 window.subject 数组
    const idx = window.subject.indexOf(oldVal);
    if (idx > -1) {
        window.subject[idx] = newVal;
    }

    // 2. 深度更新 window.submissionData (历史交作业记录)
    if (window.submissionData) {
        for (let actId in window.submissionData) {
            for (let date in window.submissionData[actId]) {
                let records = window.submissionData[actId][date];
                if (Array.isArray(records)) {
                    records.forEach(record => {
                        if (record.subject === oldVal) {
                            record.subject = newVal; // 替换核心字段
                        }
                    });
                }
            }
        }
    }

    // 3. 深度更新 window.activityInfo (活动详情里的日常任务配置)
    if (window.activityInfo) {
        for (let actId in window.activityInfo) {
            let days = window.activityInfo[actId];
            if (Array.isArray(days)) {
                days.forEach(day => {
                    if (day.tasks && Array.isArray(day.tasks)) {
                        day.tasks.forEach(task => {
                            if (task.subject === oldVal) {
                                task.subject = newVal; // 替换任务字段
                            }
                        });
                    }
                });
            }
        }
    }
    
    // 4. 更新 window.activityList (如果活动列表里也存了 subject 字段)
    if (window.activityList && Array.isArray(window.activityList)) {
         window.activityList.forEach(act => {
             // 如果你存的是数组格式
             if (Array.isArray(act.subject)) {
                 const sIdx = act.subject.indexOf(oldVal);
                 if (sIdx > -1) act.subject[sIdx] = newVal;
             } 
             // 如果你存的是 "语文,数学" 这样的字符串格式
             else if (typeof act.subject === 'string') {
                 let sArr = act.subject.split(',').map(s => s.trim());
                 const sIdx = sArr.indexOf(oldVal);
                 if (sIdx > -1) {
                     sArr[sIdx] = newVal;
                     act.subject = sArr.join(','); // 重新拼合
                 }
             }
         });
    }

    // --- 替换完成 ---

    // 5. 重新渲染列表（让输入框的 data-old-value 更新为最新值）
    renderSubjectList(window.subject);
    
    // 6. 保存所有更改
    if (typeof saveData === 'function') saveData();
    
    showToastHTML(`<div class="cm-toast-title">【${oldVal}】已修改为【${newVal}】<br><span style="font-size:12px;opacity:0.8;">历史关联数据已同步更新</span></div>`);
}