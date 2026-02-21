// 锁屏模块
// 1. 确保全局对象存在
window.AppTemplates = window.AppTemplates || {};

// 2. 挂载 'lock' 属性
window.AppTemplates.lock = `
<div id="lockScreenOverlay" class="lock-overlay" style="display: none;">
    <div class="lock-box">
        <div id="panel-unlock" class="lock-content active">
            <div class="lock-avatar">🔒</div>
            <input type="password" id="unlockPwd" class="lock-input" placeholder="输入管理密码" onkeyup="if(event.key==='Enter') checkUnlock()">
            <button class="btn-unlock" onclick="checkUnlock()">解 锁</button>
        </div>
    </div>
</div>
`;