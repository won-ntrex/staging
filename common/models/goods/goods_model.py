from django.db import models, connection
from common.utils import log
from common.utils import db_util
from django.db.models import Q

class GoodsModel():
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

class dGoodsModel(models.Model):
    user_fk = models.IntegerField() 
    title = models.CharField(null=False, blank=False, max_length=200)
    content = models.TextField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    hit = models.IntegerField(default=0) 

    class Meta:
        db_table = 'board'
        app_label = 'goods'

    @classmethod #클래스 메서드를 정의할 때 사용하는 데코레이터입니다. 이 메서드는 클래스 자체 (this)를 첫 번째 인자로 받아, 인스턴스를 생성하지 않고도 클래스 차원에서 호출할 수 있도록 해줍니다.
    def get_list(this, args = {}):
        '''
            상품 정보 불러오기 함수
        '''
        if 'search_text' in args:
            #data = this.objects().filter(Q(title__icontains=args['search_text']) | Q(content__icontains=args['search_text'])).all().order_by("-created_at")[:10]
            data = this.objects.using('default').filter(title=args['search_text']).order_by("-created_at").all()[:10]
        else:
            data = this.objects.all()[:10]

        log.info(data.query)
        return data
    
    @classmethod
    def get_data(this, id):
        data = this.objects.get(id=id)
        log.info("get_data", data.query)
        return data