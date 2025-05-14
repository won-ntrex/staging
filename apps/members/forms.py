from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from common.models import NiMember

class LoginForm(forms.Form):
    id = forms.CharField(
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': '아이디'
            }
        )
    )
    pw = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': '비밀번호'
            }
        )
    )

class CustomUserCreationForm(UserCreationForm):
    phone_number = forms.CharField(
        max_length=15,
        required=False,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': '전화번호'
            }
        )
    )
    
    class Meta:
        model = NiMember
        fields = ('id', 'email', 'phone', 'password1', 'password2')
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 기본 필드들의 스타일 지정
        self.fields['id'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '사용자 아이디'
        })
        self.fields['email'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '이메일'
        })
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '비밀번호'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': '비밀번호 확인'
        }) 