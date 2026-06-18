"""练习记录核心接口集成测试。"""

REQUIRED_FIELDS = ("id", "date", "spread_name", "deck", "key_cards", "summary", "created_at", "updated_at")


def _payload(**overrides):
    base = {
        "date": "2026-06-18",
        "spread_name": "三牌阵",
        "deck": "韦特塔罗",
        "key_cards": "愚者、魔术师、女祭司",
        "summary": "测试用的练习记录摘要",
    }
    base.update(overrides)
    return base


def test_create_record_success_returns_full_fields(client):
    """新建成功：状态码 201，返回体包含所有完整字段。"""
    payload = _payload()
    response = client.post("/api/records", json=payload)

    assert response.status_code == 201
    data = response.get_json()
    for field in REQUIRED_FIELDS:
        assert field in data, f"响应缺少字段 {field}"
    assert data["date"] == payload["date"]
    assert data["spread_name"] == payload["spread_name"]
    assert data["deck"] == payload["deck"]
    assert data["key_cards"] == payload["key_cards"]
    assert data["summary"] == payload["summary"]
    assert isinstance(data["id"], int)
    assert data["id"] > 0
    assert data["created_at"]
    assert data["updated_at"]


def test_list_records_contains_newly_created(client):
    """列表查询：新建记录后列表能查到对应记录。"""
    payload = _payload(date="2026-06-01", spread_name="每日一牌", key_cards="太阳")
    create_resp = client.post("/api/records", json=payload)
    created = create_resp.get_json()

    list_resp = client.get("/api/records")
    assert list_resp.status_code == 200
    records = list_resp.get_json()
    assert isinstance(records, list)

    ids = [r["id"] for r in records]
    assert created["id"] in ids, "新建记录未出现在列表中"

    match = next(r for r in records if r["id"] == created["id"])
    assert match["date"] == payload["date"]
    assert match["spread_name"] == payload["spread_name"]
    assert match["deck"] == payload["deck"]
    assert match["key_cards"] == payload["key_cards"]
    assert match["summary"] == payload["summary"]


def test_update_record_fields_change_correctly(client):
    """单条更新：更新后字段变化正确，updated_at 应更新。"""
    create_resp = client.post("/api/records", json=_payload())
    created = create_resp.get_json()
    original_updated_at = created["updated_at"]

    update_payload = _payload(
        date="2026-06-20",
        spread_name="凯尔特十字",
        deck="马赛塔罗",
        key_cards="恋人、死神、世界",
        summary="更新后的练习记录摘要",
    )

    import time
    time.sleep(1)

    update_resp = client.put(f"/api/records/{created['id']}", json=update_payload)
    assert update_resp.status_code == 200
    updated = update_resp.get_json()

    assert updated["id"] == created["id"]
    assert updated["date"] == update_payload["date"]
    assert updated["spread_name"] == update_payload["spread_name"]
    assert updated["deck"] == update_payload["deck"]
    assert updated["key_cards"] == update_payload["key_cards"]
    assert updated["summary"] == update_payload["summary"]
    assert updated["updated_at"] != original_updated_at

    get_resp = client.get(f"/api/records/{created['id']}")
    fetched = get_resp.get_json()
    assert fetched["date"] == update_payload["date"]
    assert fetched["spread_name"] == update_payload["spread_name"]


def test_delete_record_then_get_returns_not_found(client):
    """单条删除：删除后再查询返回 404 记录不存在。"""
    create_resp = client.post("/api/records", json=_payload())
    created = create_resp.get_json()
    record_id = created["id"]

    before_get = client.get(f"/api/records/{record_id}")
    assert before_get.status_code == 200

    delete_resp = client.delete(f"/api/records/{record_id}")
    assert delete_resp.status_code == 204
    assert delete_resp.get_data(as_text=True) == ""

    after_get = client.get(f"/api/records/{record_id}")
    assert after_get.status_code == 404
    data = after_get.get_json()
    assert data is not None
    assert "error" in data
    assert data["error"] == "记录不存在"
