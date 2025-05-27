import hashlib
from django.contrib.auth.backends import BaseBackend
from common.models import NiMember  # 사용자 모델 경로에 따라 조정
from common.utils import log

ENCRYPT_KEY = '202302!$_Screet' # PHP에서 사용하는 ENCRYPT_KEY 동일하게

class PhpSha256Enc(BaseBackend):
    def authenticate(self, request, id=None, pw=None):
        """
        주어진 id, pw로 사용자를 인증합니다.

        Args:
            request: Django 요청 객체
            id (str): 사용자 아이디
            pw (str): 평문 비밀번호

        Returns:
            NiMember 또는 None: 인증 성공 시 사용자 객체, 실패 시 None
        """
        try:
            log.ingo("PhpSha256Enc call " + id)
            user = NiMember.objects.get(id=id)
            hashed_input = hashlib.sha256((pw + ENCRYPT_KEY).encode('utf-8')).hexdigest()
            if user.pw == hashed_input:
                return user
        except NiMember.DoesNotExist:
            return None

    def get_user(self, id):
        """
        주어진 id로 사용자 객체를 반환합니다.

        Args:
            id (str): 사용자 아이디

        Returns:
            NiMember 또는 None: 해당 id의 사용자 객체, 없으면 None
        """
        try:
            return NiMember.objects.get(id=id)
        except NiMember.DoesNotExist:
            return None

def php_sha256_enc(raw_pw):
    """
    주어진 비밀번호에 ENCRYPT_KEY를 붙여 sha256 해시값을 반환합니다.

    Args:
        raw_pw (str): 평문 비밀번호

    Returns:
        str: sha256 해시값
    """
    return hashlib.sha256((raw_pw + ENCRYPT_KEY).encode('utf-8')).hexdigest()
