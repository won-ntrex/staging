# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class NiCode(models.Model):
    cdgp = models.CharField(primary_key=True, max_length=3, db_comment='분류(그룹) 코드 : A~Z와 0~9를 사용하는 3자리 코드')  # The composite primary key (cdgp, cd) found, that is not supported. The first column is selected.
    cd = models.CharField(max_length=6, db_comment='코드 : 분류코드 + A~Z와 0~9를 사용하는 최대 6자리 코드')
    cdnm = models.CharField(max_length=50, db_comment='코드명')
    cdgpnm = models.CharField(max_length=50, db_comment='분류(그룹)명')
    note = models.CharField(max_length=200, db_comment='코드설명')
    use_yn = models.IntegerField(db_comment='사용 유무(0:사용안함, 1:사용)')
    k1 = models.CharField(max_length=10, blank=True, null=True, db_comment='예비 컬럼 1')
    k2 = models.CharField(max_length=10, blank=True, null=True, db_comment='예비 컬럼 2')
    k1nm = models.CharField(max_length=200, blank=True, null=True, db_comment='예비 컬럼 1 이름')
    k2nm = models.CharField(max_length=200, blank=True, null=True, db_comment='예비 컬럼 2 이름')

    class Meta:
        managed = False
        db_table = 'ni_code'
        unique_together = (('cdgp', 'cd'),)
        db_table_comment = '코드 목록'
