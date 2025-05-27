def dictfetchall(cursor):
    """
    커서의 fetchall 결과를 딕셔너리 리스트로 변환합니다.

    Args:
        cursor: DB 커서 객체

    Returns:
        list[dict]: 각 행을 딕셔너리로 변환한 리스트
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor):
    """
    커서의 fetchone 결과를 딕셔너리로 변환합니다.

    Args:
        cursor: DB 커서 객체

    Returns:
        dict or None: 한 행을 딕셔너리로 변환하거나, 결과가 없으면 None 반환
    """
    desc = cursor.description
    row = cursor.fetchone()
    if row is None:
        return None
    return {desc[i][0]: row[i] for i in range(len(row))}

# def dictfetchall(cursor):
#     "Returns all rows from a cursor as a dict"
#     desc = cursor.description
#     return [
#         {desc[i][0]: col[i] for i in range(len(col))}
#         for col in cursor.fetchall()
#     ]
