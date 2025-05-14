# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiBoardFileInfo(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    file_name = models.CharField(max_length=255, db_comment='파일명(변경된)')
    org_name = models.CharField(max_length=255, db_comment='원래 파일명')
    file_division = models.CharField(max_length=100, db_comment='파일 사용 목적 구분(ei:editor image)')
    reg_dt = models.DateTimeField(db_comment='등록일')
    board_id = models.CharField(max_length=100, db_comment='게시판 아이디(구분용)')
    file_info_ref = models.CharField(max_length=50, db_comment='첨부 이미지 참조정보')
    file_path = models.CharField(max_length=255, db_comment='파일 실저장 경로')

    class Meta:
        managed = False
        db_table = 'ni_board_file_info'
        db_table_comment = '게시판 첨부 이미지 저장 테이블'
