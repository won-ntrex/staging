let GOODSORDER = {
	ListUrl :  '/Stock/GoodsOrder_AsyncGet',//리스트 
	ExcelUrl : '/Stock/GoodsOrder_Excel',
	SaveUrl :'/Stock/GoodsOrderStatus_Save',
	PurchaseUrl :'/Stock/GetPurchase_AsyncGet',
	OrderCompleteListUrl :  '/Stock/GoodsOrder_AsyncGet',//리스트 
	DelUrl :'/Stock/GoodsOrder_Del',
	commonInit : () => {
		// 검색 조건 초기화 버튼 기능 부여
		$("#search-reset").off("click").on("click", (e)=>{
			let form = $("#sea-form");
			form.find("input, select").each((i, o)=>{
				$(o).val("");
			});
		});

		//발주 담기/발주 완료 전체 체크
		$("#allCheckOrderButton").on("click", function(){
			if($(this).prop("checked")){
				$("input[name='sel_order_seq']").each(function(){
					$(this).prop("checked", true);
					$(this).closest("tr").css("background", "#bbc1f7");
				});
			}else{
				$("input[name='sel_order_seq']").each(function(){
					$(this).prop("checked", false);
					$(this).closest("tr").css("background", "");
				});
			}
		});
	},
	init : () => {
		GOODSORDER.commonInit();
		GOODSORDER.getPurchase('A');
		// 검색 버튼 클릭
		$("#search-goods").on("click", (e) => { GOODSORDER.OrderGetList(1); });

		//발주 대상 전체 체크
		$("#allCheckGoodsButton").on("click", function(){
			if($(this).prop("checked")){
				$("input[name='sel_goods_seq']").each(function(){
					$(this).prop("checked", true);
					$(this).closest("tr").css("background", "#bbc1f7");
				});
			}else{
				$("input[name='sel_goods_seq']").each(function(){
					$(this).prop("checked", false);
					$(this).closest("tr").css("background", "");
				});
			}
		});

		//발주 대상 선택 삭제
		$("#orderDelButton").on("click", async function(){
			var data = Array();
			$("input[name='sel_goods_seq']").each(function(){
				if($(this).prop("checked")){
					data.push($(this).val());
				}
			});

			if(data.length > 0){
				MsgBox.Confirm("삭제 하시겠습니까?", async function() {
					// 서버통신 결과 받기 - 상태변경
					let result = await getAjax(GOODSORDER.DelUrl, {"seq" : data});
					if(result != false && result.state == 1){
						GOODSORDER.OrderGetList(window.pageset.nowpage);
						GOODSORDER.OrderAddGetList();
						$("#allCheckOrderButton").prop("checked", false);
					}else{
						CallCommonModal("발주 대상 삭제 처리 실패", result != false ? AjaxErrorMessage(result) : {});
					}
				});
			}else{
				MsgBox.Alert("상품을 선택해주세요.");
			}
		});

		//발주 담기
		$("#orderAddButton").on("click", async function(){
			var data = Array();
			$("input[name='sel_goods_seq']").each(function(){
				if($(this).prop("checked")){
					data.push($(this).val());
				}
			});

			if(data.length > 0){
				// 서버통신 결과 받기 - 발주 담기
				let result = await getAjax(GOODSORDER.SaveUrl, {"seq" : data, "status" : 'C'});
				if(result != false && result.state == 1){
					GOODSORDER.OrderGetList(window.pageset.nowpage);
					GOODSORDER.OrderAddGetList();
					$("#allCheckGoodsButton").prop("checked", false);
				}else{
					CallCommonModal("발주 담기 실패", result != false ? AjaxErrorMessage(result) : {});
				}
			}else{
				MsgBox.Alert("상품을 선택해주세요.");
			}
		});

		//엑셀 다운
		$("#excelDownButton").on('click', function(){
			MsgBox.Confirm("다운로드 하시겠습니까? <br />다운로드시 발주 담기 목록은 완료 처리됩니다.", async function() {
				//먼저 발주 담기에 담긴 발주 목록을 삭제 처리
				var data = Array();
				$("input[name='sel_order_seq']").each(function(){
					data.push($(this).val());
				});

				if(data.length > 0) {
					// 서버통신 결과 받기 - 다운 받은 목록 삭제
					let result = await getAjax(GOODSORDER.SaveUrl, {"seq" : data, "status" : 'D'});
					console.log(4);
					if(result != false && result.state == 1){
						GOODSORDER.OrderGetList(window.pageset.nowpage);
						GOODSORDER.OrderAddGetList();
						$("#allCheckOrderButton").prop("checked", false);

						GOODSORDER.ExcelDown({ 'order_state' : 'D', 'order_seq' : data});
					}else{
						CallCommonModal("다운 받은 목록 삭제 실패", result != false ? AjaxErrorMessage(result) : {});
					}
				}							
			} , function() {});
		});

		//발주 담기 삭제 - 선택취소
		$("#orderCancelButton").on("click", async function(){
			var data = Array();
			$("input[name='sel_order_seq']").each(function(){
				if($(this).prop("checked")){
					data.push($(this).val());
				}
			});

			if(data.length > 0){
				// 서버통신 결과 받기 - 상태변경
				let result = await getAjax(GOODSORDER.SaveUrl, {"seq" : data, "status" : 'A'});
				if(result != false && result.state == 1){
					GOODSORDER.OrderGetList(window.pageset.nowpage);
					GOODSORDER.OrderAddGetList();
					$("#allCheckOrderButton").prop("checked", false);
				}else{
					CallCommonModal("발주 담기 취소 처리 실패", result != false ? AjaxErrorMessage(result) : {});
				}
			}else{
				MsgBox.Alert("상품을 선택해주세요.");
			}
		});

		GOODSORDER.OrderGetList(1);
		GOODSORDER.OrderAddGetList();
	}, // End of Function : init,
	/**
	 * 발주 대상 업체 리스트 가져오기
	 * @author won@ntrex on 2024.01.29.
	 * @param {string} order_state 발주 구분
	 */	
	async getPurchase(order_state){
		// 서버통신 결과 받기 - 발주 담기
		let result = await getAjax(GOODSORDER.PurchaseUrl, {'order_state' : order_state});
		if(result != false && result.state == 1){
			let html = [];
			$.each(result.data, function(key, obj){
				html.push("<a href='#none' data-co_code='" + obj.co_code + "'>" + obj.purchase + "</a>");
			});
			$("#purchase_base").html(html.join(" / "));

			$("#purchase_base a").each(function(){
				$(this).on("click", function(){
					$("#l-purchase").val($(this).text());
					$("[name='s-purchase']").val($(this).data("co_code"));
					$("#search-goods").trigger("click");
				});
			});
		}else{
			CallCommonModal("업체 리스트 불러오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},// End of Function : getPurchase
	/**
	 * 발주 대상 리스트 가져오기
	 * @author won@ntrex on 2024.01.19
	 * @param {integer} page 페이지 번호
	 */
	async OrderGetList(page) {
		// 페이지 번호 획득
		let data = {"page" : (page == undefined ? 1 : page)};
		data['s-order_seq'] = $("[name='s-order_seq']").val();
		data['s-purchase'] = $("[name='s-purchase']").val();
		data['l-purchase'] = $("#l-purchase").val();
		data['s-managercode'] = $("[name='s-managercode']").val();
		data['l-managercode'] = $("#l-managercode").val();
		data['order_state'] = 'A';

		let result = await getAjax(GOODSORDER.ListUrl, data);
		if(result != false && result.state == 1){
			window.pageset = result.data.pageset;
			//목록 출력 / 출력 이후 후 처리 지정
			hbs("hb-source-goods-object", result.data, "hb-target-goods-list-object", true, ()=>{
				// 하단 페이징 처리
				let pagination_top = SetPagination(result.data.pageset, GOODSORDER.OrderGetList);
				let pagination = SetPagination(result.data.pageset, GOODSORDER.OrderGetList);
				$("#pagination-area-object-top").empty().append(pagination_top);
				$("#pagination-area-object").empty().append(pagination);

				// 이미지 모달 이벤트 추가
				$("#hb-target-goods-list-object .table-img img").on("click", (e)=>{
					e.stopPropagation();
					let myModalEl = document.querySelector('#imgModal')
					let modal = bootstrap.Modal.getOrCreateInstance(myModalEl)
					let src = $(e.currentTarget).attr("src");

					$(modal._element).find("img").attr("src", src);
					modal.show()
				});

				$("#hb-target-goods-list-object tr").on("click", function(e) {
					var obj = $(e.currentTarget).find("input[type=checkbox]");
					if(e.target.nodeName == 'INPUT'){
						if(obj.prop("checked")){
							$(e.currentTarget).css("background", "#bbc1f7");
						}else{
							$(e.currentTarget).css("background", "");
						};
					}else{
						if(obj.prop("checked")){
							obj.prop("checked", false);
							$(e.currentTarget).css("background", "");
						}else{
							obj.prop("checked", true);
							$(e.currentTarget).css("background", "#bbc1f7");
						};
					} 
				});
			});	
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},	// End of Function : OrderGetList,
	/**
	 * 발주 담기 리스트 가져오기
	 * @author won@ntrex on 2024.01.19
	 */
	async OrderAddGetList() {
		// 페이지 번호 획득
		let result = await getAjax(GOODSORDER.ListUrl, {'order_state' : 'C', 'excel_use': 'Y'});
		if(result != false && result.state == 1){
			//목록 출력 / 출력 이후 후 처리 지정
			hbs("hb-source-order-object", result.data, "hb-target-order-list-object", true, ()=>{
				// 이미지 모달 이벤트 추가
				$("#hb-target-order-list-object .table-img img").on("click", (e)=>{
					e.stopPropagation();
					let myModalEl = document.querySelector('#imgModal')
					let modal = bootstrap.Modal.getOrCreateInstance(myModalEl)
					let src = $(e.currentTarget).attr("src");

					$(modal._element).find("img").attr("src", src);
					modal.show()
				});

				$("#hb-target-order-list-object tr").on("click", function(e) {
					var obj = $(e.currentTarget).find("input[type=checkbox]");
					if(e.target.nodeName == 'INPUT'){
						if(obj.prop("checked")){
							$(e.currentTarget).css("background", "#bbc1f7");
						}else{
							$(e.currentTarget).css("background", "");
						};
					}else{
						if(obj.prop("checked")){
							obj.prop("checked", false);
							$(e.currentTarget).css("background", "");
						}else{
							obj.prop("checked", true);
							$(e.currentTarget).css("background", "#bbc1f7");
						};
					} 
				});
			});	
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},	// End of Function : OrderCompleteGetList,
	/**
	 * excel download
	 */		
	ExcelDown : async (option) => {
		option = option || {};
		var $form = $('<form></form>');
		$(document.body).append($form);
		$form.attr('action', GOODSORDER.ExcelUrl);
		$form.attr('method', 'post');
		$form.attr('target', '_blank');

		if(option.hasOwnProperty('order_state')){
			$form.append($('<input/>', {type: 'hidden', name: 'order_state', value: option.order_state }));
		}

		if(option.hasOwnProperty('order_seq') && option.order_seq.length > 0){
			
			$form.append($('<input/>', {type: 'hidden', name: 'order_seq', value: option.order_seq }));
		}

		$form.submit();
	},	// End of Function : ExcelDown		
	orderCompleteInit : () => {
		GOODSORDER.commonInit();
		GOODSORDER.getPurchase('D');

		//엑셀 선택 다운
		$("#excelSelDownButton").on('click', function(){
			//선택 목록 담기
			var data = Array();
			$("input[name='sel_order_seq']:checked").each(function(){
				data.push($(this).val());
				$(this).prop("checked", false);
			});

			if(data.length > 0) {
				GOODSORDER.ExcelDown({'order_state' : 'D', 'order_seq' : data});
			}else{
				MsgBox.Alert("상품을 선택해주세요.");
			}						
		});

		// 검색 버튼 클릭
		$("#search-goods").on("click", (e) => { GOODSORDER.OrderCompleteGetList(1); });
		GOODSORDER.OrderCompleteGetList(1);
	}, // End of Function : orderCompleteInit,		
	/**
	 * 발주 완료(엑셀다운로드) 리스트 가져오기
	 * @author won@ntrex on 2024.01.29
	 */
	async OrderCompleteGetList(page) {
		// 페이지 번호 획득
		let data = {"page" : (page == undefined ? 1 : page)};
		data['s-purchase'] = $("[name='s-purchase']").val();
		data['l-purchase'] = $("#l-purchase").val();
		data['s-managercode'] = $("[name='s-managercode']").val();
		data['l-managercode'] = $("#l-managercode").val();
		data['order_state'] = 'D';

		let result = await getAjax(GOODSORDER.OrderCompleteListUrl, data);
		if(result != false && result.state == 1){
			//목록 출력 / 출력 이후 후 처리 지정
			hbs("hb-source-order-complete-object", result.data, "hb-target-order-complete-list-object", true, ()=>{
				// 하단 페이징 처리
				let pagination_top = SetPagination(result.data.pageset, GOODSORDER.OrderCompleteGetList);
				let pagination = SetPagination(result.data.pageset, GOODSORDER.OrderCompleteGetList);
				$("#pagination-area-object-top").empty().append(pagination_top);
				$("#pagination-area-object").empty().append(pagination);

				// 이미지 모달 이벤트 추가
				$("#hb-target-order-complete-list-object .table-img img").on("click", (e)=>{
					e.stopPropagation();
					let myModalEl = document.querySelector('#imgModal')
					let modal = bootstrap.Modal.getOrCreateInstance(myModalEl)
					let src = $(e.currentTarget).attr("src");
					
					$(modal._element).find("img").attr("src", src);
					modal.show()
				});
			});	
		}else{
			CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	},	// End of Function : OrderCompleteGetList,	
};

$(async () =>{
	HB_StockManageHelperLoad();
	
	/*
	// 검색 지원용 플러그인 HTML 페이지를 로드 시킬때 까지 대기
	await new Promise((resolve, reject)=>{
		$("#code-search-contents").load("/Code/CodeSearch_LoadHtml", function(response, status, xhr){
			if(status == "error") resolve(false);
			else resolve(true);
		});
	});
	
	// 위 Html 페이지가 로드 되면 실행
	new CodeSearchElement($("#sea-form input[data-group='code-search']"));
	*/

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

	if($("#order-complete-list-container").length > 0){
		// 첫 페이지 호출 / 화면 출력
		GOODSORDER.orderCompleteInit();
	}else{
		// 첫 페이지 호출 / 화면 출력
		GOODSORDER.init();
	}
});