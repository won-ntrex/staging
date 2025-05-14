def dictfetchall(cursor):
    """
    커서의 fetchall 결과를 딕셔너리 리스트로 변환
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor):
    "커서의 fetchonel 결과를 딕셔너리 리스트로 변환"
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
