

// 打开班级管理窗口
function openClassManager() {
    const modal = document.getElementById('modal-cm');
    if (!modal) return;
    
    // 显示窗口
    modal.style.display = 'flex';
    
    // 【关键新增】绑定右上角关闭按钮事件
    const closeBtn = document.getElementById('btn-close-cm');
    if (closeBtn) {
        closeBtn.onclick = closeClassManager;
    }

    // 渲染列表
    renderClassList();
}

// ============================================================
// 1. 视图切换通用逻辑 (解决代码重复问题)
// ============================================================

/**
 * 通用切换视图函数
 * @param {string} targetViewId - 要显示的视图ID (e.g. 'view-class-list')
 * @param {string} activeMenuId - 要高亮的菜单ID (e.g. 'menu-class-list')
 */
function _switchView(targetViewId, activeMenuId) {
    // 【修改点】在数组中加入 'view-subject-settings'
    const views = ['view-class-list', 'view-student-list', 'view-group-list', 'view-new-class', 'view-subject-settings'];
    
    // 循环处理显示/隐藏
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === targetViewId) ? 'flex' : 'none';
        }
    });

    // 处理左侧菜单高亮
    // 【修改点】获取所有菜单项，包括新增的 menu-subject-settings
    const menuList = document.getElementById('menu-class-list');
    const menuNew = document.getElementById('menu-new-class');
    const menuSub = document.getElementById('menu-subject-settings'); // 新增
    
    // 移除所有 active 样式
    if (menuList) menuList.classList.remove('active');
    if (menuNew) menuNew.classList.remove('active');
    if (menuSub) menuSub.classList.remove('active'); // 新增
        
    // 加上 active 类
    const activeEl = document.getElementById(activeMenuId);
    if (activeEl) activeEl.classList.add('active');
}

function showSubjectSettings() {
    _switchView('view-subject-settings', 'menu-subject-settings');
    
    // 初始化全局变量，防止报错
    window.subject = window.subject || [];

    // 获取文本框
    const textarea = document.getElementById('cm-subject-list');
    if (textarea) {
        // 将数组用换行符连接，显示在文本框中
        textarea.value = window.subject.join('\n');
    }
}

// ============================================================
// 2. 保存科目设置 (处理多行文本存入数组)
// ============================================================
function saveSubjectSettings() {
    const textarea = document.getElementById('cm-subject-list');
    const rawText = textarea ? textarea.value : '';

    // 1. 处理文本：按行分割 -> 去除首尾空格 -> 过滤空行
    const newSubjects = rawText.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    if (newSubjects.length === 0) {
        alert("请至少输入一个科目");
        return;
    }

    // 2. 存入全局数组
    window.subject = newSubjects;

    // 3. 持久化保存 (如果系统有这个函数)
    if (typeof window.saveData === 'function') window.saveData();
    
    // 4. 提示成功
    if (typeof showToastHTML === 'function') {
        showToastHTML(`<div class="cm-toast-title">已保存 ${newSubjects.length} 个科目</div>`);
    } else {
        alert(`保存成功！共包含 ${newSubjects.length} 个科目。`);
    }
}

// 打开班级列表 (重构后)
function showClassManager() {
    _switchView('view-class-list', 'menu-class-list');
    // 每次切换回来时，重新渲染数据
    renderClassList();
}

// 打开新建班级 (重构后)
function showNewClassView() {
    _switchView('view-new-class', 'menu-new-class');
}

// ============================================================
// 2. 班级列表渲染逻辑
// ============================================================

function renderClassList() {
    const container = document.querySelector('#view-class-list .cm-table-body');
    if (!container) return;

    container.innerHTML = ''; 

    if (!window.classes || window.classes.length === 0) {
        container.innerHTML = `<div style="padding:40px;text-align:center;color:#999;">暂无班级数据</div>`;
        return;
    }

    window.classes.forEach(cls => {
        const cName = cls.className;
        // 统计人数
        const count = window.students ? window.students.filter(s => s.className === cName).length : 0;
        
        const row = document.createElement('div');
        row.className = 'cm-row';
        row.innerHTML = `
            <div class="cm-col-c1">${cName}</div>
            <div class="cm-col-c2">${count}人</div>
            <div class="cm-col-c3"><span class="cm-status-badge">进行中</span></div>
            <div class="cm-col-c4">
                <button class="cm-btn-icon cm-btn-cyan" onclick="openStudentManager('${cName}')">🎓学生</button>
                <button class="cm-btn-icon cm-btn-orange" onclick="openGroupManager('${cName}')">🧩分组</button>
                <button class="cm-btn-icon-only" onclick="deleteClass('${cName}')">🗑️</button>
            </div>
        `;
        container.appendChild(row);
    });
}

// ============================================================
// 3. 学生列表管理逻辑
// ============================================================

// 进入【学生管理】视图
function openStudentManager(className) {
    // 1. 切换视图
    _switchView('view-student-list', 'menu-class-list');

    // 2. 修改顶部的标题 (找到 class="cm-class-name" 的元素)
    const titleEl = document.querySelector('#view-student-list .cm-class-name');
    if (titleEl) titleEl.innerText = className;

    // 3. 渲染该班级的学生列表
    renderStudentList(className);

    // 4. 绑定“返回列表”按钮的功能
    // 防止重复绑定，先移除再添加，或者简单暴力点直接覆盖 onclick
    const backBtn = document.getElementById('btn-back-to-class');
    if (backBtn) {
        backBtn.onclick = function() {
            showClassManager(); // 返回主列表
        };
    }
}

// 渲染学生表格核心函数
function renderStudentList(className) {
    const container = document.querySelector('#view-student-list .cm-table-body');
    if (!container) return;
    
    container.innerHTML = '';

    // 1. 筛选出当前班级的学生
    const currentStudents = window.students.filter(s => s.className === className);

    if (currentStudents.length === 0) {
        container.innerHTML = `<div style="padding:20px;text-align:center;color:#999;">暂无学生</div>`;
        return;
    }

    // 2. 遍历生成行
    currentStudents.forEach(s => {
        // 如果有分组就显示分组名，没有就显示“未分组”
        const groupTag = s.groupName 
            ? `<span class="cm-tag cm-tag-orange">${s.groupName}</span>` 
            : `<span class="cm-tag" style="background:#eee;color:#999;">未分组</span>`;

        const row = document.createElement('div');
        row.className = 'cm-row';
        row.innerHTML = `
            <div class="cm-col-name">${s.studentName}</div>
            <div class="cm-col-group">${groupTag}</div>
            <div class="cm-col-action">
                <button class="cm-btn-opt cm-btn-blue">改名</button>
                <button class="cm-btn-opt cm-btn-red">移除</button>
            </div>
        `;
        container.appendChild(row);
    });
}



function openAddStudentModal() {
    // 1. 防御性检查：尝试获取当前班级名
    // 因为你在 view-student-list 里有一个 <h2 class="cm-class-name">...</h2>
    // 这就是页面上显示的真理。
    const titleEl = document.querySelector('#view-student-list .cm-class-name');
    const currentClass = titleEl ? titleEl.innerText.trim() : '';

    if (!currentClass) {
        alert("系统异常：无法识别当前班级，请刷新页面重试。");
        return;
    }

    // 2. 显示弹窗
    const modal = document.getElementById('modal-add-student');
    const textarea = document.getElementById('inp-student-names');
    
    if (modal) {
        if (textarea) textarea.value = ''; // 清空
        modal.style.display = 'flex';
        setTimeout(() => textarea && textarea.focus(), 100);
    }
}

function closeAddStudentModal() {
    const modal = document.getElementById('modal-add-student');
    if (modal) modal.style.display = 'none';
}

function confirmAddStudent() {
    // 1. 再次获取上下文 (Source of Truth)
    const titleEl = document.querySelector('#view-student-list .cm-class-name');
    const currentClass = titleEl ? titleEl.innerText.trim() : '';
    
    if (!currentClass) {
        alert("未找到班级信息，无法保存！");
        return;
    }

    // 2. 获取输入
    const textarea = document.getElementById('inp-student-names');
    const rawText = textarea.value;
    const newNames = rawText.split('\n').map(n => n.trim()).filter(n => n.length > 0);

    if (newNames.length === 0) {
        alert("请输入至少一个学生姓名");
        return;
    }

    // 3. 查重逻辑
    const existingStudents = window.students.filter(s => s.className === currentClass);
    const existingNames = new Set(existingStudents.map(s => s.studentName));

    for (let name of newNames) {
        if (existingNames.has(name)) {
            alert(`无法添加：学生【${name}】已存在于【${currentClass}】！`);
            return;
        }
    }
	const addedCount = newNames.length;
    // 4. 保存
    window.students = window.students || [];
    newNames.forEach(name => {
        window.students.push({
            className: currentClass,
            groupName: '', 
            studentName: name
        });
    });

    if (typeof window.saveData === 'function') window.saveData();

    // 5. 收尾
    closeAddStudentModal();
	if (typeof showToastHTML === 'function') {
        showToastHTML(`
            <div class="cm-toast-title">${currentClass}录入：${addedCount} 人</div>
        `);
    } else {
        alert(`班级【${className}】创建成功！`);
    }
    // 刷新列表（此时我们知道 currentClass 是对的，直接传回去渲染）
    renderStudentList(currentClass); 
}
// 进入【分组管理】视图
function openGroupManager(className) {
    _switchView('view-group-list', 'menu-class-list');

    const titleEl = document.querySelector('#view-group-list .cm-class-name');
    if (titleEl) titleEl.innerText = className + ' - 分组管理';

    // 绑定返回按钮
    const backBtn = document.getElementById('btn-back-from-group');
    if (backBtn) {
        backBtn.onclick = function() {
            showClassManager();
        };
    }

    // ----------------------------------------------------
    // 【修改点】绑定右上角的 "+ 新建小组" 按钮
    // 直接调用 openCreateGroupStep1 并传入 className
    // ----------------------------------------------------
    const createGroupBtn = document.querySelector('#view-group-list .cm-btn-add-group');
    if (createGroupBtn) {
        // 先移除旧的事件监听（防止多次点击触发多次）
        createGroupBtn.onclick = null; 
        
        // 绑定新事件
        createGroupBtn.onclick = function() {
            openCreateGroupStep1(className);
        };
    }

    // 渲染分组数据
    renderGroupList(className);
}

// 核心：渲染分组列表
function renderGroupList(className) {
    const container = document.querySelector('.cm-group-body');
    if (!container) return;
    container.innerHTML = ''; // 清空现有卡片

    // 1. 获取该班级所有学生
    const allStudents = window.students.filter(s => s.className === className);

    // 2. 数据归类
    const groupsMap = {};   // 存放 { "飞虎队": [学生对象, ...], "雄鹰队": [...] }
    const unassigned = [];  // 存放未分组学生

    allStudents.forEach(s => {
        if (s.groupName) {
            if (!groupsMap[s.groupName]) {
                groupsMap[s.groupName] = [];
            }
            groupsMap[s.groupName].push(s);
        } else {
            unassigned.push(s);
        }
    });

    // 3. 渲染【已分组】卡片 (亮色框)
    // 遍历 groupsMap 的每一个组名
    Object.keys(groupsMap).forEach(gName => {
        const groupStudents = groupsMap[gName];
        
        // 生成成员的 HTML (带删除叉号的小方块)
        const membersHTML = groupStudents.map(s => 
            `<div class="cm-member-chip">
                ${s.studentName} 
                <span class="cm-chip-close" onclick="removeStudentFromGroup('${s.studentName}', '${className}')">×</span>
            </div>`
        ).join('');

        // 创建卡片 DOM
        const card = document.createElement('div');
        card.className = 'cm-group-card'; // 亮色框样式
        card.innerHTML = `
            <div class="cm-group-header">
                <div class="cm-group-title">
                    <span class="cm-shield-icon">🛡️</span> ${gName}
                </div>
                <button class="cm-btn-icon-only" style="width:24px; height:24px; font-size:12px;" onclick="deleteGroup('${gName}', '${className}')">🗑️</button>
            </div>
            <div class="cm-group-content">
                <div class="cm-member-list">
                    ${membersHTML}
                </div>
                <button class="cm-btn-dashed-add" onclick="addStudentToGroup('${gName}', '${className}')">+ 添加组员</button>
            </div>
        `;
        container.appendChild(card);
    });

    // 4. 渲染【未分组】卡片 (灰色框)
    // 即使没有人未分组，通常也显示这个框，方便拖拽或查看（或者你可以决定为空不显示，这里默认显示）
    const unassignedMembersHTML = unassigned.map(s => 
        `<span class="cm-text-gray" style="margin-right:10px; display:inline-block;">${s.studentName}</span>`
    ).join('');

    const grayCard = document.createElement('div');
    grayCard.className = 'cm-group-card cm-card-gray'; // 灰色框样式
    grayCard.innerHTML = `
        <div class="cm-group-header">
            <div class="cm-group-title" style="color:#757575;">
                <span>👻</span> 未分组
            </div>
        </div>
        <div class="cm-group-content" style="min-height: 60px;">
            <div class="cm-member-list">
                ${unassignedMembersHTML || '<span class="cm-text-gray" style="font-size:12px; opacity:0.5;">暂无未分组学生</span>'}
            </div>
        </div>
    `;
    container.appendChild(grayCard);
}

// =======================
// 5. 分组操作的占位函数 (你需要自己实现具体的逻辑)
// =======================

// 从小组移除 (变回未分组)
function removeStudentFromGroup(studentName, className) {
    // 1. 在学生列表里找到这个人
    const student = window.students.find(s => s.studentName === studentName && s.className === className);
    if (!student) return;

    // 先记下他原来的组名，一会儿要用来检查该组是否空了
    const targetGroupName = student.groupName;

    // 2. 移除学生 (将组名置空)
    student.groupName = '';

    // 3. 检查该组是否还有其他人
    // 筛选条件：同班级 且 同组名
    const membersLeft = window.students.filter(s => 
        s.className === className && s.groupName === targetGroupName
    );

    // 4. 如果该组没人了，且 window.groups 存在，则删除该组定义
    if (membersLeft.length === 0 && targetGroupName) {
        // 确保 window.groups 已经初始化
        window.groups = window.groups || [];
        
        // 过滤掉这个要删除的组
        window.groups = window.groups.filter(g => 
            !(g.className === className && g.groupName === targetGroupName)
        );
        
        console.log(`提示：小组【${targetGroupName}】因无人而在 window.groups 中被自动解散`);
    }

    // 5. 保存并刷新
    if(typeof window.saveData === 'function') window.saveData();
    renderGroupList(className); 
}

// 删除整个小组 (组员全部变回未分组)
function deleteGroup(groupName, className) {
    if(!confirm(`确定要解散小组【${groupName}】吗？组员将变回未分组状态。`)) return;
    
    window.students.forEach(s => {
        if (s.className === className && s.groupName === groupName) {
            s.groupName = '';
        }
    });
    
    if(window.saveData) saveData();
    renderGroupList(className);
}

function addStudentToGroup(groupName, className) {
    // 1. 设置全局上下文
    // 这样当用户点击弹窗里的“确认添加”时，系统知道是往哪个班、哪个组加人
    tempCtx.className = className;
    tempCtx.groupName = groupName;

    // 2. 直接调用之前写好的“打开选人弹窗”函数
    // 它会自动筛选该班级下的未分组学生，并渲染 checkbox 列表
    openSelectStudentModal(className, groupName);
}

// 补充一个简单的删除函数供测试
function deleteClass(className) {
    if(!confirm(`确定要删除班级【${className}】吗？这将同时删除所有学生数据！`)) return;

    // 1. 删班级
    window.classes = window.classes.filter(c => c.className !== className);
    // 2. 删学生
    window.students = window.students.filter(s => s.className !== className);
    
    // 3. 保存并重绘
    if(window.saveData) window.saveData(); 
    renderClassList();
}

function onClickCreateClass() {
    const classInput = document.getElementById('cm-class-name');
    const studentTextarea = document.getElementById('cm-student-list');

    const className = (classInput?.value || '').trim();
    const studentText = (studentTextarea?.value || '').trim();
    // 1) 班级不能为空
    if (!className) {
        alert('班级名称不能为空');
        return;
    }
    // 2) 班级不能重复 (必须检查 window.classes)
    if (window.classes && window.classes.some(c => c.className === className)) {
        alert('班级名称已存在');
        return;
    }
    // 3) 学生名单解析
    const names = studentText.split('\n').map(s => s.trim()).filter(Boolean);
    if (names.length === 0) {
        alert('学生名单不能为空');
        return;
    }
    // 4) 姓名查重
    const set = new Set();
    for (const n of names) {
        if (set.has(n)) {
            alert(`学生姓名重复：${n}`);
            return;
        }
        set.add(n);
    }
    // 5) 写入班级 (修正为 window.classes)
    window.classes = window.classes || [];
    window.classes.push({ className });
    window.students = window.students || [];
    for (const n of names) {
        window.students.push({ className, groupName: '', studentName: n });
    }

    // 7) 保存
    if (typeof window.saveData === 'function') window.saveData();

    // 8) 清空并提示
    classInput.value = '';
    studentTextarea.value = '';

    // 如果你有 showToastHTML 就用，没有就用 alert
    if (typeof showToastHTML === 'function') {
        showToastHTML(`
            <div class="cm-toast-title">班级【${className}】创建成功！</div>
            <div class="cm-toast-sub">录入：${names.length} 人</div>
        `);
    } else {
        alert(`班级【${className}】创建成功！`);
    }
    // 刷新列表
    showClassManager();
}

// 临时上下文，用于在两步弹窗之间传递数据
let tempCtx = {
    className: '',
    groupName: ''
};


// 【入口】第一步：打开输入组名窗口
// 这个函数要绑定在“+新建小组”按钮上
function openCreateGroupStep1(className) {
    tempCtx.className = className;
    tempCtx.groupName = '';

    // 清空输入框
    document.getElementById('inp-new-group-name').value = '';
    
    // 显示弹窗1
    document.getElementById('modal-step1-name').style.display = 'flex';
    
    // 自动聚焦输入框 (体验更好)
    setTimeout(() => document.getElementById('inp-new-group-name').focus(), 100);
}

// 【逻辑】关闭指定的子模态框
function closeStepModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 【逻辑】第一步确认 -> 验证 -> 进入第二步
function nextStepSelectStudent() {
    const nameInput = document.getElementById('inp-new-group-name');
    const groupName = nameInput.value.trim();
    const className = tempCtx.className;

    // 1. 校验非空
    if (!groupName) {
        alert("请输入小组名称");
        return;
    }

    // 2. 校验是否重名
    // 在当前班级的所有学生中查找，看有没有人的 groupName 等于这个新名字
    const studentsInClass = window.students.filter(s => s.className === className);
    const isDuplicate = studentsInClass.some(s => s.groupName === groupName);

    if (isDuplicate) {
        alert(`班级【${className}】中已存在小组【${groupName}】，请更换名称。`);
        return;
    }

    // 校验通过，存入临时变量
    tempCtx.groupName = groupName;

    // 关闭步骤1，打开步骤2
    closeStepModal('modal-step1-name');
    openSelectStudentModal(className, groupName);
}

// 【逻辑】第二步：渲染未分组学生供选择
function openSelectStudentModal(className, groupName) {
    const modal = document.getElementById('modal-step2-member');
    const titleEl = document.getElementById('step2-group-title');
    const listEl = document.getElementById('step2-student-list');

    // 设置标题
    titleEl.innerText = groupName;
    listEl.innerHTML = ''; 

    // 设置高度限制 + 滚动条
    listEl.style.maxHeight = '250px'; 
    listEl.style.overflowY = 'auto';  

    // 筛选未分组学生
    const unassigned = window.students.filter(s => s.className === className && !s.groupName);

    if (unassigned.length === 0) {
        alert("当前班级没有【未分组】的学生，无法建立新组。");
        return; 
    }

    // 动态生成列表
    unassigned.forEach(s => {
        const row = document.createElement('div');
        
        // CSS 类名 (对应之前添加的 hover 变色样式)
        row.className = 'cm-select-row'; 
        
        // 行样式
        row.style.padding = '12px 15px';
        row.style.borderBottom = '1px solid #f9f9f9';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.cursor = 'pointer';
        row.style.transition = 'background 0.2s';

        // 生成内容
        // 注意：label 仍然保留，为了显示文字
        row.innerHTML = `
            <input type="checkbox" name="chk-student" value="${s.studentName}" id="chk-${s.studentName}" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="chk-${s.studentName}" style="margin-left: 10px; cursor: pointer; flex: 1; user-select: none;">${s.studentName}</label>
        `;

        // ===============================================
        // 【核心代码】点击整行切换选中状态
        // ===============================================
        row.onclick = function(e) {
            // 1. 如果点的是 Checkbox 本身，浏览器会自动处理，JS 不要插手
            if (e.target.type === 'checkbox') return;

            // 2. 如果点的是 Label (名字)，因为有 for 属性，浏览器也会自动处理，JS 不要插手
            // (如果这里不拦截，会导致“浏览器勾选一次” + “JS又勾选一次” = “没变化”)
            if (e.target.tagName === 'LABEL') return;

            // 3. 只有点击了 div 的空白区域 (背景)，JS 才手动去切换状态
            const chk = row.querySelector('input[type="checkbox"]');
            if (chk) {
                chk.checked = !chk.checked;
            }
        };

        listEl.appendChild(row);
    });

    // 显示弹窗
    modal.style.display = 'flex';
}

// 【逻辑】最终提交：写入数据
// 【逻辑】最终提交：写入数据
function confirmCreateGroupFinal() {
    // 【关键修正】第一步必须先把变量拿出来！放在函数最顶端
    const { className, groupName } = tempCtx;

    // 1. 获取选中的学生
    const checkboxes = document.querySelectorAll('input[name="chk-student"]:checked');
    const selectedNames = Array.from(checkboxes).map(cb => cb.value);

    // 2. 必须先检查是否选了人，没选人就不往下走了
    if (selectedNames.length === 0) {
        alert("请至少选择一名学生加入该组！\n(如果不想建组了，请点击取消)");
        return;
    }

    // 3. 维护 window.groups 数组 (确保初始化)
    window.groups = window.groups || [];
    
    // 防止重复添加组定义
    const isGroupExist = window.groups.some(g => g.className === className && g.groupName === groupName);
    if (!isGroupExist) {
        window.groups.push({ className: className, groupName: groupName });
    }

    // 4. 更新学生数据 (在 window.students 里找到这些人，把 groupName 赋给他们)
    window.students.forEach(s => {
        if (s.className === className && selectedNames.includes(s.studentName)) {
            s.groupName = groupName;
        }
    });

    // 5. 保存
    if (typeof window.saveData === 'function') window.saveData();

    // 6. 关闭所有弹窗
    closeStepModal('modal-step2-member');

    // 7. 重新渲染分组界面 (最重要的一步！)
    renderGroupList(className);
}

// 关闭班级管理窗口
function closeClassManager() {
    const modal = document.getElementById('modal-cm');
    if (modal) {
        modal.style.display = 'none';
    }
}