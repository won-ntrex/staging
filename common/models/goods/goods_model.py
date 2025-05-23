from django.db import models, connection
from common.utils import log
from common.utils import db_util
from django.db.models import Q

class qGoodsModel():
    '''
        상품 관리 클래스
    '''
    goods_seq = models.IntegerField() #상품 일련번호

    class Meta:
        app_label = 'goods' #앱 외부의 모델 위치일 경우 꼭 필요합니다.

    def get_list(args = {}):
        '''
            상품 정보 불러오기 함수
        '''
        #with connection.cursor() as cursor:
        with connection['dmdev'].cursor() as cursor:
            sql = "SELECT * FROM board WHERE 1"
            params = []
            if 'search_text' in args:
                sql += f" AND title like %s"
                params.append(f"%{args['search_text']}%")
            
            cursor.execute(sql, params)
            rows = db_util.dictfetchall(cursor)
        return rows
    

    def get_data(args = {}):
        '''
        상품 정보 상세 가져오기
        '''
        with connection.cursor() as cursor:
            sql = "SELECT * FROM board WHERE "
            if 'goods_seq' in args:
                sql += f" goods_seq = {args['goods_seq']}"
            cursor.execute(sql)
            row = cursor.fetchone()
        return row

class GoodsModel(models.Model):
    '''
        * 상품 정보 처리 모델
        * @author yds@ntrex on 2023.04.28    
    '''
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

    order_state = {
        "R": "발주 진행중",
        "C": "발주완료",
        "E": "발주취소",
    }

    item_state = {
        "D": "납기 지연",
        "O": "품절",
        "E": "단종",
        "R": "R직배송",
        "C": "개별발주취소",
        "N": "정상",
    }

    class Meta:
        db_table = 'ni_info_goods'
        app_label = 'goods'

    @classmethod #클래스 메서드를 정의할 때 사용하는 데코레이터입니다. 이 메서드는 클래스 자체 (this)를 첫 번째 인자로 받아, 인스턴스를 생성하지 않고도 클래스 차원에서 호출할 수 있도록 해줍니다.
    def GetGoodsSearch(this, params = {}):
        '''
            상품 정보 불러오기 함수
        '''
        queryset = GoodsModel.objects.all()

        # 검색 조건 예시
        if 'name' in params and params['name']:
            queryset = queryset.filter(name__icontains=params['name'])

        # 정렬
        order_by = params.get('gs.stock_goods_seq', '-reg_dt')
        queryset = queryset.order_by(order_by)

        # 페이징
        page = int(params.get('page', 1))
        perpage = int(params.get('perpage', 20))
        offset = (page - 1) * perpage
        total = queryset.count()
        queryset = queryset[offset:offset+perpage]

        # 결과 반환
        result = {
            'list': list(queryset.values()),
            'pageset': {
                'total': total,
                'page': page,
                'perpage': perpage,
                'totalpage': (total + perpage - 1) // perpage
            }
        }

        return result
    
    @classmethod
    def get_data(this, id):
        data = this.objects.get(id=id)
        log.info("get_data", data.query)
        return data
    

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


class NiLinkGoodsSeq(models.Model):
    stock_goods_seq = models.BigAutoField(primary_key=True, db_comment='일련번호 : 재고 관리의 상품번호')
    link_goods_seq = models.CharField(max_length=40, db_comment='디바이스마트, 101도, 칼레오, 유니즈 등 고유 상품번호(알파벳 등 문자 포함 가능)')
    devicemart_goods_seq = models.PositiveBigIntegerField(db_comment='다비아스마트 fm_goods의 goods_seq 값(컬럼 link_goods_seq 값, 디바이스마트의 경우만 존재)')
    source_type = models.CharField(max_length=6, db_comment="출처(공통코드 '003'의 코드 값)")

    class Meta:
        managed = False
        db_table = 'ni_link_goods_seq'
        db_table_comment = '2023 재고관리 상품 번호 링크'

class NiLinkOptionSeq(models.Model):
    stock_opt_seq = models.BigAutoField(primary_key=True, db_comment='일련번호 : 재고 관리의 상품 옵션 번호')
    link_option_seq = models.CharField(max_length=40, db_comment='디바이스마트, 101도, 칼레오, 유니즈 등 고유 상품 옵션 번호(알파벳 등 문자 포함 가능)')
    devicemart_option_seq = models.PositiveBigIntegerField(db_comment='다비아스마트 fm_goods_option의 option_seq 값(컬럼 link_option_seq 값, 디바이스마트의 경우만 존재)')
    source_type = models.CharField(max_length=6, db_comment="출처(공통코드 '003'의 코드 값)")

    class Meta:
        managed = False
        db_table = 'ni_link_option_seq'
        db_table_comment = '2023 재고관리 상품 옵션 번호 링크'        