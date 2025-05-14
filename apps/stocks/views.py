from django.shortcuts import render

def index(request):
    return render(request, 'stocks/index.html', {'sidebar_template' : 'common/sidebar_stock.html'})

def goods_manage(request):

    return render(request, 'stocks/goods_manage.html', {'sidebar_template' : 'common/sidebar_stock.html'})