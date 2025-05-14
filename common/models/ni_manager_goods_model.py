# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiManagerGoods(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    stock_goods_seq = models.PositiveBigIntegerField(db_comment='재고관리 상품번호')
    company_goods_name = models.CharField(max_length=255, db_comment='등록자 상품명')
    co_code = models.IntegerField(db_comment='거래처 코드')
    member_seq = models.IntegerField(db_comment='등록자 일련번호')

    class Meta:
        managed = False
        db_table = 'ni_manager_goods'
        db_table_comment = '발주자 관리용 업체 상품명 관리 테이블'
