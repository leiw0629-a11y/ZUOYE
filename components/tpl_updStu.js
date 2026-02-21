window.AppTemplates = window.AppTemplates || {};

window.AppTemplates.updStuPage = `
<div id="updStu_overlay">
	<div id="updStu_modal">
		
		<div id="updStu_header">
			<span id="updStu_title">修改姓名</span>
		</div>

		<div id="updStu_form">
			<div id="updStu_group_current">
				<label id="updStu_label_current">当前名字</label>
				<input type="text" id="updStu_input_current" value="于朦胧" readonly>
			</div>

			<div id="updStu_group_new">
				<label id="updStu_label_new">新名字</label>
				<input type="text" id="updStu_input_new">
			</div>
		</div>

		<div id="updStu_footer">
			<button id="updStu_btn_cancel" onclick="closeUpdStuModal()">取消</button>
			<button id="updStu_btn_confirm" onclick="updateStuName()">确认修改</button>
		</div>
		
	</div>
</div>
`;