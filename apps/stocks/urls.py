from django.urls import path
from . import views

app_name = 'stocks'

urlpatterns = [
    path('', views.index, name='stock'),
    path('goods_manage/', views.goods_manage, name='goods_manage'),
]