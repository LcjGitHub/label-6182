"""塔罗牌阵练习记录 API 服务。"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from db import get_connection, init_db, row_to_dict

app = Flask(__name__)
CORS(app)

REQUIRED_FIELDS = ("date", "spread_name", "deck", "key_cards", "summary")
DECK_PRESET_REQUIRED_FIELDS = ("name",)


def validate_deck_preset_payload(data: dict | None) -> tuple[dict | None, str | None]:
    """校验牌组预设请求体字段，返回 (数据, 错误信息)。"""
    if not data:
        return None, "请求体不能为空"
    cleaned = {}
    for field in DECK_PRESET_REQUIRED_FIELDS:
        value = data.get(field)
        if value is None or str(value).strip() == "":
            return None, f"字段 {field} 不能为空"
        cleaned[field] = str(value).strip()
    description_value = data.get("description")
    cleaned["description"] = (
        str(description_value).strip() if description_value else ""
    )
    return cleaned, None


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


@app.get("/api/deck-presets")
def list_deck_presets():
    """获取牌组预设列表，按创建时间正序。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM deck_presets ORDER BY id ASC"
        ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@app.get("/api/deck-presets/<int:preset_id>")
def get_deck_preset(preset_id: int):
    """获取单条牌组预设。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM deck_presets WHERE id = ?", (preset_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "牌组预设不存在"}), 404
        return jsonify(row_to_dict(row))
    finally:
        conn.close()


@app.post("/api/deck-presets")
def create_deck_preset():
    """新建牌组预设。"""
    payload, error = validate_deck_preset_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM deck_presets WHERE name = ?", (payload["name"],)
        ).fetchone()
        if existing is not None:
            return jsonify({"error": "该牌组名称已存在"}), 400

        cursor = conn.execute(
            """
            INSERT INTO deck_presets
                (name, description)
            VALUES
                (:name, :description)
            """,
            payload,
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM deck_presets WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return jsonify(row_to_dict(row)), 201
    finally:
        conn.close()


@app.put("/api/deck-presets/<int:preset_id>")
def update_deck_preset(preset_id: int):
    """更新牌组预设。"""
    payload, error = validate_deck_preset_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM deck_presets WHERE id = ?", (preset_id,)
        ).fetchone()
        if existing is None:
            return jsonify({"error": "牌组预设不存在"}), 404

        duplicate = conn.execute(
            "SELECT id FROM deck_presets WHERE name = ? AND id != ?",
            (payload["name"], preset_id),
        ).fetchone()
        if duplicate is not None:
            return jsonify({"error": "该牌组名称已存在"}), 400

        conn.execute(
            """
            UPDATE deck_presets
            SET name = :name,
                description = :description,
                updated_at = datetime('now', 'localtime')
            WHERE id = :id
            """,
            {**payload, "id": preset_id},
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM deck_presets WHERE id = ?", (preset_id,)
        ).fetchone()
        return jsonify(row_to_dict(row))
    finally:
        conn.close()


@app.delete("/api/deck-presets/<int:preset_id>")
def delete_deck_preset(preset_id: int):
    """删除牌组预设。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "DELETE FROM deck_presets WHERE id = ?", (preset_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "牌组预设不存在"}), 404
        return "", 204
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=4000, debug=True)
