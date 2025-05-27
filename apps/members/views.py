from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .forms import LoginForm, CustomUserCreationForm
from common.utils import log, php_sha256_enc
from common.models import NiMember

from common.services import user_service

def login(request):
    form = LoginForm()
    return render(request, 'members/login.html', {'form': form})

@require_http_methods(["POST"])
def login_proc(request):
    try:
        log.info("SignInProc call")
        form = LoginForm(request.POST)
        if form.is_valid():
            id = form.cleaned_data['id']
            pw = form.cleaned_data['pw']

            #user = user_service.create_user(id, pw)

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

def logout(request):
    #logout(request)
    request.session.flush()
    messages.info(request, '로그아웃되었습니다.')
    return redirect('members:login')

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # 회원가입 후 자동 로그인
            messages.success(request, '회원가입이 완료되었습니다.')
            return redirect('home')
        else:
            messages.error(request, '입력한 정보를 다시 확인해주세요.')
    else:
        form = CustomUserCreationForm()
    return render(request, 'members/register.html', {'form': form})

def member_list(request):
    return render(request, 'members/member_list.html', {'sidebar_template' : 'common/sidebar_member.html'})

def test(request):
    user = NiMember.objects.filter(id='won0334').first()
    print(user)
