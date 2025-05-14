/**
 * 입고 기록용 스크립트
 * @author yds@ntrex on 2024.07.29
 */

class ImportHistory {
	isSearchComplete = false;    // autocomplete 실행 상태
	storedData = [];    // autocomplete 재출력용 수신 목록
	lastsdate = '';
	lastedate = '';
	lastTerm = '';      // 마지막 실행항 키워드
	viewgoods = [];

	// 생성자 처리
	constructor() {
		// -------- Handlebars Helper ---------------------------
		HB_StockManageHelperLoad();
		// 0이면 1로 지정
		Handlebars.registerHelper("ifzeroone", function(input) { return (Number(input) == 0)?1:Number(input); });
		// 보관 수량 처리 상태명 반환
		Handlebars.registerHelper("keepstatename", function(state) {
			let sname = "";
			switch(state) {
				case "a": sname = "-"; break;
				case "n": sname = "정산 대기"; break;
				case "y": sname = "정산 완료"; break;
				default: sname = "보류";
			}
			return sname;
		});

		// -------- 검색 영역의 달력 기능 추가 ---------------------------
		// https://uxsolutions.github.io/bootstrap-datepicker
		$('#datepicker').datepicker(defaultDatePickerOption);//datepicker end

		// -------- 검색 영역의 기간(어제 ~ 최근 일주일) 버튼 기능 추가 ---------------------------
		$("#sea-form button[name^=d]").on("click", (e)=>{
			let days = Number($(e.currentTarget).data("day"));
			this.SetDateRange(days, e.currentTarget);
		});

		// -------- [ajax] 검색 영역의 상품명 Autocomplete 기능 추가 ---------------------------
		this.SearchGoodsNameAutoomplete();

		// -------- [ajax] 검색 영역의 입고담당 Autocomplete 기능 추가 -------------------------
		this.SearchImportManagerAutocomplete();

		// -------- 검색 영역의 조회버튼 기능 추가 ---------------------------
		$("#search-import").off("click").on("click", (e)=>{
			e.preventDefault();
			// e.stopPropagation();
			// e.stopImmediatePropagation();
			this.GetList();
		});

		// $("#GoodsSearchAll").on("click", (e)=>{
		// 	$("#hb-target-goods-list-object tr.goodsline").each((i, o)=>{
		// 		if ($(o).hasClass('d-none')) $(o).removeClass("d-none");
		// 		if (!$(o).next(".orderline").hasClass('d-none')) $(o).next(".orderline").addClass("d-none");
		// 	})
		// });
	}	// End of Method : constructor

	/**
	 * 버튼의 검색기간 반영 시키기
	 * @author yds@ntrex on 2024.07.29
	 * @param {integer} days 구분 일수
	 * @param {object} element 클릭된 버튼
	 */
	SetDateRange(days, element) {
		// 모든 버튼에서 'active' 클래스 제거
		$(element).closest("div").find(".btn").removeClass("active");

		// 클릭한 버튼에 'active' 클래스 추가
		$(element).addClass("active");

		let date = new Date();
		let enddate = date.toISOString().substring(0, 10);
		let startdate = "";
		// 어제 항목만 따로 지정
		if (days != -1) {
			date.setDate(date.getDate() - days + 1);
			startdate= date.toISOString().substring(0, 10);
		} else {
			date.setDate(date.getDate() - 1);
			startdate = enddate = date.toISOString().substring(0, 10);
		}
		$("#sea-form input#s-regdatestart").val(startdate);
		$("#sea-form input#s-regdateend").val(enddate);
		this.runstate = false;	// autocomplete용 실행상태 변경
	}	// End of Method : SetDateRange

	/**
	 * 입고 기록중 상품명 Autocomplete 기능 추가(검색기간 기본 포함)
	 */
	async SearchGoodsNameAutoomplete() {

		let $input = $('#s-goodsname');
		$input.autocomplete({ // autocomplete 구현 시작부
			source : async (request, response)=>{
				console.log("source, request.term", request);
				if (request.term.trim() === "") {
					// this.isSearchComplete = false;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정
					return false; // 빈 값이면 AJAX 요청하지 않음
				}
				let formdata = $("#sea-form").serializeObject();
				// 검색에 필요한 항목 추리기
				let sdata = Object.keys(formdata).reduce((a, key)=>{
					// 's-' 를 포함하는 항목만 선택 : 코드 검색이 붙는 경우 'dp-', 'keyword-' 시작하는 항목이 추가로 붙기 때문
					let confirmkey = key.split("s-");
					if (confirmkey.length == 2) a[confirmkey[1]] = formdata[key];
					return a;
				}, {});
				sdata.type = "names";	// 상품명 목록만 반환

				// 같은 검색어, 같은 검색 기간이면 이전 목록 출력함
				if (this.storedData.length && request.term == this.lastTerm &&  sdata.regdatestart == this.lastsdate &&  sdata.regdateend == this.lastedate) {
					response(this.storedData);
				} else { // 새로 불러올 상황이면 서버 통신
					let sres = await getAjax('/Stock/GImport_History_AsyncGet', sdata)
						.then((response) => {
							if (response.state == 1) {
								return response.data;
							} else {
								$input.blur();
								CallCommonModal("기록 조회 실패", "<pre>{0}</pre>".format(JSON.stringify(response.errors, null, 2)));
								return false;
							}
						})
						.catch((error) => {
							console.error('Error:', error);	// 이미 CallCommonModal("호출 실패", url); 로 처리하기 때문에 여기선 그냥 로그만 찍자
							return false;
						});

					if (sres) {
						//runstate = false;   // 진행상태 해제
						this.lastTerm = request.term;	// 같은 검색어 비교용으로 지정
						this.lastsdate = sdata.regdatestart;
						this.lastedate = sdata.regdateend;
						this.storedData = $.map(sres, function(item, i) {
							return {
									label : item.g_name	// 목록에 표시되는 값
									, value : item.g_name	// 선택 시 input창에 표시되는 값
									, idx : i // index
								};
						})
						response(this.storedData);
					}
				}
			}, //source 는 자동완성의 대상
			search: function(event, ui) {
				this.isSearchComplete = false;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정
			},
			response: function(event, ui) {
				this.isSearchComplete = true;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정
			},
			select : function(event, ui) { // item 선택 시 이벤트
				event.preventDefault(); // 기본 동작 중지
				this.lastTerm = $input.val();            // 선택 값을 이전 항목으로 재지정 - 추후 재통신 막기 위해
			},
			minLength : 0, // 최소 글자 수
			autoFocus : false, // true로 설정 시 메뉴가 표시 될 때, 첫 번째 항목에 자동으로 초점이 맞춰짐
			classes : { // 위젯 요소에 추가 할 클래스를 지정
				'ui-autocomplete' : 'highlight'
			},
			delay : 600, // 입력창에 글자가 써지고 나서 autocomplete 이벤트 발생될 떄 까지 지연 시간(ms)
			disable : false, // 해당 값 true 시, 자동완성 기능 꺼짐
			position : { my : 'left top', at : 'left bottom'}, // 제안 메뉴의 위치를 식별
			close : function(event) { // 자동완성 창 닫아질 때의 이벤트
			},
			open: function(event, ui) {
			}
		}).on("focus", ()=>{
			// console.log("Input field focused", this.isSearchComplete);
			if (!this.isSearchComplete) {
				$input.autocomplete('search', $input.val());
			}
		});

	}	// End of Method : SearchGoodsNameAutoomplete

	SearchImportManagerAutocomplete() {
		let $input = $('#s-importmanager');
		let $hinput = $('#s-importmanager');
		$input.autocomplete({ // autocomplete 구현 시작부
			source : async (request, response)=>{
				console.log("source, request.term", request);
				if (request.term.trim() === "") {
					// this.isSearchComplete = false;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정
					return false; // 빈 값이면 AJAX 요청하지 않음
				}
				let formdata = $("#sea-form").serializeObject();
				// 검색에 필요한 항목 추리기
				let sdata = Object.keys(formdata).reduce((a, key)=>{
					// 's-' 를 포함하는 항목만 선택 : 코드 검색이 붙는 경우 'dp-', 'keyword-' 시작하는 항목이 추가로 붙기 때문
					let confirmkey = key.split("s-");
					if (confirmkey.length == 2) a[confirmkey[1]] = formdata[key];
					return a;
				}, {});
				sdata.type = "managers";	// 입고담당만 반환

				// 같은 검색어, 같은 검색 기간이면 이전 목록 출력함
				if (this.storedData.length && request.term == this.lastTerm &&  sdata.regdatestart == this.lastsdate &&  sdata.regdateend == this.lastedate) {
					response(this.storedData);
				} else { // 새로 불러올 상황이면 서버 통신
					let sres = await getAjax('/Stock/GImport_History_AsyncGet', sdata)
						.then((response) => {
							if (response.state == 1) {
								return response.data;
							} else {
								$input.blur();
								CallCommonModal("기록 조회 실패", "<pre>{0}</pre>".format(JSON.stringify(response.errors, null, 2)));
								return false;
							}
						})
						.catch((error) => {
							console.error('Error:', error);	// 이미 CallCommonModal("호출 실패", url); 로 처리하기 때문에 여기선 그냥 로그만 찍자
							return false;
						});

					if (sres) {
						//runstate = false;   // 진행상태 해제
						this.lastTerm = request.term;	// 같은 검색어 비교용으로 지정
						this.lastsdate = sdata.regdatestart;
						this.lastedate = sdata.regdateend;
						this.storedData = $.map(sres, function(item, i) {
							return {
									label : item.name	// 목록에 표시되는 값
									, value : item.seq	// 선택 시 input창에 표시되는 값
									, idx : i // index
								};
						})
						response(this.storedData);
					}
				}
			}, //source 는 자동완성의 대상
			search: function(event, ui) {
				this.isSearchComplete = false;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정
			},
			response: function(event, ui) {
				this.isSearchComplete = true;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정
			},
			select : function(event, ui) { // item 선택 시 이벤트
				event.preventDefault(); // 기본 동작 중지
				$input.val(ui.item.label);          // 검색용 표기 항목(코드명 지정)
				this.lastTerm = $input.val();            // 선택 값을 이전 항목으로 재지정 - 추후 재통신 막기 위해
			},
			minLength : 0, // 최소 글자 수
			autoFocus : false, // true로 설정 시 메뉴가 표시 될 때, 첫 번째 항목에 자동으로 초점이 맞춰짐
			classes : { // 위젯 요소에 추가 할 클래스를 지정
				'ui-autocomplete' : 'highlight'
			},
			delay : 600, // 입력창에 글자가 써지고 나서 autocomplete 이벤트 발생될 떄 까지 지연 시간(ms)
			disable : false, // 해당 값 true 시, 자동완성 기능 꺼짐
			position : { my : 'left top', at : 'left bottom'}, // 제안 메뉴의 위치를 식별
			close : function(event) { // 자동완성 창 닫아질 때의 이벤트
			},
			open: function(event, ui) {
			}
		}).on("focus", ()=>{
			// console.log("Input field focused", this.isSearchComplete);
			if (!this.isSearchComplete) {
				$input.autocomplete('search', $input.val());
			}
		});
	}	// End of Method : SearchImportManagerAutocomplete

	/**
	 * 목록 출력용으로 데이터 가공
	 * 	- 입고기록 목록용으로 받아온 데이터를 Handlebars 출력에 맞게 변경
	 * @author yds@ntrex on 2024.07.30
	 * @param {array} oridata URL(/Stock/GImport_History_AsyncGet)로 부터 받은 데이터
	 * @return {array} Handlebars용 가공 데이터
	 */
	RemainData(oridata) {
		// 담당자 코드
		let codes = {};
		codes.sm = oridata.stock_managers.reduce((a, c)=>{ a[c.code] = c.name; return a; }, {});
		codes.m = oridata.managers.reduce((a, c)=>{ a[c.code] = c.name; return a; }, {});


		// 발주 완료 목록 재정립
		let followorder = oridata.order.reduce((a, c)=>{
			c.order_member_name = codes.m[c.order_manager]||"";
			c.regist_member_name = codes.m[c.regist_manager]||"";

			if (a.hasOwnProperty(c.import_seq)) a[c.import_seq].push(c);
			else a[c.import_seq] = [c];
			return a;
		}, {});

		// 입고 담당자명 지정
		oridata.import.forEach((d) => {
			d.manager = codes.m[d.member_seq]||"";
			d.stock_manager = codes.sm[d.stock_manager_code]||"";
			d.followorder = followorder[d.seq]||[];
		});


		return oridata;
	}	// End of Method : RemainData

	/**
	 * 입고 기록 조회
	 */
	async GetList() {
		let formdata = $("#sea-form").serializeObject();
		// 검색에 필요한 항목 추리기
		let sdata = Object.keys(formdata).reduce((a, key)=>{
			// 's-' 를 포함하는 항목만 선택 : 코드 검색이 붙는 경우 'dp-', 'keyword-' 시작하는 항목이 추가로 붙기 때문
			let confirmkey = key.split("s-");
			if (confirmkey.length == 2) a[confirmkey[1]] = formdata[key];
			return a;
		}, {});
		sdata.type = "list";	// 목록 조회 반환 지정

		let sres = await getAjax('/Stock/GImport_History_AsyncGet', sdata)
			.then((response) => {
				if (response.state == 1) {
					return response.data;
				} else {
					CallCommonModal("기록 조회 실패", "<pre>{0}</pre>".format(JSON.stringify(response.errors, null, 2)));
					return false;
				}
			})
			.catch((error) => {
				console.error('Error:', error);	// 이미 CallCommonModal("호출 실패", url); 로 처리하기 때문에 여기선 그냥 로그만 찍자
				return false;
			});

		if (!sres) return false;

		// 정보 가공
		let outdata = this.RemainData(sres);
		// console.log(outdata);

		// 상품명 취합 / 동일 상품명 goodskey 모으기
		let goodsnames = outdata.import.reduce((a, c)=>{
			let existsgoods = a.findIndex(element => element.value === c.g_name);
			if (existsgoods == -1) {
				a.push({"label":c.g_name, "value":c.g_name, "goodskey":[c.seq]});
			} else {
				a[existsgoods].goodskey.push(c.seq);
			}
			return a;
		},[]);
		// 제일 앞에 전체 항목 추가
		goodsnames.unshift({"label":"전체", "value":"전체", "goodskey":"전체"});

		// autocomplete 추가
		$('#GoodsSearchInput').autocomplete({ // autocomplete 구현 시작부
			source : goodsnames, //source 는 자동완성의 대상
			select : (event, ui) => { // item 선택 시 이벤트
				// 버튼 보이기
				// $("#GoodsSearchAll").removeClass("d-none");
				if (ui.item.goodskey == "전체") {
					$("#hb-target-goods-list-object tr.goodsline").each((i, o)=>{
						if ($(o).hasClass('d-none')) $(o).removeClass("d-none");
						if (!$(o).next(".orderline").hasClass('d-none')) $(o).next(".orderline").addClass("d-none");
					});
					// 노출중인 상품목록 초기화
					this.viewgoods=[];
				} else {
					// 노출중인 상품목록 초기화
					this.viewgoods=[];
					// 목록 숨기고 보이기
					$("#hb-target-goods-list-object tr.goodsline").each((i, o)=>{
						let key = $(o).data("goodskey");
						if (ui.item.goodskey.indexOf(key.toString()) != -1) {
							if ($(o).hasClass('d-none')) $(o).removeClass("d-none");
							if ($(o).next(".orderline").hasClass('d-none')) $(o).next(".orderline").removeClass("d-none");
							this.viewgoods.push($(o).data("index"));
						} else {
							if (!$(o).hasClass('d-none')) $(o).addClass("d-none");
							if (!$(o).next(".orderline").hasClass('d-none')) $(o).next(".orderline").addClass("d-none");
						}
					});
				}
				console.log("before:", this.viewgoods);
			},
			focus : function(event, ui) { // 포커스 시 이벤트
				return false;
			},
			minLength : 0, // 최소 글자 수
			autoFocus : false, // true로 설정 시 메뉴가 표시 될 때, 첫 번째 항목에 자동으로 초점이 맞춰짐
			classes : { // 위젯 요소에 추가 할 클래스를 지정
				'ui-autocomplete' : 'highlight'
			},
			delay : 400, // 입력창에 글자가 써지고 나서 autocomplete 이벤트 발생될 떄 까지 지연 시간(ms)
			disable : false, // 해당 값 true 시, 자동완성 기능 꺼짐
			position : { my : 'left top', at : 'left bottom'}, // 제안 메뉴의 위치를 식별
			close : function(event) { // 자동완성 창 닫아질 때의 이벤트
				//console.log(event);
			},
			open: function() {
				// 화면 상단에 존재하는 검색항목(상품명, 제조사, 매입처) 때문에 max-width가 고정폭이라 여기서 폭 조정
				var autocompleteMenu = $(this).autocomplete("widget");
				var inputWidth = $(this).outerWidth();
				// autocompleteMenu[0].style.setProperty("width", inputWidth + "px", "important");
				 autocompleteMenu[0].style.setProperty("max-width", inputWidth + "px", "important");  // 원하는 최대 너비 값으로 설정
			}
		}).on("focus", function () {
			$(this).autocomplete("search", "");
		});

		// 입고담당 취합 / 동일 입고담당 모으기
		// Dropdown 리스트를 담을 배열
		let managers = outdata.managers.map(function(user) {
			return user.name;
		});
		// 제일 앞에 전체 항목 추가
		managers.unshift("전체");

		// Dropdown 리스트를 담을 배열
		// var managers = ["담당자 1", "담당자 2", "담당자 3"];

		// Dropdown 메뉴 리스트를 채울 ul 요소
		var $dropdownMenu = $('#ManagerSearchDropdown');

		// 기존 메뉴를 지우고 새로운 메뉴 추가
		$dropdownMenu.empty();  // 기존의 내용을 비웁니다

		// 배열의 항목을 기반으로 동적으로 Dropdown 메뉴 생성
		$.each(managers, function(index, manager) {
			var $li = $('<li>');
			var $a = $('<a>', {
				class: 'dropdown-item',
				href: '#',
				text: manager
			});
			$li.append($a);
			$dropdownMenu.append($li);
		});

		// Dropdown 항목 클릭 이벤트
		$dropdownMenu.off('click', 'a.dropdown-item').on('click', 'a.dropdown-item', (event) => {
			event.preventDefault();  // 기본 링크 동작 막기
			var selectedManager = $(event.currentTarget).text();  // 클릭한 항목의 텍스트 가져오기
			console.log('선택된 담당자:', selectedManager);  // 선택된 항목 출력

			// 선택된 값을 버튼 텍스트로 업데이트
			if (selectedManager == "전체") {
				selectedManager = "담당자 선택";
			}
			$('#ManagerSearchButton').text(selectedManager);
			
			let targetList=[];	// 대상 목록
			if (this.viewgoods.length == 0) {
				targetList=$("#hb-target-goods-list-object tr.goodsline");
			} else {
				$.each(this.viewgoods, (index, row)=>{
					console.log(row, $("#hb-target-goods-list-object tr.goodsline[data-index='{0}']".format(row))[0]);
					targetList.push($("#hb-target-goods-list-object tr.goodsline[data-index='{0}']".format(row))[0]);
				});
			}
			$.each(targetList, (index, row)=>{
				if (selectedManager == "담당자 선택") {
					$(row).removeClass("d-none");
					$(row).next().removeClass("d-none");
				} else {
					if ($(row).data("managername") == selectedManager) {
						$(row).removeClass("d-none");
						$(row).next().removeClass("d-none");
					} else {
						$(row).addClass("d-none");
						$(row).next().addClass("d-none");
					}
				}
			})
		});

		// Handlebars 출력
		hbs("hb-source-goods-object", outdata.import, "hb-target-goods-list-object", true, ()=>{
			ImgModalImageChange();	// 이미지 모달 이벤트 추가
			$("#hb-target-goods-list-object tr.goodsline").on("click", (e)=>{
				if ($(e.currentTarget).next(".orderline").hasClass("d-none")) {
					$(e.currentTarget).next(".orderline").removeClass("d-none");
				} else {
					$(e.currentTarget).next(".orderline").addClass("d-none");
				}
			});
		});
	}	// End of Method : GetList

	

}	// End of Class : ImportHistory