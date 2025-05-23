from django.db import models

class NiPushToken(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    member_ref = models.BigIntegerField(db_comment='회원 일련번호')
    member_token = models.CharField(max_length=164, db_comment='회원 token')
    member_agent = models.CharField(max_length=255, db_comment='접속 환경 정보')
    reg_dt = models.DateTimeField(db_comment='등록일')
    upd_dt = models.DateTimeField(db_comment='수정일')

    class Meta:
        managed = False
        db_table = 'ni_push_token'
        db_table_comment = 'sms 발송 이력 테이블'