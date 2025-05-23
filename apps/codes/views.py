from django.shortcuts import render
from common.models import Code
from django.http import JsonResponse
from common.utils import log
def index(request):
     return render()

def CodeManage_List_V2_AsyncGet(request):
        '''
            * [Ajax Call] 문의 담당 리스트 - 문의 담당자 목록을 별도로 볼수 있도록 하기 위해서 분리함
            * @author won@ntrex.co.kr 2023.08.02
        '''
        params = request.POST.dict()
        #params['type'] = 'managercode'
        params['offset'] = 12
        if 'page' not in params or not params['page']:
            params['page'] = 1
        else:
            params['page'] = int(params['page'])

        # 실제 데이터 조회
        dbres = Code.CodeSelectSearchList(params)
        if dbres is False:
            return JsonResponse({"state" : False, "message": "파라미터 오류", "data" : { "error": "form invalid"}})
        else:
            return JsonResponse({"state" : True, "message": "파라미터 오류", "data" : dbres})
