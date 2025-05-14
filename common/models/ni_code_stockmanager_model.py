# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiCodeStockmanager(models.Model):
    manager_code = models.AutoField(primary_key=True, db_comment='재고문의 담당자 코드')
    manager_seq = models.PositiveIntegerField(unique=True, db_comment='고유번호(디바이스마트용 관리자 번호)')
    manager_id = models.CharField(unique=True, max_length=30, db_comment='담당자 아이디')
    manager_name = models.CharField(max_length=50, db_comment='담당자 이름')
    m_use = models.CharField(max_length=1, db_comment='사용 여부')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')

    class Meta:
        managed = False
        db_table = 'ni_code_stockmanager'
        db_table_comment = '재고문의 담당자'
