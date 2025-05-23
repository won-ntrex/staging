# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.db.models import F, Value, CharField, Case, When
from django.db.models.functions import Concat
from common.models import NiMember
from common.utils import log

class Code(models.Model):
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

    @classmethod #클래스 메서드를 정의할 때 사용하는 데코레이터입니다. 이 메서드는 클래스 자체 (this)를 첫 번째 인자로 받아, 인스턴스를 생성하지 않고도 클래스 차원에서 호출할 수 있도록 해줍니다.
    def CodeSelectSearchList(selft, params = {}):
        '''
            * 상품 정보 처리 모델
            * 	- NTREX_Model을 상속 받아 공통 사용에 대한 부분을 일괄 지정 사용
            * @author yds@ntrex on 2023.04.28
        '''
        log.info("CodeSelectSearchList params")
        log.info(params)
         # 페이징
        page = int(params.get('page', 1))
        perpage = int(params.get('perpage', 20))
        start = (page - 1) * perpage
        total = 0

        queryset = CodeCompany.objects.none()  # 또는 기본값
        use_field = 'm_use' if params['type'] == 'manufacture' else 'p_use'

        if params['type'] == 'manufacture' or params['type'] == 'purchase':
            # 데이터 쿼리
            queryset = CodeCompany.objects.filter(
                **{use_field: 'y'},
                co_name__icontains=params['keyword']  # 검색어
            ).order_by('-reg_dt')
            log.info(queryset.query)
            total = queryset.count()
            queryset.values(
                code=models.F('co_code'), #query문중 AS 문장(별칭)을 추가할때 사용
                name=models.F('co_name'),
                m_use=models.F('m_use'),
                p_use=models.F('p_use'),
                reg_dt=models.F('reg_dt'),
                upd_dt=models.F('upd_dt')
                # 'm_use', 'p_use', 'reg_dt', 'upd_dt'
            )[start:start+perpage]

        elif params['type'] == 'spcode1' or params['type'] == 'spcode2':
             # 데이터 쿼리
            queryset = CodeStockPlace.objects.filter(
                stock_place__icontains=params['keyword']  # 검색어
            ).annotate(
                code=models.F('sp_code'), #query문중 AS 문장(별칭)을 추가할때 사용
                name=models.F('stock_place'),
            ).order_by('-reg_dt')
            total = queryset.count()
            queryset.values()[start:start+perpage]

        elif params['type'] == 'managercoder' :
            # 기본 필터: name LIKE '%검색어%'
            queryset = CodeStockmanager.objects.filter(
                manager_name__icontains=params.get("manager_name", ""),  # 검색어 처리
            )

            # 추가 조건: m_use 필터링
            if "m_use" in params and params["m_use"]:
                queryset = queryset.filter(m_use=params["m_use"])

            # annotate: 조건부 name 생성
            queryset = queryset.annotate(
                code=F('manager_code'),
                name=Case(
                    When(manager_name='', then=Value('')),
                    default=Concat(
                        F('manager_name'),
                        Value('('),
                        F('manager_id'),
                        Value(')'),
                        output_field=CharField()
                    )
                ),
                id=F('manager_id')
            ).order_by('-reg_dt')
            total = queryset.count()   
            queryset.values(
                'code', 'name', 'id', 'm_use', 'reg_dt', 'upd_dt'
            )[start:start+perpage]
            
        elif params['type'] == 'member' :
            # 데이터 쿼리
            queryset = NiMember.objects.filter(
                name__icontains=params['keyword']  # 검색어
            ).annotate(
                code=F('seq'),
                name=Concat(
                    F('name'),
                    Value('('),
                    F('id'),
                    Value(')'),
                    output_field=CharField()
                )
            ).order_by('-reg_dt')
            total = queryset.count()    
            queryset.values(
                'code', 'name', 'id', 'reg_dt', 'upd_dt'
            )[start:start+perpage]
            

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


class CodeCompany(models.Model):
    co_code = models.AutoField(primary_key=True, db_comment='거래처 코드')
    co_name = models.CharField(unique=True, max_length=50, db_comment='거래처 명(중복 불가)')
    m_use = models.CharField(max_length=1, db_comment='제조사 여부')
    p_use = models.CharField(max_length=1, db_comment='매입처 여부')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')

    class Meta:
        managed = False
        db_table = 'ni_code_company'
        db_table_comment = '거래처코드'


class CodeStockPlace(models.Model):
    sp_code = models.AutoField(primary_key=True, db_comment='일련번호 : 재고위치 코드')
    stock_place = models.CharField(unique=True, max_length=150, db_comment='재고위치명')
    reg_dt = models.DateTimeField(db_comment='등록 일시')
    upd_dt = models.DateTimeField(db_comment='수정 일시')

    class Meta:
        managed = False
        db_table = 'ni_code_stock_place'
        db_table_comment = '재고위치 코드'


class CodeStockmanager(models.Model):
    manager_code = models.AutoField(primary_key=True, db_comment='재고문의 담당자 코드')
    manager_seq = models.PositiveIntegerField(unique=True, db_comment='고유번호(디바이스마트용 관리자 번호)')
    manager_id = models.CharField(unique=True, max_length=30, db_comment='담당자 아이디')
    manager_name = models.CharField(max_length=50, db_comment='담당자 이름')
    m_use = models.CharField(max_length=1, db_comment='사용 여부')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')

    class Meta:
        managed = False
        db_table = 'ni_code_stockmanager'
        db_table_comment = '재고문의 담당자'                

class InfoCodeCompany(models.Model):
    co_code = models.PositiveIntegerField(primary_key=True, db_comment='거래처 코드(ni_code_company의 co_code)')
    co_ceoname = models.CharField(max_length=40, db_comment='대표자명')
    co_regno = models.CharField(max_length=12, db_comment="사업자번호('-'포함한 12자리)")
    co_ymestbl = models.CharField(max_length=40, db_comment='회사 설립연월')
    co_bizcnd = models.CharField(max_length=40, db_comment='업태')
    co_item = models.CharField(max_length=40, db_comment='종목')
    co_address = models.CharField(max_length=255, db_comment='회사주소')
    co_address_detail = models.CharField(max_length=255, db_comment='회사주소 상세')
    co_zipcode = models.CharField(max_length=10, db_comment='회사주소-우편번호')
    co_tel = models.CharField(max_length=20, db_comment='연락처')
    co_fax = models.CharField(max_length=20, db_comment='fax')

    class Meta:
        managed = False
        db_table = 'ni_info_code_company'
        db_table_comment = '거래처'        