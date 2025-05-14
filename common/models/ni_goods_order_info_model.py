# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiGoodsOrderInfo(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    stock_goods_seq = models.BigIntegerField(blank=True, null=True, db_comment='상품 일련번호(영업부에서 직접입력 가능)')
    stock_opt_seq = models.BigIntegerField(blank=True, null=True, db_comment='상품 옵션번호(영업부에서 직접입력 가능)')
    goods_name = models.CharField(max_length=255, blank=True, null=True, db_comment='상품명(영업부에서 직접입력 가능)')
    export_stock = models.BigIntegerField(db_comment='출고처리시 출고요청갯수')
    before_stock = models.BigIntegerField(db_comment='출고처리시 남은갯수')
    underage_stock = models.BigIntegerField(db_comment='출고처리시 부족수량')
    order_stock = models.BigIntegerField(db_comment='발주 수량')
    order_state = models.CharField(max_length=1, db_comment='A:출고등록, C:발주예정, D:발주완료(엑셀다운)')
    order_manager = models.IntegerField(blank=True, null=True, db_comment='발주 담당자')
    regist_manager = models.IntegerField(blank=True, null=True, db_comment='최초 등록자')
    reg_dt = models.DateTimeField(db_comment='등록 일시')
    update_dt = models.DateTimeField(db_comment='수정일')
    order_seq = models.BigIntegerField(db_comment='주문번호')
    order_data = models.TextField(blank=True, null=True, db_comment='주문정보 json')
    receiving_yn = models.CharField(max_length=1, db_comment='입고완료 유무')
    receiving_date = models.DateTimeField(blank=True, null=True, db_comment='입고완료 날짜')
    mapping_state = models.CharField(max_length=1, blank=True, null=True, db_comment='디바이스마트 연동 상태(n:대상 아님, s:연동 가능, f:연동 불가)')
    item_option_seq = models.IntegerField(blank=True, null=True, db_comment='상품 고유번호')

    class Meta:
        managed = False
        db_table = 'ni_goods_order_info'
        db_table_comment = '출고 처리시 부족한 재고로인해 자동으로 등록된 발주 대기 리스트'
