	let CO_COMPANY = {
		coListUrl : '/Code/CodeCompany_List_AsyncGet',//거래처 리스트 
		coSaveUrl : "/Code/CodeCompany_Save",//거래처 저장
		coUpdateUrl : "/Code/CodeCompany_Update",//거래처 수정
		maListUrl : '/Code/CompanyManager_List_AsyncGet',//담당자 리스트 
		maSaveUrl : "/Code/CompanyManager_Save",//담당자 저장
		maUpdateUrl : "/Code/CompanyManager_Update",//담당자 수정
		maDelUrl : "/Code/CompanyManager_Delete",//담당자 삭제
		validator : null,
		init : () => {
			// 검색 버튼 클릭
			$("#search-button").on("click", function(e) { CO_COMPANY.GetList(1); });
			// 추가 버튼 클릭
			$("#new-button").on("click", function(e) { CO_COMPANY.ModalOpen("new"); });
			//주소검색 버튼 클릭
			$("#searchAddress").on("click", (e) => {
				new daum.Postcode({
					oncomplete: function(data) {
						// 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
		
						// 각 주소의 노출 규칙에 따라 주소를 조합한다.
						// 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
						var addr = ''; // 주소 변수
		
						//사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
						if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
							addr = data.roadAddress;
						} else { // 사용자가 지번 주소를 선택했을 경우(J)
							addr = data.jibunAddress;
						}
		
						// 우편번호와 주소 정보를 해당 필드에 넣는다.
						$("#co_zipcode").val(data.zonecode);
						$("#co_address").val(addr);
						// 커서를 상세주소 필드로 이동한다.
						$("#co_address_detail").focus();
					}
				}).open();
			});			
			CO_COMPANY.GetList(1);//최초 페이지 로드
		},
		setValidation: (targetForm, url, option) => {
			option = option || {};
			CO_COMPANY.validator = targetForm.validate($.extend( {
				submitHandler:  (form) => {
					let result =  getAjax(url, $(form).serialize());
					let targetModal = $(form).closest(".modal");
		
					result.then((resData) => {
						if (resData.state != 1) {
							AjaxResultModalProc(targetModal.attr("id"), resData);
						} else {
							targetModal.modal("hide");
							$.formReset(form);

							if (url == CO_COMPANY.coSaveUrl) {
								CallCommonModal("통신 결과", "저장이 완료되었습니다.<br>검색 조건을 초기화 하고 데이터를 다시 불러 옵니다.");
								CO_COMPANY.GetList(1);
							} else {
								CO_COMPANY.GetList(window.pageset.nowpage);
							}
						}
					}).catch((resData) => {
						AjaxResultModalProc(targetModal.attr("id"), resData);
					});
				}
			}, option));
		},	
		/**
		 * 목록 데이터 호출 / 화면 출력
		 * 	- handlebars를 이용한 목록 출력
		 * @param {integer} page 페이지 번호
		 */		
		GetList : async (page) => {
			// 페이지 번호 획득
			let data = {"page" : (page == undefined ? 1 : page)};

			// 총 레코드 개수 획득
			if (page > 1) data.totalcount = window.pageset.totalcount;

			// 검색 항목 획득
			data = Object.assign(data, $("#search-form").serializeObject());
			let result = await getAjax(CO_COMPANY.coListUrl, data);
			if(result != false && result.state == 1){
				//목록 출력 / 출력 이후 후 처리 지정
				window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
				let targetId = "hb-target-company-list";
				let pagination = SetPagination(window.pageset, CO_COMPANY.GetList);
				hbs("hb-source-company-list", result.data, targetId, true, () => {
					$("#pagination-area").empty().append(pagination);
					CO_COMPANY.RowModifyEvent(targetId);

					//담당자 버튼 클릭시
					$("[name='managerButton']").on("click", function(e) {
						e.preventDefault();
						let coCode = $(this).data("co_code");
						
						$(this).text() == "담당자 보기" ? $(this).text("담당자 닫기") : $(this).text("담당자 보기");
						CO_COMPANY.GetCompanyManager(coCode);
					});

					//담당자 추가 버튼 클릭시
					$("[name='managerAddButton']").on("click", function(e){
						e.preventDefault();
						$.formReset($("#manager-modal-form"));
						let targetModal = $("#manager-modal");
						let coCode = $(this).data("co_code");
						$("#co_code_ref").val(coCode);
						
						if(CO_COMPANY.validator){
							CO_COMPANY.validator.destroy();
						}
						
						CO_COMPANY.setValidation($("#manager-modal-form"), CO_COMPANY.maSaveUrl, {
							rules: {
								"co_code_ref": {
									required: true,
								},
								"co_name": {
									required: true
								},
							},
							messages: {
								"co_code": {
									required: "* 필수 항목입니다.",
								},
								"co_name": {
									required: "* 필수 항목입니다.",
								},
							},
						});
						targetModal.find('.modal-title').text("담당자 정보 등록");
						targetModal.modal("show");
					});
				});
			}else{
				CallCommonModal("거래처 목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
			}
		},	// End of Function : GetList
		GetCompanyManager : async (coCode) => {//담당자 리스트 가져오기
			let targetDiv = $("#managerList_" + coCode);
			let targetModal = $("#manager-modal");
			let viewButton = targetDiv.closest(".list-line-block").find(".dropdown-menu").find("[name='managerButton']");//담당자 보기 버튼 클릭시 
			let buttonState = viewButton.text() == "담당자 닫기";
			if(buttonState){//닫혀 있는지 열려 있는지 
				let result = await getAjax(CO_COMPANY.maListUrl, {'co_code' : coCode});
				if(result != false && result.state == 1){
						let source = $("#hb-source-manager-list").html();
						let template = Handlebars.compile(source);
						let html = template(result.data);
						if(result.data.list.length){
							targetDiv.html(html).removeClass("d-none");
						}else{
							targetDiv.html("등록된 담당자 정보가 없습니다.").removeClass("d-none");
						}

						//수정 버튼 - 담당자 정보 수정 처리
						targetDiv.find(".button-base").find(".update-button").on("click", function(e){
							e.preventDefault();
							$.formReset($("#manager-modal-form"));
							let managerBase = $(this).closest(".manager-base");
							let managerCode = $(this).data("co_manager_seq");
							$("#co_manager_seq").val(managerCode);

							let params = {};
							managerBase.find(".subtitle[data-field]").each(function(i, v) {
								params[$(v).data("field")] = $(v).data("value");
							});
							//radio 타입처리 구분
							let checkRadio = ['co_rep_use'];
							// 정보 대입
							$.each(params, function(key, data){
								if(checkRadio.includes(key)){
									targetModal.find("[name='"+key+"'][value='"+data+"']").prop("checked", true);
								}else{
									targetModal.find("#"+key).val(data);
								}
							});

							if(CO_COMPANY.validator){
								CO_COMPANY.validator.destroy();
							}

							CO_COMPANY.setValidation($("#manager-modal-form"), CO_COMPANY.maUpdateUrl, {
								rules: {
									"co_manager_seq": {
										required: true,
									},
								},
								messages: {
									"co_manager_seq": {
										required: "* 필수 항목입니다.",
									},
								},
							});

							targetModal.find('.modal-title').text("담당자 정보 수정");
							targetModal.modal("show");
						});

						//삭제 버튼
						targetDiv.find(".button-base").find(".del-button").on("click", function(e){
							e.preventDefault();
							let managerCode = $(this).data("co_manager_seq");
							MsgBox.Confirm("담당자를 삭제하시겠습니까? 삭제시 복구 불가합니다.", async function() {
								let result = await getAjax(CO_COMPANY.maDelUrl, {"co_manager_seq" : managerCode});
								if(result != false && result.state == 1){
									CO_COMPANY.GetCompanyManager(coCode);
								}else{
									CallCommonModal("담당자 삭제 실패", result != false ? AjaxErrorMessage(result) : {});
								}
							} , function() {});
						});					
				}else{
					targetDiv.html("데이터를 불러오지 못했습니다.");
					CallCommonModal("담당자 목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
				}
			}else{
				targetDiv.addClass("d-none");
			}
		},	// End of Function : GetCompanyManager
		ModalOpen : (type, params) => {
			/**
			 * 거래처 등록/수정 Midal 띄우기
			 * @param {string} type 신규/기존 구분("new":신규, "modify":기존)
			 * @param {object} params 정보 JSON Data
			 */
			let modalformId = "#company-modal-form";
			let targetModal = $('#company-modal');
			let title = "";
			
			// 폼 리셋
			$.formReset($(modalformId));

			if (type == "modify") {
				title = "거래처 정보";
				let checkRadio = ['m_use', 'p_use'];
				// 정보 대입
				$.each(params, function(key, data){
					if(checkRadio.includes(key)){
						$( modalformId ).find("[name='"+key+"'][value='"+data+"']").prop("checked", true);
					}else{
						$( modalformId ).find("#"+key).val(data);
					}
				});
				CO_COMPANY.setValidation($( modalformId ), CO_COMPANY.coUpdateUrl);
			} else {
				title = "신규 거래처 정보";
				CO_COMPANY.setValidation($( modalformId ), CO_COMPANY.coSaveUrl);
			}
			
			// Modal Show
			targetModal.find('.modal-title').text(title);
			targetModal.modal("show");
		},	// End of Function : ModalOpen
		RowModifyEvent : (targetId) =>{
			$("#"+targetId+" .list-line-block .compnay-list-link").on("click", function(e) {
				e.preventDefault();
				// 이벤트 사용자 정보 획득
				let params = {};
				let parent = $(this).parent(".list-line-block").children(".compnay-list-top");

				//클릭 영역을 분리함으로 인해 거래처코드/거래처명을 별도로 가져와야함.
				params['co_code'] = parent.find(".subtitle[data-field='co_code']").data("value");
				params['co_name'] = parent.find(".subtitle[data-field='co_name']").data("value");
				$(this).find(".subtitle[data-field]").each(function(i, v) {
					params[$(v).data("field")] = $(v).data("value");
				});

				// Modal Open
				CO_COMPANY.ModalOpen("modify", params);
			});
		},	// End of Function : RowModifyEvent
	};

	$(() =>{
		// 첫 페이지 호출 / 화면 출력
		CO_COMPANY.init();
	});