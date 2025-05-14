from .base import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ntrex_stock',
        'USER': 'ntrexuser',
        'PASSWORD': 'ntrex321',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

DEBUG = False