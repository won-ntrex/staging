import logging
from django.utils.deprecation import MiddlewareMixin

'''
    로그 처리를 수행하는 middleware 클래스로 구버전 방식임
    구버전을 지원하기 위해 MiddlewareMixin를 상속 받아서 사용함.
    @author won@ntrex.co.kr on 2025.05.22
'''
class RequestLoggingMiddleware(MiddlewareMixin):
    logger = logging.getLogger('common')

    def process_request(self, request):
        user = request.user.username if request.user.is_authenticated else 'Anonymous'

        ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '-')
        referer = request.META.get('HTTP_REFERER', '-')

        self.logger.info(
            f"[REQUEST] {request.method} {request.path} by {user} | IP: {ip} | Agent: {user_agent} | Referer: {referer}"
        )

    def process_response(self, request, response):
        self.logger.info(f"[RESPONSE] {request.method} {request.path} - {response.status_code}")
        return response

    def process_exception(self, request, exception):
        self.logger.error(f"[EXCEPTION] {request.path} - {str(exception)}")
        return None

    def get_client_ip(self, request):
        """ X-Forwarded-For 처리 포함 IP 추출 """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip



'''
로그 처리를 수행하는 middleware 클래스  gpt4 참고
'''    
class AccessLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('custom')  # 설정에 등록된 logger 이름

    def __call__(self, request):
        response = self.get_response(request)

        user = request.user.username if request.user.is_authenticated else 'Anonymous'
        ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '-')
        referer = request.META.get('HTTP_REFERER', '-')

        self.logger.info(
            f"[AccessLogMiddleware REQUEST] {request.method} {request.path} by {user} | IP: {ip} | Agent: {user_agent} | Referer: {referer}"
        )
        return response

    def get_client_ip(self, request):
        """ X-Forwarded-For 처리 포함 IP 추출 """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip    
