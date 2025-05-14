# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiPlacingOrderItem(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    placing_order_num = models.PositiveBigIntegerField(db_comment='발주 일련번호')
    item_status = models.CharField(max_length=1, db_comment='D:납기 지연, O:품절, E:단종, R직배송, C:개별발주취소 N:정상 - 이항목은 개별 상품별 사용')
    stock_goods_seq = models.BigIntegerField(db_comment='상품 일련번호')
    stock_opt_seq = models.BigIntegerField(db_comment='상품 옵션번호')
    req_goods_name = models.CharField(max_length=255, blank=True, null=True, db_comment='상품명(직접입력 가능 - 미등록 상품명)')
    order_goods_name = models.CharField(max_length=255, blank=True, null=True, db_comment='업체 발주 상품명')
    order_stock = models.IntegerField(db_comment='실발주 수량(업체에 실 요청하는 수량)')
    receiving_yn = models.CharField(max_length=1, db_comment='입고완료 유무(Y:입고, N:미입고, E:부분입고)')
    receiving_date = models.DateField(blank=True, null=True, db_comment='입고완료 날짜')
    receiving_stock = models.IntegerField(db_comment='실 입고 수량')
    receiving_price = models.DecimalField(max_digits=10, decimal_places=2, db_comment='공급가(입고가)')
    receiving_member_seq = models.IntegerField(db_comment='입고 처리자 seq')
    order_price = models.DecimalField(max_digits=10, decimal_places=2, db_comment='상품합계(공급가*수량)')
    specification = models.CharField(max_length=100, blank=True, null=True, db_comment='규격')
    unit = models.CharField(max_length=100, blank=True, null=True, db_comment='단위')
    memo = models.TextField(blank=True, null=True, db_comment='상품별 특이 사항 기록')
    order_purchase = models.CharField(max_length=1, db_comment='매입 완료 여부')

    class Meta:
        managed = False
        db_table = 'ni_placing_order_item'
        db_table_comment = '발주서별 상품 정보 테이블'
