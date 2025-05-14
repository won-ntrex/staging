# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiInfoCompanyManager(models.Model):
    co_manager_seq = models.AutoField(primary_key=True, db_comment='거래처 담당자 번호')
    co_code = models.PositiveIntegerField(db_comment='거래처 코드(ni_code_company의 co_code)')
    co_rep_use = models.CharField(max_length=1, db_comment='대표 지정 여부')
    co_manager_name = models.CharField(max_length=20, blank=True, null=True, db_comment='거래처담당자명')
    co_depart = models.CharField(max_length=100, blank=True, null=True, db_comment='부서')
    co_manager_tel = models.CharField(max_length=20, blank=True, null=True, db_comment='연락처')
    co_manager_email = models.CharField(max_length=255, blank=True, null=True, db_comment='이메일')
    reg_dt = models.DateTimeField(blank=True, null=True)
    upd_dt = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ni_info_company_manager'
        db_table_comment = '거래처 담당자'
