let PUSH_GROUP = {
	ListUrl : '/Alram/Group_List_AsyncGet',//리스트 
	SaveUrl : "/Alram/Group_Save",//등록
	UpdateUrl : "/Alram/Group_Update",//수정
	DelUrl : "/Alram/Group_Del",//삭제
	MemberDelUrl : "/Alram/Group_Member_Del",//멤버삭제
	MemberListUrl : "/Alram/Group_Member_List_AsyncGet",//멤버리스트
	init : () => {
		// 검색 버튼 클릭
		$("#search-button").on("click", (e) => { PUSH_GROUP.GetList(1); });

		// 추가 버튼 클릭
		$("#new-button").on("click", (e) => { PUSH_GROUP.ModalOpen("new"); });	
		PUSH_GROUP.GetList(1);//최초 페이지 로드
	},
	setValidation: (targetForm, url, option) => {
		option = option || {};
		let validator = targetForm.validate($.extend( {
			rules: {
				"group_name": {
					required: true,
				},
			},
			messages: {
				"group_name": {
					required: "* 필수 항목입니다.",
				},
			},			
			submitHandler:  (form) => {
				let result =  getAjax(url, $(form).serialize());
				let targetModal = $(form).closest(".modal");
				result.then((resData) => {
					if (resData.state != 1) {
						AjaxResultModalProc(targetModal.attr("id"), resData);
					} else {
						targetModal.modal("hide");
						$.formReset(form);
						
						if (url == PUSH_GROUP.SaveUrl) {
							CallCommonModal("통신 결과", "저장이 완료되었습니다.<br>검색 조건을 초기화 하고 데이터를 다시 불러 옵니다.");
							PUSH_GROUP.GetList(1);
						} else {
							PUSH_GROUP.GetList(window.pageset.nowpage);
						}
					}
				}).catch((resData) => {
					AjaxResultModalProc(targetModal.attr("id"), resData);
				});
			}
		}, option));
	},
	/**
	 * 목록 데이터 호출 / 화면 출력 - handlebars를 이용한 목록 출력
	 * @param {integer} page 페이지 번호
	 */		
	GetList : async (page) => {
		// 페이지 번호 획득
		let data = {"page" : (page == undefined ? 1 : page)};

		// 총 레코드 개수 획득
		if (page > 1) data.totalcount = window.pageset.totalcount;

		// 검색 항목 획득
		data = Object.assign(data, $("#search-form").serializeObject());
		let result = await getAjax(PUSH_GROUP.ListUrl, data);
		if(result != false && result.state == 1){
			//목록 출력 / 출력 이후 후 처리 지정
			window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
			let targetId = "hb-target-group-list";
			let pagination = SetPagination(window.pageset, PUSH_GROUP.GetList);
			hbs("hb-source-group-list", result.data, targetId, true, () => {
				$("#pagination-area").empty().append(pagination);
				$("#"+targetId+" .card-body .d-flex.align-items-center.title").on("click", function(e) {
					e.preventDefault();
					// 이벤트 사용자 정보 획득
					let params = $(this).data("group-info");
	
					// Modal Open
					PUSH_GROUP.ModalOpen("modify", params);
				});
				//그룹삭제 버튼 클릭시
				$("[name='delButton']").on("click", function(e) {
					e.preventDefault();
					let seq = $(this).data("seq");
					MsgBox.Confirm("그룹을 삭제하시겠습니까? 삭제시 복구 불가합니다.", async function() {
						let result = await getAjax(PUSH_GROUP.DelUrl, {"seq" : seq});
						if(result != false && result.state == 1){
							PUSH_GROUP.GetList(1);
						}else{
							CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(result));
						}
					} , function() {});
				});	

				//구성원 등록 버튼 클릭시
				$("[name='groupMemberButton']").on("click", function(e) {
					e.preventDefault();
					let group_seq = $(this).data("seq");
					SEARCH_MEMBER.init(group_seq);
				});	
				
				//구성원 보기 버튼 클릭시
				$("[name='groupMemberListButton']").on("click", function(e) {
					e.preventDefault();
					PUSH_GROUP.memberListGroupSeq = $(this).data("seq");
					PUSH_GROUP.GDrawList(1);
				});
			});
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},	// End of Function : GetList
	GDrawList: async (page)=>{
		let member_result = await getAjax(PUSH_GROUP.MemberListUrl, {"group_seq" : PUSH_GROUP.memberListGroupSeq, "page" : page});
		if(member_result != false && member_result.state == 1) {
			let data = member_result.data;

			hbs("hb-source-group-member-list", data, "modal-group-member-list-base", true, () => {
				$("#stock-group-member-modal").modal("show");
				let pagination = SetPagination(data.pageset, PUSH_GROUP.GDrawList);
				$("#pagination-area-goodslist").empty().append(pagination);

				//구성원 삭제 버튼 클릭시
				$("[name='memberDelButton']").on("click", function(e) {
					e.preventDefault();
					let member_seq = $(this).data("seq");
					MsgBox.Confirm("그룹구성원을 삭제하시겠습니까? 삭제시 복구 불가합니다.", async function() {
						let result = await getAjax(PUSH_GROUP.MemberDelUrl, {"member_seq" : member_seq});
						if(result != false && result.state == 1){
							PUSH_GROUP.GDrawList(page);
						}else{
							CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(result));
						}
					} , function() {});
				});	
			});
		}else{
			CallCommonModal("구성원 리스트 가져오기 실패", goods_result != false ? AjaxErrorMessage(goods_result) : {});
		}
	},	// End of Function : GDrawList
	ModalOpen : (type, params) => {
		/**
		 * 등록/수정 Midal 띄우기
		 * @param {string} type 신규/기존 구분("new":신규, "modify":기존)
		 * @param {object} params 정보 JSON Data
		 */
		let modalformId = "#base-modal-form";
		let targetModal = $('#base-modal');
		let title = "";
		
		// 폼 리셋
		$.formReset($(modalformId));
		
		if (type == "modify") {
			title = "그룹 정보";
			// 정보 대입
			$.each(params, function(key, data){
				$( modalformId ).find("#"+key).val(data);
			});

			PUSH_GROUP.setValidation($( modalformId ), PUSH_GROUP.UpdateUrl);
		} else {
			title = "신규 그룹 정보";
			PUSH_GROUP.setValidation($( modalformId ), PUSH_GROUP.SaveUrl);
		}
		
		// Modal Show
		targetModal.find('.modal-title').text(title);
		targetModal.modal("show");
	},	// End of Function : ModalOpen
};

let SEARCH_MEMBER = {
	ListUrl : '/Alram/Push_List_AsyncGet',
	init : (seq) => {
		$("#group_seq").val(seq);
		// 사용자 검색 버튼 클릭
		$("#search-member").on("click", function(e) { SEARCH_MEMBER.GetList(1); });
		$("#search-member-modal").modal("show");
		SEARCH_MEMBER.GetList(1);//최초 페이지 로드
		SEARCH_MEMBER.setValidation($("#group-member-add-modal-form"), '/Alram/Group_Member_Save');
	},	
	setValidation: (targetForm, url, option) => {
		option = option || {};
		let validator = targetForm.validate($.extend( {
			rules: {
				"group_seq": {
					required: true,
				},
			},
			messages: {
				"group_seq": {
					required: "* 필수 항목입니다.",
				},
			},			
			submitHandler:  (form) => {
				let result =  getAjax(url, $(form).serialize());
				let targetModal = $(form).closest(".modal");
				result.then((resData) => {
					if (resData.state != 1) {
						AjaxResultModalProc(targetModal.attr("id"), resData);
					} else {
						targetModal.modal("hide");
						$.formReset(form);
						validator.destroy();
						CallCommonModal("통신 결과", "저장이 완료되었습니다.");
					}
				}).catch((resData) => {
					AjaxResultModalProc(targetModal.attr("id"), resData);
				});
			}
		}, option));
	},	
	/**
	 * 목록 데이터 호출 / 화면 출력 - handlebars를 이용한 목록 출력
	 * @param {integer} page 페이지 번호
	 */		
	GetList : async (page) => {
		// 페이지 번호 획득
		let data = {"page" : (page == undefined ? 1 : page)};

		// 총 레코드 개수 획득
		if (page > 1) data.totalcount = window.search_pageset.totalcount;

		// 검색 항목 획득
		data = Object.assign(data, $("#sea-form").serializeObject());
		let result = await getAjax(SEARCH_MEMBER.ListUrl, data);
		if(result != false && result.state == 1){
			//목록 출력 / 출력 이후 후 처리 지정
			window.search_pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
			let pagination = SetPagination(window.search_pageset, SEARCH_MEMBER.GetList);

			$("#member-pagination-area").empty().append(pagination);
			$("#hb-target-member-list").empty();
			let html = '<ul class="list-group list-group-light">';
			$.each(result.data.list, (key, list) => {
				html += '<li class="list-group-item">';
				html += '<input type="checkbox" class="form-check-input me-1" name="group_member[]" value="'+list.member_ref+'" />'+list.id + "(" + list.name + ")";
				html += '</li>';
			});
			html += '</ul>';
			$("#hb-target-member-list").html(html);
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},	// End of Function : GetList
}

$(() =>{
	// 첫 페이지 호출 / 화면 출력
	PUSH_GROUP.init();
});