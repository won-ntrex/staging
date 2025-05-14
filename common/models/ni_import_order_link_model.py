# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiImportOrderLink(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='일련번호')
    import_seq = models.PositiveBigIntegerField(db_comment='입고번호')
    go_seq = models.PositiveBigIntegerField(db_comment='발주번호')
    proc_state = models.CharField(max_length=1, db_comment='입고완료처리 상태(y:완료, n:미완료)')

    class Meta:
        managed = False
        db_table = 'ni_import_order_link'
        db_table_comment = '입고 처리 연관 발주번호 정보'
