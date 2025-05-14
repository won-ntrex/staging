/* ---------------------
	재고관리 공통
	@author yds@ntrex on 2023.07.24
 ---------------------- */

/* jQuery에서 객체에 할당된 이벤트 목록 획득 - show.bs.collapse 지정 유무 판단
	let events = $._data($(ID 또는 Selector)[0], "events");
	let hasEvents = (events != null);
	if (!hasEvents || Object.keys(events).find(key => key === "show") == undefined) {
		// show.bs.collapse 없는 경우로 이벤트 처리
		$(listCollapse).on('show.bs.collapse', function () {
			// do something...
			console.log("collapse show event", $(e.currentTarget).data());
		});
	}
*/


/**
 * 재고관리 공통 Handlebars registerHelper
 * @author yds@ntrex on 2023.07.24
 */
	function HB_StockManageHelperLoad() {
		// ------- 옵션 출력용 ------------------
		// Handlebar Add Function
		if(!('image_custom' in Handlebars.helpers)) {
			Handlebars.registerHelper("image_custom", function (url) {
				if(!url){
					return new Handlebars.SafeString('<img src="/assets/image/noimage.gif" class="img c-pointer">');
				}
				// url 시작이 '/data'로 시작 시 디바이스마트 host를 붙여 지정
				if (url) {
					if (url.search(/\/data/gi) == 0) url = "https://www.devicemart.co.kr"+url;
				} else {
					url = "/assets/image/noimage.gif";
				}
				let img = "<img src=\""+url+"\" class=\"img c-pointer\" onerror=\"this.src='/assets/image/noimage.gif'\">";
				return new Handlebars.SafeString(img);
			});
		}
		if(!('image_html' in Handlebars.helpers)) {
			Handlebars.registerHelper("image_html", function (url) {
				if(!url){
					return new Handlebars.SafeString('<img src="/assets/image/noimage.gif" class="img c-pointer">');
				}
				// url 시작이 '/data'로 시작 시 디바이스마트 host를 붙여 지정
				if (url) {
					if (url.search(/\/data/gi) == 0) url = "https://www.devicemart.co.kr"+url;
				} else {
					url = "/assets/image/noimage.gif";
				}
				let img = "<img src=\""+url+"\" class=\"img c-pointer\" data-bs-toggle=\"modal\" data-bs-target=\"#imgModal\" onerror=\"this.src='/assets/image/noimage.gif'\">";
				return new Handlebars.SafeString(img);
			});
		}
		if(!('image_html_small' in Handlebars.helpers)) {
			Handlebars.registerHelper("image_html_small", function (url) {
				if(!url){
					return new Handlebars.SafeString('<img src="/assets/image/noimage.gif" class="img_small c-pointer">');
				}
				// url 시작이 '/data'로 시작 시 디바이스마트 host를 붙여 지정
				if (url.search(/\/data/gi) == 0) url = "https://www.devicemart.co.kr"+url;
				let img = "<img src=\""+url+"\" class=\"img_small c-pointer\" data-bs-toggle=\"modal\" data-bs-target=\"#imgModal\" onerror=\"this.src='/assets/image/noimage.gif'\">";
				return new Handlebars.SafeString(img);
			});
		}
		// 옵션상품 아이콘 표기
		if(!('optionicon' in Handlebars.helpers)) {
			Handlebars.registerHelper("optionicon", function (value) {
				let html = ""; 
				if (value == "옵션상품") {
					html += '<span data-type="option" class="c-pointer text-primary"><i class="fa-solid fa-rectangle-list fs-4"></i></span>';
				}
				return new Handlebars.SafeString(html);
			});
		}
		// 옵션상품 아이콘 표기
		if(!('optionicon_in' in Handlebars.helpers)) {
			Handlebars.registerHelper("optionicon_in", function (value) {
				let html = ""; 
				if (value == "옵션상품") {
					html += '<span data-type="option" class="c-pointer text-primary" style="font-size:13px;"><i class="fa-solid fa-rectangle-list align-middle"></i></span>';
				}
				return new Handlebars.SafeString(html);
			});
		}

		// ------- 옵션 출력용 ------------------
		Handlebars.registerHelper("image_url", function (url) {
			// url 시작이 '/data'로 시작 시 디바이스마트 host를 붙여 지정
			if (url.search(/\/data/gi) == 0) url = "https://www.devicemart.co.kr"+url;
			return url;
		});
		Handlebars.registerHelper("option_print", function (opt) {
			let html = [];
			$.each(opt, (i, r)=>{
				html.push("<div class=\"col-md-auto opt-name\">[{0}] {1}</div>".format(r.t, r.o));
			});
			return new Handlebars.SafeString(html.join(""));
		});
		Handlebars.registerHelper("new_opt_name_print", function (opt) {
			let html = [];
			$.each(opt, (i, r)=>{
				html.push("<span class=\"opt-name\">[{0}] {1}</span>".format(r.t, r.o));
			});
			return new Handlebars.SafeString(html.join(", "));
		});
		
		Handlebars.registerHelper("log_option_print", function (opt) {
			let text = [];
			$.each(opt, (i, r)=>{
				text.push("[{0}] {1}".format(r.t, r.o));
			});
			return text.join(" ");
		});
		Handlebars.registerHelper("stockidx", function (idx) {
			return Number(idx) + 1;
		});
		// 변경이력 표기에 사용 - 입고, 출고만 표한하기 위함이어서 다른데 사용되어진것 보고 변경 또는 삭제 처리 해야 함
		if(!('stypehtml' in Handlebars.helpers)) {
			Handlebars.registerHelper("stypehtml", function (type, value, stock) {
				let html = ""; 
				if (type == "0") {
					if (stock > 0) html = "<span class='text-primary'>[{0}]</span> {1}".format(value, stock);
				} else if (type == "1") {
					html = "<span class='text-danger'>[{0}]</span> {1}".format(value, stock);
				} else if (type == "2") {
					html = "<span class='text-success'>[{0}]</span> <span class='fw-bold me-2'>{1}</span>".format(value, stock);
				}
				return new Handlebars.SafeString(html);
			});
		}
		Handlebars.registerHelper("log_stock_print", function (seq) {
			let text = [];
			$("div[data-stockseq={0}][data-logparegent=true] div".format(seq)).each((i, r)=>{
				//console.log(i, $(r).text());
				if (i < 2) text.push($(r).text());
			});
			return text.join(", ");
		});
		if(!('SupplyPricePrint' in Handlebars.helpers)) {
			Handlebars.registerHelper("SupplyPricePrint", function (price) {
				let html = ""; 
				if (price > 0) {
					html = "<span class='text-warning'>[입고가 변경]</span> {0}원".format(price);
				}
				return new Handlebars.SafeString(html);
			});
		}
		if(!('NumberComma' in Handlebars.helpers)) {
			Handlebars.registerHelper("NumberComma", function (value) {
				if (typeof value == "string") return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				else return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			});
		}
		//won@ntrex.co.kr 날자 형식을 줄임 형식으로 표시
		if(!('toShortDate' in Handlebars.helpers)) {
			Handlebars.registerHelper("toShortDate", function (date_str) {
				let date = new Date(date_str)
				let dateFormat2 = date.getFullYear() % 100 +
					'.' + ( (date.getMonth()+1) < 9 ? "0" + (date.getMonth()+1) : (date.getMonth()+1) ) +
					'.' + ( (date.getDate()) < 9 ? "0" + (date.getDate()) : (date.getDate()) ) +
					'<br />' + ( (date.getHours()) < 9 ? "0" + (date.getHours()) : (date.getHours()) ) +
					':' + ( (date.getMinutes()) < 9 ? "0" + (date.getMinutes()) : (date.getMinutes()) );
				return new Handlebars.SafeString(dateFormat2);
			});
		}
	}	// End of Function : HB_StockManageHelperLoad

	/**
		 * 입/출고가 변동 현황 보기
		 * @author won@ntrex on 2023.10.06
		 * @param {int} link_goods_seq 고유 상품번호 
		 * @param {int} history_type 입/출고 구분 
		 */
	function GetPriceHistory(link_goods_seq, history_type){
		var now = new Date();
		var set_edate = new Date();
		var set_sdate = new Date(now.setMonth(now.getMonth() - 6));	// 6개월전

		let result =  getAjax('/Stock/PriceHistory_AsyncGet', {
			's-goodsSeq' : link_goods_seq,//417, //link_goods_seq,
			's-sday' : set_sdate.getFullYear()+'-'+(set_sdate.getMonth()+1)+'-'+ set_sdate.getDate(),
			's-eday' : set_edate.getFullYear()+'-'+(set_edate.getMonth()+1)+'-'+ set_edate.getDate(),
			's-stype' : history_type,
		});
		result.then((resData) => {
			if (resData.state != 1) {
				CallCommonModal("통신 결과", resData.data.error);
			} else {
				if(Object.keys(resData.data.list).length){//검색 결과 데이터가 있을때만 
					const ctx = document.getElementById('priceHistoryChart');
					let labels = [];
					let data = [];
					$.each(resData.data.labels, (key, list) => {//하단 날자 레이블 설정
						labels.push(list);
					});

					$.each(resData.data.list, (key, list) => {//옵션별 그래프 표시
						data.push({
							label: key,
							data: list,
							borderWidth: 1
						});
					});
					
					if(window.chart == undefined){
						window.chart = new Chart(ctx, {
						type: 'line',
						data: {
							labels: labels,
							datasets: data
						},
						options: {
							scales: {
							y: {
								beginAtZero: true
							}
							}
						}
						});
					}else{
						window.chart.data.labels = labels;
						window.chart.data.datasets = data;
						window.chart.update('active');
					}

					$("#pirce-history-modal").modal("show");
				}else{
					CallCommonModal("통신 결과", '검색 결과가 없습니다.');
				}
			}
		})		
	}// End of Function : GetPriceHistory