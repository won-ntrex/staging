class MyUploadAdapter {
    constructor( loader ) {
        // The file loader instance to use during the upload.
        this.loader = loader;
		this.url = '/Board/Upload_Image';
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
                this._initRequest();
                this._initListeners( resolve, reject, file );
                this._sendRequest( file );
            } ) );
    }

    // Aborts the upload process.
    abort() {
        if ( this.xhr ) {
            this.xhr.abort();
        }
    }

    // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();

		//xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
        //xhr.setRequestHeader('Authorization', getToken()) 요청시 헤더 추가등을 수행해야 할때

        // Note that your request may look different. It is up to you and your editor
        // integration to choose the right communication channel. This example uses
        // a POST request with JSON as a data structure but your configuration
        // could be different.
        xhr.open( 'POST', this.url, true );
        xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners( resolve, reject, file ) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${ file.name }.`;

        xhr.addEventListener( 'error', () => reject( genericErrorText ) );
        xhr.addEventListener( 'abort', () => reject() );
        xhr.addEventListener( 'load', () => {
            const response = xhr.response;

            // This example assumes the XHR server's "response" object will come with
            // an "error" which has its own "message" that can be passed to reject()
            // in the upload promise.
            //
            // Your integration may handle upload errors in a different way so make sure
            // it is done properly. The reject() function must be called when the upload fails.
            if ( !response || response.error ) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }

            // If the upload is successful, resolve the upload promise with an object containing
            // at least the "default" URL, pointing to the image on the server.
            // This URL will be used to display the image in the content. Learn more in the
            // UploadAdapter#upload documentation.
            resolve( {
                default: response.data.url
            } );
        } );

        // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
        // properties which are used e.g. to display the upload progress bar in the editor
        // user interface.
        if ( xhr.upload ) {
            xhr.upload.addEventListener( 'progress', evt => {
                if ( evt.lengthComputable ) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            } );
        }
    }

    // Prepares the data and sends the request.
    _sendRequest( file ) {
        // Prepare the form data.
        const data = new FormData();

        data.append( 'upload', file );
		data.append('board_id', 'notice');
		data.append('file_info_ref', $("#file_info_ref").val());

        // Important note: This is the right place to implement security mechanisms
        // like authentication and CSRF protection. For instance, you can use
        // XMLHttpRequest.setRequestHeader() to set the request headers containing
        // the CSRF token generated earlier by your application.

        // Send the request.
        this.xhr.send( data );
    }
}

let NOTICE = {
		ListUrl : '/Board/Notice_List_AsyncGet',//리스트 
		DataUrl : '/Board/Notice_Data',//개별 게시물 
		SaveUrl : "/Board/Notice_Save",//저장
		UpdateUrl : "/Board/Notice_Update",//수정
		DelUrl : "/Board/Notice_Delete",//삭제
		GetFileRefUrl: '/board/GetFileRef',//파일 참조 정보
		editor : null,
		init : () => {
			// 검색 버튼 클릭
			$("#search-button").on("click", (e) => { NOTICE.GetList(1); });

			// 추가 버튼 클릭
			$("#new-button").on("click", (e) => { NOTICE.ModalOpen("new"); });

			ClassicEditor.create( document.querySelector( '#contents' ) , {
				language:'ko'
			}).then( editor => {
				editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {//custorm upload adapter 등록하기
					return new MyUploadAdapter( loader );
				};

				//https://www.npmjs.com/package/ckeditor5-image-remove-event-callback-plugin?activeTab=code
				editor.model.document.on('change:data', (event, data) => {
					let elementTypes = [
						'image',
						'imageBlock',
						'inlineImage',
					]

					let differ = event.source.differ

					// if no difference
					if (differ.isEmpty) {
						return;
					}

					let changes = differ.getChanges({
						includeChangesInGraveyard: true
					});

					if (changes.length === 0) {
						return;
					}

					let hasNoImageRemoved = true

					// check any image remove or not
					for (let i = 0; i < changes.length; i++) {
						let change = changes[i]
						// if image remove exists
						if (change && change.type === 'remove' && elementTypes.includes(change.name)) {
							hasNoImageRemoved = false
							break
						}
					}

					// if not image remove stop execution
					if (hasNoImageRemoved) {
						return;
					}

					// get removed nodes
					let removedNodes = changes.filter(change => (change.type === 'insert' && elementTypes.includes(change.name)))
					removedNodes.forEach(node => {
						let removedNode = node.position.nodeAfter
						let img_name = removedNode.getAttribute('src').replace(/^.*\//, '');
						let img_list = $("#img_del_list").val();
						img_list = img_list + img_name + "|";
						$("#img_del_list").val(img_list);
					})
				});

				NOTICE.editor = editor;
            } );

			NOTICE.GetList(1);//최초 페이지 로드
		},
		setValidation: (targetForm, url, option) => {
			option = option || {};
			let validator = targetForm.validate($.extend( {
				rules: {
					"title": {
						required: true,
					},
					"contents": {
						required: true
					},
				},
				messages: {
					"title": {
						required: "* 필수 항목입니다.",
					},
					"contents": {
						required: "* 필수 항목입니다.",
					},
				},	
				submitHandler:  (form) => {
					let contents = NOTICE.editor.getData();
					$("#contents").val(contents);	
					let result =  getAjax(url, $(form).serialize());
					let targetModal = $(form).closest(".modal");
		
					result.then((resData) => {
						if (resData.state != 1) {
							AjaxResultModalProc(targetModal.attr("id"), resData);
						} else {
							targetModal.modal("hide");
							$.formReset(form);
							if (url == NOTICE.SaveUrl) {
								CallCommonModal("통신 결과", "저장이 완료되었습니다.<br>검색 조건을 초기화 하고 데이터를 다시 불러 옵니다.");
								NOTICE.GetList(1);
							} else {
								NOTICE.GetList(window.pageset.nowpage);
							}
						}
					}).catch((resData) => {
						AjaxResultModalProc(targetModal.attr("id"), resData);
					});
				}
			}, option));
		},		
		/**
		 * 목록 데이터 호출 / 화면 출력
		 * 	- handlebars를 이용한 목록 출력
		 * @param {integer} page 페이지 번호
		 */		
		GetList : async (page) => {
			// 페이지 번호 획득
			let data = {"page" : (page == undefined ? 1 : page)};

			// 총 레코드 개수 획득
			if (page > 1) data.totalcount = window.pageset.totalcount;

			// 검색 항목 획득
			data = Object.assign(data, $("#search-form").serializeObject());
			let result = await getAjax(NOTICE.ListUrl, data);
			if(result != false && result.state == 1){
				//목록 출력 / 출력 이후 후 처리 지정
				window.pageset = result.data.pageset;	// 2page 이상 호출 시 필요하다
				let targetId = "hb-target-notice-list";
				let pagination = SetPagination(window.pageset, NOTICE.GetList);
				hbs("hb-source-notice-list", result.data, targetId, true, () => {
					$("#pagination-area").empty().append(pagination);
					//게시물 보기
					$("#"+targetId+" .contents-zone").on("click", async function(e) {
						e.preventDefault();
		
						let seq = $(this).data("seq");
						let result = await getAjax(NOTICE.DataUrl, {"seq" : seq});
						if(result != false && result.state == 1){
							// Modal Open
							hbs("hb-source-notice-view", result.data, "notice-view-modal-body", true, () => {
								$("#notice-view-modal").modal("show");
							});	
						}else{
							CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(result));
						}
					});

					//수정 버튼 클릭시
					$("[name='updateButton']").on("click", async function(e) {
						e.preventDefault();
						let seq = $(this).data("seq");
						let result = await getAjax(NOTICE.DataUrl, {"seq" : seq});
						if(result != false && result.state == 1){
							NOTICE.ModalOpen('modify', result.data);
						}else{
							CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(result));
						}
					});

					//삭제 버튼 클릭시
					$("[name='delButton']").on("click", function(e) {
						e.preventDefault();
						let seq = $(this).data("seq");
						MsgBox.Confirm("게시물을 삭제하시겠습니까? 삭제시 복구 불가합니다.", async function() {
							let result = await getAjax(NOTICE.DelUrl, {"seq" : seq});
							if(result != false && result.state == 1){
								NOTICE.GetList(1);
							}else{
								CallCommonModal("정보 가져오기 실패", AjaxErrorMessage(result));
							}
						} , () =>{});
					});
				});
			}else{
				CallCommonModal("목록 가져오기 실패", result != false ? AjaxErrorMessage(result) : {});
			}
		},	// End of Function : GetList
		ModalOpen : async (type, params) => {
			/**
			 * 등록/수정 Midal 띄우기
			 * @param {string} type 신규/기존 구분("new":신규, "modify":기존)
			 * @param {object} params 정보 JSON Data
			 */
			let modalformId = "#notice-modal-form";
			let targetModal = $('#notice-modal');
			let title = "";
			
			// 폼 리셋
			NOTICE.editor.setData("");
			$.formReset($(modalformId));
			
			if (type == "modify") {
				title = "공지사항 수정";
				let checkRadio = [];
				// 정보 대입
				$.each(params, function(key, data){
					if(checkRadio.includes(key)){
						$( modalformId ).find("[name='"+key+"'][value='"+data+"']").prop("checked", true);
					}else{
						$( modalformId ).find("#"+key).val(data);
					}
				});

				NOTICE.editor.setData(params.contents);
				NOTICE.setValidation($( modalformId ), NOTICE.UpdateUrl);
			} else {
				title = "신규 공지사항 등록";
				NOTICE.setValidation($( modalformId ), NOTICE.SaveUrl);
			}
			
			// Modal Show
			targetModal.find('.modal-title').text(title);
			targetModal.modal("show");
		},
	};

	$(() =>{
		// 첫 페이지 호출 / 화면 출력
		NOTICE.init();
	});