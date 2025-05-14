import os
import environ
from .base import *

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

DJANGO_ENV = env('DJANGO_ENV', default='dev')

if DJANGO_ENV == 'prod':
    from .prod import *
else:
    from .dev import *