# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiGroupInfo(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    group_name = models.CharField(max_length=255, db_comment='그룹명')
    memo = models.TextField(blank=True, null=True, db_comment='참고 사항')

    class Meta:
        managed = False
        db_table = 'ni_group_info'
        db_table_comment = '푸시 관리용 그룹'
