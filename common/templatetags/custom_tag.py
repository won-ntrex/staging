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
    if user is None:
        return '익명'
    else:
        return user
    
@register.filter
def my_upper(value):
    return value.upper()

@register.filter
def basename(value):
    return os.path.basename(value)