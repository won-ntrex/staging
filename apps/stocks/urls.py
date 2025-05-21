from django.urls import path
from . import views

app_name = 'stocks'

urlpatterns = [
    path('', views.index, name='stock'),
    path('GoodsManage_DP/', views.GoodsManage_DP, name='goods_manage'),
    path('GManage_List_AsyncGet/', views.GManage_List_AsyncGet, name='GManage_List_AsyncGet'),
]