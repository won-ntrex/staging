# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiPlacingOrderNumLink(models.Model):
    seq = models.BigAutoField(primary_key=True, db_comment='일련번호')
    req_seq = models.BigIntegerField(db_comment='요청 테이블 일련번호')
    placing_order_num = models.BigIntegerField(db_comment='발주번호')

    class Meta:
        managed = False
        db_table = 'ni_placing_order_num_link'
        db_table_comment = '요청테이블 정보와 발주테이블을 연결하기 위한 테이블'
