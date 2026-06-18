"""牌组预设相关路由。"""

from flask import Blueprint, jsonify, request

from db import get_connection, row_to_dict
from validators import validate_deck_preset_payload

bp = Blueprint("deck_presets", __name__, url_prefix="/api")


@bp.get("/deck-presets")
def list_deck_presets():
    """获取牌组预设列表，支持按日期升序、日期降序、名称字母排序。"""
    sort = request.args.get("sort", "date_desc").strip()
    valid_sorts = {
        "date_asc": "ORDER BY created_at ASC, id ASC",
        "date_desc": "ORDER BY created_at DESC, id DESC",
        "name_asc": "ORDER BY name COLLATE NOCASE ASC, id ASC",
    }
    order_clause = valid_sorts.get(sort, valid_sorts["date_desc"])
    conn = get_connection()
    try:
        rows = conn.execute(
            f"SELECT * FROM deck_presets {order_clause}"
        ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@bp.get("/deck-presets/<int:preset_id>")
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


@bp.post("/deck-presets")
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


@bp.put("/deck-presets/<int:preset_id>")
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


@bp.post("/deck-presets/batch-delete")
def batch_delete_deck_presets():
    """批量删除牌组预设，接收编号数组逐条删除。"""
    data = request.get_json(silent=True)
    if not data or not isinstance(data.get("ids"), list):
        return jsonify({"error": "请求体格式错误，请提供待删除编号列表"}), 400
    ids = data["ids"]
    if not ids:
        return jsonify({"error": "待删除编号列表不能为空"}), 400
    invalid = [i for i in ids if not isinstance(i, int)]
    if invalid:
        return jsonify({"error": "待删除编号列表中的元素必须为正整数"}), 400

    conn = get_connection()
    try:
        deleted = 0
        for preset_id in ids:
            cursor = conn.execute(
                "DELETE FROM deck_presets WHERE id = ?", (preset_id,)
            )
            deleted += cursor.rowcount
        conn.commit()
        return jsonify({"deleted": deleted})
    finally:
        conn.close()


@bp.delete("/deck-presets/<int:preset_id>")
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
