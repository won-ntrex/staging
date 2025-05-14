# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiInfoOption(models.Model):
    stock_opt_seq = models.BigAutoField(primary_key=True, db_comment='옵션 정보 번호(ni_link_option_seq의 stock_opt_seq)')
    stock_goods_seq = models.PositiveBigIntegerField(db_comment='재고 상품 번호(ni_link_goods_seq의 stock_goods_seq)')
    default_option = models.CharField(max_length=1, blank=True, null=True, db_comment='기본 여부')
    otc1 = models.IntegerField(blank=True, null=True, db_comment='옵션그룹코드1(ni_code_option_group의 ot_code)')
    otc2 = models.IntegerField(blank=True, null=True, db_comment='옵션그룹코드2(ni_code_option_group의 ot_code)')
    otc3 = models.IntegerField(blank=True, null=True, db_comment='옵션그룹코드3(ni_code_option_group의 ot_code)')
    otc4 = models.IntegerField(blank=True, null=True, db_comment='옵션그룹코드4(ni_code_option_group의 ot_code)')
    otc5 = models.IntegerField(blank=True, null=True, db_comment='옵션그룹코드5(ni_code_option_group의 ot_code)')
    oc1 = models.IntegerField(blank=True, null=True, db_comment='옵션코드1(ni_code_option의 o_code)')
    oc2 = models.IntegerField(blank=True, null=True, db_comment='옵션코드2(ni_code_option의 o_code)')
    oc3 = models.IntegerField(blank=True, null=True, db_comment='옵션코드3(ni_code_option의 o_code)')
    oc4 = models.IntegerField(blank=True, null=True, db_comment='옵션코드4(ni_code_option의 o_code)')
    oc5 = models.IntegerField(blank=True, null=True, db_comment='옵션코드5(ni_code_option의 o_code)')
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_comment='가격(부가세포함가)')
    supply_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_comment='입고가')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')
    export_last_dt = models.DateTimeField(blank=True, null=True, db_comment='마지막 출고 일시')

    class Meta:
        managed = False
        db_table = 'ni_info_option'
        db_table_comment = '옵션 정보 - 필수'
