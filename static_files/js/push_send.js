let html = "";
const PUSH = {
	selBox : null,
	ListUrl : '/Alram/Push_List_AsyncGet',
	init : () => {
		//그룹선택 버튼
		$("#group-manager-button").on("click", function(e){
			let result = getAjax( '/Alram/Group_List_AsyncGet', {page: 1, all : "Y"});
			result.then((resData) => {
				if (resData.state != 1) {
					alert("그룹 정보를 가져오지 못했습니다.");
				} else {
					hbs("hb-source-group-list", resData.data, "hb-target-group-list", true, () => {
						$("[name='group_sel_button']").on("click", function(e){
							let group_seq = $(this).data("group-seq");
							let member_result = getAjax( '/Alram/Group_Member_List_AsyncGet', {page: 1, all : "Y", "group_seq" : group_seq});
							
							member_result.then((member_data) => {
								if(member_data != false && member_data.state == 1){
									let html = "";
									$("#member_seq").empty();
									$.each(member_data.data.list, (key, list) => {console.log(list);
										html += "<option value='"+list.member_seq_ref+"'>" + list.id + "(" + list.name + ")</option>"
									});

									$("#member_seq").append(html);
									$("[id='bootstrap-duallistbox-selected-list_member_seq[]']").append(html);
									PUSH.selBox.bootstrapDualListbox('refresh');

									$("#hb-target-group-list").html('');
									$("#group-sel-modal").modal("hide");
								}else{
									CallCommonModal("구성원 목록 가져오기 실패", member != false ? AjaxErrorMessage(member) : {});
								}
							});
						});
					});		
				}
			}).catch((result) => {
				CallCommonModal("실패", result != false ? AjaxErrorMessage(result) : {});
			});
			$("#group-sel-modal").modal("show");
		});
				
		PUSH.selBox = $("#member_seq").bootstrapDualListbox({
			moveAllLabel: '전체등록',
    		removeAllLabel: '전체삭제'
		});

		// 사용자 검색 버튼 클릭
		$("#search-member").on("click", function(e) { PUSH.GetList(1); });

		PUSH.GetList(1);

		let validator = $( "#push-form").validate( {
			rules: {
				"member_seq[]": {
					required: true,
				},
				"title": {
					required: true,
				},
				"message": {
					required: true
				},
			},
			messages: {
				"member_seq[]": {
					required: "* 필수 항목입니다.",
				},
				"title": {
					required: "* 필수 항목입니다.",
				},
				"message": {
					required: "* 필수 항목입니다.",
				},
			},
			submitHandler: (form) => {
				let result = getAjax( '/Alram/Send_Push_Async', $(form).serialize());
				result.then((resData) => {
					if (resData.state != 1) {
						MsgBox.Alert(resData.data.error);
					} else {
						$.formReset($(form));
						$(".removeall").trigger("click");
						MsgBox.Alert("발송되었습니다. (성공 : "+resData.data.send_result.success+", 실패 : "+resData.data.send_result.fail + ")");
					}
				}).catch((result) => {
					CallCommonModal("발송 절차 실패", result != false ? AjaxErrorMessage(result) : {});
				});
			}
		} );		
	},
	/**
	 * 사용자 목록 데이터 호출 / 화면 출력
	 * 	- handlebars를 이용한 목록 출력
	 * @author won@ntrex on 2023.08.31
	 * @param {integer} page 페이지 번호
	 */
	GetList: async (page) => {
		// 페이지 번호 획득
		let data = {"page":(page == undefined?1:page)};

		// 총 레코드 개수 획득
		if (page > 1) data.totalcount = window.pageset.totalcount;

		// 검색 항목 획득
		data = Object.assign(data, $("#sea-form").serializeObject());
		
		let result = await getAjax(PUSH.ListUrl, data);
		if(result != false && result.state == 1){
			let selector = document.getElementById("member_seq");
			let oldSel = '';
			let x = 0;
			if(selector.length > 0){
				for (x = 0; x < selector.length; x++)
				{
					if (selector[x].selected)
					{
						oldSel += "<option value='"+selector[x].value+"' selected='selected'>"+selector[x].text+"</option>"
					}
				}	
			}		

			// 목록 출력
			window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
			let pagination = SetPagination(window.pageset, PUSH.GetList);
			$("#pagination-area").empty().append(pagination);
			
			$("#member_seq").empty();
			if(oldSel != ''){
				PUSH.selBox.append(oldSel);
			}
			$.each(result.data.list, (key, list) => {
				PUSH.selBox.append("<option value='"+list.member_ref+"'>" + list.id + "(" + list.name + ")</option>");
			});
			PUSH.selBox.bootstrapDualListbox('refresh', true);
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	}	// End of Function : GetList
};

$(() =>{
	PUSH.init();
});