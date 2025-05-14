	let ALRAM = {
		ListUrl : '/Alram/Alram_List_AsyncGet',//리스트 
		DelUrl : "/Alram/Alram_Delete",//삭제
		editor : null,
		init : () => {
			ALRAM.GetList(1);//최초 페이지 로드
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
			let result = await getAjax(ALRAM.ListUrl, data);
			if(result != false && result.state == 1){
				//목록 출력 / 출력 이후 후 처리 지정
				window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
				let targetId = "hb-target-alram-list";
				let pagination = SetPagination(window.pageset, ALRAM.GetList);
				hbs("hb-source-alram-list", result.data, targetId, true, () => {
					$("#pagination-area").empty().append(pagination);

					//삭제 버튼 클릭시
					$("[name='delButton']").on("click", async function(e) {
						e.preventDefault();
						let seq = $(this).data("seq");
						MsgBox.Confirm("알람을 삭제하시겠습니까? 삭제시 복구 불가합니다.", async function() {
							let result = await getAjax(ALRAM.DelUrl, {"seq" : seq});
							if(result != false && result.state == 1){
								ALRAM.GetList(1);
							}else{
								CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(result));
							}
						} , function() {});
					});
				});
			}else{
				CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
			}
		},	// End of Function : GetList
	};

	$(() =>{
		// 첫 페이지 호출 / 화면 출력
		ALRAM.init();
	});