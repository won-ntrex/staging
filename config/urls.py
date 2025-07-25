"""
URL configuration for ntrexproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
#from django.urls import re_path #대소문자 무시 처리

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.main.urls'), name='home'),
    path('stock/', include('apps.stocks.urls')),
    path('Stock/', include('apps.stocks.urls')), #대소문자 구분 처리가 안됨
    #re_path(r'(?i)^stock/$', include('apps.stocks.urls')), #대소문자 무시 처리
    path('code/', include('apps.codes.urls')),
    path('Code/', include('apps.codes.urls')),
    path('members/', include('apps.members.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path("__debug__/", include(debug_toolbar.urls)),
    ]