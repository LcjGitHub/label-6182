"""请求体验证模块。"""

REQUIRED_FIELDS = ("date", "spread_name", "deck", "key_cards", "summary")
DECK_PRESET_REQUIRED_FIELDS = ("name",)
SPREAD_TEMPLATE_REQUIRED_FIELDS = ("name",)


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


def validate_spread_template_payload(data: dict | None) -> tuple[dict | None, str | None]:
    """校验牌阵模板请求体字段，返回 (数据, 错误信息)。"""
    if not data:
        return None, "请求体不能为空"
    cleaned = {}
    for field in SPREAD_TEMPLATE_REQUIRED_FIELDS:
        value = data.get(field)
        if value is None or str(value).strip() == "":
            return None, f"字段 {field} 不能为空"
        cleaned[field] = str(value).strip()
    scenario_value = data.get("scenario")
    cleaned["scenario"] = str(scenario_value).strip() if scenario_value else ""
    card_count_value = data.get("card_count")
    try:
        cleaned["card_count"] = int(card_count_value) if card_count_value else 0
    except (ValueError, TypeError):
        return None, "字段 card_count 必须是整数"
    if cleaned["card_count"] < 0:
        return None, "字段 card_count 不能为负数"
    return cleaned, None
