from django.shortcuts import render
from django.http import JsonResponse
from .forms import CheckManageListPostForm
from common.models import GoodsModel
from common.utils import log
from common.decorators import log_execution

def index(request):
    return render(request, 'stocks/index.html', {'sidebar_template' : 'common/sidebar_stock.html'})

def GoodsManage_DP(request):

    return render(request, 'stocks/goods_manage.html', {'sidebar_template' : 'common/sidebar_stock.html'})

@log_execution
def GManage_List_AsyncGet(request):
    '''
	 * [Ajax Call] 상품목록 반환
	 * 	- 제품조회 사용
	 * @author yds@ntrex on 2023.04.28
    '''
    try:
        log.info(f"GManage_List_AsyncGet 호출")
        form = CheckManageListPostForm(request.POST)
        if form.is_valid():
            # page 파라미터 처리
            params = {}
            params['page'] = form.cleaned_data.get('page', 1)

            data = GoodsModel.GetGoodsSearch(params)
            return JsonResponse({"state": True, "message": "성공", "data": data}, safe=False)
        else:
            return JsonResponse({"state" : False, "message": "파라미터 오류", "data" : { "error": "form invalid"}})
    except Exception as e:
        return JsonResponse({"state" : False, "message": "서버 오류", "data" : { "error": str(e)}})