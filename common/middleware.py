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
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('common')

class RequestLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user = request.user.username if request.user.is_authenticated else 'Anonymous'

        ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '-')
        referer = request.META.get('HTTP_REFERER', '-')

        logger.info(
            f"[REQUEST] {request.method} {request.path} by {user} | IP: {ip} | Agent: {user_agent} | Referer: {referer}"
        )

    def process_response(self, request, response):
        logger.info(f"[RESPONSE] {request.method} {request.path} - {response.status_code}")
        return response

    def process_exception(self, request, exception):
        logger.error(f"[EXCEPTION] {request.path} - {str(exception)}")
        return None

    def get_client_ip(self, request):
        """ X-Forwarded-For 처리 포함 IP 추출 """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip