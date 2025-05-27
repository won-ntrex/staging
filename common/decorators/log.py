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