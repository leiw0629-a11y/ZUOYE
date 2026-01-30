window.AppTemplates = window.AppTemplates || {};

// ✅ 学生端视图 (ID: view-student)
// 包含完整的 D1-D28 学生数据
window.AppTemplates.student = `
<div class="layout-container" id="view-student">
    
    <div class="sidebar panel-base">
        <div class="sidebar-container">
            <div class="sidebar-tabs">
                <div class="tab-btn active">活动列表</div>
                <div class="tab-btn">小组</div>
                <div class="tab-btn">学生</div>
            </div>
            <div class="search-area">
                <input type="text" class="search-box" placeholder="🔍 搜姓名或小组...">
            </div>
            
            <div class="list-content">
                <div class="list-item active">
                    <div class="avatar-circle">🐯</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px; display:flex; justify-content:space-between;">
                            王芳 <span style="background:#FF5252; color:white; font-size:10px; padding:2px 6px; border-radius:10px;">缺2</span>
                        </div>
                        <div style="font-size:12px; color:#999;">积分: 4500</div>
                    </div>
                </div>
                <div class="list-item"><div class="avatar-circle">🐰</div><div style="flex:1;"><div style="font-weight:700; font-size:14px;">张敏</div><div style="font-size:12px; color:#999;">积分: 1250</div></div></div>
                <div class="list-item"><div class="avatar-circle">🦊</div><div style="flex:1;"><div style="font-weight:700; font-size:14px;">周涛</div><div style="font-size:12px; color:#999;">积分: 920</div></div></div>
            </div>
        </div>
    </div>

    <div class="main-area panel-base">
        <div class="main-top-bar">
            <div style="display:flex; align-items:center; gap:10px;">
                <span id="studentTitle" style="font-size:18px; font-weight:800; color:var(--text-main);">王芳的冒险进度</span>
                <span class="progress-tag">完成度 15/28</span>
            </div>
            <button class="btn-white" onclick="toggleBatchMode()">⚡ 批量录入作业</button>
        </div>

        <div class="grid-container" id="grid-container-student">
            <div class="grid-cell done"><span class="day-label">D1</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D2</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D3</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell danger"><span class="day-label">D4</span><div class="cell-icon">💣</div><div class="cell-status-text">缺交</div></div>
            <div class="grid-cell holiday"><span class="day-label">D5</span><div class="holiday-badge">休</div><div class="cell-icon">🏖️</div><div class="cell-status-text">免打卡</div></div>
            <div class="grid-cell done"><span class="day-label">D6</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D7</span><div class="cell-icon">🎁</div><div class="cell-status-text">已领奖</div></div>

            <div class="grid-cell done"><span class="day-label">D8</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D9</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D10</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D11</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell done"><span class="day-label">D12</span><div class="cell-icon">🌟</div><div class="cell-status-text">已完成</div></div>
            <div class="grid-cell danger"><span class="day-label">D13</span><div class="cell-icon">💣</div><div class="cell-status-text">缺交</div></div>
            <div class="grid-cell done"><span class="day-label">D14</span><div class="cell-icon">🎁</div><div class="cell-status-text">已领奖</div></div>

            <div class="grid-cell locked"><span class="day-label">D15</span><div class="cell-icon">🔒</div><div class="cell-status-text">未开启</div></div>
            <div class="grid-cell locked"><span class="day-label">D16</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D17</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D18</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D19</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D20</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D21</span><div class="cell-icon">🔒</div></div>

            <div class="grid-cell locked"><span class="day-label">D22</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D23</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D24</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D25</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D26</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D27</span><div class="cell-icon">🔒</div></div>
            <div class="grid-cell locked"><span class="day-label">D28</span><div class="cell-icon">🏆</div><div class="cell-status-text">终极大奖</div></div>
        </div>
    </div>

    <div class="right-panel panel-base">
        <div class="panel-header">
            <span>⚠️ 作业警报</span>
        </div>
        <div class="alert-card">
            <div class="alert-num">2</div>
            <div class="alert-label">本月累计未交(次)</div>
        </div>
        <div style="padding:0 15px; font-weight:bold; color:#8D6E63; font-size:13px; margin-bottom:5px;">未交作业清单:</div>
        <div class="missing-list">
            <div class="missing-item">
                <div class="m-date">Day 4 (1月15日)</div>
                <div class="m-tag">未补交</div>
            </div>
            <div class="missing-item">
                <div class="m-date">Day 13 (1月24日)</div>
                <div class="m-tag">未补交</div>
            </div>
        </div>
        <div class="action-area">
            <div class="copy-box">
                <strong>文案预览:</strong><br>
                "家长您好，王芳同学在冒险岛打卡中，Day4和Day13暂未提交，请及时督促..."
            </div>
            <button class="btn-full">📋 一键复制并提醒家长</button>
        </div>
    </div>
</div>
`;