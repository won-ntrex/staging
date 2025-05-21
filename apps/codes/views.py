from django.shortcuts import render

def index(request):
    return render(request, 'stocks/index.html', {'sidebar_template' : 'common/sidebar_stock.html'})

def CodeManage_List_V2_AsyncGet(request):
    try:
        form = LoginForm(request.POST)
        if form.is_valid():
            id = form.cleaned_data['id']
            pw = form.cleaned_data['pw']

            # Django에서 PHP와 동일한 방식으로 암호화된 비밀번호를 생성
            encrypted_pw = php_sha256_enc(pw)
            log.info(encrypted_pw)
            # 데이터베이스에서 해당 아이디와 암호화된 비밀번호로 사용자를 찾음
            user = NiMember.objects.filter(id=id, pw=encrypted_pw).first()

            if user is not None:
                request.session['login_user'] = {
                    'seq': user.seq,
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                }
                user.update_last_login()
                return JsonResponse({"state" : True, "message": "로그인되었습니다."})
            else:
                # form.add_error(None, '아이디 또는 비밀번호가 일치하지 않습니다.')
                return JsonResponse({"state" : False,  "message": "아이디 또는 비밀번호가 올바르지 않습니다.", "data" : { "error": "id or pass error"}})
        else:
            return JsonResponse({"state" : False,  "message": "아이디 또는 비밀번호가 올바르지 않습니다.", "data" : { "error": "id or pass error"}})
    except:
        return JsonResponse({"state" : False, "message": "로그인에 실패하였습니다.", "data" : { "error": "log fail"}})