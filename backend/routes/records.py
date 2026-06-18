"""练习记录相关路由。"""

from flask import Blueprint, jsonify, request

from db import get_connection, row_to_dict
from validators import validate_payload

bp = Blueprint("records", __name__, url_prefix="/api")


@bp.get("/calendar")
def get_calendar():
    """获取指定月份的练习日历数据：哪些日期有记录及对应条数。"""
    year = request.args.get("year", type=int)
    month = request.args.get("month", type=int)
    if not year or not month or month < 1 or month > 12:
        return jsonify({"error": "请提供有效的 year 和 month 参数"}), 400

    month_str = f"{year:04d}-{month:02d}"
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT date, COUNT(*) AS count
            FROM practice_records
            WHERE strftime('%Y-%m', date) = ?
            GROUP BY date
            ORDER BY date ASC
            """,
            (month_str,),
        ).fetchall()
        return jsonify({"year": year, "month": month, "dates": [row_to_dict(row) for row in rows]})
    finally:
        conn.close()


@bp.get("/records/by-date")
def list_records_by_date():
    """获取指定日期的全部练习记录。"""
    date = request.args.get("date", "").strip()
    if not date:
        return jsonify({"error": "请提供 date 参数"}), 400
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM practice_records WHERE date = ? ORDER BY id DESC",
            (date,),
        ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@bp.get("/records")
def list_records():
    """获取练习记录列表，支持关键词模糊搜索、牌组筛选和多种排序方式。"""
    keyword = request.args.get("keyword", "").strip()
    deck = request.args.get("deck", "").strip()
    sort = request.args.get("sort", "date_desc").strip()
    valid_sorts = {
        "date_desc": "ORDER BY date DESC, id DESC",
        "date_asc": "ORDER BY date ASC, id ASC",
        "spread_name_asc": "ORDER BY spread_name COLLATE NOCASE ASC, id ASC",
    }
    order_clause = valid_sorts.get(sort, valid_sorts["date_desc"])
    conn = get_connection()
    try:
        conditions = []
        params = []
        if keyword:
            search_pattern = f"%{keyword}%"
            conditions.append("(spread_name LIKE ? OR key_cards LIKE ? OR summary LIKE ?)")
            params.extend([search_pattern, search_pattern, search_pattern])
        if deck:
            conditions.append("deck = ?")
            params.append(deck)
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        sql = f"""
            SELECT * FROM practice_records
            {where_clause}
            {order_clause}
        """
        rows = conn.execute(sql, params).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@bp.get("/records/<int:record_id>")
def get_record(record_id: int):
    """获取单条练习记录。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM practice_records WHERE id = ?", (record_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "记录不存在"}), 404
        return jsonify(row_to_dict(row))
    finally:
        conn.close()


@bp.post("/records")
def create_record():
    """新建练习记录。"""
    payload, error = validate_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO practice_records
                (date, spread_name, deck, key_cards, summary)
            VALUES
                (:date, :spread_name, :deck, :key_cards, :summary)
            """,
            payload,
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM practice_records WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return jsonify(row_to_dict(row)), 201
    finally:
        conn.close()


@bp.put("/records/<int:record_id>")
def update_record(record_id: int):
    """更新练习记录。"""
    payload, error = validate_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM practice_records WHERE id = ?", (record_id,)
        ).fetchone()
        if existing is None:
            return jsonify({"error": "记录不存在"}), 404

        conn.execute(
            """
            UPDATE practice_records
            SET date = :date,
                spread_name = :spread_name,
                deck = :deck,
                key_cards = :key_cards,
                summary = :summary,
                updated_at = datetime('now', 'localtime')
            WHERE id = :id
            """,
            {**payload, "id": record_id},
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM practice_records WHERE id = ?", (record_id,)
        ).fetchone()
        return jsonify(row_to_dict(row))
    finally:
        conn.close()


@bp.delete("/records/<int:record_id>")
def delete_record(record_id: int):
    """删除练习记录。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "DELETE FROM practice_records WHERE id = ?", (record_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "记录不存在"}), 404
        return "", 204
    finally:
        conn.close()


@bp.get("/stats")
def get_stats():
    """获取练习统计数据：按月、牌组、牌阵名聚合。"""
    conn = get_connection()
    try:
        monthly_rows = conn.execute(
            """
            SELECT strftime('%Y-%m', date) AS month, COUNT(*) AS count
            FROM practice_records
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month ASC
            """
        ).fetchall()

        deck_rows = conn.execute(
            """
            SELECT deck AS name, COUNT(*) AS count
            FROM practice_records
            GROUP BY deck
            ORDER BY count DESC
            """
        ).fetchall()

        spread_rows = conn.execute(
            """
            SELECT spread_name AS name, COUNT(*) AS count
            FROM practice_records
            GROUP BY spread_name
            ORDER BY count DESC
            """
        ).fetchall()

        return jsonify(
            {
                "monthly": [row_to_dict(row) for row in monthly_rows],
                "by_deck": [row_to_dict(row) for row in deck_rows],
                "by_spread": [row_to_dict(row) for row in spread_rows],
            }
        )
    finally:
        conn.close()
