# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiInfoGoods(models.Model):
    stock_goods_seq = models.PositiveBigIntegerField(primary_key=True, db_comment='2023 재고관리 상품번호')
    goods_name = models.CharField(max_length=255, db_comment='상품명')
    summary = models.CharField(max_length=500, blank=True, null=True, db_comment='간략설명')
    price = models.DecimalField(max_digits=10, decimal_places=2, db_comment='가격')
    supply_price = models.DecimalField(max_digits=10, decimal_places=2, db_comment='입고가')
    total_stock = models.BigIntegerField(db_comment='총 재고수량')
    min_purchase_ea = models.PositiveIntegerField(db_comment='최소 구매 수량')
    min_purchase_ea_multiple = models.PositiveIntegerField(db_comment='최소 구매 수량 배수')
    max_purchase_ea = models.PositiveIntegerField(blank=True, null=True, db_comment='최대 구매 수량')
    image = models.CharField(max_length=255, blank=True, null=True, db_comment='대표 이미지')
    manufacture_code = models.IntegerField(db_comment='제조사:ni_code_company의 m_use(y)인 거래처 코드')
    purchase_code = models.IntegerField(db_comment='매입처:ni_code_company의 p_use(y)인 거래처 코드')
    option_state = models.CharField(max_length=6, db_comment='옵션상태(normal:기본상품, option:옵션상품)')
    reg_dt = models.DateTimeField(db_comment='재고 관리 추가 일시')
    upd_dt = models.DateTimeField(db_comment='재고 관리 수정 일시')
    export_last_dt = models.DateTimeField(blank=True, null=True, db_comment='마지막 출고 일시')

    class Meta:
        managed = False
        db_table = 'ni_info_goods'
        db_table_comment = '재고 관리 운영 상품 정보'
