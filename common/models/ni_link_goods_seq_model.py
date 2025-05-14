# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiLinkGoodsSeq(models.Model):
    stock_goods_seq = models.BigAutoField(primary_key=True, db_comment='일련번호 : 재고 관리의 상품번호')
    link_goods_seq = models.CharField(max_length=40, db_comment='디바이스마트, 101도, 칼레오, 유니즈 등 고유 상품번호(알파벳 등 문자 포함 가능)')
    devicemart_goods_seq = models.PositiveBigIntegerField(db_comment='다비아스마트 fm_goods의 goods_seq 값(컬럼 link_goods_seq 값, 디바이스마트의 경우만 존재)')
    source_type = models.CharField(max_length=6, db_comment="출처(공통코드 '003'의 코드 값)")

    class Meta:
        managed = False
        db_table = 'ni_link_goods_seq'
        db_table_comment = '2023 재고관리 상품 번호 링크'
