let PRICEHISTORY = {
	ListUrl : '/Stock/PriceHistory_AsyncGet',//리스트 
	ExcelUrl : '/Stock/PriceHistory_Excel',
	init : () => {
		// 검색 버튼 클릭
		$("#search-button").on("click", (e) => { 
			let result =  getAjax(PRICEHISTORY.ListUrl, $("#search-form").serialize());
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
					}else{
						CallCommonModal("통신 결과", '검색 결과가 없습니다.');
					}
				}
			})		
		});
		// $("#keyword-good-name").on("click", () =>{
		// 	let result =  getAjax(PRICEHISTORY.ListUrl, $("#search-form").serialize());
		// 	result.then((resData) => {
		// 		if (resData.state != 1) {
		// 			CallCommonModal("통신 결과", resData.data);
		// 		} else {

		// 		}
		// 	}).catch((resData) => {
		// 		CallCommonModal("통신 결과", "처리가 실패하였습니다.");
		// 	});			
		// });
	},
};

$(() =>{
	// 첫 페이지 호출 / 화면 출력
	PRICEHISTORY.init();

	// https://uxsolutions.github.io/bootstrap-datepicker
	$('#s-sday, #s-eday').datepicker(defaultDatePickerOption);//datepicker end

});