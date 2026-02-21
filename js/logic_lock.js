// ===========================================
// 逻辑模块：挂机锁屏 (Logic Lock)
// 依赖全局变量：window.defaultConfig
// ===========================================

/**
 * 触发锁屏
 * 逻辑：直接显示解锁界面，并清空输入框
 */
function lockScreen() {
    const overlay = document.getElementById('lockScreenOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // 正常锁屏，清空并聚焦
    const unlockInput = document.getElementById('unlockPwd');
    if (unlockInput) {
        unlockInput.value = '';
        setTimeout(() => {
            unlockInput.focus();
        }, 100);
    }
}

/**
 * 执行解锁验证 (双重密码支持)
 */
function checkUnlock() {
    const input = document.getElementById('unlockPwd').value.trim();
    
    // 拿取配置中的密码，加一个容错兜底
    const config = window.defaultConfig || {};
    const teaPass = String(config.teacherPass || "888888");
    const stuPass = String(config.studentPass || "123456");

    if (String(input) === teaPass) {
        // 老师密码正确
        sessionStorage.setItem('sessionUnlocked', 'teacher');
        document.getElementById('lockScreenOverlay').style.display = 'none';
        applyRoleUI(); // 解锁后立即刷新一下界面权限
        
    } else if (String(input) === stuPass) {
        // 学生密码正确
        sessionStorage.setItem('sessionUnlocked', 'student');
        document.getElementById('lockScreenOverlay').style.display = 'none';
        applyRoleUI(); // 解锁后立即刷新一下界面权限
        
    } else {
        // 密码错误
        alert("❌ 密码错误");
        const unlockInput = document.getElementById('unlockPwd');
        if (unlockInput) {
            unlockInput.value = '';
            unlockInput.focus();
        }
    }
}

/**
 * 手动上锁 / 退出登录
 */
function manualLock() {
    // 撕毁通行证
    sessionStorage.removeItem('sessionUnlocked');
    // 立即锁屏
    lockScreen();
}

/**
 * 根据当前解锁角色，动态控制页面元素的显示与隐藏
 */
function applyRoleUI() {
    const role = sessionStorage.getItem('sessionUnlocked');
    console.log("当前身份权限：", role);
    
    // 拿到所有标有 'teacher-only' 的元素
    const teacherElements = document.querySelectorAll('.teacher-only');
    
    if (role === 'teacher') {
        // 如果是老师，把这些按钮显示出来（按钮通常用 inline-block）
        teacherElements.forEach(el => {
            el.style.display = 'inline-block';
        });
    } else {
        // 如果是学生（或者还没登录的异常情况），确保它们是隐藏的
        teacherElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}