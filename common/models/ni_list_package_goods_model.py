# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiListPackageGoods(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='일련번호')
    package_key = models.CharField(max_length=50, db_comment='패키지 key')
    item_goods_seq = models.PositiveBigIntegerField(db_comment='구성 상품번호(디바이스마트 상품번호)')
    item_option_seq = models.PositiveBigIntegerField(db_comment='구성 옵션번호(디바이스마트 옵션번호)')
    ea = models.PositiveIntegerField(blank=True, null=True, db_comment='지정 출고 수량')
    main_type = models.CharField(max_length=1, db_comment='대표 여부(패키지상품번호는 y)')
    member_seq = models.BigIntegerField(db_comment='사용자 번호')
    reg_dt = models.DateTimeField(db_comment='추가 일시')
    upd_dt = models.DateTimeField(db_comment='수정 일시')

    class Meta:
        managed = False
        db_table = 'ni_list_package_goods'
        db_table_comment = '패키지상품의 포함된 상품번호 목록'
