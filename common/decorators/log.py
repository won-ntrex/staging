import functools
import time
from common.utils.logger import log

def log_execution(func):
    """
    함수 실행 정보를 로그로 기록하는 데코레이터.

    Args:
        func (callable): 로그를 남기고자 하는 함수

    Returns:
        callable: 로깅 기능이 추가된 함수
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        """
        데코레이터로 감싼 함수의 실행 전후로 로그를 기록하는 내부 함수.

        Args:
            *args: 원본 함수에 전달되는 위치 인자
            **kwargs: 원본 함수에 전달되는 키워드 인자

        Returns:
            원본 함수의 반환값

        Raises:
            Exception: 원본 함수 실행 중 발생한 예외를 다시 발생시킴
        """
        start_time = time.time()
        log.info(f"▶ 함수 {func.__name__} 시작 - args: {args}, kwargs: {kwargs}")
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            log.info(f"✅ 함수 {func.__name__} 완료 - 결과: {result}, 실행시간: {duration:.4f}초")
            return result
        except Exception as e:
            log.exception(f"❌ 함수 {func.__name__} 오류 - {e}")
            raise
    return wrapper