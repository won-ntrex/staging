# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiInfoCodeCompany(models.Model):
    co_code = models.PositiveIntegerField(primary_key=True, db_comment='거래처 코드(ni_code_company의 co_code)')
    co_ceoname = models.CharField(max_length=40, db_comment='대표자명')
    co_regno = models.CharField(max_length=12, db_comment="사업자번호('-'포함한 12자리)")
    co_ymestbl = models.CharField(max_length=40, db_comment='회사 설립연월')
    co_bizcnd = models.CharField(max_length=40, db_comment='업태')
    co_item = models.CharField(max_length=40, db_comment='종목')
    co_address = models.CharField(max_length=255, db_comment='회사주소')
    co_address_detail = models.CharField(max_length=255, db_comment='회사주소 상세')
    co_zipcode = models.CharField(max_length=10, db_comment='회사주소-우편번호')
    co_tel = models.CharField(max_length=20, db_comment='연락처')
    co_fax = models.CharField(max_length=20, db_comment='fax')

    class Meta:
        managed = False
        db_table = 'ni_info_code_company'
        db_table_comment = '거래처'
