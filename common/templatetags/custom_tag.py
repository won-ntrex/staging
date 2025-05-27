'''
Custom Template Tags and Filters 
templatetag는 템플릿에서 재사용 가능한 사용자 정의 필터, 태그, 기능 등을 구현할 수 있는 방법
templatetags 디렉토리명은 고정으로 구조는 유지해야함.  templatetags 포함된 앱(common)은 settings.py(bse.py)에 등록해야함.
@author won@ntrex.co.kr on 2025.05.22
'''
from django import template
import os
register = template.Library()

@register.filter
def chekc_anonymity(user):
    """
    사용자 객체가 None일 경우 '익명'을 반환하는 템플릿 필터.

    Args:
        user: 사용자 객체 또는 None

    Returns:
        str: 익명 또는 사용자 객체
    """
    if user is None:
        return '익명'
    else:
        return user
    
@register.filter
def my_upper(value):
    """
    문자열을 대문자로 변환하는 템플릿 필터.

    Args:
        value (str): 입력 문자열

    Returns:
        str: 대문자로 변환된 문자열
    """
    return value.upper()

@register.filter
def basename(value):
    """
    경로에서 파일명만 추출하는 템플릿 필터.

    Args:
        value (str): 파일 경로

    Returns:
        str: 파일명
    """
    return os.path.basename(value)