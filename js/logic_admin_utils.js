// ==========================================
// 核心配置与全局状态 (Core State)
// ==========================================

// 科目活动变量
window.currentAdminActivityKey = null;  // 科目活动：当前选中的活动Key/id
window.isBatchMode = false;             // 是否处于批量操作模式
window.batchSelectedDates = new Set();  // 批量选中的日期集合
let currentAdminActivityId = null;
let lastSelectedActivityKey = null;    // 取消新建时回退用
let currentAdminTab = 'ongoing';
// 全局活动变量
window.currentGlobalActId = null;       // 全局活动：当前选中的全局ID
window.currentGlobalFilterType = 'all'; // 全局活动：当前的筛选状态 (all/selected/unselected)


// ==========================================
// 入口与视图控制 (Entry & View Control)
// ==========================================

/**
 * 切换后台面板的显示/隐藏 (入口函数)
 * 通常绑定在某个设置按钮上
 */
function toggleSettings() {
    const studentView = document.getElementById('view-student');
    const adminView = document.getElementById('view-admin');
    const globalView = document.getElementById('view-global'); // 新增获取
    const settingBtn = document.getElementById('setting_btn');
	const chartView = document.getElementById('view-analysis');
	if (chartView) chartView.style.display = 'none';
    if (studentView.style.display !== 'none') {
        // [进入后台模式]
        studentView.style.display = 'none'; 
        switchViewMode('subject'); 
		settingBtn.innerHTML = '🔙返回';
        document.body.classList.add('mode-admin');
        initDropdowns();
		initAdminSearch();
        refreshAdminView(); 
    } else {
        // [退出后台模式]
        studentView.style.display = 'flex';
        settingBtn.innerHTML = '⚙️活动';
        // 确保两个后台视窗都关闭
        if (adminView) adminView.style.display = 'none';   
        if (globalView) globalView.style.display = 'none'; 
        document.body.classList.remove('mode-admin');
    }
	renderAdminClassSelect('admin_class_slc');
	renderAdminClassSelect('global_class_slc');
}

/**
 * 切换视图模式：科目活动 <-> 全局活动
 * @param {string} mode - 'subject' | 'global'
 */
function switchViewMode(modeName) {
    const adminView = document.getElementById('view-admin');
    const globalView = document.getElementById('view-global'); 
    // 获取两套侧边栏里的四个按钮
    const btnSubjectInAdmin = document.getElementById('mode-btn-subject');
    const btnGlobalInAdmin = document.getElementById('mode-btn-global');
    const btnSubjectInGlobal = document.getElementById('global-btn-subject');
    const btnGlobalInGlobal = document.getElementById('global-btn-global');
    if (modeName === 'subject') {
        // --- 1. UI 切换 ---
        if (adminView) adminView.style.display = 'flex';
        if (globalView) globalView.style.display = 'none';
        // --- 2. 按钮状态同步 ---
        if (btnSubjectInAdmin) btnSubjectInAdmin.classList.add('active');
        if (btnGlobalInAdmin) btnGlobalInAdmin.classList.remove('active');
        if (btnSubjectInGlobal) btnSubjectInGlobal.classList.add('active');
        if (btnGlobalInGlobal) btnGlobalInGlobal.classList.remove('active');
		document.getElementById('header-default-title').style.display = 'flex';
        refreshAdminView(); 
    } else if (modeName === 'global') {
        // --- 1. UI 切换 ---
        if (adminView) adminView.style.display = 'none';
        if (globalView) globalView.style.display = 'flex';
		
        // --- 2. 按钮状态同步 ---
        if (btnSubjectInAdmin) btnSubjectInAdmin.classList.remove('active');
        if (btnGlobalInAdmin) btnGlobalInAdmin.classList.add('active');
        if (btnSubjectInGlobal) btnSubjectInGlobal.classList.remove('active');
        if (btnGlobalInGlobal) btnGlobalInGlobal.classList.add('active');
		
        refreshGlobalView(); 
    }
}



function initDropdowns() {
    const classSelect = document.getElementById('setting-class-id');
    // 2. 全局活动 - 班级下拉框 (新增这行) 👇
    const globalClassSelect = document.getElementById('global-class-select'); 

    // === 定义一个通用的填充逻辑 (避免写重复代码) ===
    const fillClassOptions = (selectEl) => {
        if (!selectEl) return;
        selectEl.innerHTML = `<option value="">--请选择班级--</option>`;
        if (window.classes && Array.isArray(window.classes)) {
            window.classes.forEach(cls => {
                let val, txt;
                if (typeof cls === 'object' && cls !== null) {
                    txt = cls.className || cls.name || "未知班级";
                    val = cls.className || cls.id || txt; // 注意：要确保这里的取值逻辑和你 loadGlobalActivity 里回显的数据一致
                } else {
                    val = cls;
                    txt = cls;
                }
                selectEl.innerHTML += `<option value="${val}">${txt}</option>`;
            });
        }
    };

    // === 执行填充 ===
    fillClassOptions(classSelect);       // 填充科目活动的
    fillClassOptions(globalClassSelect); // 填充全局活动的 ✅ 修复点

	const subjectSelect = document.getElementById('setting-act-subject');
    if (subjectSelect) {
        subjectSelect.innerHTML = `<option value="">--请选择科目--</option>`;
        if (window.subject && Array.isArray(window.subject)) {
            if (window.subject.length > 1) subjectSelect.innerHTML += `<option value="all">全部科目</option>`;
            window.subject.forEach(sub => {
                let val, txt;
                if (typeof sub === 'object' && sub !== null) {
                    val = sub.name || sub.key || sub.id; txt = sub.name || sub.key;
                } else { val = sub; txt = sub; }
                subjectSelect.innerHTML += `<option value="${val}">${txt}</option>`;
            });
        }
    }
}

/**
 * 渲染后台班级下拉框 (admin_class_slc)
 * 依赖全局变量: window.classes = [{ className: '...' }, ...]
 */
function renderAdminClassSelect(sleId) {
    const $select = document.getElementById(sleId);
    
    // 安全检查：如果页面上还没渲染出这个DOM，直接返回
    if (!$select) return;

    // 获取数据，防止未定义报错
    const classList = window.classes || [];
    let html = '';

    if (classList.length === 0) {
        // --- 情况 A: 为空 ---
        // 显示"请新建班级"，并设为 disabled 防止误选
        html = '<option value="" disabled selected>请新建班级</option>';
    
    } else if (classList.length === 1) {
        // --- 情况 B: 只有一个班级 ---
        // 直接填充该班级，并默认选中
        const cls = classList[0];
        // 注意：这里 value 和 text 都用了 className，如果你有 id 字段，value 可以改成 cls.id
        html = `<option value="${cls.className}" selected>${cls.className}</option>`;
    
    } else {
        // --- 情况 C: 两个及以上 ---
        // 第一个是"全部班级"，后面跟随具体班级
        html = '<option value="all" selected>全部班级</option>';
        
        classList.forEach(cls => {
            html += `<option value="${cls.className}">${cls.className}</option>`;
        });
    }

    // 更新 DOM
    $select.innerHTML = html;
}
