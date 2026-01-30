// ================= 全局数据 =================

window.classes = window.classes || []; // { className }
window.students = window.students || [];// { className, groupName, studentName }
window.groups = window.groups || []; // {className,groupName}
window.subject = window.subject || [];
// 新增的活动相关数据
window.activityList = window.activityList || []; 
window.activityInfo = window.activityInfo || {};
// window.activityInfo = {
  // "三年二班_寒假数学大闯关": [
    // // 数组索引 0 对应第 1 天，索引 1 对应第 2 天...
    // {
      // "date": "2025-01-12",
      
      // // 0=休息(灰色), 1=普通(白色), 2=奖励(金色)
      // "dayType": 1, 

      // // 作业列表 (支持一天多个作业)
      // "tasks": [
        // { "subject": "数学", "content": "口算20道" },
        // { "subject": "数学", "content": "应用题5道" } 
      // ],

      // // 请假/免做学生名单 (存姓名)
      // "exemptStudents": ["张三", "李四"],

      // // 奖励数据 (仅当 dayType=2 时有效)
      // "rewardData": {
        // "studentView": "神秘大礼包",  // 学生看到的文案
        // "teacherView": "肯德基兑换券" // 老师看到的底底
      // }
    // },
    // // ... 后续天数
  // ]
// };


// ================= 1. 页面初始化 =================
window.onload = function() {
    // 1. 读取数据
    loadData(); 

    
    // 3. 如果存在日期输入框，计算一次（逻辑在 logic_admin.js）
    if(typeof calcEndDate === 'function') {
        calcEndDate(); 
    }

    // 4. 如果处于后台模式，刷新一下列表（防止刷新页面后列表空白）
    // 检测 body 上是否有 mode-admin 类，或者根据逻辑判断
    const adminView = document.getElementById('view-admin');
    if (adminView && adminView.style.display !== 'none' && typeof renderActivityList === 'function') {
        renderActivityList();
    }
};

// ================= 2. 核心数据存取 (统一版) =================

// ✅ 保存：将所有数据存入 'schoolManagerData'
function saveData() {
    const data = {
        classes: window.classes,
        students: window.students,
        groups: window.groups,
		subject: window.subject,
        activityList: window.activityList, // 重点：保存活动列表
        activityInfo: window.activityInfo  // 重点：保存活动详情
    };
    localStorage.setItem('schoolManagerData', JSON.stringify(data));
}

function loadData() {
    const rawNew = localStorage.getItem('schoolManagerData'); // 新版数据
    const rawOld = localStorage.getItem('classManagerData');  // 旧版数据

    let data = null;

    if (rawNew) {
        // 情况 A: 已经有新版数据了，直接用
        try {
            data = JSON.parse(rawNew);
            console.log("📂 读取到新版数据");
        } catch(e) { console.error("新版数据解析失败", e); }
    } else if (rawOld) {
        // 情况 B: 还没有新数据，但是有以前的旧数据 (兼容模式)
        try {
            data = JSON.parse(rawOld);
            console.log("📂 检测到旧版数据，已自动迁移");
        } catch(e) { console.error("旧版数据解析失败", e); }
    }

    if (data) {
        // 恢复数据到全局变量
        window.classes = data.classes || [];
        window.students = data.students || [];
        window.groups = data.groups || [];
		window.subject = data.subject || [];
        window.activityList = data.activityList || [];
        window.activityInfo = data.activityInfo || {};
    } else {
        console.log("📂 本地暂无数据，初始化为空");
    }
}





function showToastHTML(html) {
  const toast = document.getElementById('cm-toast');
  if (!toast) {
    console.warn('找不到 #cm-toast');
    return;
  }

  const body = toast.querySelector('.cm-toast-body');
  if (body) body.innerHTML = html;

  toast.style.display = 'flex';     
  toast.classList.add('show');      

  clearTimeout(toast.__timer);
  toast.__timer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => (toast.style.display = 'none'), 200);
  }, 2000);
}