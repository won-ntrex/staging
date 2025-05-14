# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiPlacingOrder(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    order_manager = models.IntegerField(db_comment='발주 담당자')
    reg_dt = models.DateTimeField(db_comment='발주일')
    placing_order_num = models.PositiveBigIntegerField(db_comment='발주 일련번호')
    co_code = models.IntegerField(db_comment='발주 대상 업체(발주서 생성시에는 없고 선택을 통해서 저장되어야함)')
    order_state = models.CharField(max_length=1, db_comment='R:발주 진행중, C:발주완료, E:발주취소 - 이항목은 전체 발주에 대한 등록/취소시 사용')
    placing_order_date = models.DateField(blank=True, null=True, db_comment='발주일')
    delivery_date = models.DateField(blank=True, null=True, db_comment='납기일')
    recipient = models.CharField(max_length=100, blank=True, null=True, db_comment='수신자')
    co_manager_seq = models.IntegerField(db_comment='선택 담당자 일련번호')

    class Meta:
        managed = False
        db_table = 'ni_placing_order'
        db_table_comment = '발주서 정보 테이블'
