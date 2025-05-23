/**
 * Input Tag에 자동완성 기능 부여
 *      - 특정 코드 항목(제조사, 매입처, 재고위치1, 재고위치2 등)을 다루는 Input 태그에 Autocomplete 기능 부여
 *      - 재고 위치 1, 2는 코드 선택용 뿐만 아이라 일부 문자를 넣고도 Like 검색이 되도록 지원 처리
 * @author yds@ntrex on 2024.06.07
 */
// (function($) {
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

	// css 동적 로드
	function loadCSS(href) {
		return new Promise(function(resolve, reject) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href + '?v=' + new Date().getTime();
			link.onload = resolve;
			link.onerror = reject;
			document.head.appendChild(link);
		});
	}

	// css 로드 여부
	function isCSSLoaded(href) {
		return Array.from(document.styleSheets).some(styleSheet => styleSheet.href && styleSheet.href.includes(href));
	}

	// jquery 로드 여부
	function isJQueryLoaded() {
		return typeof jQuery !== 'undefined';
	}

	// jquery ui 로드 여부
	function isJQueryUILoaded() {
		return typeof jQuery.ui !== 'undefined';
	}

	// autocomplete 기능을 jQuery 추가 모듈로 선언
	function definePlugin($) {
		// jquery 추가 함수로 선언
		$.fn.ajaxDebounceAutocomplete = function(options) {
			var settings = $.extend({
				url: '',
				delay: 500,		// 이벤트 발생 지연 주기
				minLength: 1,
				curpage: 1,		// 현재 요청 페이지 번호
				pageSet: null,	// more 버튼 처리용 페이지 세트 데이터
			}, options);

			return this.each(function() {
				// 할당된 input 지정
				let $input = $(this);

				// 사용할 값 지정
				let inputdata = $input.data();			// 화면에 표기 할 코드명 input의 data set
				//won@ntrex.co.kr 24.07.02 한페이지에서 같은 이름을 가지게 되는 문제점 있어서 속성값을 추가하여 이름을 달리 할수 있도록 수정
				let hiddenname = inputdata.hiddenname || "s-" + inputdata.type;	// 코드값 전달 할 input name

				// 검색용 코드값 저장용 hidden input 추가 / 할당
				$input.parent().append("<input type='hidden' name='" + hiddenname + "'>");
				let $hiddenInput = $("INPUT[name='" + hiddenname + "']");
				$hiddenInput.data("cname", "");

				// Ajax 호출용 데이터
				let reqdata = { "type": inputdata.type, "keyword": $input.val(), "page": 1 };

				// 통신 없이 재출력 위한 목록 저장 변수
				var storedData = [];    // 재출력용 수신 목록
				var lastTerm = '';      // 마지막 실행항 키워드
				var lastPage = 1;       // 마지막 처리한 페이지 번호
				var runstate = true;    // autocomplete 실행 상태

				// autocomplete 선언
				$input.autocomplete({
					source: function(request, response) {
						runstate = true;    // focus, click 이벤트 연달아 호출을 막기위해 진행 상태 지정

						if (storedData.length && request.term === lastTerm && settings.curpage == lastPage) {  // 같은 검색어, 같은 페이지번호이면 이전 목록 출력
							response(storedData);
						} else if (request.term == "<지정하지 않음>") { // "<지정하지 않음>"" 일 때 처리 안함
							response([]);
						} else { // 새로 불러올 상황이면 서버 통신
							if (request.term != lastTerm) settings.curpage = 1; // keyword 바뀌었으면 page = 1 로 첫 페이지 호출 지정
							reqdata.keyword = request.term; // Ajax용 keyword 항목 지정
							reqdata.page = settings.curpage; // Ajax용 page 항목 지정

							// 1페이지이면 totalcount 삭제, 아니면 추가
							if (reqdata.page == 1) {
								delete reqdata.totalcount;  // 서버로부터 페이징 정보를 획득하기 위해 삭제
							} else {
								reqdata.totalcount = settings.pageSet.totalcount;   // 지정시 DB에서 총 레코드 수를 읽지 않음
							}

							$.ajax({
								url: settings.url,
								method: 'POST',
								data: reqdata,
								dataType: 'json',
								headers: { "X-CSRFToken": csrftoken },
								success: function(data) {
									if (data.state == 1) {
										let processedData = data.data.list.map(item => ({
											label: item.name,               // 표시할 텍스트
											value: item.code,               // 선택 시 사용할 값
											itemstate: item.not_assigned    // 지정하지 않음 항목 여부 지정
										}));
										lastTerm = reqdata.keyword;    // 같은 keyword 체크용 이전 값
										lastPage = reqdata.page;
										settings.pageSet = data.data.pageset;   // pageset 지정
										if (data.data.pageset.nowpage == 1) {
											storedData = processedData; // 담아 둘 출력 목록 지정
										} else {
											storedData = storedData.concat(processedData); // 기존 데이터에 추가
										}
										response(storedData);
									} else {
										response([]);   // 에러로 목록 출력 안함
									}
								},
								error: function() {
									response([]);   // 에러로 목록 출력 안함
								}
							});
						}
					},
					search: function(event, ui) {
						// console.log("search:", $input.val());
					},
					delay: settings.delay,
					minLength: settings.minLength,
					open: function() {
						// autocomplete 출력 후 후처리할 대상 획득
						var $autocomplete = $input.autocomplete("widget");

						// close 버튼 추가
						if (!$autocomplete.find(".autocomplete-close").length) {
							var $closeButton = $('<div class="autocomplete-close">Close</div>');
							$autocomplete.append($closeButton);
							$closeButton.on("click", () => { $input.autocomplete("close"); });
						}
						// close 버튼 상단에 따라다니게 지정
						$autocomplete.on('scroll', () => { $closeButton.css('top', $autocomplete.scrollTop() + 5 + 'px'); });
						
						// 다음 페이지 존재시 더보기 버튼 추가 : 다음 페이지 존재 시
						if (settings.pageSet.totalpage > settings.curpage) {
							if (!$autocomplete.find("div[data-type='autocomplete_more']").length) {
								$autocomplete.append('<div class="w-100 text-center my-2"><div class="btn btn-sm btn-primary py-1" data-type="autocomplete_more">더 보기</div></div>');
								$("div[data-type='autocomplete_more']").on("click", function(event) {
									event.preventDefault(); // Prevents the select event
									settings.curpage += 1; // 다음 페이지로 설정
									$input.autocomplete('search', $input.val()); // 검색어를 사용하여 목록 업데이트
								});
							}
						}
					},
					close: function(e) {
						runstate = false;   // 진행상태 해제
					},
					select: function(event, ui) {
						event.preventDefault(); // 기본 동작 중지
						lastTerm = $input.val();            // 선택 값을 이전 항목으로 재지정 - 추후 재통신 막기 위해
						$hiddenInput.val(ui.item.value);    // 검색용 hidden 항목(input name이 's-' 로 시작하는 대상에 코드값 지정)
						$hiddenInput.data('cname', ui.item.label); // 실제 상품 목록 가져오기에서 재고위치의 like 처리할 값 비교용
						$input.val(ui.item.label);          // 검색용 표기 항목(코드명 지정)
					}
				});

				// input이 다시 focus 또는 click되었을 때 이전 데이터를 사용하여 목록을 표시
				$input.on('focus click', function(e) {
					// 이미 실행중이면 이벤트 중복으로 처리 안함
					if (runstate) return true;
					// 이미 조회 목록이 있고, keyword가 비어 있지 않으면 실행
					if (storedData.length && $input.val() != "") $input.autocomplete('search', $input.val());
					else if ($input.val() == "") {
						$hiddenInput.val("");    // 검색용 hidden 항목(input name이 's-' 로 시작하는 대상에 코드값 지정)
						$hiddenInput.data('cname', ""); // 실제 상품 목록 가져오기에서 재고위치의 like 처리할 값 비교용
					}
				});

				// input 대상에 입력이 되거나 지워지면 input 이벤트 발생(모바일도 된다고 함)
				// 코드를 선택했다가 입력값을 비우면 초기화 해야 하는데 입력 값이 비어 있으면 autocomplete 이벤트 발생하지 않아 여기서 초기화 함
				$input.on('input', function(e) {
					let chk = false;
					if ($input.val() == "") {
						// console.log("입력값이 초기화 되어 이전 지정된 값 삭제");
						chk = true;
					}
					if ($input.val() != $hiddenInput.data('cname') && $hiddenInput.data('cname') != "") {
						// console.log("입력값이 바뀌어서 이전 지정된 값 삭제");
						chk = true;
					}
					if (chk) {
						$hiddenInput.val("");    // 검색용 hidden 항목(input name이 's-' 로 시작하는 대상에 코드값 지정)
						$hiddenInput.data('cname', ""); // 실제 상품 목록 가져오기에서 재고위치의 like 처리할 값 비교용
					}
				});

				// 특정 조건에 맞는 항목에 색을 지정하는 renderItem 함수
				$input.autocomplete("instance")._renderItem = function(ul, item) {
					var $li = $("<li>")
						.append("<div>" + item.label + "</div>")
						.appendTo(ul);
					if (item.itemstate == 'y') {
						$li.css({ "background-color": "#4FA3F7", "color": "white" }); // 강조할 항목의 배경색을 지정
					}
					return $li;
				};
			});
		};
	}

	// 필요한 jQuery, jQuery-ui, autocomplete 추가 css 로딩 처리
	var loadDependencies = async function() {
		return new Promise(function(resolve) {
			if (!isJQueryLoaded()) {
				loadScript('/assets/_jquery/jquery-3.5.1.min.js').then(resolve);
			} else {
				resolve();
			}
		}).then(function() {
			return new Promise(function(resolve) {
				if (!isJQueryUILoaded()) {
					loadScript('/assets/_jqueryui/jquery-ui.min.js').then(function() {
						loadCSS('/assets/_jqueryui/jquery-ui.min.css').then(resolve);
					});
				} else {
					resolve();
				}
			});
		}).then(function() {
			return new Promise(function(resolve) {
				if (!isCSSLoaded('/assets/css/inputAutoComplete.css')) {
					loadCSS('/assets/css/inputAutoComplete.css').then(resolve);
				} else {
					resolve();
				}
			});
		});
	};


	definePlugin(jQuery);

	// 위 로딩 완료 후 커스텀 autocomplete 플러그인 등록
	loadDependencies().then(function() {
		// 외부에서 사용할 수 있는 콜백 호출(goods_order.js에서 지정해서 쓰고 있음)
		if (window.ajaxDebounceAutocompleteInit) {
			// definePlugin 실행 완료 되기 전에 호출되는 현상이 있어 시간 지연 시킴
			setTimeout(()=>{window.ajaxDebounceAutocompleteInit()}, 500);
		}
	}).catch(function(error) {
		console.error('Error loading dependencies:', error);
	});


// })();
