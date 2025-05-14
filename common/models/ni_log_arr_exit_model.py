# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiLogArrExit(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='일련번호')  # The composite primary key (seq, stock_goods_seq, stock_opt_seq, log_date) found, that is not supported. The first column is selected.
    log_date = models.DateField(db_comment='등록일')
    stock_goods_seq = models.PositiveBigIntegerField(db_comment='재고 상품 번호(ni_link_goods_seq의 stock_goods_seq)')
    stock_opt_seq = models.PositiveBigIntegerField(db_comment='재고 옵션 번호(ni_link_option_seq의 stock_opt_seq)')
    price = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True, db_comment='입고가/출고가')
    stype = models.CharField(max_length=1, db_comment='기록구분(0:입고, 1:출고, 2:etc)')
    member_seq = models.BigIntegerField(db_comment='기록 관리자 seq')
    log_dt = models.DateTimeField(db_comment='기록일시')

    class Meta:
        managed = False
        db_table = 'ni_log_arr_exit'
        unique_together = (('seq', 'stock_goods_seq', 'stock_opt_seq', 'log_date'),)
        db_table_comment = '입고가 출고가 변동 이력 테이블'
