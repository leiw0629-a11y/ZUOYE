
async function exportJsonData() {
    const raw = localStorage.getItem("schoolManagerData");

    if (!raw) {
        showToastHTML('<div class="cm-toast-title">❌未找到数据</div>');
        return;
    }

    // 文件名
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}${hour}${minute}${second}`;
    const fileName = `作业冒险岛_${timestamp}.json`;

    try {
        showToastHTML('<div class="cm-toast-title">⏳数据导出中，请稍候...</div>', 0);
        await new Promise(resolve => setTimeout(resolve, 50));

        const data = JSON.parse(raw);
        const jsonStr = JSON.stringify(data, null, 2);

        // 优先尝试系统保存
        if (window.isSecureContext && typeof window.showSaveFilePicker === "function") {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'JSON 数据文件',
                        accept: { 'application/json': ['.json'] },
                    }],
                });

                const writable = await fileHandle.createWritable();
                await writable.write(jsonStr);
                await writable.close();

                showToastHTML('<div class="cm-toast-title">数据导出成功！</div>', 2000);
                window.isDataDirty = false;
                return;
            } catch (e) {
                // 用户取消
                if (e.name === 'AbortError') {
                    console.log("用户取消了保存");
                    return;
                }

                // 关键：文件选择器失败时，不直接报错，改走降级下载
                console.warn("showSaveFilePicker 失败，改用普通下载：", e);
            }
        }

        // 降级方案：Blob 下载
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 稍微延后释放，更稳一点
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        showToastHTML('<div class="cm-toast-title">数据导出成功！</div>', 2000);
        window.isDataDirty = false;

    } catch (e) {
        console.error("导出失败：", e);
        showToastHTML('<div class="cm-toast-title">❌数据导出异常或被拒绝</div>', 3000);
    }
}

// 导入
async function triggerImport() {
	if (window.isDataDirty) {
        const goAhead = confirm("⚠️ 当前系统有未导出的新数据！\n\n如果现在导入，当前的新数据将被全部覆盖且无法恢复。\n强烈建议先点击【💾保存(导出)】备份当前数据。\n\n你确定要强行导入吗？");
        if (!goAhead) {
            return; // 用户点击取消，中止导入
        }
    }
    // 为了兼容所有浏览器，我们使用创建 <input type="file"> 的经典方式
    // 这种方式在读取文件时兼容性最好，也不会像系统级 API 那样受限于安全上下文
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // 限制只能选 JSON 文件
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. 开始读取提示
        showToastHTML('⏳ 正在读取文件...', 0);

        try {
            // 2. 使用 FileReader 读取文件内容
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const text = event.target.result;
                    const data = JSON.parse(text);

                    // 3. 基础校验：判断是不是咱们系统的合法数据
                    // 这里简单判断一下是否包含我们约定的核心字段
                    if (!data || typeof data !== 'object') {
                        throw new Error("数据格式不是一个有效的对象");
                    }
                    if (!data.students && !data.activityList && !data.submissionData) {
                        throw new Error("缺失核心业务字段，可能不是本系统导出的文件");
                    }

                    // 4. 覆盖写入 localStorage
                    localStorage.setItem('schoolManagerData', JSON.stringify(data));
                    
                    // 5. 成功提示
                    showToastHTML('✅ 导入成功！正在重启系统...', 0);
                    
                    // 6. 延迟 1.5 秒后刷新页面，让系统重新读取并渲染新数据
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);

                } catch (parseError) {
                    console.error("数据解析失败：", parseError);
                    showToastHTML('❌ 导入失败：文件内容不是合法的系统数据', 3000);
                }
            };
            
            reader.onerror = function() {
                showToastHTML('❌ 导入失败：文件读取发生异常', 3000);
            };

            // 以文本格式读取文件
            reader.readAsText(file);

        } catch (err) {
            console.error("导入过程发生异常：", err);
            showToastHTML('❌ 导入发生未知错误', 3000);
        }
    };

    // 触发点击，弹出文件选择窗口
    input.click();
}
