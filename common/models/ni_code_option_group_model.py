# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiCodeOptionGroup(models.Model):
    ot_code = models.AutoField(primary_key=True, db_comment='일련번호 : 옵션그룹명 코드')
    option_title_nm = models.CharField(unique=True, max_length=100, db_comment='옵션그룹명(중복 불가)')
    reg_dt = models.DateTimeField(db_comment='등록 일시')
    upd_dt = models.DateTimeField(db_comment='수정 일시')

    class Meta:
        managed = False
        db_table = 'ni_code_option_group'
        db_table_comment = '상품 옵션그룹명 코드'
