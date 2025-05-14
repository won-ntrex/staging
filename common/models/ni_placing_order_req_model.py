# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiPlacingOrderReq(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='일련번호')
    stock_goods_seq = models.PositiveBigIntegerField(db_comment='상품 일련번호')
    stock_opt_seq = models.PositiveBigIntegerField(db_comment='상품 옵션번호')
    req_goods_name = models.CharField(max_length=255, blank=True, null=True, db_comment='상품명(직접입력 가능 - 미등록 상품명)')
    request_stock = models.BigIntegerField(db_comment='발주요청 수량')
    regist_manager = models.IntegerField(db_comment='발주 요청자')
    order_seq = models.BigIntegerField(db_comment='주문번호')
    receiving_yn = models.CharField(max_length=1, db_comment='입고완료 유무(Y:입고, N:미입고, E:부분입고)')
    receiving_date = models.DateField(blank=True, null=True, db_comment='입고완료 날짜')
    mapping_state = models.CharField(max_length=1, blank=True, null=True, db_comment='디바이스마트 연동 상태(N:대상 아님, F:연동 가능, S:연동 불가)')
    item_option_seq = models.IntegerField(db_comment='디바이스마트 상품 옵션 고유번호')
    memo = models.TextField(blank=True, null=True, db_comment='메모')
    reg_dt = models.DateTimeField(db_comment='등록 일시')
    update_dt = models.DateTimeField(db_comment='수정일')
    placing_order_num = models.PositiveBigIntegerField(db_comment='발주 일련번호')
    unstocked_item = models.IntegerField(db_comment='미입고수량(입고부족분)')

    class Meta:
        managed = False
        db_table = 'ni_placing_order_req'
        db_table_comment = '발주 요청 테이블'
