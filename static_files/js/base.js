/**
 * 기본 스크립트
 * @author yds@ntrex on 2023.02.16
 */
	let csrftoken = Cookies.get('csrftoken');
	var defaultDatePickerOption = {
		format: "yyyy-mm-dd",	//데이터 포맷 형식(yyyy : 년 mm : 월 dd : 일 )
				autoclose : true,		//사용자가 날짜를 클릭하면 자동 캘린더가 닫히는 옵션
				disableTouchKeyboard : true,	//모바일에서 플러그인 작동 여부 기본값 false 가 작동 true가 작동 안함.
				templates : {
					leftArrow: '<i class="fa-solid fa-angles-left"></i>',
					rightArrow: '<i class="fa-solid fa-angles-right"></i>'
				}, //다음달 이전달로 넘어가는 화살표 모양 커스텀 마이징 
				title: "기록일 선택",	//캘린더 상단에 보여주는 타이틀
				todayBtn : true,	// 오늘 날짜가 포함된 월 이동 버튼
				language : "ko"	//달력의 언어 선택, 그에 맞는 js로 교체해줘야한다.
	};
	/**
	 * Mobile Touch Evnet - hover
	 * @author yds@ntrex on 2023.02.16
	 */
	(function() {
		$("*").on( 'touchstart', function() {
				$(this).trigger('hover') ;
			} )
			.on('touchend', function() {
				$(this).trigger('hover') ;
			} ) ;
	})() ;

	/**
	 * Handlebars 컴파일 / 결과물 붙이기
	 * @author yds@ntrex on 2023.02.22
	 * @param {String} sourceId Handlebars Template Source ID(HTML Source)
	 * @param {Object} data 출력용 JSON Data
	 * @param {String} resultId 출력 대상 ID
	 * @param {Boolean || object} options 출력 대상 ID의 하위 항목 모두 지울지 결정(true:지우기, false:남기기)
	 *      won@ntrex.co.kr 24.09.06 대상 항목의 앞쪽 뒤쪽에 구분해서 추가해야 하는 상황이 발생해서 별도의 함수 추가하지 않고 파라미터의 값에 따라 추가 기능이 동작 할수 있도록 수정 
	 * @param {Function} callback 출력 후 실행 할 Function Name
	 */
	function hbs (sourceId, data, resultId, options, callback) {
		var source = $("#"+sourceId).html();
		// [[ ]] → {{ }}로 치환 - djaong의 구분자 처리와 handlebars의 구분자가 동일한 문제가 있어서 template페이지의 handlebars 구분자를 [[ ]] 로 수정함.
		source = source.replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');
		var template = Handlebars.compile(source);
		var html = template(data);
		var append_type = "append";
		if(typeof options === "boolean") {
			if (options) $("#"+resultId).empty();
		}else if(typeof options === "string"){
			//options가 문자열로 전달됬을 경우 해당 값이 json 인지 여부에 따라 처리 결정
			if(IsJsonString(options) === true) {
				var json_option = JSON.parse(options);
				append_type = json_option.append_type;
			}
			//여기에 순수 문자열일 경우에 대한 처리 구문 기술 - 현재는 필요 없을듯	
		}else if (typeof options === "object" && options !== null && !Array.isArray(options)) {
			//options가 json일 경우 처리 - option 세부 항목에 따른 처리 기술 해야 하나 현재는 필요 없을듯
			append_type = options.append_type;
		}

		$("#"+resultId)[append_type](html).ready(()=>{
			if (callback instanceof Function) callback();
		});
	};

	/**
	 * Handlebars Helper 등록
	 * @author yds@ntrex on 2023.02.22
	 */
	function SetHandlebarsHelper() {
		// 대소문자로 변환
		if(!('toupper' in Handlebars.helpers)) Handlebars.registerHelper("toupper", function(input) { return input.toUpperCase(); });
		if(!('tolower' in Handlebars.helpers)) Handlebars.registerHelper("tolower", function(input) { return input.toLowerCase(); });
		// 큰숫자 3자리 콤마넣기
		if(!('numberComma' in Handlebars.helpers)) Handlebars.registerHelper("numberComma", function(x) {
			if (x != null && x != "") {
				return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			} else {
				return x;
			}
		});
		// 페이징 포함한 레코드 순번
		Handlebars.registerHelper("pagecounter", function (index, page, offset) {
			//console.log(page, offset);
			return index + 1 + (parseInt(page) - 1) * parseInt(offset);
		});
		// 핸들바의 IF 블럭으로 처리 : ex) {{#checkIf v1 "==" v2}} // true 일때 처리 {{else}} // false 일때 처리 {{/checkIf}}
		Handlebars.registerHelper('checkIf', function (v1, o1, v2, options) {
			var operators = {
				'==': function (a, b) {
					return a == b
				},
				'===': function (a, b) {
					return a === b
				},
				'!=': function (a, b) {
					return a != b
				},
				'!==': function (a, b) {
					return a !== b
				},
				'<': function (a, b) {
					return a < b
				},
				'<=': function (a, b) {
					return a <= b
				},
				'>': function (a, b) {
					return a > b
				},
				'>=': function (a, b) {
					return a >= b
				},
				'&&': function (a, b) {
					return a && b
				},
				'||': function (a, b) {
					return a || b
				},
			}
			var isTrue = operators[o1](v1, v2);
			return isTrue ? options.fn(this) : options.inverse(this);
		});
		// 검색 결과 목록 페이징
		Handlebars.registerHelper("searchPagingNavigation", function (page) {
			var html = "";
			if (page.first) {
				html += '<a onclick="GetSearchListPageProc(\''+page.first+'\')" class="first">◀ 처음</a>';
			}
			if (page.prev) html += '<a onclick="GetSearchListPageProc(\''+page.prev+'\')" class="prev">◀ 이전</a>';
			$.each(page.page, function(idx, val) {
				html += '<a onclick="GetSearchListPageProc(\''+val+'\')"'+((page.nowpage == val)?' class="on"':'')+'>'+val+'</a>';
			});
			if (page.next) html += '<a onclick="GetSearchListPageProc(\''+page.next+'\')" class="next">다음 ▶</a>';
			if (page.last) html += '<a onclick="GetSearchListPageProc(\''+page.last+'\')" class="last">마지막 ▶</a>';
			return new Handlebars.SafeString(html);
		});
		// 빈값 '-' 처리
		Handlebars.registerHelper("nonehyphen", function (value) {
			var text = (value == "")?"-":value;
			return text;
		});
		//json data로 변경
		Handlebars.registerHelper('toJSON', function(obj) {
			return JSON.stringify(obj, null);
		});
	}	// End of Function : SetHandlebarsHelper
	/**
	 * ajax 처리
	 * @author won0334@ntrex on 2023.08.11
	 */
	function getAjax(url, data, option) {
		option = option || {};
		return new Promise(( resolve, reject ) =>{
			$.ajax($.extend({
				type: 'POST',
				async: true, 
				dataType: 'json', // xml, json, script, html
				url: url, // 요청 할 주소
				data: data, // 전송할 데이터
				success: (res) => {
					resolve(res);
				},
				error: (res) => {
					CallCommonModal("호출 실패", url);
					reject(false);
				}
			}, option));
		});
	}

	/**
	 * FCM push 서버 정보 저장용 객체 - 추가기능 구현시 사용하기 위해 기본적인 내용만 적용
	 * @author won0334@ntrex on 2023.08.11
	 */
	let FCM = {
		SaveUrl : "/Alram/Token_Save",//저장
		DelUrl : "/Alram/Token_Del",//삭제
		init : () => {}
	};// End of Object : FCM

	/**
	 * 컨텐츠 준비되면 시작
	 * @author yds@ntrex on 2023.02.23
	 */
	$(document).ready(function() {
		SetHandlebarsHelper();
		//알람 목록 가져오기 won0334@ntrex
		if($("#alram_list").length > 0){
			let obj = $("#alram_list");
			obj.parent("li").children("a").click(() => {
				if(obj.hasClass("show") == false){
					let url = "/Alram/Alram_List_AsyncGet";
					getAjax(url, {page : 1, type : 'top'}, {
						success: (res) => {
							if(res.state == 0){
								CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(res));
							}else{
								let html = [];
								$.each(res.data.list, (idx, obj) => {
									if(obj.link_url != ''){
										html.push('<li><a class="nav-link" href="' + obj.link_url + '">' + obj.title + '</a></li>');
									}else{
										html.push('<li><a class="nav-link">' + obj.title + '</a></li>');
									}
								});
								html.push('<li><a class="nav-link" href="/Alram/Alram_List">전체보기</a></li>');

								obj.html(html.join(""));
							}
						},
						error: (res) => {
							CallCommonModal("호출 실패", url);
						}
					});
				}
			});
			//sse 호출 현재 - 1분 단위로 호출
			let alram_sse = $.SSE('/Alram/GetMessageCnt', {
				withCredentials: true, // CORS
				options: {
					forceAjax: false
				},
				onMessage: function(e) {
					var
						data = e.data || ''
						, response = JSON.parse(data)
						, abort = (response.abort || '') === 'Y'
						, cnt = response.cnt || 0
					;
					$("#alram_cnt").html(cnt);
					
					if (abort) {
						alram_sse.stop();
					}
				}
			});

			alram_sse.start();
		}

		//fcm push 처리 won0334@ntrex
		//firebase는 _base/head에서 불러온다.
		firebase.initializeApp(fb_config);
		let messaging = firebase.messaging();

		messaging.onMessage((payload) => {
			let toastDiv=[];
			let link_html = "";
			toastDiv.push('<div class="toast" role="alert" aria-live="polite" aria-atomic="true"  data-bs-autohide="false"  id="'+payload.fcmMessageId+'">');
			toastDiv.push('<div class="toast-header">');
			toastDiv.push('<strong class="me-auto fs-6">{0}</strong>'.format(payload.notification.title));
			toastDiv.push('<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>');
			toastDiv.push('</div>');
			if(payload.data.link != ""){
				link_html += "<br />";
				link_html += '<a href="'+payload.data.link+'">링크</a>';
			}
			toastDiv.push('<div class="toast-body">{0}{1}</div>'.format(payload.notification.body, link_html));
			toastDiv.push('</div>');
		
			$("#msg-toast-container").append(toastDiv.join(""));
			$("#msg-toast-container #"+payload.fcmMessageId).toast('show');
		});

		//자동 완성 기능 처리 won0334@ntrex
		if($("#s-goodsName").length){
			$('#s-goodsName').on("keyup", (e) => {
				if(e.keyCode  == 13){
					$("#search-goods").trigger("click");
					$("#s-goodsName").blur();
					$("#s-goodsName").focus();
				}
			});

			$('#s-goodsName').autocomplete({
				source : function(request, response) {
					$(document).ajaxStart(function () { LoadingScreen("hide"); });
					let result =  getAjax('/stock/GetAutoCompleteWord', {"search_word" : $('#s-goodsName').val()}, {
						success : function(data) {
							// 서버에서 json 데이터 response 후 목록 추가
							response(
								$.map(data.data, function(item) {
									return {
										value : item,
									}
								})
							);
							$(document).ajaxStart(function () { LoadingScreen("show"); });
						}
					});
				},
				delay : 1000,
				minLength: 2,
				select : function(event, ui) { // item 선택 시 이벤트
					//console.log(ui, event);
					$('#s-goodsName').val(ui.item.value);
					$("#search-goods").trigger("click");
				},
				focus : function(event, ui) {
					return false;
				},
			}).autocomplete('instance')._renderItem = function(ul, item) { // UI 변경 부
				const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
				var search_word = $('#s-goodsName').val().replace(reg,'');;
				var search_word_array = search_word.split(" ");
				var li_obj = $('<li>'); //기본 tag가 li
				var temp_value = item.value;

				if(search_word_array.length){//검색 단어를 공백 기준으로 잘라서 있으면 처리, 없으면 값이 없음이거나 오류 임으로 검색 결과를 그냥 표시
					for(var idx in search_word_array){
						$.trim(search_word_array[idx]);
						if(search_word_array[idx] != ""){//마지막 띄어쓰기등으로 인해 검색어에 공백이 들어 갈수 있음 공백은 처리 필요없음
							var temp_search_word = search_word_array[idx].trim();
							
							temp_value = temp_value.replace(temp_search_word.toLowerCase(), "<span style='color:red'>"+temp_search_word.toLowerCase()+"</span>");
							temp_value = temp_value.replace(temp_search_word.toUpperCase(), "<span style='color:red'>"+temp_search_word.toUpperCase()+"</span>");
						}
						temp_value = "<div>"+temp_value+"</div>";						
					}
					li_obj.append(temp_value);
				}else{
					li_obj.append('<div>' + item.value + '</div>')
				}

				return li_obj.appendTo(ul);
			};
		}
	});

	/**
	 * JSON 유무 판단
	 */
	function IsJsonString(str) {
		try {
			var json = JSON.parse(str);
			return (typeof json === 'object');
		} catch (e) {
			return false;
			
		}
	}

	/**
	 * 리스트 Pagination 처리
	 * @author yds@ntrex on 2023.02.2
	 * @param {object} pageset 페이징 정보
	 * 		- first : 첫 블록 시작 페이지 번호
	 * 		- last : 마지막 블록 마지막 페이지 번호
	 * 		- prev : 이전 블록 마지막 페이지 번호
	 * 		- next : 다음 블록 시작 페이지 번호
	 * 		- nowpage : 현재 페이지 번호
	 * 		- page : 현재 블록의 페이지 번호들 - json data ex) {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10}1
	 * 		- totalcount : 총 레코드 수
	 * 		- totalpage : 총 페이지 수
	 * @param {function} callback 함수
	 * @return {object} jQuery로 생성된 Pagination 객체
	 */
	function SetPagination(pageset, callback) {
		// Pagination 처리
		let page = $("<ul/>", {id:"pageination", class:"pagination justify-content-center row row-cols-auto"});
		let litmp = $('<li/>', {class:"page-item col mx-0 px-0"});
		let spantmp = $('<span/>', {class:"page-link"});			// 링크 없는 용도 원본
		let atmp = $('<a/>', {class:"page-link", role:"button"});	// 링크 용도 원본
		let linkset;	// 복제 후 값 지정된 링크

		// console.log("pageset", pageset, Object.values(pageset.page));

		// first block
		if (pageset.first == 0) {
			// 이동 페이지 없으므로 링크를 없애고 disabled class 추가
			linkset = litmp.clone().addClass("disabled").append(spantmp.clone().text("<<"));
		} else {
			linkset = litmp.clone().append(atmp.clone().data("page",  pageset.first).text("<<"));
		}
		page.append(linkset);

		// prev block
		if (pageset.prev == 0) {
			// 이동 페이지 없으므로 링크를 없애고 disabled class 추가
			linkset = litmp.clone().addClass("disabled").append(spantmp.clone().text("<"));
		} else {
			linkset = litmp.clone().append(atmp.clone().data("page", pageset.prev).text("<"));
		}
		page.append(linkset);

		// page in block
		$.each(Object.values(pageset.page), function(i,v) {
			//console.log(i, v);
			if (v == pageset.nowpage) {
				// 현재 페이지 표기를 위해 링크를 없애고 active class 추가
				linkset = litmp.clone().addClass("active").append(spantmp.clone().text(v));
			} else {
				linkset = litmp.clone().append(atmp.clone().data("page", v).text(v));
			}
			page.append(linkset);
		} );
		
		// next block
		if (pageset.next == 0) {
			// 이동 페이지 없으므로 링크를 없애고 disabled class 추가
			linkset = litmp.clone().addClass("disabled").append(spantmp.clone().text(">"));
		} else {
			linkset = litmp.clone().append(atmp.clone().data("page", pageset.next).text(">"));
		}
		page.append(linkset);

		// last block
		if (pageset.last == 0) {
			// 이동 페이지 없으므로 링크를 없애고 disabled class 추가
			linkset = litmp.clone().addClass("disabled").append(spantmp.clone().text(">>"));
		} else {
			linkset = litmp.clone().append(atmp.clone().data("page", pageset.last).text(">>"));
		}
		page.append(linkset);

		// 각 버튼에 클릭 이벤트로 callback 실행 추가
		let paginationNav = $("<nav aria-label='Search results pages'/>").append(page);
		paginationNav.find("a").on("click", function(e) {
			callback($(this).data("page"));
		});

		// 페이지네이션 반환
		return paginationNav;
	}	// End of Function : SetPagination

	
	/**
	 * form element to json
	 */
	jQuery.fn.serializeObject = function() {
		var obj = null;
		try {
			if (this[0].tagName && this[0].tagName.toUpperCase() == "FORM") {
				var arr = this.serializeArray();
				if (arr) {
					obj = {};
					jQuery.each(arr, function() {
						obj[this.name] = this.value;
					});
				}
			}
		} catch (e) {
			alert(e.message);
		} finally {}
	 
		return obj;
	};

	/**
	 * Loading Screen
	 */
	function LoadingScreen(type) {
		if (type == "show") {
			//$("body").css("overflow", "hidden");	// Ajax => Modal 순으로 호출되면 overflowrk Hidden으로 되는 현상이 있어 주석 처리 : yds@ntrex on 2023.05.25
			let height = $("body").prop("scrollHeight");
			$("#loading-backdrop").css("height", height).show();
		} else {
			//$("body").css("overflow", "auto");	// Ajax => Modal 순으로 호출되면 overflowrk Hidden으로 되는 현상이 있어 주석 처리 : yds@ntrex on 2023.05.25
			$("#loading-backdrop").hide();
		}
	}	// End of Function : LoadingScreen

	/**
	 * Ajax 호출 시작 / 종료 시 Loading Screen 처리
	 */
	$(document).ajaxStop(function () { LoadingScreen("hide"); });
	$(document).ajaxStart(function () { LoadingScreen("show"); });

	 /**
	  * Form 내부의 input에서 Enter로 submit 되는 것 막기
	  */
	 $(document).on("keydown", ":input:not(textarea)", function(event) {
		 if (event.key == "Enter" || event.keyCode === 13) {
			 event.preventDefault();
		 }
	 });

	/**
	 * Ajax 통신 결과의 에러 메시지 가공 반환
	 * @author yds@ntrex on 2023.03.13
	 * @param {object} resData JSON 응답
	 * @return {string} 에러 가공 메시지
	 */
	function AjaxErrorMessage(resData) {
		let content = "";
		if (resData.errors == undefined) {
			let error = resData.data.error;
			delete resData.data.error;
			content = " -- "+error+" -- <br>";
			content += Object.values(resData.data).map(function(r) { return " &nbsp; &nbsp; * " + r; }).join("<BR>");
		} else {
			content = " -- Error -- <br>";
			content += JSON.stringify(resData.errors);
		}
		return content;
	}	// End of Function : AjaxErrorMessage

	/**
	 * 문자열 포멧팅
	 */
	String.prototype.format = function() {
		var formatted = this;
		for (var i = 0; i < arguments.length; i++) {
			var regexp = new RegExp('\\{'+i+'\\}', 'gi');
			formatted = formatted.replace(regexp, arguments[i]);
		}
		return formatted;
	};

	/**
	 * jquery object 인지 확인
	 * @author won@ntrex on 2023.06.23
	 * @param {object} 확인 대상 object
	 * @return {boolean} jquery object 여부
	 */
	$.isJQueryObject = function(object) {
		try {
			return !!object && object instanceof jQuery;
		}
		catch(e) {
			return false;
		}
	};

	/**
	 * element 존재 여부 확인
	 * @author won@ntrex on 2023.06.23
	 * @return {boolean} element 존재 여부
	 */
	$.fn.isset = function() {
		return !!(this && this.length && (this[0] instanceof HTMLDocument || this[0] instanceof HTMLElement));
	};

	/**
	 * element 존재 여부 확인
	 * @author won@ntrex on 2023.06.23
	 * @param {string} 대상 selector 
	 * @return {boolean} element 존재 여부
	 */
	$.isset = function(selector) {
		return selector !== null && selector !== void 0 && !!selector && String(selector).length && ($.isJQueryObject(selector) ? selector.isset() : $(selector).isset());
	};

	/**
	 * form 초기화 처리 - 초기화시에 추가로 처리할 항목에 대해서는 차후에 추가 
	 * @author won@ntrex on 2023.06.23
	 * @param {object} 초기화할 폼 object
	 */
	$.formReset = function(form) {
		form = $.isJQueryObject(form) ? form : $(form);
		if ($.isset(form)) {
			form[0].reset();
			form.find('input[type="hidden"]').val('');
		}
	};

	/**
	 * 3자리마다 콤마 삽입
	 * @author yds@ntrex on 2023.11.15
	 */
	function NumberComma(value) {
		return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	// ----- 공통 사용 함수 정의 ------------------------------------------------------------------------- //
	/**
	 * Modal에서 Ajax 통신 결과 처리
	 * 	- 전달 받은 targetId Modal창을 숨김 처리 후 Modal 메시지 출력
	 * 	- 성공/에러 일 때를 구분하여 처리
	 * @author yds@ntrex on 2023.03.09
	 * @param {string} targetId '#'기호를 제외한 Object ID 값
	 * @param {object} resData Ajax 통신 응답 json 데이터
	 * @param {function} callback 처리 후 호출할 Function
	 */
	function AjaxResultModalProc(targetId, resData, callback) {
		let content = "";
		if (resData.state != 1) content = AjaxErrorMessage(resData);

		// 현재 모달 창 핸들러
		let target_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(targetId));
		if (resData.state != 1) {
			$('#common-modal').off('shown.bs.modal').on('shown.bs.modal', event => {
				target_modal.hide();
			});

			$('#common-modal').off('hidden.bs.modal').on('hidden.bs.modal', event => {
				target_modal.show();
			});
			
			CallCommonModal("통신 결과", content);
		} else {
			$('#common-modal').off('hidden.bs.modal').on('hidden.bs.modal', function() {
				if (typeof callback == "function") callback(resData.data);
			});
			target_modal.hide();
			$("#"+targetId+" form")[0].reset();
			CallCommonModal("통신 결과", "저장이 완료되었습니다.");
		}
	}	// End of Function : AjaxResultModalProc

	// javascript 동적 로드
	function loadScript(src) {
		return new Promise(function(resolve, reject) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = src;
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	/**
	 * form을 이용하여 엑셀 파일 다운로드 처리
	 * @author won@ntrex on 2024.12.18
	 * @param {object} option 옵션
	 */

	function getExcelDownForm(option){
		option = option || {};
		option = $.extend({
			form_name : "#sea-form",
			url : "",
			method : "post",
			target : "_blank"
		}, option);

		if(!option.url){
			Msgbox.Alert("url 정보가 존재하지 않습니다.");
			return false;
		}

		let alldata = $(option.form_name).serializeObject();	// 폼의 모든 항목을 Object로 반환 받기
		var $form = $('<form></form>');
		$(document.body).append($form);
		$.each(alldata, function(key, value){
			let confirmkey = key.split("s-");
			if (confirmkey.length == 2){
				$form.append($('<input/>', {type: 'hidden', name: 'where['+confirmkey[1]+']', value: value }));
			}
		});

		$form.attr('action', option.url);
		$form.attr('method', option.method);
		$form.attr('target', option.target);
		$form.submit();
		$form.remove();
	}

	/**
	 * Common Modal 타이들 & 내용 넣고 호출하기
	 */
	function CallCommonModal(title, contents, callback) {
		$('#common-modal .modal-title').html(title);
		$('#common-modal .modal-body').html(contents);
		var commonModal = new bootstrap.Modal($('#common-modal'), {backdrop: 'static'});
			commonModal.show();
		if (typeof callback == "function") {
			$('#common-modal').off("hidden.bs.modal").on("hidden.bs.modal", function(e) {
				//e.preventDefault();
				//e.stopPropagation();
				callback();
			});
		}

	}