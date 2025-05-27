from django.http import JsonResponse

def csrf_failure(request, reason=""):
    """
    csrf 오류 처리를 json 결과로 리턴

    Args:
        request (str): request 요청
        reason (dic): 실패 사유

    Returns:
        JsonResponse: 결과  json

    Note(opt):
        won@ntrex.co.kr 25.05.27
        csrf 함수는 django가 csrf 실패시 템플릿 오류 페이지를 반환함으로 ajax처리에는 적합하지 않다. 
        오류 발생시  json 형태로 변환을 위해 csrf_failure 함수를 오버라이드 한다.
        settions.py에 명시해야함. CSRF_FAILURE_VIEW
    """
    if request.headers.get("x-requested-with") == "XMLHttpRequest":
        #return JsonResponse({"error": "CSRF 인증 실패", "reason": reason}, status=403)
        return JsonResponse({"state" : False, "error": "CSRF 인증 실패", "data" : { "error": reason}})
    return JsonResponse({"state" : False, "error": "CSRF 인증 실패", "data" : { "error": reason}})