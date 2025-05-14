from django.shortcuts import redirect
from django.conf import settings
from django.urls import resolve

EXEMPT_URLS = [
    '/members/login/',
    '/admin/login/',
    '/admin/',
    '/static/',  # 정적 파일 경로 예외 처리
    '/media/',   # 미디어 파일 경로 예외 처리 (사용할 경우)
    '/assets/',
    '/members/login_proc',
    '/members/test',
]

class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        #if not request.user.is_authenticated and not any(path.startswith(url) for url in EXEMPT_URLS):
        if not request.session.get('login_user') and not any(path.startswith(url) for url in EXEMPT_URLS):
            return redirect(settings.LOGIN_URL)
        return self.get_response(request)
