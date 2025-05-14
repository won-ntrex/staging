from django.urls import path
from . import views
app_name = 'members'

urlpatterns = [
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('login_proc/', views.login_proc, name='login_proc'),
    path('member_list/', views.member_list, name='member_list'),
    path('test/', views.test)
]    