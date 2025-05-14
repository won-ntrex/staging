# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiCodeCompany(models.Model):
    co_code = models.AutoField(primary_key=True, db_comment='거래처 코드')
    co_name = models.CharField(unique=True, max_length=50, db_comment='거래처 명(중복 불가)')
    m_use = models.CharField(max_length=1, db_comment='제조사 여부')
    p_use = models.CharField(max_length=1, db_comment='매입처 여부')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')

    class Meta:
        managed = False
        db_table = 'ni_code_company'
        db_table_comment = '거래처코드'
