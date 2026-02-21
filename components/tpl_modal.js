window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.modalPopup = `
    <div id="gridModal" class="modal-overlay dm-modal-overlay" style="display: none;">
        <div class="dm-modal-content">
            <div class="dm-modal-header">
                <span id="modalTitle">⚙️ Day X 管理中心</span>
                <button class="dm-btn-close" onclick="closeGridModal()">✕</button>
            </div>
            
            <div class="dm-modal-body">
                
                <div class="dm-sidebar">
                    <div id="nav-btn-rules" class="dm-nav-btn active" onclick="switchModalPanel('rules')">
                        <div class="dm-nav-icon">🛠️</div>
                        <div class="dm-nav-text">规则设置</div>
                    </div>

                    <div id="nav-btn-subjects" class="dm-nav-btn" onclick="switchModalPanel('subjects')">
                        <div class="dm-nav-icon">📚</div>
                        <div class="dm-nav-text">科目作业</div>
                    </div>

                    <div id="nav-btn-attendance" class="dm-nav-btn" onclick="switchModalPanel('attendance')">
                        <div class="dm-nav-icon">🙋‍♂️</div>
                        <div class="dm-nav-text">请假管理</div>
                    </div>
                </div>

                <div class="dm-main-content">
                    
                    <div id="panel-rules" class="dm-panel active">
                        <div class="dm-section-title">📅 该日属性配置</div>
                        
                        <div class="dm-rules-row">
                            <label class="dm-radio-card">
                                <input type="radio" id="cfg-dt-normal" name="dayType" value="1" checked>
                                <div class="dm-radio-info">
                                    <span class="dm-radio-title">📝 普通作业日</span>
                                    <span class="dm-radio-desc">常规打卡</span>
                                </div>
                            </label>

                            <label class="dm-radio-card">
                                <input type="radio" id="cfg-dt-rest" name="dayType" value="0">
                                <div class="dm-radio-info">
                                    <span class="dm-radio-title">🏖️ 节假 / 休息</span>
                                    <span class="dm-radio-desc">全员免打卡</span>
                                </div>
                            </label>
                        </div>

                        <div class="dm-rules-row single">
                            <label class="dm-radio-card highlight">
                                <input type="radio" id="cfg-dt-reward" name="dayType" value="2">
                                <div class="dm-radio-info">
                                    <span class="dm-radio-title">🎁 发放奖励日</span>
                                    <span class="dm-radio-desc">选中后，将向全勤学生展示下方奖品</span>
                                </div>
                            </label>
                        </div>

                        <div class="dm-reward-box">
                            <div class="dm-badge">🎁 奖品配置</div>
                            <div class="dm-form-row">
                                <div class="dm-form-group" style="flex:1;">
                                    <label>展示名称 (学生可见)</label>
                                    <input type="text" class="dm-input" value="神秘大奖 ✨" onfocus="autoSelectReward()">
                                </div>
                                <div class="dm-form-group" style="flex:1.5;">
                                    <label>真实内容 (仅老师可见)</label>
                                    <input type="text" class="dm-input" placeholder="例如：免作业券" onfocus="autoSelectReward()">
                                </div>
                            </div>
                        </div>
						<div class="dm-info-box">
							<strong>奖励生效规则：</strong><br>
							学生需<b>从活动开始连续打卡至本日</b>，才可领取此奖。<br>
							举例：活动1日开始，若将10日设为奖励日，学生需1号-10号全勤。<br>
							<span style="color:#455A64; font-size:11px;">注：如需设置跨活动的长期累计续签奖励，请前往「全局活动管理」。</span>
						</div>
                    </div>		
					
                    <div id="panel-subjects" class="dm-panel">
                        <div class="dm-section-title">📚 本日作业明细</div>
                        <div class="dm-tip">💡常规作业开启开关即可；如需布置多项或具体内容，请在后方填写。只需填写内容无需填科目名</div>

                        <div class="dm-subject-list">
                            <div class="dm-subject-row">
                                <div class="dm-subject-ctrl">
                                    <label class="dm-switch">
                                        <input type="checkbox" checked onchange="toggleSubjectInputs(this)">
                                        <span class="dm-slider"></span>
                                    </label>
                                    <span class="dm-subj-name">📐数学</span>
                                </div>
                                <div class="dm-subject-inputs">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 1">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 2">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 3">
                                </div>
                            </div>

                            <div class="dm-subject-row">
                                <div class="dm-subject-ctrl">
                                    <label class="dm-switch">
                                        <input type="checkbox" checked onchange="toggleSubjectInputs(this)">
                                        <span class="dm-slider"></span>
                                    </label>
                                    <span class="dm-subj-name">📖语文</span>
                                </div>
                                <div class="dm-subject-inputs">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 1">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 2">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 3">
                                </div>
                            </div>

                            <div class="dm-subject-row disabled">
                                <div class="dm-subject-ctrl">
                                    <label class="dm-switch">
                                        <input type="checkbox" onchange="toggleSubjectInputs(this)">
                                        <span class="dm-slider"></span>
                                    </label>
                                    <span class="dm-subj-name">🔤 英语</span>
                                </div>
                                <div class="dm-subject-inputs">
                                    <input type="text" class="dm-input-mini" placeholder="作业项 1" disabled>
                                    <input type="text" class="dm-input-mini" placeholder="作业项 2" disabled>
                                    <input type="text" class="dm-input-mini" placeholder="作业项 3" disabled>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="panel-attendance" class="dm-panel">
                        <div class="dm-flex-header">
                            <div class="dm-section-title" style="margin:0;">🙋‍♂️ 人员名单设置</div>
                            <div class="dm-search-wrapper">
                                <span class="dm-search-icon">🔍</span>
                                <input type="text" placeholder="搜索姓名..." class="dm-search-input" oninput="filterStudentList(this)">
                            </div>
                        </div>
                        
                        <div class="dm-tip warning">
                            <strong>点名逻辑：</strong> 点击名字变灰，代表该学生 <b>今日请假/排除</b>。
                        </div>

                        <div class="dm-grid-container">
                            <div class="dm-stu-card active" onclick="toggleStudentStatus(this)">
                                <div class="dm-avatar">王</div>
                                <div class="dm-stu-info">
                                    <div class="dm-name">王芳</div>
                                    <div class="dm-status">正常</div>
                                </div>
                            </div>
                            <div class="dm-stu-card active" onclick="toggleStudentStatus(this)">
                                <div class="dm-avatar">李</div>
                                <div class="dm-stu-info">
                                    <div class="dm-name">李雷</div>
                                    <div class="dm-status">正常</div>
                                </div>
                            </div>
                            <div class="dm-stu-card excluded" onclick="toggleStudentStatus(this)">
                                <div class="dm-avatar">孙</div>
                                <div class="dm-stu-info">
                                    <div class="dm-name">孙悟空</div>
                                    <div class="dm-status">请假</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dm-footer">
                     <button class="dm-btn-save" onclick="saveGridConfig()">💾 保存配置</button>
                </div>

            </div>
        </div>
    </div>
`;