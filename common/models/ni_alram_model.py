# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiAlram(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    send_seq = models.PositiveBigIntegerField(db_comment='송신자 일련번호')
    recv_seq = models.PositiveBigIntegerField(db_comment='수신자 일련번호 - 시스템일경우(0)')
    message_type = models.CharField(max_length=1, db_comment='메세지 타입(N:일반, E:기타)')
    title = models.CharField(max_length=255, db_comment='제목')
    message = models.TextField(blank=True, null=True, db_comment='내용')
    link_url = models.CharField(max_length=255, blank=True, null=True, db_comment='링크')
    reg_dt = models.DateTimeField(db_comment='등록일')

    class Meta:
        managed = False
        db_table = 'ni_alram'
        db_table_comment = '알람 정보 저장 테이블'
