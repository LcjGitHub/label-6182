"""牌阵模板相关路由。"""

from flask import Blueprint, jsonify, request

from db import get_connection, row_to_dict
from validators import validate_spread_template_payload

bp = Blueprint("spread_templates", __name__, url_prefix="/api")


@bp.get("/spread-templates")
def list_spread_templates():
    """获取牌阵模板列表，支持按日期升序、日期降序、名称字母排序。"""
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
            f"SELECT * FROM spread_templates {order_clause}"
        ).fetchall()
        return jsonify([row_to_dict(row) for row in rows])
    finally:
        conn.close()


@bp.get("/spread-templates/<int:template_id>")
def get_spread_template(template_id: int):
    """获取单条牌阵模板。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM spread_templates WHERE id = ?", (template_id,)
        ).fetchone()
        if row is None:
            return jsonify({"error": "牌阵模板不存在"}), 404
        return jsonify(row_to_dict(row))
    finally:
        conn.close()


@bp.post("/spread-templates")
def create_spread_template():
    """新建牌阵模板。"""
    payload, error = validate_spread_template_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM spread_templates WHERE name = ?", (payload["name"],)
        ).fetchone()
        if existing is not None:
            return jsonify({"error": "该牌阵模板名称已存在"}), 400

        cursor = conn.execute(
            """
            INSERT INTO spread_templates
                (name, scenario, card_count)
            VALUES
                (:name, :scenario, :card_count)
            """,
            payload,
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM spread_templates WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return jsonify(row_to_dict(row)), 201
    finally:
        conn.close()


@bp.put("/spread-templates/<int:template_id>")
def update_spread_template(template_id: int):
    """更新牌阵模板。"""
    payload, error = validate_spread_template_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM spread_templates WHERE id = ?", (template_id,)
        ).fetchone()
        if existing is None:
            return jsonify({"error": "牌阵模板不存在"}), 404

        duplicate = conn.execute(
            "SELECT id FROM spread_templates WHERE name = ? AND id != ?",
            (payload["name"], template_id),
        ).fetchone()
        if duplicate is not None:
            return jsonify({"error": "该牌阵模板名称已存在"}), 400

        conn.execute(
            """
            UPDATE spread_templates
            SET name = :name,
                scenario = :scenario,
                card_count = :card_count,
                updated_at = datetime('now', 'localtime')
            WHERE id = :id
            """,
            {**payload, "id": template_id},
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM spread_templates WHERE id = ?", (template_id,)
        ).fetchone()
        return jsonify(row_to_dict(row))
    finally:
        conn.close()


@bp.delete("/spread-templates/<int:template_id>")
def delete_spread_template(template_id: int):
    """删除牌阵模板。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "DELETE FROM spread_templates WHERE id = ?", (template_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "牌阵模板不存在"}), 404
        return "", 204
    finally:
        conn.close()
