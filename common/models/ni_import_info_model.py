# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiImportInfo(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='일련번호')
    itype = models.CharField(max_length=1, db_comment='입고 구분(E:발주, N:미등록, S:검색추가)')
    stock_goods_seq = models.BigIntegerField(blank=True, null=True, db_comment='재고 상품번호')
    stock_opt_seq = models.BigIntegerField(blank=True, null=True, db_comment='재고 옵션번호')
    stock_seq = models.BigIntegerField(blank=True, null=True, db_comment='재고 번호')
    import_stock = models.IntegerField(blank=True, null=True, db_comment='입고 수량')
    order_stock = models.IntegerField(blank=True, null=True, db_comment='차감 수량(발주완료 마감으로)')
    keep_stock = models.IntegerField(blank=True, null=True, db_comment='임시 보관 수량(발주완료 마감으로)')
    add_stock = models.IntegerField(blank=True, null=True, db_comment='재고 추가 수량')
    supply_price = models.DecimalField(max_digits=10, decimal_places=2, db_comment='입고가')
    supply_price_yn = models.CharField(max_length=1, db_comment='입고가 변경 여부')
    keep_state = models.CharField(max_length=1, db_comment='임시 보관 수량 정산 상태(추후 입고시 완료 처리용, a:대상 아님, n:정산 안됨, y:정산 완료, , h:정산 보류)')
    member_seq = models.BigIntegerField(db_comment='입고 처리자 seq')
    g_name = models.CharField(max_length=255, blank=True, null=True, db_comment='상품명')
    o_name = models.CharField(max_length=512, blank=True, null=True, db_comment='옵션명')
    reg_dt = models.DateTimeField(db_comment='기록일시')

    class Meta:
        managed = False
        db_table = 'ni_import_info'
        db_table_comment = '입고 처리 정보'
