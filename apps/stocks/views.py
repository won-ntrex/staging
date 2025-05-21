from django.shortcuts import render
from django.http import JsonResponse
from .forms import CheckManageListPostForm
from common.models import GoodsModel
def index(request):
    return render(request, 'stocks/index.html', {'sidebar_template' : 'common/sidebar_stock.html'})

def GoodsManage_DP(request):

    return render(request, 'stocks/goods_manage.html', {'sidebar_template' : 'common/sidebar_stock.html'})

def GManage_List_AsyncGet(request):
    '''
	 * [Ajax Call] 상품목록 반환
	 * 	- 제품조회 사용
	 * @author yds@ntrex on 2023.04.28
    '''
    try:
        form = CheckManageListPostForm(request.POST)
        if form.is_valid():
            # 상품 목록 조회
            goods_list = GoodsModel.get_list()
            # QuerySet을 리스트로 변환 (모델 필드에 맞게 수정)
            # data = list(goods_list.values(
            #     'stock_goods_seq', 'goods_name', 'summary', 'price', 'supply_price',
            #     'total_stock', 'min_purchase_ea', 'min_purchase_ea_multiple', 'max_purchase_ea',
            #     'image', 'manufacture_code', 'purchase_code', 'option_state',
            #     'reg_dt', 'upd_dt', 'export_last_dt'
            # ))

            data = list(goods_list.values())
            return JsonResponse({"state": True, "message": "성공", "data": data}, safe=False)
        else:
            return JsonResponse({"state" : False, "message": "파라미터 오류", "data" : { "error": "form invalid"}})
    except Exception as e:
        return JsonResponse({"state" : False, "message": "서버 오류", "data" : { "error": str(e)}})