import hashlib
from django.contrib.auth.backends import BaseBackend
from common.models import NiMember  # 사용자 모델 경로에 따라 조정
from common.utils import log

ENCRYPT_KEY = '202302!$_Screet' # PHP에서 사용하는 ENCRYPT_KEY 동일하게

class PhpSha256Enc(BaseBackend):
    def authenticate(self, request, id=None, pw=None):
        try:
            log.ingo("PhpSha256Enc call " + id)
            user = NiMember.objects.get(id=id)
            hashed_input = hashlib.sha256((pw + ENCRYPT_KEY).encode('utf-8')).hexdigest()
            if user.pw == hashed_input:
                return user
        except NiMember.DoesNotExist:
            return None

    def get_user(self, id):
        try:
            return NiMember.objects.get(id=id)
        except NiMember.DoesNotExist:
            return None

def php_sha256_enc(raw_pw):
    return hashlib.sha256((raw_pw + ENCRYPT_KEY).encode('utf-8')).hexdigest()
