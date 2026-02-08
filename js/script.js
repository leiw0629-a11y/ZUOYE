// ================= 全局数据 =================

window.classes = window.classes || []; // { className }
window.students = window.students || [];// { className, groupName, studentName }
window.groups = window.groups || []; // {className,groupName}
window.subject = window.subject || [];
window.currentBatchActId = window.currentBatchActId || [];
/** 全局存储对象
window.submissionData = {
  
  第一层 key: act_id (活动唯一ID)
  "act_170670001": { 
    
    第二层 key: date (日期字符串 YYYY-MM-DD)
    "2026-01-31": [
      
      第三层: 当天、该活动下的所有提交记录
      {
        "name": "张三",          // [核心] 学生姓名
        "subject": "数学",       // [核心] 科目
        "task": "口算20道",      // [核心] 细分任务 (若无细分则为空字符串 "")
        "isLate": false,        // [状态] true=补交, false=按时
        "finishTime": 2026-01-05 23:23:23, // [数据] 实际操作的时间戳
        "note": "",             // [预留] 备注
        "score": ""             // [预留] 分数
      },
      ... 其他学生的记录
    ],
    
    ... 其他日期的记录
    "2026-02-01": [] 
  }
};
*/
window.submissionData = window.submissionData || {};

/** 
	act_id;			// 活动ID 唯一 时间戳
	className;		// 所属班级
	activityName;	// 活动名称
	subject;		// 活动包含科目
	startDate;		// 活动开始日期
	totalDays;		// 活动总天数
	endDate;		// 活动结束日期
	isEnd;			// 活动是否结束
	manualEndDate;  // 手动结束日期
*/
window.activityList = window.activityList || []; 

/** 
	window.activityInfo = {
  "act_id": [
    数组索引 0 对应第 1 天，索引 1 对应第 2 天...
    {
      "date": "2025-01-12",
      
      0=休息(灰色), 1=普通(白色), 2=奖励(金色)
      "dayType": 1, 

      作业列表 (支持一天多个作业)
      "tasks": [
        { "subject": "数学", "content": "口算20道" , isBatch:"false"},
        { "subject": "数学", "content": "应用题5道", isBatch:"false" } 
      ],

      请假/免做学生名单 (存姓名)
      "exemptStudents": ["张三", "李四"],

      奖励数据 (仅当 dayType=2 时有效)
      "rewardData": {
        "studentView": "神秘大礼包",  // 学生看到的文案
        "teacherView": "肯德基兑换券" // 老师看到的底底
      }
    },
    ... 后续天数
  ]
};
*/
window.activityInfo = window.activityInfo || {};

/** 全局活动List
window.globalActivityList= [{
  // 1. 身份信息 (Base Info)
  "globalActId": "global_act_时间精确到毫秒",       // 活动ID 唯一 时间戳
  "actName": "2026春季学期百日挑战",         // 活动标题
  "className": "三年二班",                 // 所属班级 (隔离数据用)
  "isEnd": false,                     // 状态：true(已结束) / false(已结束)
  "createTime": "2026-02-04 23:23:23",             // 创建时间

  // 2. 绑定关系 (Binding) -> "圈地"
  // 只要是属于这个列表里的单个活动，打卡都算进这个全局活动里
  "subActivityIds": [
	activityList中的act_id
  ],

  // 3. 奖励配置 (Rules) -> "定规矩"
  
  // A. 续签配置 (Consecutive Config) - 连续打卡
  // 这是一个数组，支持多阶梯奖励
  "consecutiveRules": [
    { "target": 7,  "studentView": "神秘大礼包",teacherView: "肯德基" },
    { "target": 21, "studentView": "神秘大礼包", teacherView: "肯德基" },
    { "target": 100,"studentView": "神秘大礼包", teacherView: "肯德基" }
  ],

  // B. 累积配置 (Cumulative Config) - 累计打卡
  // 也是一个数组，允许断签，只要总数够了就给
  "cumulativeRules": [
     { "target": 10,  "studentView": "神秘大礼包",teacherView: "肯德基" },
    { "target": 50, "studentView": "神秘大礼包", teacherView: "肯德基" }

  ]
}
]
*/
window.globalActivityList= window.globalActivityList || [];
/**
window.revokedLog = {
  "act_170670001": {
    "2026-01-31": [
      {
        // ... 原有的作业数据 ...
        "name": "张三",
        "subject": "数学",
        "task": "口算20道",
        "finishTime": "...",
        
        // ✨ 新增：撤销元数据
        "revokedAt": "2026-02-07 10:00:00", // 什么时候撤销的
        "operator": "teacher"               // 谁撤销的（预留字段）
      }
    ]
  }
}*/
window.revokedLog = window.revokedLog || {};

window.defaultConfig = {
    // 🔐 权限相关
    studentPass: "123456",      // 学生用密码 (用于普通查询或简单操作)
    teacherPass: "888888",      // 老师用密码 (用于批量录入、修改、删除)
    
    // ⏳ 时间规则相关
    maxMakeupDays: 7,           // 作业最大补交天数 (例如：超过7天就不让补交了)
    maxUndoDays: 1             // 记录最大撤销天数 (例如：1天前的记录不允许撤销/删除)
};

// ================= 1. 页面初始化 =================
window.onload = function() {
    // 1. 读取数据
    loadData(); 

    // 1. 更新数据状态
	updateGlobalActivityStatus(); 
	
	initStudentDropdown(); // 先填下拉框
	renderStudentActivityPanel(); // 渲染活动列表
	renderStudentAllList(); // 再渲染列表
	
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
	document.getElementById('setting_btn').innerHTML = '⚙️活动设置';
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
        activityInfo: window.activityInfo,  // 重点：保存活动详情
		submissionData: window.submissionData,
		globalActivityList: window.globalActivityList,
		defaultConfig: window.defaultConfig,
		revokedLog:window.revokedLog
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
		window.submissionData = data.submissionData || {}; 
		window.globalActivityList = data.globalActivityList || [];
		window.defaultConfig = data.defaultConfig || {};
		window.revokedLog = data.revokedLog || {};
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

/**
 * ✅ 全局状态检查器
 * 建议在 window.onload 或读取数据后立即调用
 * 作用：遍历活动列表，自动将过期的活动标记为 isEnd=true
 */
function updateGlobalActivityStatus() {
    if (!window.activityList || window.activityList.length === 0) return;

    // ✅ 修正：获取本地时间 (解决 UTC 时区导致早上的时间判断不准的问题)
    // 技巧：利用 sv-SE (瑞典) locale 刚好是 YYYY-MM-DD 格式，或者手动拼接
    // 简单粗暴且兼容性好的写法：
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`; 

    let hasChange = false;

    window.activityList.forEach(item => {
        // 逻辑保持不变：大于结束日期才算结束
        if (!item.isEnd && item.endDate && today > item.endDate) {
            item.isEnd = true;
            hasChange = true;
            console.log(`自动结项：活动【${item.activityName}】已过期`);
        }
    });

    if (hasChange && typeof saveData === 'function') {
        saveData();
    }
}

/**
 * 辅助：生成唯一的活动 Key
 */
function getActivityKey(item) {
    return item.act_id;;
}

function exportJsonData() {
  const raw = localStorage.getItem("schoolManagerData");

  if (!raw) {
    alert("未找到 schoolManagerData 数据");
    return;
  }

  try {
    // 校验一下是不是合法 JSON（防止脏数据）
    const data = JSON.parse(raw);

    // 转回字符串（带缩进，方便你看）
    const jsonStr = JSON.stringify(data, null, 2);

    // 生成 Blob
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });

    // 文件名：带时间，避免覆盖
    const now = new Date();
    const fileName =
      "schoolManagerData_" +
      now.toISOString().replace(/[:.]/g, "-") +
      ".json";

    // 触发下载
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (e) {
    console.error("导出失败，JSON 解析错误：", e);
    alert("数据格式异常，无法导出");
  }
}