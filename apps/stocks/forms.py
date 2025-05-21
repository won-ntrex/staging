from django import forms

class CheckManageListPostForm(forms.Form):
    page = forms.IntegerField()
