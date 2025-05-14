# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiMemberPermission(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='레코드 인덱스')
    member_seq = models.BigIntegerField(db_comment='사용자 번호(ni_member:seq)')
    permission = models.CharField(max_length=6, db_comment='사용자 메뉴 권한 코드(ni_code:002 참고)')
    state = models.CharField(max_length=1, db_comment='권한 코드 지정 상태(y:활성, n:비활성)')
    reg_dt = models.DateTimeField(db_comment='등록 일시')
    upd_dt = models.DateTimeField(db_comment='수정 일시')

    class Meta:
        managed = False
        db_table = 'ni_member_permission'
        unique_together = (('member_seq', 'permission'),)
        db_table_comment = '사용자 메뉴사용권한 테이블'
