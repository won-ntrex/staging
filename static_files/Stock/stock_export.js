/**
 * [ 출고 ]
 * @author yds@ntrex on 2024.01.26
 */

let GlobalGoods = {};			// 출고용 상품 데이터 취합
let sb = new StockBarcode();	// 바코드용 객체 생성
let goodsobjecttop = $(".goods-object").offset().top;

/**
 * 최초 로드 후 최종 처리
 * 	※ 비동기 호출을 막기 위해 promise, async, await을 이용하는 함수를 호출하므로
 * 		ready() 인자 함수를 async 선언 함
 * @author yds@ntrex on 2023.07.04
 */
$(document).ready(async ()=>{
	// -------- Handlebars Helper ---------------------------
	HB_StockManageHelperLoad();

	// -------- 바코드 검색 HTML Load ------------------------
	sb.init(20);
	sb.DrawGoods = DrawGoods;

	// 상단 고정 기능 때문에 새로고침용 추가
	$("html, body").animate({scrollTop:0}, 0);

	$(window).resize(OptionWindowPosition);

	//----- 테스트용도의 모든 상품 검색 처리 ------------------
	//await sb.GetBarcodeGoodsSeq(12148417);
	// await sb.GetBarcodeGoodsSeq(22);
});	// End of Document Ready

Handlebars.registerHelper("stocklogtype", function (type, value) {
	let html = ""; 
	if (type == "0") {
		html = "<span class='text-primary'>[{0}]</span>".format(value);
	} else if (type == "1") {
		html = "<span class='text-danger'>[{0}]</span>".format(value);
	} else if (type == "2") {
		html = "<span class='text-success'>[{0}]</span>".format(value);
	}
	return new Handlebars.SafeString(html);
});
//부서구분 노출
//won@ntrex.co.kr 24.02.19
Handlebars.registerHelper("stockdtype", function (type) {
	let html = ""; 
	if (type == "U") {
		html = "<span class='text-success'>[유니즈]</span>";
	} else if (type == "S") {
		html = "<span class='text-success'>[영업부]</span>";
	} else {
		html = "";
	}
	return new Handlebars.SafeString(html);
});
Handlebars.registerHelper("historystockstring", function (value) {
	let returnstring = value.replace(/출고수량/g, '수량');
	returnstring = returnstring.replace(/입고수량/g, '수량');
	returnstring = returnstring.replace(/수정수량/g, '수량');
	returnstring = returnstring.replace(/:/g, ' : ');
	return new Handlebars.SafeString(returnstring);
});
Handlebars.registerHelper("historyplacestring", function (value) {
	let returnstring = value.split(", (수량")[0];
	// /returnstring = returnstring.replace(/:/g, ' : ');
	return new Handlebars.SafeString(returnstring);
});

// Scroll에 따른 옵션 보기, 출고 일괄 처리 버튼 위치 변경
$(window).scroll(function () {
	OptionWindowPosition();
});	// End of Block : window.scroll

/**
 * 스크롤위치에 따른 대상 위치 재지정
 *  @autohr yds@ntrex on 2023.11.15
 */
function OptionWindowPosition() {
	// // 스크롤 기준
	// let wpt = $(window).scrollTop();
	// let ww = parseInt($(".goods-object").width()),	// 영역 width
	// 	lw = parseInt($("#barcode-list").width()),	// 왼쪽(상품) width
	// 	rw = parseInt($("#current-contents > div.goods-object.mx-0 > div > div.col-12.col-md-5").width());	// 오른쪽(옵션) width

	// // 기준 TOP가 바뀌었다면 지정
	// if (goodsobjecttop != $(".goods-object").offset().top) goodsobjecttop = $(".goods-object").offset().top;

	// // 옵션 : position - fixed
	// let offset = $('#hb-target-option-object').closest("div.row").offset();
	// let top1 = (ww >= lw + rw)?10:82;
	// let top2 = (ww >= lw + rw)?0:70;

	// if ( wpt >= goodsobjecttop ) $('#hb-target-option-object').css("top", (top1)+"px");
	// else $('#hb-target-option-object').css("top", (goodsobjecttop - wpt + top2)+"px")
	
	// // 출고 일괄 처리 : position - fixed
	// let lwidth = $('#barcode-list').width();
	// if ( wpt >= goodsobjecttop ) {
	// 	$('#barcode-list').addClass("movetop");
	// 	$('.export-send').addClass("movetop");
	// } else {
	// 	$('.export-send').removeClass("movetop").width(lwidth -22);
	// 	$('#barcode-list').removeClass("movetop");
	// }

	let option_modal = $('#hb-target-option-object');
	option_modal.css({"top" : 65, "z-index" : 99999});
}	// End of Function : OptionWindowPosition


// 출고수량 0이면 1로 지정
Handlebars.registerHelper("ifzeroone", function(input) { return (Number(input) == 0)?1:Number(input); });
// INPUT max 값 지정
Handlebars.registerHelper("maxifzeroone", function(input) {
	let val = (Number(input) == 0)?1:Number(input);
	if (val > 1) {
		let html = 'max="{0}"'.format(val);
		return new Handlebars.SafeString(html);
	} else {
		return "";
	}
});

/**
 * 바코드로부터 읽어 들인 상품 목록으로 출력
 * @autohr yds@ntrex on 2023.10.26
 * @param {object} data 통신 결과 값
 * @param {int} barcode_seq 바코드 읽어들인 순서
 */
async function DrawGoods(data, barcode_seq, codes) {
	// 코드 정리 => {코드:코드명, ...} or {코드:{name:이름, id:아이디}, ...}
	if (!codes == true) {
		// 초기화
		codes = {};
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
	}

	// 출력 Data 편집 - 우선 상품의 출고 기본정보 지정
	let outdata = {
		"stock_goods_seq":data.goods.stock_goods_seq,
		"goods_seq":data.goods.goods_seq,
		"goods_name":data.goods.goods_name,
		"min_purchase_ea":Number((data.goods.min_purchase_ea == 0)?1:data.goods.min_purchase_ea),
		"max_purchase_ea":Number(data.goods.max_purchase_ea),
		"min_purchase_ea_multiple":Number((data.goods.min_purchase_ea_multiple == 0)?1:data.goods.min_purchase_ea_multiple),
		"link_goods_seq":data.goods.link_goods_seq,
		"link_option_seq":data.goods.link_option_seq,
		"export_orign_amount":Number(data.goods.export_stock),
		"image":data.goods.image,
		"total_stock":data.goods.total_stock,
		"option_state":data.goods.option_state,
		"options":{},
		"select_option":{},
		"purchase_state_text":"",
		"purchase_state":"",
		"department_type" : (data.goods.link_option_seq == 'U' || data.goods.link_option_seq == 'S') ? data.goods.link_option_seq : 'N',
		"append_type": data.append_type || "barcode"
	}

	// 출고 수량 초기값, 발주대상 상태 지정 - 일반 상품만 처리(옵션은 옵션선택 기능에서 지정)
	if (data.goods.option_state == "normal") {
		let checkamount = (Number(data.goods.export_stock) == 0)?1:Number(data.goods.export_stock);
		// // 강제 보정
		// if (outdata.min_purchase_ea > checkamount) checkamount = outdata.min_purchase_ea;
		let stockamount = Number(data.goods.total_stock);
		outdata.export_stock = checkamount;	// 최초에는 최소구매수량으로 지정 - 출고 처리자가 변경한 수량으로 다시 지정 예정
		outdata.purchase_state = (stockamount < checkamount)?"purchase order":"done";
		outdata.purchase_state_text = (stockamount < checkamount)?"발주요청대상":"";

	}

	// 옵션 정보 편집 - 형식 : [타이틀명] 옵션명
	if (data.goods.option_state == "option") {
		//바코드 처리시 유니즈/영업부 바코드는 옵션 선택 정보가 전달되지 않음으로 첫번째 옵션을 임시 설정되도록 수정
		//won@ntrec.co.kr 24.02.19
		let compare_link_option_seq = '';
		if(data.goods.link_option_seq == 'U' || data.goods.link_option_seq == 'S'){
			compare_link_option_seq = data.opts[0].devicemart_option_seq;

		}else{
			compare_link_option_seq = data.goods.link_option_seq;
		}

		outdata.options = data.opts.reduce((a, c)=>{
			let onames = [];
			for(let i=1; i<=5; i++) {
				if (codes.title[c["otc"+i]] == "") continue;
				onames.push("[{0}] {1}".format(codes.title[c["otc"+i]], codes.option[c["oc"+i]]));
			}
			let fstocks = Object.values(data.stocks.filter(o => o.stock_opt_seq === c.stock_opt_seq)).map((a)=>{
				a.sp_name_1 = codes.sp[a.sp_code_1];	// 재고위치1 명칭
				a.sp_name_2 = codes.sp[a.sp_code_2];	// 재고위치2 명칭
				a.manager = codes.sm[a.manager_code];	// 문의담당 이름
				// 불필요 항목 삭제
				["reg_dt","upd_dt","sp_code_1","sp_code_2","manager_code"].forEach(e => delete a[e]);
				return a;
			});

			let setoption = {"stock_opt_seq":Number(c.stock_opt_seq), "name":onames.join(", "), "sp":fstocks};
			a.push(setoption);
			if (c.devicemart_option_seq == compare_link_option_seq) {
				outdata.select_option = $.extend(true, {}, setoption);
				let checkamount = (Number(data.goods.export_stock) == 0)?1:Number(data.goods.export_stock);
				let stockamount = Number(fstocks[0].stock);
				outdata.export_stock = checkamount;	// 최초에는 최소구매수량으로 지정 - 출고 처리자가 변경한 수량으로 다시 지정 예정
				outdata.purchase_state = (stockamount < checkamount)?"purchase order":"done";
				outdata.purchase_state_text = (stockamount < checkamount)?"발주요청대상":"";
				
				outdata.selectoption = setoption.stock_opt_seq;
				outdata.selectstock = setoption.sp[0].stock_seq;
			}
			return a;
		}, []);

		//바코드 처리시 유니즈/영업부 바코드는 옵션 선택 정보가 전달되지 않음으로 메세지 출력으로 출고자가 인지 할수 있도록
		//won@ntrec.co.kr 24.02.19
		let otherDivisionMessage = '';
		switch(data.goods.link_option_seq){
			case 'U':
				otherDivisionMessage = '유니즈 출고 상품은 옵션을 선택해야 합니다.<br />첫번째 옵션으로 기본 선택됩니다.';
				break;
			case 'S':
				otherDivisionMessage = '영업부 출고 상품은 옵션을 선택해야 합니다.<br />첫번째 옵션으로 기본 선택됩니다.';
				break;
			default:					
				otherDivisionMessage = '';				
		}

		if(otherDivisionMessage != ''){
			MsgBox.Alert(otherDivisionMessage);
		}
	} else {
		let fstocks = Object.values(data.stocks).map((a)=>{
			a.sp_name_1 = codes.sp[a.sp_code_1];	// 재고위치1 명칭
			a.sp_name_2 = codes.sp[a.sp_code_2];	// 재고위치2 명칭
			a.manager = codes.sm[a.manager_code];	// 문의담당 이름
			// 불필요 항목 삭제
			["reg_dt","upd_dt","sp_code_1","sp_code_2","manager_code"].forEach(e => delete a[e]);
			return a;
		});
		outdata.options = [{"stock_opt_seq":0, "name":"", "sp":fstocks}];
		// 옵션 & 재고 선택 값 지정
		outdata.selectoption = data.stocks[0].stock_opt_seq;
		outdata.selectstock = data.stocks[0].stock_seq;
	}

	// 옵션 / 출고 처리용 gloval 지정
	outdata.goodskey = "{0}_{1}".format(barcode_seq, data.goods.stock_goods_seq);	// 상품의 Unique Key 지정
	GlobalGoods[outdata.goodskey] = outdata;
	
	// console.log("=== 가공 완료한 상품정보 ===")
	// console.log(outdata.goodskey, GlobalGoods[outdata.goodskey]);
	
	// 화면 출력이 끝날 때 까지 대기
	await new Promise((resolve, reject)=>{
		$("#hb-target-goods-list-object .list-select-goods").removeClass("list-select-goods");
		hbs("hb-source-goods-object", outdata, "hb-target-goods-list-object", {"append_type" : "prepend"}, ()=>{
			ImgModalImageChange();	// 이미지 모달 이벤트 추가

			// 출고 입력란의 바코드 연타 입력 금지 추가
			let ti = $("#hb-target-goods-list-object tr:last-child td input[data-exportamount]");
			sb.repeatKeydownProc(ti[0]);

			// 제외 버튼 이벤트 버블링 처리 및 클릭 이벤트 처리
			let ignoretr = $("#hb-target-goods-list-object tr[data-goods='{0}']".format(outdata.goodskey))
			let ignorebtn = ignoretr.find("td:eq(0) button");
			ignorebtn.on("click", (e)=>{
				e.stopPropagation();	// 이벤트 버블 제거
				GoodsIgnore(ignoretr, outdata.goodskey);
			})
			
			// input Enter Key 이벤트 추가
			let inputs = $("#hb-target-goods-list-object input[data-exportamount='{0}']".format(outdata.goodskey));
			ExportInputEnterEvent(inputs);
			// inputs.focus().select();	// 연속으로 처리 되는 바코드 입력에서는 문제가 되어 포커싱 안함
	
			// 중복 상품 표기
			let alertmsg = "";
			let duplicatebarcode = outdata.link_goods_seq + "|" + outdata.link_option_seq + "|" + outdata.export_orign_amount;
			let duplicatetr = $("#hb-target-goods-list-object tr[data-barcode='{0}']".format(duplicatebarcode));
			if (duplicatetr.length > 1) {
				duplicatetr.each((i, o)=>{
					$(o).addClass("duplicatetr").removeClass("list-select-goods");
				});
				alertmsg = "상품명 '<code>{0}</code>' 인 바코드 중복이 존재 합니다.<br>배경색이 반전된 상품을 확인해주세요".format(outdata.goods_name);
				//MsgBox.Alert(alertmsg);	
			}

			/* 추후 사용을 위해 발주 관련 숨김 : yds@ntrex on 2024.09.24
			// 주문번호 입력 대상(발주대상) 체크 및 메시지(중복 상품) 출력
			OrderCheckReqOrderNo(inputs, alertmsg);
			*/

			// 영역이 숨겨졌을때(출고 처리 후 로그 출력 시)를 위해 영역 표시
			LogAreaShowHide('exportshow');

			// 완료 처리를 위한 resolve 호출
			resolve(true);
		});	
	});

	// 출력이 끝난 후 옵션 영역 처리
	OptionViewClose();

	// 옵션상품인데 선택 옵션 정보가 없어서 옵션창 띄움
	if (outdata.option_state == "option" && outdata.selectoption == undefined) {
		MsgBox.Alert("옵션선택이 필요합니다.", async ()=>{ await OptionView(null, outdata.goodskey); });
		$("#hb-target-goods-list-object input[data-exportamount='{0}']".format(outdata.goodskey)).val(outdata.export_orign_amount);
	}
}	// End of Function : DrawGoods

/**
 * 옵션 출력
 * @author yds@ntrex on 2023.11.01
 * @param {object} obj 클릭된 버튼
 * @param {string} goodskey 바코드입력으로부터 생성된 Unique Key
 */
async function OptionView(obj, goodskey) {
	// 검색 상품 옵션 보기 닫기 함수가 존재하면 실행
	if (typeof SearchOptionViewClose === 'function') SearchOptionViewClose();

	// 창 보이기
	OptionWindowPosition();

	// 출고 상품 옵션 보기 영역 보이기
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
					// 옵션까지 스크롤
					let start = $("#hb-target-option-object .tableFixHead").find("tbody tr:eq(0)");
					let target = $("#hb-target-option-object .tableFixHead").find("tr[data-goodskey='{0}'][data-optseq={1}]".format(ui.item.selectkey.goodskey, ui.item.selectkey.stock_opt_seq));
					var t1 = start.offset().top;
					var t2 = target.offset().top;
					$("#hb-target-option-object .tableFixHead").animate({scrollTop : t2 - t1}, 200);
					// 옵션 선택 표기
					$("#hb-target-option-object .tableFixHead tbody tr.tr_select_bg").removeClass("tr_select_bg");
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

			// 완료 처리를 위한 resolve 호출
			resolve(true);
		});	
	});
}	// End of Function : OptionView

/**
 * 옵션 출력 영역에서 닫기 버튼 처리
 * @author yds@ntrex on 2023.11.03
 */
function OptionViewClose() {
	// 창 숨기기
	$("#hb-target-option-object").addClass('d-none');
	$("#hb-target-goods-list-object .list-select-goods").removeClass("list-select-goods");
	$("#hb-target-option-object").empty();
}	// End of Function : OptionViewClose

/**
 * 상품 정보에 선택한 옵션 반영
 * @author yds@ntrex on 2023.11.02
 */
function SelectOptionStock(target, goodskey, stock_opt_seq, stock_seq) {
	let goods = GlobalGoods[goodskey];
	let options = goods.options.find(o => o.stock_opt_seq == stock_opt_seq);
	let stocks = options.sp.find(s => s.stock_seq == stock_seq);

	// 옵션 & 재고 선택 값 지정
	goods.selectoption = stock_opt_seq;
	goods.selectstock = stock_seq;

	let checkamount = (Number(goods.export_stock) == 0)?1:Number(goods.export_stock);
	let stockamount = Number(goods.total_stock);
	goods.export_stock = checkamount;	// 최초에는 최소구매수량으로 지정 - 출고 처리자가 변경한 수량으로 다시 지정 예정
	goods.purchase_state = (stockamount < checkamount)?"purchase order":"done";
	goods.purchase_state_text = (stockamount < checkamount)?"발주요청대상":"";

	// 선택 행 배경색 지정
	$("#hb-target-option-object [data-stock].tr_select_stock_bg").removeClass('tr_select_stock_bg');
	$(target).addClass('tr_select_stock_bg');

	// --------------- 상품 목록에 선택한 옵션 & 재고 정보 표기 --------------
	// 옵션명
	$("#hb-target-goods-list-object").find("tr[data-goods='{0}'] div.select-option-name".format(goodskey)).html(options.name);

	// 재고위치명
	let spname = "위치1 : {0}, 위치2 : {1}".format(stocks.sp_name_1||'-', stocks.sp_name_2||'-');
	$("#hb-target-goods-list-object").find("tr[data-goods='{0}'] div.select-sp-name".format(goodskey)).html(spname);

	// 현 재고수량
	$("#hb-target-goods-list-object").find("tr[data-goods='{0}'] td[data-stock=stockamount] span.select-stock-entity".format(goodskey)).text(stocks.stock);

	// 발주
	let alink = '';
	if (stocks.stock == 0 || stocks.stock < goods.export_stock)  alink = '발주 요청 대상';
	$("#hb-target-goods-list-object").find("tr[data-goods='{0}'] td[data-stock=button]".format(goodskey)).html(alink);

	// 옵션 영역 숨기기
	OptionViewClose();

	/* 추후 사용을 위해 발주 관련 숨김 : yds@ntrex on 2024.09.24
	// 옵션이 변경되었으니 주문번호를 다시한번 챙기자
	let export_input = $("input[data-exportamount='{0}']".format(goodskey));
	OrderCheckReqOrderNo(export_input);
	*/
}	// End of Function : SelectOptionStock

/**
 * 출고 상품 목록에서 닫기 버튼 처리
 * 	- 출고 대상에서 상품을 빼 버림
 * @author yds@ntrex on 2023.11.06
 */
function GoodsIgnore(obj, goodskey) {
	let confirmmsg = ["<span class='fs-6 text-danger'>출고 대상 목록에서 해당 선택 상품을 제외시킵니다.</span>"];
	confirmmsg.push("상품명 : <span class='text-primary'>{0}</span>".format(GlobalGoods[goodskey].goods_name));
	confirmmsg.push("출고 대상에서 제외 하시겠습니까?");
	MsgBox.Confirm(confirmmsg.join("<br><br>"), ()=>{
		let duplicatebarcode = $(obj).closest("tr").data("barcode");
		let duplicatetr = $("#hb-target-goods-list-object tr[data-barcode='{0}']".format(duplicatebarcode));
		if (duplicatetr.length == 2) {
			duplicatetr.each((i, o)=>{
				$(o).removeClass("duplicatetr");
			})
		}
		$(obj).closest("tr").remove();
		delete GlobalGoods[goodskey];
		OptionViewClose();			// 옵션 보기가 열려 있으면 닫아 주기
	});

	return false;
}	// End of Function : GoodsIgnore

/**
 * 출고 수량 입력 INPUT에 Enter Key 이벤트 추가
 * 	- 다음 INPUT에 포커싱 또는 옵션 보기 버튼 클릭 이벤트 실행
 * @author yds@ntrex 2023.11.07
 * @param {object} inputs INPUT 대상
 */
function ExportInputEnterEvent(inputs) {
	// $(inputs).off("input").on("input", function(e) {
	$(inputs).off("blur").on("blur", function(e) {	// 바코드 입력 문제로 포커싱 해제 될때로 변경
		e.stopPropagation();
		e.stopImmediatePropagation();
		/* 추후 사용을 위해 발주 관련 숨김 : yds@ntrex on 2024.09.24
		OrderCheckReqOrderNo($(this));
		*/
	});
	$(inputs).off("focus").on("focus", function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		OptionViewClose();			// 옵션 보기가 열려 있으면 닫아 주기
		$(e.currentTarget).closest("tbody tr.list-select-goods").removeClass('list-select-goods');
		let tr = $(e.currentTarget).closest("tr");
		$(tr).addClass('list-select-goods');
	});
	$(inputs).off("click").on("click", function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		OptionViewClose();			// 옵션 보기가 열려 있으면 닫아 주기
	});

	/**
	 * 출고 수량 Input 
	 */
	$(inputs).on("keydown", function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		if (e.keyCode === 13) {
			OptionViewClose();			// 옵션 보기가 열려 있으면 닫아 주기
			$(e.currentTarget).blur();	// 이벤트 발생 INPUT에서 포커싱 해제

			// 다음 Row
			let tr = $(e.currentTarget).closest("tr").next();
			if (tr.length > 0) {
				let goodskey = $(tr).data('goods');
				let nextinput = $(tr).find("input[data-exportamount]");
				//let nextbutton= $(tr).find("td[data-stock=input] button");
				if (nextinput.length > 0) {
					nextinput.focus().select();
				} else {
					// 다음 INPUT 선택 불가
					let msg = ["<span class='fs-6 text-danger'>옵션 선택이 필요한 상품입니다.</span>"];
						msg.push("상품명 : <span class='text-primary'>{0}</span>".format(GlobalGoods[goodskey].goods_name));
						msg.push("옵션 선택 후 출고 수량을 지정해주세요.");
					MsgBox.Alert(msg.join("<br><br>"), ()=>{
						// 선택 권유용 상품 선택 및 옵션 띄우기
						//nextbutton.trigger("click");
						tr.trigger("click");
					});
					
				}
			}	// End of IF : tr.length > 0
			
		}	// End of IF : e.keyCode === 13
	});
}	// End of Function : ExportInputEnterEvent

/**
 * 발주 요청 대상 확인 및 주문번호 받기
 * @author yds@ntrex on 2024.06.14
 * @param {Object} inputs 해당 상품의 출고 수량 Input 객체
 * @param {string} addmsg 추가 메시지
 */
async function OrderCheckReqOrderNo(inputs, addmsg) {
	let cur_amount = Number(inputs.val());
	// 문자이거나 입력을 안한 경우 처리
	if (isNaN(cur_amount) || cur_amount == 0) {
		inputs.val(0);
		cur_amount = 0;
		MsgBox.Alert("<code>0 개</code>를 출고 수량으로 지정할 수 없습니다.<br>출고수량을 정확히 숫자로 입력하세요");
		return false;
	}

	// 발주 기능을 추후 사용하기 위해 빼지 않고 진행하지 않도록 리턴 처리 : yds@ntrex on 2024.09.24
	return true;

	let goodskey = inputs.data('exportamount');
	let g = GlobalGoods[goodskey];
	let {selectoption:optseq, selectstock:spseq, options:opts} = g;	// 리턴 받는 object의 요소명을 대입하는 object의 요소명으로 지정할 시 리턴 받는 위치의 변수에 대입 됨
	let stock_amount = Number(opts.find(o => o.stock_opt_seq == optseq)?.sp.find(s => s.stock_seq == spseq)?.stock);
	
	let set_target = inputs.closest("tr").find("td[data-stock=button]");	// 발주 표기 td

	// 연타로 발생되는 중복 실행 방지용 선언
	if (g.stock_modal == undefined) g.stock_modal = true;

	let stock_check = new Promise((resolve) => {
		// 상품 정보에 수량 부족 상태 지정
		g.purchase_state = (stock_amount < cur_amount)?"purchase order":"done";
		g.purchase_state_text = (stock_amount < cur_amount)?"발주요청대상":"";
		if (g.order_state == undefined) g.order_state = false;	// 발주 필요 상태 여부
		if (g.order_seq == undefined) g.order_seq = ""		// 발주일때 입력 받을 주문번호
		set_target.html("");	// 초기화
		
		// 재고 수량 부족이면서 Modal 처리 상태 아니라면 처리
		if (cur_amount > stock_amount && g.stock_modal) {
			g.stock_modal = false;	// 연타입력으로 실행 막기

			// 발주 대상 요청 표기 변경 : 주문번호 없는 것도 처리 위해 먼저 변경
			set_target.html("발주 요청 대상<br><span class='text-dark' style='font-size: 12px;'>주문번호 대상 아님</code>");
			
			// 바코드 입력일 때 주문번호 입력 받도록 처리
			// if (g.append_type == "barcode" && ! ["U", "S"].includes(g.link_option_seq)) {
			if (g.append_type == "barcode" && ! ["U", "S"].includes(g.department_type)) {
				// Modal Contents 지정
				let title = ["발주에 필요한 주문번호 확인"];
				let contents = ["<kbd>상품명</kbd> " + g.goods_name];
				if (g.option_state == 'option') contents.push("<kbd>옵션</kbd> " + opts.find(o => o.stock_opt_seq == optseq)?.name || "옵션 못찾음");
				contents.push('해당 상품은 재고가 부족합니다.');
				contents.push('발주를 위해 <mark>주문번호</mark>를 입력하세요.');
				// 주문번호 입력용 input 추가
				let t_contents = '<div class="d-inline-flex  align-items-center">';
					t_contents += '<strong>주문번호</strong>&nbsp;';
					t_contents += '<input type="text" name="goods_order_seq" data-goodskey="{0}" data-type="barcode_order_seq" class="my-1 form-control form-control-sm w-auto">';
					t_contents += '</div>';					
				contents.push(t_contents.format(goodskey));
				if (addmsg) contents.push('<hr class="my-2 border-secondary"><div class="mt-2 ps-1">{0}</div>'.format(addmsg));	// 주로 상품 중복 표기용 메시지로 옴
		
				// modal Contents 출력
				$('#common-modal .modal-title').html(title);
				$('#common-modal .modal-body').html(contents.map(str => `<div class="my-2">${str}</div>`).join(""));

				// Modal 생성
				var commonModal = new bootstrap.Modal($('#common-modal')[0]);
				// Modal 오픈시 주문번호 받기 이벤트 설정
				$('#common-modal')
					.off("shown.bs.modal")
					.on("shown.bs.modal", (event)=>{
						// Modal이 완전히 열리고 나면 주문번호 INPUT의 값을 선택
						let order_input = $("INPUT[data-goodskey={0}][data-type='barcode_order_seq']".format(goodskey));
						order_input.focus();
						order_input.select();
					});
				$('#common-modal')
					.off("show.bs.modal")
					.on("show.bs.modal", (event)=>{
						// 주문번호 입력 input 설정 및 이벤트 추가
						let order_input = $("INPUT[data-goodskey={0}][data-type='barcode_order_seq']".format(goodskey));
						if (g.order_seq != "") order_input.val(g.order_seq);	// 모달창이 열렸을 때 이미 지정한 주문번호 있으면 채워 넣기
						g.order_state = true;	// 발주 필요 상태 지정
						// g.order_seq = order_input.val().replace(/[^0-9]/g, '');	// 상품정보에 입력받은 주문번호 업데이트

						// 주문번호 input에 바코드 입력 처리
						sb.GoodsScannerDetection(order_input, (barcode, qty)=>{
							g.order_seq = barcode;		// 바코드 입력이 제일 나중에 호출되어 다시 지정
							order_input.val(barcode);	// 이미 닫힌 후이지만 일단 변경

							// 발주 대상 요청 표기 변경을 Modal Hide 시에 지정하지만 여기서 다시 선언
							// order_input의 keydown 이벤트가 먼저 호출되기 때문에 Modal Hide가 먼저 실행되기 때문
							let set_target = inputs.closest("tr").find("td[data-stock=button]");	// 발주 표기 td
							if (barcode) set_target.html("발주 요청 대상<br><code class='text-decoration-underline c-pointer'>{0}</code>".format(g.order_seq));
							else set_target.html("발주 요청 대상<br><code class='text-decoration-underline c-pointer'>주문번호 입력 필요</code>");
							// code 태그안의 텍스트에 click 이벤트 추가(주문번호 입력 받기 재호출)
							set_target.find("code").off("click").on("click", (e)=>{ OrderCheckReqOrderNo(inputs); });

							
							let event = $.Event("keydown", {keyCode:13});
							order_input.trigger(event);
							event.stopPropagation();
						});

						// 주문번호 추가
						order_input.on("input", function() {
							let currentValue = $(this).val().replace(/[^0-9]/g, '');	// 숫자가 아닌 문자 제거
							$(this).val(currentValue);	// INPUT 객체 업데이트
							g.order_seq = currentValue;	// 상품정보에 입력받은 주문번호 업데이트
						});
						// 엔터키 처리
						order_input.on("keydown", function(e) {
							// 출고 상품용 바코드처리 문제인지 이벤트가 없어지는 경우가 발행하네.... 
							if (e && e.keyCode === 13) {
								e.stopPropagation();
								let currentValue = $(this).val().replace(/[^0-9]/g, '');	// 숫자가 아닌 문자 제거
								$(this).val(currentValue);	// INPUT 객체 업데이트
								g.order_seq = currentValue;	// 상품정보에 입력받은 주문번호 업데이트
								commonModal.hide();
							}
						});
					});
				// Modal 닫기시 화면처리
				$('#common-modal')
					.off("hide.bs.modal")
					.on("hide.bs.modal", (event)=>{
						g.stock_modal = true;	// 연타입력으로 막은 실행 허용
						$('#common-modal').off("hide.bs.modal");	// 다른 곳에서 hide 이벤트 안 쓰도록 삭제
						
						// sb.GoodsScannerDetection(sb.input);	// 원래의 출력 상품 바코드 입력 처리 원복 - 흠... 원래의 바코드 입력 Input의 keydown 사라지는것 같다
						sb.init(20);

						// 발주 대상 요청 표기 변경
						let set_target = inputs.closest("tr").find("td[data-stock=button]");	// 발주 표기 td
						if (g.order_seq) set_target.html("발주 요청 대상<br><code class='text-decoration-underline c-pointer'>{0}</code>".format(g.order_seq));
						else set_target.html("발주 요청 대상<br><code class='text-decoration-underline c-pointer'>주문번호 입력 필요</code>");
						// code 태그안의 텍스트에 click 이벤트 추가(주문번호 입력 받기 재호출)
						set_target.find("code").off("click").on("click", (e)=>{ OrderCheckReqOrderNo(inputs); });

						resolve(true);	// 추가 메시지 포함 Modal 처리 완료 반환
					});
				// Modal 오픈
				commonModal.show();
			} else {
				resolve(false);	// 바코드 입력 상품 아니라서 스킵 완료 반환
			}
		} else {
			resolve(false);	// 수량 부족이 아니거나 Modal 처리 중이라 스킵 완료 반환
		}	// End of IF : 재고 수량 부족이면서 Modal 처리 상태 아니라면 처리
	});	// End of Promise : stock_check
	
	// Promise 응답 받으면 추가 메시지 처리
	stock_check.then((state)=> {
		if (addmsg && !state) {
			if (g.stock_modal) {
				g.stock_modal = false;
				MsgBox.Alert(addmsg, ()=> { g.stock_modal = true; });
			}
		} else {
			g.stock_modal = true;
		}
	}).catch((error)=>{ console.log("Error:", error); });	
	
}	// End of Function : OrderCheckReqOrderNo

/**
 * 출고 일괄 처리
 * @author yds@ntrex on 2023.11.06
 */
async function ExportBatchSend() {
	OptionViewClose();	// 옵션 보기가 열려 있으면 닫아 주기

	// 선택 목록이 없는 경우 중지 처리
	if (sb.barcodegoods.length == 0) {
		MsgBox.Alert("선택된 상품이 존재하지 않습니다.");
		return true;
	}

	// 체크 결과
	let checkstate = 0;
	let stopgoodskey = "";

	let sendData = [];

	// 출고 상품 Loop check
	$.each(GlobalGoods, (i, r)=>{
		if (r.option_state == "option") {
			// 옵션 선택이 안되어 체크 중단
			if (r.export_stock == undefined) {
				checkstate = 1;
				stopgoodskey = r.goodskey;
				return false;
			}
		}

		// 입력된 출고 수량 찾기
		let export_input = parseInt($("#hb-target-goods-list-object input[data-exportamount={0}]".format(r.goodskey)).val());
		if (export_input == 0 || isNaN(export_input)) {
			checkstate = 2;
			stopgoodskey = r.goodskey;
			return false;
		}

		// 바코드 입력 상품만 수량 부족 시 주문번호 입력되었는지 체크
		if (r.append_type == "barcode" && r.purchase_state == "purchase order") {
			// 유니즈와 영업팀 출고 상품이 아닌 경우만 주문번호 체크(유니즈:U, 영업부:S, 칼레오:K, 연구소:R)
			if (! ["U", "S", "K", "R"].includes(r.department_type)) {
				// 현재는 바코드 입력 상품일 때 무조건 주문번호 필요상품으로 처리
				if (r.order_state && !r.order_seq) {
					checkstate = 3;
					stopgoodskey = r.goodskey;
					return false;
				}
			}
		}

		// 상품정보에 출고 지정 수량 입히기
		r.export_stock = export_input;

		let row = {
			"goodskey": r.goodskey,
			"stock_goods_seq": r.stock_goods_seq,
			"stock_opt_seq": r.selectoption,
			"stock_seq": r.selectstock,
			"export_stock": r.export_stock,
			"purchase_state": r.purchase_state,
			"department_type": r.department_type,
			"order_seq": r.order_seq || "",	// 주문번호
			"append_type": r.append_type || ""	// 추가 방법
		}
		sendData.push(row);
	});

	// 옵션 선택이 안된 경우
	if (checkstate == 1) {
		// 일괄 처리 불가 메시지 부여
		let msg = ["<span class='fs-6 text-danger'>옵션 선택이 필요한 상품이 존재합니다.</span>"];
			msg.push("상품명 : <span class='text-primary'>{0}</span>".format(GlobalGoods[stopgoodskey].goods_name));
			msg.push("옵션 선택 후 출고 수량을 지정해주세요.");
		MsgBox.Alert(msg.join("<br><br>"), ()=>{
			// 선택 권유용 상품 선택 및 옵션 띄우기
			//$("#hb-target-goods-list-object tr[data-goods='{0}'] td[data-stock=input] button".format(stopgoodskey)).trigger("click");
			OptionView(this, stopgoodskey);
		});
		return true;
	}

	// 출고 수량 0 지정 시
	if (checkstate == 2) {
		// 일괄 처리 불가 메시지 부여
		let msg = ["<span class='fs-6 text-danger'>출고 수량 입력이 필요한 상품이 존재합니다.</span>"];
			msg.push("상품명 : <span class='text-primary'>{0}</span>".format(GlobalGoods[stopgoodskey].goods_name));
			let g = GlobalGoods[stopgoodskey];
			let {selectoption:optseq, selectstock:spseq, options:opts} = g;
			if (g.option_state == 'option') msg.push("옵션명 : " + opts.find(o => o.stock_opt_seq == optseq)?.name || "옵션 못찾음");
			msg.push("출고 수량을 지정해주세요.");
		MsgBox.Alert(msg.join("<br><br>"), ()=>{
			// 선택 권유용 상품 선택 및 옵션 띄우기
			$("[data-goods='{0}']".format(stopgoodskey)).addClass('list-select-goods');
		});
		return true;
	}

	// 주문번호 입력 필요 상품인데 주문번호 입력 받지 않은 경우
	if (checkstate == 3) {
		// 일괄 처리 불가 메시지 부여
		let msg = ["<span class='fs-6 text-danger'>재고 부족으로 주문번호 입력이 필요한 상품이 존재합니다.</span>"];
		msg.push("상품명 : <span class='text-primary'>{0}</span>".format(GlobalGoods[stopgoodskey].goods_name));
		let g = GlobalGoods[stopgoodskey];
		let {selectoption:optseq, selectstock:spseq, options:opts} = g;
		if (g.option_state == 'option') msg.push("옵션명 : " + opts.find(o => o.stock_opt_seq == optseq)?.name || "옵션 못찾음");
		msg.push("주문번호를 입력해주세요.");
		MsgBox.Alert(msg.join("<br><br>"), ()=>{
			// 선택 권유용 상품 선택 및 옵션 띄우기
			$("[data-goods='{0}']".format(stopgoodskey)).addClass('list-select-goods');
		});
		return true;
	}

	// 마지막 점검 메시지 출력 및 출고 처리
	MsgBox.Confirm("출고 수량 입력을 다시한번 확인해주세요.<br><br>일괄 출고 처리 하시겠습니까?", async ()=>{
		let result = await getAjax("/Stock/GStock_Multi_Save_AsyncGet", {"proc_type" : "export" , "data" : JSON.stringify(sendData)});
		
		if(result != false && result.state == 1){
			sb.barcodegoods = [];							// 바코드 선택 비우기
			GlobalGoods = {};								// 상품 획득 목록 비우기
			$("#hb-target-goods-list-object").empty();		// 출력된 목록 비우기
			// $("html, body").animate({scrollTop:0}, 0);
			let movetop = $("#hb-target-goods-list-object").offset().top;
			$("html, body").scrollTop(movetop - 100);
			MsgBox.Alert("출고 일괄 처리가 완료되었습니다.");

			LogView(result);

		}else{
			CallCommonModal("출고 일괄 처리 실패", result != false ? AjaxErrorMessage(result) : {});
		}
	});
}	// End of Function : ExportBatchSend

/**
 * 로그 영역 보이기
 * @author yds@ntrex on 2023.12.15
 * @param {string} type 구분(logshow:로그 영역, exportshow:출고 영역) 
 */
function LogAreaShowHide(type) {
	if (type == "exportshow") {
		$("div.goods-object").removeClass("d-none");
		$("div.log-area").addClass("d-none");
		$("#hb-target-logstock").empty();
		OptionWindowPosition();
	} else {
		$("div.goods-object").addClass("d-none");
		$("div.log-area").removeClass("d-none");
	}
}	// End of Function : LogAreaShowHide

/**
 * 로그 목록 출력
 * @author yds@ntrex on 2023.12.15
 * @param {object} result ajax 통신 결과
 */
function LogView(result) {
	// 출력 항목 조정
	$.each(result.data.datas, (i, lrow)=>{
		switch(lrow.stype) {
			case "0": lrow.stypename = "입고"; break;
			case "1": lrow.stypename = "출고"; break;
			case "2": lrow.stypename = "수량조정"; break;
			default: lrow.stypename = "-"; break;
		}
		// note 파싱하여 변동 최종값에 색 반영
		lrow.note = lrow.note.split(" | ").reduce((a, c)=>{
			let r = c.split(" : ");
			if (["재고변동", "입고가변동"].indexOf(r[0]) !== -1) {
				let t = r[1].split(" → ");
				t[1] = "<span class='text-danger fw-bold'>{0}</span>".format(t[1]);
				r[1] = t.join(" <i class='fa-solid fa-arrow-right'></i> ");
			}
			a.push(r.join(" : "));
			return a;
		}, []).join(" | ");
	});
	
	// 조회 결과 화면 출력
	hbs("hb-source-logstock", result.data, "hb-target-logstock", true, ()=>{
		if (result.data.datas.length > 0) {
			// 이미지 팝업용 모달 이벤트 : 화면 출력 전 이미지 교체 지정 실행
			ImgModalImageChange();
			LogAreaShowHide('logshow');

			// Pagination
			$("#hb-target-logstock").append("<li class='list-group-item p-3 d-flex justify-content-center'><div id='pagination-stock'></div></li>");
			let pagination = SetPagination(result.data.pageset, RelayGetTodayExportLog);
			$("#pagination-stock").empty().append(pagination);
		} else {
			$("#hb-target-logstock").html("<li class='list-group-item p-3 d-flex justify-content-center'>당일 출고 이력이 없습니다.</li>");
		}
		
	});
}	// End of Funciton : LogView

/**
 * 당일 출고 이력 조회
 * @author yds@ntrex on 2023.12.15
 * @param {string} type 구분(last:마지막 출력 이력, page:전체 출력 이력)
 */
async function GetTodayExportLog(type, page) {
	if (type == "last") page = 1;
	else page = page || 1;

	let result = await getAjax("/Stock/GStock_User_Export_Log_AsyncGet", {"type" : type , "page" : page});
	if(result != false && result.state == 1){
		LogView(result);
	}else{
		CallCommonModal("당일 출고 기록 조회 실패", result != false ? AjaxErrorMessage(result) : {});
	}
}	// End of Function : GetTodayExportLog

/**
 * 페이징 처리를 위한 callback function
 * @author yds@ntrex on 2023.12.15
 */
function RelayGetTodayExportLog(page) {
	GetTodayExportLog("page", page);
}	// End of Function : RelayGetTodayExportLog