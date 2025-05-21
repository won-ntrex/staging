from django.urls import path
from . import views

app_name = 'Codes'

urlpatterns = [
    path('', views.index, name='Code'),
    path('CodeManage_List_V2_AsyncGet/', views.CodeManage_List_V2_AsyncGet, name='CodeManage_List_V2_AsyncGet'),
]