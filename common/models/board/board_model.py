from django.db import models

class NiAlram(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    send_seq = models.PositiveBigIntegerField(db_comment='송신자 일련번호')
    recv_seq = models.PositiveBigIntegerField(db_comment='수신자 일련번호 - 시스템일경우(0)')
    message_type = models.CharField(max_length=1, db_comment='메세지 타입(N:일반, E:기타)')
    title = models.CharField(max_length=255, db_comment='제목')
    message = models.TextField(blank=True, null=True, db_comment='내용')
    link_url = models.CharField(max_length=255, blank=True, null=True, db_comment='링크')
    reg_dt = models.DateTimeField(db_comment='등록일')

    class Meta:
        managed = False
        db_table = 'ni_alram'
        db_table_comment = '알람 정보 저장 테이블'

class NiBoardFileInfo(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    file_name = models.CharField(max_length=255, db_comment='파일명(변경된)')
    org_name = models.CharField(max_length=255, db_comment='원래 파일명')
    file_division = models.CharField(max_length=100, db_comment='파일 사용 목적 구분(ei:editor image)')
    reg_dt = models.DateTimeField(db_comment='등록일')
    board_id = models.CharField(max_length=100, db_comment='게시판 아이디(구분용)')
    file_info_ref = models.CharField(max_length=50, db_comment='첨부 이미지 참조정보')
    file_path = models.CharField(max_length=255, db_comment='파일 실저장 경로')

    class Meta:
        managed = False
        db_table = 'ni_board_file_info'
        db_table_comment = '게시판 첨부 이미지 저장 테이블'        

class NiNotice(models.Model):
    seq = models.AutoField(primary_key=True, db_comment='일련번호')
    title = models.CharField(max_length=255, db_comment='제목')
    contents = models.TextField(blank=True, null=True, db_comment='내용')
    reg_dt = models.DateTimeField(db_comment='등록일시')
    upd_dt = models.DateTimeField(db_comment='수정일시')
    file_info_ref = models.CharField(max_length=50, db_comment='첨부 이미지 참조정보')

    class Meta:
        managed = False
        db_table = 'ni_notice'
        db_table_comment = '공지사항'        