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
        * 	- NTREX_Model을 상속 받아 공통 사용에 대한 부분을 일괄 지정 사용
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

    class Meta:
        db_table = 'ni_info_goods'
        app_label = 'goods'

    @classmethod #클래스 메서드를 정의할 때 사용하는 데코레이터입니다. 이 메서드는 클래스 자체 (this)를 첫 번째 인자로 받아, 인스턴스를 생성하지 않고도 클래스 차원에서 호출할 수 있도록 해줍니다.
    def get_list(this, args = {}):
        '''
            상품 정보 불러오기 함수
        '''
        if 'search_text' in args:
            #data = this.objects().filter(Q(title__icontains=args['search_text']) | Q(content__icontains=args['search_text'])).all().order_by("-created_at")[:10]
            data = this.objects.using('default').filter(title=args['search_text']).order_by("-created_at").all()[:10] #using문 사용할 데이터베이스 접속 정보
        else:
            data = this.objects.all()[:10]

        log.info(data.query)
        return data
    
    @classmethod
    def get_data(this, id):
        data = this.objects.get(id=id)
        log.info("get_data", data.query)
        return data