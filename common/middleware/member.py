from django.shortcuts import redirect
from django.conf import settings

EXEMPT_URLS = [
    '/members/login/',
    '/admin/login/',
    '/admin/',
    '/static/',  # 정적 파일 경로 예외 처리
    '/media/',   # 미디어 파일 경로 예외 처리 (사용할 경우)
    '/assets/',
    '/members/login_proc/',
]
#전체 사이트에 대해서 로그인 체크를 수행하고 미로그인시 지정된 url로 이동하도록 처리
class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        #if not request.user.is_authenticated and not any(path.startswith(url) for url in EXEMPT_URLS):
        if not request.session.get('login_user') and not any(path.startswith(url) for url in EXEMPT_URLS):
            return redirect(settings.LOGIN_URL)
        return self.get_response(request)

#로그인 처리
