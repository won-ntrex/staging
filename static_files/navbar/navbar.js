/**
 * Navbar 스크립트
 * @author yds@ntrex on 2023.02.16
 */

$(document).ready(function() {
	/*
	// https://www.jqueryscript.net/other/parse-url.html 참고
	console.log($.ddUrl.current);
	console.log($.ddUrl.current);
	console.log($.ddUrl.current.full);
	console.log($.ddUrl.current.protocol);
	console.log($.ddUrl.current.host);
	console.log($.ddUrl.current.port);
	console.log($.ddUrl.current.relative);
	console.log($.ddUrl.parse('https://www.google.com'));
	console.log($.ddUrl.parseQuery('param1=value1&param2=value2'));
	*/

	/**
	 * navbar 선택된 항목에 css active 지정 
	 * 	페이지가 갱신되어 들어오는 기준으로 PATH 기준 선택 부여
	 *  won@@ntrex.co.kr 24.06.11 메뉴에 따라 연결되는 controller가 여러가지일때가 있어서 배열 형태로 처리되도록 수정
	 */
	let now_url_first = $.ddUrl.parsePath($.ddUrl.current.path)[0] || '';
	$("#TopNavBar ul li a").each(function() {
		var match_url = $(this).data('match-url');
		var now_obj = $(this);
		if(match_url){
			var match_first_array = match_url.split(",");
			$.each(match_first_array, function(idx, match){
				if($.trim(now_url_first) == $.trim(match)){
					if(now_url_first == 'help'){
						if (now_obj.closest("li.nav-item").hasClass("dropdown")) {
							now_obj.closest("li.nav-item").addClass('active');
						}
					}else{
						now_obj.closest('li').addClass('active');
					}
				}
			});
		}
		// console.log(match_url_array);
		// if ($(this).attr("href") == $.ddUrl.current.path || ($(this).attr("href") == "/Main" && $.ddUrl.current.path == "/" )) {
		// 	$(this).closest('li').addClass('active');
		// }
		// console.log("------>", $(this).attr("href"), $.ddUrl.current.path, $.ddUrl.current.path.indexOf('help'));
		// if (
		// 	$(this).attr("href") == $.ddUrl.current.path
		// 	&& $.ddUrl.current.path.indexOf('help') != -1
		// 	&& $(this).attr("href") && $(this).attr("href").indexOf('help') != -1
		// ) {
		// 	console.log($(this).closest("li.nav-item"), $(this).closest("li.nav-item").hasClass("dropdown"))

		// 	if ($(this).closest("li.nav-item").hasClass("dropdown")) {
		// 		$(this).closest("li.nav-item").addClass('active');
		// 		$(this).closest("li").addClass('active');
		// 	}
		// }
	});

});