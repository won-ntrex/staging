/**
 * 상품정보 출력용 가공 클래스
 * 	-  2024.09.05 업무 협의로 백업
 * 		발주 처리 정보 포함이며, 입고 단건 처리 기능임
 */
class GoodsInfoProc {
	// ajax_result;

	constructor(data) { 
		// this.ajax_result = data;
	}

	/**
	 * 발주 완료로 입고 처리 안된 목록 가져오기
	 * @author yds@ntrex on 2024.07.05
	 */
	async GetGoodsOrderComplete() {
		return await getAjax('/Stock/GEmportListToOrder_List_AsyncGet', {})
			.then((response) => {
				if (response.state == 1) {
					return response.data;
				} else {
					CallCommonModal("조회 실패", "<pre>{0}</pre>".format(JSON.stringify(response.errors, null, 2)));
					return false;
				}
			})
			.catch((error) => {
				console.error('Error:', error);	// 이미 CallCommonModal("호출 실패", url); 로 처리하기 때문에 여기선 그냥 로그만 찍자
				return false;
			})
	}	// End of Method : 	GetGoodsOrderComplete

	/**
	 * 입고 저장
	 */
	async SetImportProc(goodskey) {
		let g = GlobalGoods[goodskey];
		let data = {
			"stock_goods_seq": g.stock_goods_seq,
			"stock_opt_seq": g.selectoption,
			"stock_seq": g.selectstock,
			"supplyprice": Number($("input[data-importprice='{0}'".format(goodskey)).val()),
			"importstock": parseInt($("input[data-importamount='{0}'".format(goodskey)).val()),
			"ordertype": g.ordertype,
			"goodsname": g.goods_name,
			"optionfullname": g.optionfullname,
			"stockfullname": g.stockfullname,
			"goodskey": goodskey
		};
		// 미등록 상품 때문에 발주 번호 추가
		data.goods_order_seq = (g.ordertype == "N")?g.goi[0].seq:0;	// 미등록 상품이 아닌경우 '0'으로 지정 처리

		let origin_supply_price = g.supply_price;

		if (data.importstock == 0) {
			MsgBox.Alert("입고 수량이 <code class='info-text'>0</code>입니다.<br>수량 확인을 해주세요.");
			return true;
		}

		// 입고가 변경 여부 지정
		data.chksupplyprice = (Number(origin_supply_price) == data.supplyprice) ? false : true ;

		// 입고 처리 후 결과 받기
		let setres = await getAjax('/Stock/GStock_Import_Save_AsyncGet', data)
			.then((response) => {
				if (response.state == 1) {
					return response.data;
					//return response.state;
				} else {
					CallCommonModal("입고 처리 실패", "<pre>{0}</pre>".format(JSON.stringify(response.errors, null, 2)));
					return false;
				}
			})
			.catch((error) => {
				// 이미 CallCommonModal("호출 실패", url); 로 처리하기 때문에 여기선 그냥 로그만 찍자
				console.error('Error:', error);
				return false;
			});

		if (setres) {
			//alert("입고 처리 완료, 해당 출록된 상품 정보 목록에서 삭제 ~~~~");
			console.log(setres);
			let importmsg = "{0} 입고 처리되었습니다.".format(data.goodsname);
			// 2024.09.05 진행 협의로 발주 관련 내용 숨김 처리 : yds@ntrex on 2024.09.05
			// if (setres.keep_state == 'n') importmsg += "<br> ※ 발주 정보 수량보다 부족하여 추가 입고 처리가 필요합니다.";
			MsgBox.Alert(importmsg);
			/* 2024.09.05 진행 협의로 발주 관련 내용 숨김 처리 : yds@ntrex on 2024.09.05
			// 발주 완료 목록 호출 - 응답 대기 후 처릴 위해 await로 받으면 됨
			let getdata = await this.GetGoodsOrderComplete();
			if (getdata) {
				GlobalGoods = this.GlobalGoodsEditFromRequest(getdata);
				console.log("GlobalGoods:", GlobalGoods);
				this.DrawImportList(GlobalGoods);
			}
			*/
		}
	}	// End of Method : SetImportProc

	/**
	 * 상품 출력에 필요한 코드 정보 가공
	 * 	※ 기존 입고에 존재하던 코드 정리 함수를 그대로 가져 옴
	 * 	- 코드 정리 => {코드:코드명, ...} or {코드:{name:이름, id:아이디}, ...}
	 * @author yds@ntrex on 2024.06.25
	 * @param {object} data Ajax로 부터 받은 데이터
	 */
	GoodsInfoCodes(data) {
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
		return codes;
	}	// End of Method : GoodsInfoCodes

	/**
	 * 상품 출력에 필요한 정보 가공
	* 	※ 기존 입고에 존재하던 코드 정리 함수를 그대로 가져 옴
		* @author yds@ntrex on 2023.11.15
		* @param {object} c 상품 정보 (기본, 옵션, 재고 등)
		* @param {object} codes 가공한 코드 정보(옵션코드, 재고위치 코드 등)
		* @param {object} data Ajax로 부터 받은 데이터
		*/
	GoodsInfoProcess(c, codes, data) {
		let tmp = {
				"ordertype":c.ordertype||"S",			// 발주 상품 구분(E:등록 상품, N:미등록 상품, S:발주 외 추가 상품)
				"seq":c.seq||0,							// 발주 완료 seq
				"order_seq":c.order_seq||0,				// 발주 완료의 경우 주문번호 존재 함
				"export_stock":c.export_stock||0,		// 발주 완료의 경우 출고수량 존재 함
				"before_stock":c.before_stock||0,		// 발주 완료의 경우 이전재고수량 존재 함
				"underage_stock":c.underage_stock||0,	// 발주 완료의 경우 부족재고수량 존재 함
				"order_stock":c.order_stock||0,			// 발주 완료의 경우 개별발주수량 존재 함
				"order_member_name":c.order_member_name||"",	// 발주 완료의 경우 발주 담당자 존재 함
				"regist_member_name":c.regist_member_name||"",	// 발주 완료의 경우 발주 등록자 존재 함
				"stock_goods_seq":c.stock_goods_seq,
				"goods_seq":c.goods_seq||0,
				"goods_name":c.goods_name,
				"supply_price":Number(c.supply_price),
				"min_purchase_ea":c.min_purchase_ea,
				"max_purchase_ea":c.max_purchase_ea,
				"min_purchase_ea_multiple":c.min_purchase_ea_multiple,
				"image":c.image||"",
				"total_stock":Number(c.total_stock),
				"option_state":c.option_state,
				"manufacture":c.manufacture||"",
				"purchase":c.purchase||"",
				"options":[]
			};
		
		// 옵션과 재고 정보 추가 - 추가로 필요한 항목은 return 항목에 요소 추가로 사용
		if (c.option_state == "option") {
			let odata = Object.values(data.opts.filter(o => o.stock_goods_seq === c.stock_goods_seq)).map((a)=>{
				let onames = [];
				for(let i=1; i<=5; i++) {
					if (codes.title[a["otc"+i]] == "") continue;
					onames.push("[{0}] {1}".format(codes.title[a["otc"+i]], codes.option[a["oc"+i]]));
				}

				// 재고의 해당 옵션번호는 map()의 인자 a 의 것을 사용
				let fstocks = Object.values(data.stocks.filter(s => s.stock_opt_seq == a.stock_opt_seq)).map((sa)=>{
					sa.sp1 = codes.sp[sa.sp_code_1];	// 재고위치1 명칭
					sa.sp2 = codes.sp[sa.sp_code_2];	// 재고위치2 명칭
					sa.ospcode1 = sa.sp_code_1;
					sa.ospcode2 = sa.sp_code_2;
					sa.manager = codes.sm[sa.manager_code];	// 문의담당 이름

					// 불필요 항목 삭제 - 삭제 때문에 관련 항목의 위 대입된 항목 값이 undefined 처리 되어 여기서 하면 안되는 듯 
					// ["reg_dt","upd_dt","sp_code_1","sp_code_2","manager_code"].forEach(e => delete sa[e]);
					return sa;
				});

				return {"stock_opt_seq":Number(a.stock_opt_seq),"devicemart_option_seq":Number(a.devicemart_option_seq), "name":onames.join(", "), "sp":fstocks, "currentsupplyprice":a.supply_price};
			});
			
			tmp.options = odata;
			// 옵션 & 재고 선택 값 지정
			tmp.selectoption = tmp.selectoption||0;	// 존재하지 않으면 0 지정
			tmp.selectstock = tmp.selectstock||0;	// 존재하지 않으면 0 지정
		} else {
			let fstocks = Object.values(data.stocks.filter(s => s.stock_goods_seq == c.stock_goods_seq)).map((sa)=>{
					sa.sp1 = codes.sp[sa.sp_code_1];	// 재고위치1 명칭
					sa.sp2 = codes.sp[sa.sp_code_2];	// 재고위치2 명칭
					sa.ospcode1 = sa.sp_code_1;
					sa.ospcode2 = sa.sp_code_2;
					sa.manager = codes.sm[sa.manager_code];	// 문의담당 이름
					// 불필요 항목 삭제
					["reg_dt","upd_dt","sp_code_1","sp_code_2","manager_code"].forEach(e => delete sa[e]);
					return sa;
				});

			tmp.options = [{"stock_opt_seq":0, "name":"", "sp":fstocks, "currentsupplyprice":c.supply_price}];
			// 옵션 & 재고 선택 값 지정
			tmp.selectoption = 0;	// 일반 상품은 옵션 번호가 존재하지 않으므로 '0' 강제 지정
			tmp.selectstock = fstocks[0].stock_seq;
		}
		return tmp;
	}	// End of Function : GoodsInfoProcess

	/**
	 * 조회 상품 리스트 출력용 상품 정보 가공
	 * 	- 코드에 부합하는 코드명 부여
	 * 	- 상품별 옵션 분류 및 옵션 하위에 재고 정보 추가
	 * @author yds@ntrex on 2024.06.25
	 * @param {object} data 서버로 부터 받은 상품 조회 결과 목록
	 */
	EditListInfo(data) {
		// 코드 정리 => {코드:코드명, ...} or {코드:{name:이름, id:아이디}, ...}
		let codes = this.GoodsInfoCodes(data);
		// 데이터 정리
		let editdata = data.list.reduce((a, c)=>{
			a.push(this.GoodsInfoProcess(c, codes, data));
			return a;
		}, []);
		return editdata;
	}	// End of Method : EditListInfo

	/**
	 * 입고 대상 리스트 출력용 상품 정보 가공
	 * @author yds@ntrex on 2024.07.12
	 * @param {object} data 상품정보
	 * @param {string} type 요청 구분(search:발주 외 추가 상품 검색에서 요청)
	 */
	GlobalGoodsEditFromRequest(data, type) {
		// 코드 정리 => {코드:코드명, ...} or {코드:{name:이름, id:아이디}, ...}
		let codes = (type != "search")?this.GoodsInfoCodes(data):{};
		// 데이터 정리
		let editdata = data.list.reduce((a, c)=>{
			// 미등록 상품일 경우 예외 처리
			if (c.stock_goods_seq != 0) {
				let tmp = (type != "search")?this.GoodsInfoProcess(c, codes, data):c;
				
				// 옵션, 재고 기본 선택 지정 - 일반 상품 포함 못찾은 경우 0으로 지정해서 사용
				tmp.selectoption = Number(c.stock_opt_seq)||0;	// 선택된 재고관리 옵션번호
				tmp.selectstock = 0;						// 선택된 재고관리 재고번호
				tmp.supply_price = Number(c.supply_price);	// 선택된 재고관리 옵션의 입고가
				tmp.stock = Number(c.total_stock);			// 선택된 재고관리 옵션의 재고 수량
				tmp.stock_manager = "";						// 선택된 재고의 재고 담당자명
				tmp.optionfullname = "";					// 선택된 재고의 옵션명
				tmp.stockfullname = "";						// 선택된 재고의 재고위치명
				tmp.import_stock = (type == "search") ? Number(c.import_stock) : 0;	// 입고 수량 INPUT 지정 값
				tmp.keep_stock = 0;							// 임시 보관 되었던 수량
				
				// 옵션명 찾아 넣기 처리
				if (c.option_state == "option") {
					// 옵션명 선택 만들기 : 잘못 된 것도 처리
					let otmp = Object.values(tmp.options.filter(o => Number(o.stock_opt_seq) == Number(c.stock_opt_seq)));
					let stmp = Object.values(otmp[0].sp.filter(s=>Number(s.stock_opt_seq) == Number(c.stock_opt_seq)))
					tmp.selectstock = (stmp.length == 0) ? otmp[0].sp[0].stock_seq : stmp[0].stock_seq;
					tmp.optionfullname = otmp[0].name;
					// tmp.supply_price = Number(otmp[0].currentsupplyprice);
					tmp.supply_price = Number(otmp[0].currentsupplyprice);
					tmp.stock = Number((stmp.length == 0) ? otmp[0].sp[0].stock : stmp[0].stock);
					tmp.stock_manager = (stmp.length == 0) ? "": stmp[0].manager;
					tmp.stockfullname = "위치1 {0}, 위치2 {1}".format(stmp[0].sp1||"-", stmp[0].sp2||"-");
				} else {
					tmp.stockfullname = "위치1 {0}, 위치2 {1}".format(tmp.options[0].sp[0].sp1||"-", tmp.options[0].sp[0].sp2||"-");
					tmp.selectstock = tmp.options[0].sp[0].stock_seq;
				}
				// keep_stock 내용 처리
				if (data.keep_stock) {
					let keep_stock = data.keep_stock.find(item => item.stock_goods_seq == tmp.stock_goods_seq && item.stock_opt_seq == tmp.selectoption);
					if (keep_stock != undefined) tmp.keep_stock = keep_stock.keep_stock;
				}

				a.push(tmp);
			} else {
				// 미등록 추가 발주 상품으로 상품번호가 없음으로 기타 화면출력(handlebars)용 처리 기본 정보를 넣자.
				let tmp = $.extend(true, {}, c);
				tmp.option_state = "normal";
				tmp.total_stock = 0;		// 재고관리 총 재고 없음
				tmp.selectoption = 0;		// 재고관리 옵션번호 없음
				tmp.selectstock = 0;		// 재고관리 재고번호 없음
				tmp.supply_price = 0;		// 재고관리 입고가 없음
				tmp.stock = 0;				// 재고관리 재고 수량 없음
				tmp.stock_manager ="";		// 재고의 재고 담당자명 없음
				tmp.optionfullname = "";	// 재고관리 옵션명 없음
				tmp.stockfullname = "";		// 재고관리 재고위치명 없음
				tmp.import_stock = 0;		// 입고 수량 INPUT 초기화

				// keep_stock 내용 처리
				if (data.keep_stock_n) {
					let keep_stock = data.keep_stock_n.find(item => item.seq == tmp.seq);
					if (keep_stock != undefined) tmp.keep_stock = keep_stock.keep_stock;
				}
				a.push(tmp);
			}
			
			return a;
		}, []);

		// 같은 상품 & 옵션 을 하나로 묶고, 발주 정보를 sub object로 취합
		let groupdate = editdata.reduce((a, c)=>{
			// 상품 식별 키 생성
			let goodskey = (c.stock_goods_seq != 0)?"{0}_{1}".format(c.stock_goods_seq, c.selectoption):c.seq;
			// 발주완료 정보 취합
			let keys = ["seq", "order_seq", "export_stock", "before_stock", "underage_stock", "order_stock", "order_member_name", "regist_member_name"];
			let goidata = keys.reduce((obj, key)=>{
				if (c.hasOwnProperty(key)) {
					obj[key] = c[key];
					delete c[key];
				}
				return obj;
			}, {});
			// 발주용 부족했던 수량 취합
			goidata.notenough_stock = parseInt(goidata.underage_stock) + parseInt(goidata.order_stock);

			// 같은 상품이 있을 때 예외 처리
			if (typeof a[goodskey] == "undefined") {
				a[goodskey] = c;
				a[goodskey].goi = [goidata]
			} else {
				// 발주 완료 정보만 추가
				a[goodskey].goi.push(goidata);
			}
			a[goodskey].goi_notenoughtsum = a[goodskey].goi.reduce((a, row)=>{ return a + (parseInt(row.underage_stock) + parseInt(row.order_stock))}, 0);

			// 상품 식별 키 추가
			a[goodskey].goodskey = goodskey;

			return a;
		}, {});

		return groupdate;
	}	// End of Method : GlobalGoodsEditFromRequest

	/**
	 * 입고 목록 데이터 화면 출력
	 * 	- GlobalGoodsEditFromRequest()로 가공된 데이터를 사용
	 */
	async DrawImportList(data) {
		// 화면 출력이 끝날 때 까지 대기
		await new Promise((resolve, reject)=>{
			$("#hb-target-goods-list-object .list-select-goods").removeClass("list-select-goods");
			this.OptionViewClose();	// 옵션 보기 닫기
			hbs("hb-source-goods-object", data, "hb-target-goods-list-object", true, ()=>{

				this.DrawImportListCallback();

				// 완료 처리를 위한 resolve 호출
				resolve(true);
			});	
		});
	}	// End of Method : DrawImportList


	/**
	 * 입고 목록 데이터 화면 출력용 콜백
	 * 	※ 발주 완료 목록 외에 추가 되는 상품 처리시에도 사용
	 * 	- 발주 내역 보이기
	 * 	- 상품명 Autocomplete 기능 부여
	 * 	- 상품 "모두 보이기" 버튼 기능 부여
	 * 	- "옵션보기" 버튼 기능 부여
	 * 	- "입고" 버튼 기능 부여
	 */
	DrawImportListCallback() {
		ImgModalImageChange();	// 이미지 모달 이벤트 추가

		// 상품 클릭 시 발주 정보 보이기
		$("#hb-target-goods-list-object tr[data-goodskey]").on("click", (e)=>{
			e.stopPropagation();

			// 옵션 팝업 숨기기
			this.OptionViewClose();

			// 발주 내역 보이기
			let nextobj = $(e.currentTarget).next(".orderline");
			if (nextobj.hasClass("d-none")) {
				// 옵션명 수직 정렬을 한줄로 치환
				if ($("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").length > 0) {
					let optnames = $("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html();
					let replaceoptnames = optnames.replace(/<br>\[/g, ', [')
					$("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html(replaceoptnames);
				}
				
				$("#hb-target-goods-list-object tr.goodsline td.goods-name").removeClass("fw-bold");
				$("#hb-target-goods-list-object tr.goodsline.choiceline").removeClass("choiceline");
				$("#hb-target-goods-list-object tr.orderline.choiceline").removeClass("choiceline");
				nextobj.addClass("choiceline");
				nextobj.prev(".goodsline").addClass("choiceline").removeClass("d-none");
				nextobj.prev(".goodsline").find("td.goods-name").addClass("fw-bold");


				// 옵션명 한줄을 수직 정렬로 치환
				if ($("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").length > 0) {
					let orioptnames = $("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html();
					let orireplaceoptnames = orioptnames.replace(/, \[/g, '<br>[');
					$("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html(orireplaceoptnames);
				}

				$("#hb-target-goods-list-object tr.orderline:not(.d-none)").addClass("d-none");
				nextobj.removeClass("d-none");

				$("#hb-target-goods-list-object tr.goodsline:not(.choiceline)").addClass("d-none");

				$("#GoodsSearchAll").removeClass("d-none");
			}
		});

		// 상품명 autocomplete의 옆 모두 보이기 버튼 이벤트 처리
		$("#GoodsSearchAll").on("click", (e)=>{
			if ($("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").length > 0) {
				let optnames = $("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html();
				let replaceoptnames = optnames.replace(/<br>\[/g, ', [')
				$("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html(replaceoptnames);
			}
			$("#hb-target-goods-list-object tr.goodsline td.goods-name.fw-bold").removeClass("fw-bold");
			$("#hb-target-goods-list-object tr.goodsline").removeClass("d-none");
			$("#hb-target-goods-list-object tr.goodsline.choiceline").removeClass("choiceline");
			$("#hb-target-goods-list-object tr.orderline.choiceline").removeClass("choiceline").addClass("d-none");
			$(this).addClass("d-none");
			$('#GoodsSearchInput').val("");
		});
		// 옵션 변경 버튼 클릭 시 옵션 팝업 띄우기
		$("#hb-target-goods-list-object button[data-optionpopup]").on("click", (e)=>{
			e.stopPropagation();
			let btndata = $(e.currentTarget).data();
			this.OptionView(btndata.goodskey);
			SG.SearchOptionViewClose();	// SG가 선언되었다는 가정하에 호출(발주 외 추가 상품 옵션 창 닫기)
		});

		// 상품명을 출력된 순서대로 모음 - object는 순서가 없으므로...
		let goodsnames = [];
		$("#hb-target-goods-list-object tr[data-goodskey]").each((i, v)=>{
			let gk = $(v).data("goodskey");
			let c = GlobalGoods[gk];
			let existsgoods = goodsnames.findIndex(element => element.value === c.goods_name);
			if (existsgoods == -1) {
				goodsnames.push({"label":c.goods_name, "value":c.goods_name, "goodskey":[c.goodskey]});
			} else {
				goodsnames[existsgoods].goodskey.push(c.goodskey);
			}
		});

		// 상품명 autocomplete
		$('#GoodsSearchInput').autocomplete({ // autocomplete 구현 시작부
			source : goodsnames, //source 는 자동완성의 대상
			select : function(event, ui) { // item 선택 시 이벤트
				$(this).blur();
				// 옵션명 수직 정렬을 한줄로 치환
				if ($("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").length > 0) {
					let optnames = $("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html();
					let replaceoptnames = optnames.replace(/<br>\[/g, ', [')
					$("#hb-target-goods-list-object tr.goodsline.choiceline .flex-grow-1").html(replaceoptnames);
				}
				// 상품 모두 보이고 발주내용 숨기기
				$("#hb-target-goods-list-object tr.goodsline.choiceline").removeClass("choiceline");
				$("#hb-target-goods-list-object tr.orderline.choiceline").removeClass("choiceline").addClass("d-none");
				$("#hb-target-goods-list-object tr.goodsline.d-none").removeClass("d-none");
				$("#hb-target-goods-list-object tr.goodsline td.goods-name.fw-bold").removeClass("fw-bold");

				$.each(ui.item.goodskey, (i, v)=>{
					// $("#hb-target-goods-list-object tr[data-goodskey='{0}']".format(v)).trigger("click");
					let gl = $("#hb-target-goods-list-object tr[data-goodskey='{0}']".format(v));
					gl.addClass("choiceline").next(".orderline").addClass("choiceline").removeClass("d-none");

					// 옵션명 수직 정렬을 한줄로 치환
					let optnames = gl.find(".flex-grow-1").html();
					let replaceoptnames = optnames.replace(/, \[/g, '<br>[');
					gl.find(".flex-grow-1").html(replaceoptnames);
					
				});
				$("#hb-target-goods-list-object tr.goodsline:not(.choiceline)").addClass("d-none");
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

		// "입고" 버튼 기능 처리
		$("#hb-target-goods-list-object button[data-importbtn]").each((i, o)=>{
			$(o).off("click").on("click", (e)=> {
				// 선택 상태라면 진행
				if ($(e.currentTarget).closest("tr").hasClass("choiceline")) {
					let goodskey = $(e.currentTarget).data('importbtn');
					this.SetImportProc(goodskey);
				}
			});
		});
	}	// End of Method : DrawImportListHBS

	/**
	 * 옵션 출력
	 * @author yds@ntrex on 2024.07.09
	 * @param {string} goodskey 입고 목록의 상품 Unique Key
	 */
	async OptionView(goodskey) {
		// 창 보이기
		this.OptionWindowPosition();
		$("#hb-target-option-object").removeClass('d-none');

		// 상품목록에서 색반전 시키기
		$("#hb-target-goods-list-object .list-select-goods").removeClass("list-select-goods");
		$("[data-goods='{0}']".format(goodskey)).addClass('list-select-goods');

		// autocomplete 용 목록 만들기
		let options = GlobalGoods[goodskey].options.reduce((a, c)=>{
			a.push({"label":c.name, "value":c.name, "selectkey":{"goodskey":goodskey, "stock_opt_seq":c.stock_opt_seq}});
			return a;
		}, []);

		// 화면 출력이 끝날 때 까지 대기
		await new Promise((resolve, reject)=>{
			hbs("hb-source-option-object", GlobalGoods[goodskey], "hb-target-option-object", true, ()=>{
				$('#OptSearchInput').autocomplete({ // autocomplete 구현 시작부
					source : options, //source 는 자동완성의 대상
					select : function(event, ui) { // item 선택 시 이벤트
						$(this).blur();
						//console.log(ui.item);
						// 옵션까지 스크롤
						let start = $(".tableFixHead").find("tbody tr:eq(0)");
						let target = $(".tableFixHead").find("tr[data-goodskey='{0}'][data-optseq={1}]".format(ui.item.selectkey.goodskey, ui.item.selectkey.stock_opt_seq));
						var t1 = start.offset().top;
						var t2 = target.offset().top;
						$(".tableFixHead").animate({scrollTop : t2 - t1}, 200);
						// 옵션 선택 표기
						$(".tableFixHead tbody tr.tr_select_bg").removeClass("tr_select_bg");
						target.addClass("tr_select_bg");

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
					position : { my : 'right top', at : 'right bottom'}, // 제안 메뉴의 위치를 식별
					close : function(event) { // 자동완성 창 닫아질 때의 이벤트
						//console.log(event);
					}
				}).on("focus", function () {
					$(this).autocomplete("search", "");
				});
				
				// 닫기 버튼 처리
				$("#hb-target-option-object button[data-closebtn=1]").on("click", ()=>{ this.OptionViewClose(); });

				/*
				// 옵션 선택 반영 이벤트 - 지금은 할게 없다, 추후 필요시 세부 구현을 해보자
				$("#hb-target-option-object .selectoption").on("click", (e)=>{
					let opt = $(e.currentTarget);
					let optdata = opt.data();
					let selectoption = Object.values(GlobalGoods[optdata.goodskey].options.filter(o => Number(o.stock_opt_seq) == Number(optdata.optseq)));
					let optionname = selectoption[0].name;

					// 새로운 입고 상품으로 추가할지 고민해보자...
				});
				*/

				// 완료 처리를 위한 resolve 호출
				resolve(true);
			});	
		});
	}	// End of Method : OptionView

	/**
	 * 옵션 출력 영역에서 닫기 버튼 처리
	 * @author yds@ntrex on 2023.11.03
	 */
	OptionViewClose() {
		// 창 숨기기
		$("#hb-target-option-object").addClass('d-none');
		$("#hb-target-goods-list-object .list-select-goods").removeClass("list-select-goods");
		$("#hb-target-option-object").empty();
	}	// End of Method : OptionViewClose

	/**
	 * 스크롤위치에 따른 대상 위치 재지정
	 *  @autohr yds@ntrex on 2023.11.15
	 */
	OptionWindowPosition() {
		// 스크롤 기준
		let wpt = $(window).scrollTop();

		// let offset = $('#hb-target-option-object').closest("div.row").offset();
		// if ( wpt >= goodsobjecttop ) $('#hb-target-option-object').css("top", "10px");
		// else  $('#hb-target-option-object').css("top", (offset.top-wpt+34)+"px");

		// 옵션을 상단으로 고정해 달라는 요청으로 상단 navbar 영역 기준으로 위치를 최 상단으로 조정 : yds@ntrex on 2024.09.06
		let topnavheight = $("#navbarSupportedContent").height();
		if (topnavheight > wpt) $('#hb-target-option-object').css("top", "63px");
		else $('#hb-target-option-object').css("top", "10px");
	}	// End of Method : OptionWindowPosition

}	// End of Class : GoodsInfoProc

