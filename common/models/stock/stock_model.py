from django.db import models

class NiInfoStock(models.Model):
    stock_seq = models.BigAutoField(primary_key=True, db_comment='재고 정보 번호(ni_link_stock_seq의 stock_seq)')
    stock_goods_seq = models.PositiveBigIntegerField(db_comment='재고 상품 번호(ni_link_goods_seq의 stock_goods_seq)')
    stock_opt_seq = models.PositiveBigIntegerField(db_comment='옵션 정보 번호(ni_link_option_seq의 stock_opt_seq) - 기본 상품은 0으로 채움')
    sp_code_1 = models.IntegerField(db_comment='재고위치1 코드(ni_code_stock_place의 sp_code)')
    sp_code_2 = models.IntegerField(db_comment='재고위치2 코드(ni_code_stock_place의 sp_code)')
    stock = models.BigIntegerField(db_comment='재고수량')
    groups = models.CharField(max_length=1, db_comment='구분(y:재고 기본 또는 옵션 기본, n:옵션, a:추가 재고위치)')
    manager_code = models.IntegerField(db_comment='재고문의 담당자 코드(ni_code_stockmanager의 manager_code)')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')

    class Meta:
        managed = False
        db_table = 'ni_info_stock'
        db_table_comment = '재고 정보 - 필수'