# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiNotice(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    title = models.CharField(max_length=255, db_comment='제목')
    contents = models.TextField(blank=True, null=True, db_comment='내용')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')
    file_info_ref = models.CharField(max_length=50, db_comment='첨부 이미지 참조정보')

    class Meta:
        managed = False
        db_table = 'ni_notice'
        db_table_comment = '공지사항'
