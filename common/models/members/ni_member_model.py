# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class NiMemberManager(BaseUserManager):
    def create_user(self, id, password=None, **extra_fields):
        if not id:
            raise ValueError('The ID must be set')
        user = self.model(id=id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('state', 'y')
        extra_fields.setdefault('grade_code', '001001')  # 관리자 등급 코드
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(id, password, **extra_fields)


class NiMember(models.Model):
    '''
        회원 정보 관리 모델
    '''
    seq = models.BigAutoField(primary_key=True, db_comment='레코드 인덱스')
    id = models.CharField(unique=True, max_length=20, db_comment='사용자 ID')
    pw = models.CharField(max_length=128, db_comment='사용자 패스워드')
    name = models.CharField(max_length=20, db_comment='사용자 이름')
    grade_code = models.CharField(max_length=6, default='001002', db_comment='사용자 등급 코드(ni_code:001 참고)')
    email = models.CharField(max_length=70, blank=True, null=True, db_comment='사용자 이메일')
    tel = models.CharField(max_length=13, blank=True, null=True, db_comment='전화')
    phone = models.CharField(max_length=13, blank=True, null=True, db_comment='사용자 전화번호')
    state = models.CharField(max_length=1, default='y', db_comment='사용자 상태(y:활성, n:비활성)')
    reg_dt = models.DateTimeField(auto_now_add=True, db_comment='등록 일시')
    upd_dt = models.DateTimeField(auto_now=True, db_comment='수정 일시')
    lastlogin_dt = models.DateTimeField(blank=True, null=True, db_comment='마지막 로그인 일시')
    fcm_use = models.CharField(max_length=1, default='n', db_comment='fcm 사용 여부(y:사용, n:미사용)')
    position = models.CharField(max_length=100, blank=True, null=True, db_comment='직책')
    appointment = models.CharField(max_length=100, blank=True, null=True, db_comment='직위')
    department = models.CharField(max_length=100, blank=True, null=True, db_comment='부서')
    
    objects = NiMemberManager()

    USERNAME_FIELD = 'seq'
    REQUIRED_FIELDS = ['id']

    class Meta:
        managed = False  # Django가 테이블을 관리하도록 변경
        db_table = 'ni_member'
        db_table_comment = '사용자 정보 테이블'
        verbose_name = '사용자'
        verbose_name_plural = '사용자 목록'

    def __str__(self):
        return f"{self.name} ({self.id})"

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def update_last_login(self):
        self.lastlogin_dt = timezone.now()
        self.save(update_fields=['lastlogin_dt'])

    @property
    def is_active_user(self):
        return self.state == 'y'
