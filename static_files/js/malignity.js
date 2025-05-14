let MALIGNITY = {
	ListUrl : '/Stock/Malignity_List_AsyncGet',//리스트 
	ExcelUrl : '/Stock/Malignity_Excel',
	init : () => {
		// 검색 버튼 클릭
		$("#search-goods").on("click", (e) => { MALIGNITY.GetList(1); });
		$("#excel-button").on("click", (e) => { MALIGNITY.ExcelDown(); });

		// 검색 조건 초기화 버튼 기능 부여
		$("#search-reset").off("click").on("click", (e)=>{
			let form = $("#sea-form");
			form.find("input, select").each((i, o)=>{
				if($(o).is("select")){
					$(o).find('option:first').prop("selected", true);
				}else{
					$(o).val("");
				}
			});
		});

		MALIGNITY.GetList(1);//최초 페이지 로드
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
		//data = Object.assign(data, $("#sea-form").serializeObject());

		// ---- 검색 조건 처리 ----------------
		let alldata = $("#sea-form").serializeObject();	// 폼의 모든 항목을 Object로 반환 받기

		// 검색에 필요한 항목 추리기
		data["where"] = Object.keys(alldata).reduce((a, key)=>{
			// 's-' 를 포함하는 항목만 선택 : 코드 검색이 붙는 경우 'dp-', 'keyword-' 시작하는 항목이 추가로 붙기 때문
			let confirmkey = key.split("s-");
			if (confirmkey.length == 2) a[confirmkey[1]] = alldata[key];
			return a;
		}, {});
		data["where"]['l-spcode1'] = $("#l-spcode1").val();
		data["where"]['l-spcode2'] = $("#l-spcode2").val();
		let result = await getAjax(MALIGNITY.ListUrl, data);
		if(result != false && result.state == 1){
			//목록 출력 / 출력 이후 후 처리 지정
			window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
			let targetId = "hb-target-goods-list";
			let pagination = SetPagination(window.pageset, MALIGNITY.GetList);
			hbs("hb-source-goods-list", result.data, targetId, true, () => {
				ImgModalImageChange();
				$("#pagination-area").empty().append(pagination);
			});
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},	// End of Function : GetList
	/**
	 * excel download
	 */		
	ExcelDown : () => {
		$("#sea-form").attr('action', MALIGNITY.ExcelUrl);
		$("#sea-form").attr('method', 'post');
		$("#sea-form").attr('target', '_blank');
		$("#sea-form").submit();
	},	// End of Function : ExcelDown	
};

$(async () =>{
	HB_StockManageHelperLoad();
	// 기존 Drop Down 기능에서 autocomplete 기능으로 변경 : yds@ntrex on 2024.06.13
	// inputAutoComplete.js에서 로딩 완료 후 처리 할 INPUT 처리를 함수로 지정
	window.ajaxDebounceAutocompleteInit = function() {
		$("INPUT[data-group='code-search']").ajaxDebounceAutocomplete({
			url: '/Code/CodeManage_List_V2_AsyncGet'
		});
	};
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = '/assets/js/inputAutoComplete.js';
	// script.onload = function() { };	// 즉시 처리 할 내용이 없음으로 미지정
	script.onerror = function() { console.error('inputAutoComplete.js 로드 중 오류 발생'); };	// 스크립트 로드 실패 시 에러를 콘솔에 출력
	document.head.appendChild(script);	// 스크립트를 document.head에 추가하여 로드 시작

	// 상품번호 INPUT Enter Key 반영
	$("#sea-form").find("input[name='s-goodsSeq']").off("keydown").on("keydown", async function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		if (e.keyCode === 13) {				
			$("#search-goods").trigger("click");
		}
	});	

	// 첫 페이지 호출 / 화면 출력
	MALIGNITY.init();	
});