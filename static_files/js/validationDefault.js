$(() =>{
    jQuery.validator.setDefaults({
        // 메시지를 담을 요소(Tag)명
        errorElement: "em",
        // [Submit Event Callback] 검증 성공 시 메시지-label(em)-과 해당 검증 항목-element-을 인자로 호출
        success: function ( label, element ) {
            // 메시지 출력 영역 삭제
            label.remove();	// 추가된 항목(em)이 존재 한다면 삭제 시킴
        },
        // [Submit Event Callback] 검증 성공 시 메시지-label(em)-과 해당 검증 항목-element-을 인자로 호출
        errorPlacement: function ( label, element ) {
            // 메시지 출력 영역 추가
            label.addClass( "invalid-feedback" );
            if ($(label).attr("id") == "form-state-error") {
                label.css({"position":"relative", "bottom":"5px", "top":"-10px"}).insertAfter( $(element).closest("div.vtable") );
            } else {
                label.insertAfter( element );
            }
        },
        // [Key Event Callback] 검증 실패 시 해당 검증 항목을 element 요소로 호출됨
        highlight: function ( element, errorClass, validClass ) {
            if ($(element).attr("name") == "form-state") {
                $("input[name='form-state']").removeClass( "is-valid" ).addClass("is-invalid");
            } else {
                $( element ).removeClass( "is-valid" ).addClass("is-invalid");
            }
        },
        // [Key Event Callback] 검증 성공 시 해당 검증 항목을 element 요소로 호출됨
        unhighlight: function (element, errorClass, validClass) {
            if ($(element).attr("name") == "form-state") {
                $("input[name='form-state']").removeClass( "is-invalid" ).addClass("is-valid");
            } else {
                $( element ).removeClass( "is-invalid" ).addClass("is-valid");
            }
        }
    });

    // https://velog.io/@jangws/JS-%EC%A0%95%EA%B7%9C%ED%91%9C%ED%98%84%EC%8B%9D%ED%8A%B9%EC%88%98%EB%AC%B8%EC%9E%90-%EC%88%AB%EC%9E%90-%EB%93%B1-6766k8d6
    // jQuery-Validation plugin용 정규식 체크 함수 추가
    if ( ! $.isFunction( $.validator.methods.regexp )) {
        $.validator.addMethod("regexp", function(value, element, regexp) {
            let re = new RegExp(regexp, 'g');
            let res = re.test(value);
            return res;
        });
    }
    // jQuery-Validation plugin용 정규식 체크 / 빈 문자열은 스킵 함수 추가
    if ( ! $.isFunction( $.validator.methods.regexp_empty )) {
        $.validator.addMethod("regexp_empty", function(value, element, regexp) {
            let re = new RegExp(regexp, 'g');
            let res = true;
            if (value !== "") {
                res = re.test(value);
            }
            return res;
        });
    }
});