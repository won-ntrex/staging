var today = new Date();
var year = today.getFullYear().toString(); // 년도
var month = (today.getMonth() + 1).toString();  // 월
var date = today.getDate().toString();  // 날짜
var hours = today.getHours().toString(); // 시
var minutes = today.getMinutes().toString();  // 분
var seconds = today.getSeconds().toString();  // 초
var date_string = year+month+date+hours+minutes+seconds;

$(()=>{
    //확장판 name[] 처리 
    $.extend( $.validator.prototype, {
        checkForm: function () {
            this.prepareForm();
            for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                if (this.findByName(elements[i].name).length != undefined && this.findByName(elements[i].name).length > 1) {
                    for (var cnt = 0; cnt < this.findByName(elements[i].name).length; cnt++) {
                        this.check(this.findByName(elements[i].name)[cnt]);
                    }
                } else {
                    this.check(elements[i]);
                }
            }

            return this.valid();
        }
    });

    switch(excel_type){
        case 'import':
            var excel_data = [['디바이스마트상품번호', '입고가', '입고수량']];
            var filename = "import_excel_" +date_string+".xlsx";
            break;
        case 'export':
            var excel_data = [['디바이스마트상품번호', '출고가', '출고수량']];
            var filename = "export_excel_" +date_string+".xlsx";
            break;
        case 'stock':
            var excel_data = [['디바이스마트상품번호', '변경수량']];
            var filename = "stock_excel_" +date_string+".xlsx";
            break;										
    }

    // 일괄등록 Excel 양식 다운로드 Button Click Event
    $("#excelDown").off("click").on("click", () => {
        /* original data */
        var ws_name = today.toISOString().substring(0, 10);//탭명
        var wscols = [// "pixels"
            {wpx: 130}, {wpx: 130}, {wpx: 60}, {wpx: 60}
        ];

        var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(excel_data);
        ws['!cols'] = wscols;	// CELL Width 지정

        /* add worksheet to workbook */
        XLSX.utils.book_append_sheet(wb, ws, ws_name);
        
        /* write workbook */
        XLSX.writeFile(wb, filename);
    });	

    //엑셀 파일 업로드
    $("#excelUpload").on("click", (e) => {
        var formData = new FormData();
        // Modal Show
        $('#excel-modal').modal("show");

        let validator = $('#excel-modal-form').validate($.extend( {
            rules: {
                "excel_file": {
                    required: true,
                },
            },
            messages: {
                "excel_file": {
                    required: "* 필수 항목입니다.",
                },
            },	
            submitHandler:  (form) => {
                let fldFileName = $('#excel_file')[0].files[0]; 
                let excel_type = $("#excel_type").val();
                let targetModal = $(form).closest(".modal");
                formData.append('excel_file', fldFileName);
                formData.append('excel_type', excel_type);

                $.formReset(form);
                $("#excel_type").val(excel_type);//폼에서 excel type은 페이지 로드시에 설정해주는건데 처리 완료후 폼 초기화 하면서 값이 삭제됨으로 페이지 새로고침 없이 업로드 재실행하면 값이 없는 상태로 오류남 그래서 재설정							
                targetModal.modal("hide");
                checkExcelData(formData);

                return false;
            }		
        }));		

    });

    function checkExcelData(formData){
        //엑셀 파일에 등록된 상품에 대해 옵션 여부를 확인
        let check_result =  getAjax("/Stock/ExcelUploadCheck", formData, {
            cache: false,
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data'
        });
        
        check_result.then((checkResData) => {
            if (checkResData.state != 1) {
                CallCommonModal("엑셀 상품 확인 실패", checkResData != false ? AjaxErrorMessage(checkResData) : {});
            } else {
                let confirmMsg = "";
                confirmMsg += "옵션이 없는 상품 : " + checkResData.data.normal.length + "<br />";
                confirmMsg += "옵션이 있는 상품 : " + checkResData.data.option.length + "<br />";
                if(checkResData.data.option.length > 0){
                    confirmMsg += "옵션이 있는 상품이 있을 경우 옵션을 선택해야 합니다. <br />업로드 후에 옵션이 없는 상품은 일괄 처리, 옵션이 있는 상품은 리스트에 표시됩니다.<br />";
                }else{
                    confirmMsg += "옵션이 있는 상품이 없을 경우 일괄 처리가 진행됩니다.<br />";
                }
                confirmMsg += "등록 하시겠습니까?";
                MsgBox.Confirm(confirmMsg, () =>{
                    //옵션이 없는 상품이 있을 경우에만 업로드 처리
                    if(checkResData.data.normal.length > 0){
                        let result =  getAjax("/Stock/ExcelUpload", formData, {
                            cache: false,
                            contentType: false,
                            processData: false,
                            enctype: 'multipart/form-data'
                        });
                        
                        result.then((resData) => {
                            if (resData.state != 1) {
                                CallCommonModal("엑셀 일괄 처리 실패", resData != false ? AjaxErrorMessage(resData) : {});
                            } else {
                                let result_message = [];
                                result_message.push("성공 : "+resData.data.complete_goods);
                                result_message.push("실패 : "+resData.data.fail_goods);
                                result_message.push(resData.data.complete_message);
                                result_message.push(resData.data.fail_message);

                                MsgBox.Alert(result_message.join("<br />"));
                            }
                        }).catch((resData) => {
                            CallCommonModal("엑셀 일괄 처리 실패", resData != false ? AjaxErrorMessage(resData) : {});
                        });	
                    }
                    //옵션이 있는 상품이 있을 경우에는 리스트에 옵션 선택 할 수 있게 표시
                    if(checkResData.data.option.length > 0){
                        let option_goods_result =  getAjax("/Stock/excel_List_UI2_AsyncGet", {"goods_arr" : checkResData.data.option});
                        option_goods_result.then((option_goodsResData) => {
                            if (option_goodsResData.state != 1) {
                                CallCommonModal("엑셀 일괄 옵션 상품 처리 실패", option_goods_result != false ? AjaxErrorMessage(option_goods_result) : {});
                            } else {
                                // 코드 정리 => {코드:코드명, ...} or {코드:{name:이름, id:아이디}, ...}
                                let codes = GoodsInfoCodes(option_goodsResData.data);

                                // 출력 Data 편집 - 우선 상품의 출고 기본정보 지정
                                let outdata = option_goodsResData.data.list.reduce((a, c)=>{
                                    // 상품별로 상품, 옵션, 재고 원본 분류
                                    let procdata = {};
                                    procdata.goods = c;
                                    procdata.goods.link_goods_seq = procdata.goods.goods_seq;
                                    
                                    procdata.opts = option_goodsResData.data.opts.filter(function (el) {
                                        return el.stock_goods_seq == c.stock_goods_seq;
                                    });
                                    procdata.stocks = option_goodsResData.data.stocks.filter(function (el) {
                                        return el.stock_goods_seq == c.stock_goods_seq;
                                    });
                                    
                                    // 출력용 정보 가공
                                    let tmp = GoodsInfoProcess(procdata.goods, codes, procdata);
                                    tmp.sheet_data = c.sheet_data;
                                    // 반환 값으로 추가
                                    a.push(tmp);				

                                    return a;
                                }, []);

                                let val_rules = {};
                                switch(excel_type){
                                    case 'import':
                                        val_rules = {
                                            rules: {
                                                "stock_opt_seq[]": {
                                                    required: true,
                                                },
                                                "stock[]": {
                                                    required: true,
                                                },
                                            },
                                            messages: {
                                                "stock_opt_seq[]": {
                                                    required: "* 필수 항목입니다.",
                                                },
                                                "stock[]": {
                                                    required: "* 필수 항목입니다.",
                                                },
                                            },	
                                            submitHandler:  (form) => {
                                                var sendData = [];
                                                $.each($("#hb-target-goods-excel-list-object").find("tr"), function(key, obj){
                                                    sendData.push({
                                                        "stock_goods_seq" : $(obj).data("stock-goods-seq"),
                                                        "stock_opt_seq" : $(obj).find("select[name='stock_opt_seq[]']").val(),
                                                        "supply_price" : $(obj).find("input[name='supply_price[]']").val() ? $(obj).find("input[name='supply_price[]']").val() : "",
                                                        "stock" : $(obj).find("input[name='stock[]']").val(),
                                                    });
                                                });
                                                
                                                let excel_send_result =  getAjax("/Stock/ExcelOptionUpload", {"excel_type" : excel_type, "send_data" : sendData});
                                                excel_send_result.then((excel_send_result) => {
                                                    if (excel_send_result.state != 1) {
                                                        CallCommonModal("옵션 상품 처리 실패", excel_send_result != false ? AjaxErrorMessage(excel_send_result) : {});
                                                    } else {
                                                        $('#excel-goods-modal').modal("hide");
                                                        $('#hb-target-goods-excel-list-object').html("");

                                                        let result_message = [];
                                                        result_message.push("성공 : "+excel_send_result.data.complete_goods);
                                                        result_message.push("실패 : "+excel_send_result.data.fail_goods);
                                                        result_message.push(excel_send_result.data.complete_message);
                                                        result_message.push(excel_send_result.data.fail_message);

                                                        MsgBox.Alert(result_message.join("<br />"));
                                                    }	
                                                });
                                                return false;
                                            },
                                             // 에러 발생시 이벤트를 가로 챔
                                            showErrors : function(errorMap, errorList) {
                                                let error_message = "";
                                                if(errorList.length){
                                                    $.each(errorList, (key, emessage) => {
                                                        error_message += emessage.message + "<br />";
                                                    });
                                                    $("#excel_error_base").html(error_message).show();
                                                }else{
                                                    error_message = ""
                                                    $("#excel_error_base").html("").hide();
                                                }
                                            }  
                                        };
                                        break;
                                    case 'export':
                                        val_rules = {
                                            rules: {
                                                "stock_opt_seq[]": {
                                                    required: true,
                                                },
                                                "stock[]": {
                                                    required: true,
                                                },
                                            },
                                            messages: {
                                                "stock_opt_seq[]": {
                                                    required: "* 필수 항목입니다.",
                                                },
                                                "stock[]": {
                                                    required: "* 필수 항목입니다.",
                                                },
                                            },	
                                            submitHandler:  (form) => {
                                                var sendData = [];
                                                $.each($("#hb-target-goods-excel-list-object").find("tr"), function(key, obj){
                                                    sendData.push({
                                                        "stock_goods_seq" : $(obj).data("stock-goods-seq"),
                                                        "stock_opt_seq" : $(obj).find("select[name='stock_opt_seq[]']").val(),
                                                        "supply_price" : $(obj).find("input[name='supply_price[]']").val() ? $(obj).find("input[name='supply_price[]']").val() : "",
                                                        "stock" : $(obj).find("input[name='stock[]']").val(),
                                                    });
                                                });
                                                
                                                let excel_send_result =  getAjax("/Stock/ExcelOptionUpload", {"excel_type" : excel_type, "send_data" : sendData});
                                                excel_send_result.then((excel_send_result) => {
                                                    if (excel_send_result.state != 1) {
                                                        CallCommonModal("옵션 상품 처리 실패", excel_send_result != false ? AjaxErrorMessage(excel_send_result) : {});
                                                    } else {
                                                        $('#excel-goods-modal').modal("hide");
                                                        $('#hb-target-goods-excel-list-object').html("");

                                                        let result_message = [];
                                                        result_message.push("성공 : "+excel_send_result.data.complete_goods);
                                                        result_message.push("실패 : "+excel_send_result.data.fail_goods);
                                                        result_message.push(excel_send_result.data.complete_message);
                                                        result_message.push(excel_send_result.data.fail_message);

                                                        MsgBox.Alert(result_message.join("<br />"));
                                                    }	
                                                });
                                                return false;
                                            },
                                             // 에러 발생시 이벤트를 가로 챔
                                            showErrors : function(errorMap, errorList) {
                                                let error_message = "";
                                                if(errorList.length){
                                                    $.each(errorList, (key, emessage) => {
                                                        error_message += emessage.message + "<br />";
                                                    });
                                                    $("#excel_error_base").html(error_message).show();
                                                }else{
                                                    error_message = ""
                                                    $("#excel_error_base").html("").hide();
                                                }
                                            }  
                                        };
                                        break;
                                    case 'stock':		
                                        val_rules = {
                                            rules: {
                                                "stock_opt_seq[]": {
                                                    required: true,
                                                },
                                                "stock[]": {
                                                    required: true,
                                                },
                                            },
                                            messages: {
                                                "stock_opt_seq[]": {
                                                    required: "* 필수 항목입니다.",
                                                },
                                                "stock[]": {
                                                    required: "* 필수 항목입니다.",
                                                },
                                            },	
                                            submitHandler:  (form) => {
                                                var sendData = [];
                                                $.each($("#hb-target-goods-excel-list-object").find("tr"), function(key, obj){
                                                    sendData.push({
                                                        "stock_goods_seq" : $(obj).data("stock-goods-seq"),
                                                        "stock_opt_seq" : $(obj).find("select[name='stock_opt_seq[]']").val(),
                                                        "stock" : $(obj).find("input[name='stock[]']").val(),
                                                    });
                                                });
                                                
                                                let excel_send_result =  getAjax("/Stock/ExcelOptionUpload", {"excel_type" : excel_type, "send_data" : sendData});
                                                excel_send_result.then((excel_send_result) => {
                                                    if (excel_send_result.state != 1) {
                                                        CallCommonModal("옵션 상품 처리 실패", excel_send_result != false ? AjaxErrorMessage(excel_send_result) : {});
                                                    } else {
                                                        $('#excel-goods-modal').modal("hide");
                                                        $('#hb-target-goods-excel-list-object').html("");

                                                        let result_message = [];
                                                        result_message.push("성공 : "+excel_send_result.data.complete_goods);
                                                        result_message.push("실패 : "+excel_send_result.data.fail_goods);
                                                        result_message.push(excel_send_result.data.complete_message);
                                                        result_message.push(excel_send_result.data.fail_message);

                                                        MsgBox.Alert(result_message.join("<br />"));
                                                    }	
                                                });
                                                return false;
                                            },
                                             // 에러 발생시 이벤트를 가로 챔
                                            showErrors : function(errorMap, errorList) {
                                                let error_message = "";
                                                if(errorList.length){
                                                    $.each(errorList, (key, emessage) => {
                                                        error_message += emessage.message + "<br />";
                                                    });
                                                    $("#excel_error_base").html(error_message).show();
                                                }else{
                                                    error_message = ""
                                                    $("#excel_error_base").html("").hide();
                                                }
                                            }  
                                        };
                                        break;											
                                }

                                // 상품리스트 화면 출력
                                hbs("hb-source-goods-excel-object", outdata, "hb-target-goods-excel-list-object", true, async ()=>{
                                    // 이미지 팝업용 모달 이벤트 : 화면 출력 전 이미지 교체 지정 실행
                                    ImgModalImageChange();
                                    $('#excel-goods-modal').modal("show");
                                    $("select[name='stock_opt_seq[]']").select2({
                                        dropdownParent: $('#excel-goods-modal')
                                    });
                                    var excel_validator = $('#excel_insert_form').validate($.extend( 
                                        val_rules
                                    ));
                                });
                            }
                        });
                    }
                });
            }
        }).catch((checkResData) => {
            CallCommonModal("통신 결과", "처리가 실패하였습니다.");
        });
    }
});