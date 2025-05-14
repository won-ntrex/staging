/**
 * 사이드바 스크립트
 * @author yds@ntrex on 2023.02.16
 */

$(document).ready(function() {
	// 사이드바 영역 접기/펼치기
		$('#LeftSideBarBtn').on('click', function() {
			$('.leftsidebar').toggleClass('reduce');
			$(this).toggleClass('active');
			$('#TopMoveBtn').toggleClass("left");
		});

	// // 사이드바 내부의 큰 메뉴의 접기/펼치기 아이콘 변경
	// 	$("#LeftSideBar > ul > li > button").on('click', function () {
	// 		if ($(this).attr("aria-expanded") == "false") {
	// 			$(this).find("span.sidebar_icon_right .fold").addClass('fa-angle-down').removeClass("fa-angle-up");
	// 		} else {
	// 			$(this).find("span.sidebar_icon_right .fold").addClass('fa-angle-up').removeClass("fa-angle-down");
	// 		}
	// 	});	

	//하단 Top 버튼
		$("#TopMoveBtn").on("click", function() { $('html, body').scrollTop(0); });

	// Icon Tooltip
		$(".leftsidebar span[data-bs-toggle=tooltip]").tooltip();


	// ----- 메인 메뉴 속성 변경 감지 처리 -----------------------------
	let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver = new MutationObserver(mutationHandler);
	let obsConfig = {attributes: true};
	// let targetNodes = $("#LeftSideBar > ul > li > button");
	let targetNodes = $("#LeftSideBar > ul li button").filter("[aria-expanded]");
		targetNodes.each(function() {
			myObserver.observe(this, obsConfig);
		});

	// 속성 감지용 Callback
	function mutationHandler(mutationRecords) {
		//console.info("mutationHandler:");
		mutationRecords.forEach(function(mutation) {
			//console.log(mutation.type, mutation.attributeName);
			if (mutation.type == "attributes" && mutation.attributeName == "aria-expanded") {
				// 메인 메뉴의 접기/펼치기 아이콘 변경
				let _targert = $(mutation.target);
				if (_targert.attr("aria-expanded") == "false") {
					_targert.find("span.sidebar_icon_right .fold").addClass('fa-angle-down').removeClass("fa-angle-up");
				} else {
					_targert.find("span.sidebar_icon_right .fold").addClass('fa-angle-up').removeClass("fa-angle-down");
				}
			}
		});
	}	// End of Function : mutationHandler

	// 해당 메뉴용 Url 획득 / 선택 처리
	//won@ntrex.co.kr 25.02.12 url마지막에 /로 끝날경우 마지막 배열이 공백으로 생성되는 현상 있어서 수정
		let now_url = "";
		let lastChar = $.ddUrl.current.path.slice(-1); 
		if(lastChar == '/'){
			now_url = $.ddUrl.current.path.slice(0, -1);
		}else{
			now_url = $.ddUrl.current.path;
		}

		let pathdivide = now_url.split("/");
		if (pathdivide[0] == "") pathdivide.shift();	// 첫번째 "/" 때문에 생긴 빈값 배열요소 삭제
		let lootmenu = pathdivide[0];
		let submenu = pathdivide.slice(-1).pop();	// URL 뒷 요소 선택

		//won@ntrex.co.kr 25.02.12 특정 페이지가 메뉴와 상관 없이 접근이 되는 경우가 있어 메뉴 활성화가 동작하지 않는 현상으로 인해 수정
		switch(submenu){
			case 'PlacingOrderMake_DP':
				submenu = "PlacingOrderReqList_DP";
				break;
		}
		
		if (lootmenu != submenu) {
			$("#M_"+submenu).parents("div.collapse").collapse("show");	// 메인 메뉴 선택
			$("#M_"+submenu).addClass("active");	// 서브 메뉴 선택
		} else {
			$("#LeftSideBar ul li:eq(0) > button").click();	// 첫 번째 메인 메뉴 오픈
		}

	// Scroll에 따른 sidebar 메뉴 포지션 / Top 버튼 처리
	$(window).scroll(function () {
		let winPos = $(window).scrollTop();

		// ----- Top 버튼 -----
		let tPos = $('#TopMoveBtn').offset().top;			// Top 버튼 위치
		let fPos = Math.floor($("#footer").offset().top);	// footer 위치

		// visibility change
		if ( tPos >= (tPos - winPos) + 54 )  $('#TopMoveBtn').addClass("shown");
		else  $('#TopMoveBtn').removeClass("shown");
		// bottom change
		if ( tPos >= fPos - 130) $('#TopMoveBtn').addClass("up");
		else $('#TopMoveBtn').removeClass("up");
	});	// End of Block : window.scroll

});	// End of Block : document.ready
