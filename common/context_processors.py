'''
모든 템플릿에 공통으로 전달할 데이터를 정의할 수 있는 함수입니다.
예를 들어 로그인한 사용자 정보, 사이트 설정, 알림 개수 등을 모든 템플릿에서 자동으로 접근하고 싶을 때 사용합니다.
settings.py --> 통합 관리 시스템에서는 settings/base.py에 정의
TEMPLATES = [
    {
        ...
        'OPTIONS': {
            'context_processors': [
                ...
               'common.context_processors.site_settings'
            ],
        },
    },
]
@author won@ntrex.co.kr on 2025.05.22
'''
def site_settings(request):
    return {
        'SITE_NAME': 'NTREX PROJECT',
        'SITE_TITLE': 'NTREX PROJECT - 통합 관리 시스템',
    } 