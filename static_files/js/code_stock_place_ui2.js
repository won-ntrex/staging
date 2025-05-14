	let CO_STOCKPLACE = {
		ListUrl : '/Code/StockPlace_List_AsyncGet',//재고 리스트 
		SaveUrl : "/Code/StockPlace_Save",//저장
		UpdateUrl : "/Code/StockPlace_Update",//수정
		DelUrl : "/Code/StockPlace_Delete",//삭제		
		stockGoodsListUrl : '/Code/StockPlace_Goods_AsyncGet',//재고 상품 리스트 
		stockGoodsListUrl_UI2 : "/Code/StockPlace_Goods_UI2_AsyncGet",//재고 상품 리스트 UI2
		init : function(){
			// 검색 버튼 클릭
			$("#search-button").on("click", function(e) { CO_STOCKPLACE.GetList(1); });

			// 추가 버튼 클릭
			$("#new-button").on("click", (e) => { CO_STOCKPLACE.ModalOpen("new"); });				
			CO_STOCKPLACE.GetList(1);//최초 페이지 로드
		},
		setValidation: (targetForm, url, option) => {
			option = option || {};
			let validator = targetForm.validate($.extend( {
				rules: {
					"code": {
						required: true,
					},
					"name": {
						required: true
					},
				},
				messages: {
					"code": {
						required: "* 필수 항목입니다.",
					},
					"name": {
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
							
							if (url == CO_STOCKPLACE.SaveUrl) {
								CallCommonModal("통신 결과", "저장이 완료되었습니다.<br>검색 조건을 초기화 하고 데이터를 다시 불러 옵니다.");
								CO_STOCKPLACE.GetList(1);
							} else {
								CO_STOCKPLACE.GetList(window.pageset.nowpage);
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
			let result = await getAjax(CO_STOCKPLACE.ListUrl, data);
			if(result != false && result.state == 1){
				//목록 출력 / 출력 이후 후 처리 지정
				window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
				let targetId = "hb-target-stock-place-list";
				let pagination = SetPagination(window.pageset, CO_STOCKPLACE.GetList);
				hbs("hb-source-stock-place-list", result.data, targetId, true, () => {
					$("#pagination-area").empty().append(pagination);
					$("#"+targetId+" .col-md-4 .card").on("click", function(e){
						e.preventDefault();
						// 이벤트 사용자 정보 획득
						let params = $(this).data("stockplace-info");
						if(params.code != 1){
							// Modal Open
							CO_STOCKPLACE.ModalOpen("modify", params);	
						}
						
					});
					//재고 상품 보기 버튼 클릭시
					$("#"+targetId+" .col-md-4 .goods_view button").on("click", function(e) {
						e.preventDefault();
						// let code = $(this).data('code');
						// 
						// let goods_result = await getAjax(CO_STOCKPLACE.stockGoodsListUrl, {"code" : code});
						// if(goods_result != false && goods_result.state == 1){
						// 	hbs("hb-source-stock-goods-list", goods_result.data, "modal-goods-list-base", true, () => {
						// 		$("#stock-goods-modal").modal("show");
						// 	});
						// }else{
						// 	CallCommonModal("재고 상품 가져오기 실패", goods_result != false ? AjaxErrorMessage(goods_result) : {});
						// }
						CO_STOCKPLACE.stockcode = $(this).data('code');
						CO_STOCKPLACE.goodstotalcount = 0;
						//console.log("재고위치코드", CO_STOCKPLACE.stockcode);
						CO_STOCKPLACE.GDrawList(1);
					});
				});
			}else{
				CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
			}
		},	// End of Function : GetList
		ModalOpen : (type, params) => {
			/**
			 * 등록/수정 Midal 띄우기
			 * @param {string} type 신규/기존 구분("new":신규, "modify":기존)
			 * @param {object} params 정보 JSON Data
			 */
			let modalformId = "#stockPlace-modal-form";
			let targetModal = $('#stockPlace-modal');
			let title = "";
			// 폼 리셋
			$.formReset($(modalformId));

			if (type == "modify") {
				title = "수정";
				let checkRadio = [];
				// 정보 대입
				$.each(params, function(key, data){
					if(checkRadio.includes(key)){
						$( modalformId ).find("[name='"+key+"'][value='"+data+"']").prop("checked", true);
					}else{
						$( modalformId ).find("#"+key).val(data);
					}
				});
				CO_STOCKPLACE.setValidation($( modalformId ), CO_STOCKPLACE.UpdateUrl);
			} else {
				title = "신규 등록";
				CO_STOCKPLACE.setValidation($( modalformId ), CO_STOCKPLACE.SaveUrl, 
				{
					rules: {
						"name": {
							required: true
						},
					},
					messages: {
						"name": {
							required: "* 필수 항목입니다.",
						},
					}
				});
			}

			// Modal Show
			targetModal.find('.modal-title').text(title);
			targetModal.modal("show");
		},
		GDrawList: async (page)=>{
			if (!CO_STOCKPLACE.stockcode) {
				MsgBox.Alert("재고위치를 찾을 수 없습니다.");
				return true;
			}

			let goods_result = await getAjax(CO_STOCKPLACE.stockGoodsListUrl_UI2, {"code" : CO_STOCKPLACE.stockcode, "page" : page, "totalcount" : CO_STOCKPLACE.goodstotalcount});
			//console.log(CO_STOCKPLACE.stockGoodsListUrl_UI2, goods_result);
			if(goods_result != false && goods_result.state == 1) {
				let data = goods_result.data;
				CO_STOCKPLACE.goodstotalcount = data.pageset.totalcount;

				// 코드 정리 => {코드:코드명, ...} or {코드:{name:이름, id:아이디}, ...}
				let codes = {};
				// 옵션 타이틀 코드
				codes.title = data.opts_codes.option_titles.reduce((a, c)=>{ a[c.code] = c.name; return a; }, {});
				// 옵션 코드
				codes.option = data.opts_codes.options.reduce((a, c)=>{ a[c.code] = c.name; return a; }, {});
				// 재고위치 코드
				codes.sp = data.stocks_codes.reduce((a, c)=>{ a[c.code] = c.name; return a; }, {});
				// 재고문의담당자 코드
				codes.sm = data.stockmanagers.reduce((a, c)=>{ a[c.code] = c.name; return a; }, {});

				// 로그용 처리 관리자 코드 : 로그가 없는 경우 전달 되지 않으므로 빈 값 처리 포함
				codes.m = (data.member_codes != undefined)
					? data.member_codes.reduce((a, c)=>{
							a[c.code] = {"name":c.name, "id":c.id};
							return a;
						}, {})
					: {}
					;

				// 상품명, 옵션명, 재고위치명 만들기
				let list = data.list.reduce((a, c)=>{
					let setdata = {}, tmpopt = [], o;
					if (c.stock_opt_seq > 0) {
						o = data.opts[c.stock_opt_seq];
						for(let i=1; i<=5; i++) {
							if (codes.title[o["otc"+i]] == "") continue;
							tmpopt.push("{0} : {1}".format(codes.title[o["otc"+i]], codes.option[o["oc"+i]]));
						}
					}
					setdata.stock_seq = c.stock_seq;
					setdata.stock_goods_seq = c.stock_goods_seq;
					setdata.stock_opt_seq = c.stock_opt_seq;
					setdata.goods_name = data.goods_name[c.stock_goods_seq];
					setdata.option_name = tmpopt.join(", ");
					setdata.stock = c.stock;
					setdata.sp1 = codes.sp[c.sp_code_1];	// 재고위치1 명칭
					setdata.sp2 = codes.sp[c.sp_code_2];	// 재고위치2 명칭
					setdata.manager = codes.sm[c.manager_code];	// 문의담당 이름

					a.push(setdata);
					return a;
				}, []);
				await new Promise((resolve, reject)=>{
					hbs("hb-source-stock-goods-list-ui2", list, "modal-goods-list-base-ui2", true, () => {
						$("#stock-goods-modal-ui2").modal("show");
						let pagination = SetPagination(data.pageset, CO_STOCKPLACE.GDrawList);
						$("#pagination-area-goodslist").empty().append(pagination);
						resolve(true)
					});
				});
			}else{
				CallCommonModal("재고 상품 가져오기 실패", goods_result != false ? AjaxErrorMessage(goods_result) : {});
			}
		}	// End of Function : GDrawList
	
	};

	$(function() {
		// 첫 페이지 호출 / 화면 출력
		CO_STOCKPLACE.init();
	});
	
	if(!('NumberComma' in Handlebars.helpers)) {
		Handlebars.registerHelper("NumberComma", function (value) {
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		});
	}