"""塔罗牌阵练习记录 API 服务。"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from db import get_connection, init_db, row_to_dict

app = Flask(__name__)
CORS(app)

REQUIRED_FIELDS = ("date", "spread_name", "deck", "key_cards", "summary")


def validate_payload(data: dict | None) -> tuple[dict | None, str | None]:
    """校验请求体字段，返回 (数据, 错误信息)。"""
    if not data:
        return None, "请求体不能为空"
    cleaned = {}
    for field in REQUIRED_FIELDS:
        value = data.get(field)
        if value is None or str(value).strip() == "":
            return None, f"字段 {field} 不能为空"
        cleaned[field] = str(value).strip()
    return cleaned, None


@app.get("/api/health")
def health():
    """健康检查。"""
    return jsonify({"status": "ok"})


@app.get("/api/records")
def list_records():
    """获取练习记录列表，按日期倒序。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM practice_records ORDER BY date DESC, id DESC"
        ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@app.get("/api/records/<int:record_id>")
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


@app.post("/api/records")
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


@app.put("/api/records/<int:record_id>")
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


@app.delete("/api/records/<int:record_id>")
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


@app.get("/api/stats")
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


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=4000, debug=True)
