from django.contrib.auth import get_user_model
User = get_user_model()

def create_user(username: str, email: str, password: str):
    """
    새로운 사용자를 생성합니다.

    Args:
        username (str): 사용자 이름
        email (str): 이메일 주소
        password (str): 비밀번호

    Returns:
        User: 생성된 사용자 객체
    """
    user = User.objects.create_user(username=username, email=email, password=password)
    # 추가 로직 예: welcome email 발송, 로그 저장 등
    return user

def get_user_by_id(user_id: str):
    """
    주어진 아이디를 사용하여 회원 정보가 존재 여부를 반환합니다.

    Args:
        user_id (str): 사용자 이름.

    Returns:
        boolean: 존재 : True, 미존재 : False

    Note(opt):
        won@ntrex.co.kr 25.05.27 최초 작성
    """
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None