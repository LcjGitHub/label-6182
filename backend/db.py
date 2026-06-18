"""SQLite 数据库初始化与连接管理。"""

import os
import sqlite3
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
_default_db_path = DATA_DIR / "tarot.db"
DATABASE_PATH = os.environ.get("DATABASE_PATH", str(_default_db_path))


def set_database_path(path: Optional[str]) -> None:
    """动态设置数据库路径，用于测试切换内存数据库。"""
    global DATABASE_PATH
    if path is None:
        DATABASE_PATH = str(_default_db_path)
    else:
        DATABASE_PATH = path

SEED_RECORDS = [
    {
        "date": "2026-06-15",
        "spread_name": "凯尔特十字",
        "deck": "韦特塔罗",
        "key_cards": "愚者、恋人、太阳",
        "summary": "整体能量偏向新生与选择，建议保持开放心态，关注关系中的真诚沟通。",
    },
    {
        "date": "2026-06-10",
        "spread_name": "三牌阵",
        "deck": "马赛塔罗",
        "key_cards": "魔术师、女祭司、世界",
        "summary": "过去已积累足够资源，当下宜静观直觉，未来有圆满收尾的可能。",
    },
    {
        "date": "2026-06-05",
        "spread_name": "圣三角",
        "deck": "韦特塔罗",
        "key_cards": "高塔、星星、审判",
        "summary": "经历短暂震荡后迎来疗愈期，适合复盘旧模式并做出决断。",
    },
    {
        "date": "2026-05-28",
        "spread_name": "每日一牌",
        "deck": "托特塔罗",
        "key_cards": "皇后",
        "summary": "今日主题与滋养、创造力相关，宜照顾身心并投入手作或园艺。",
    },
    {
        "date": "2026-05-20",
        "spread_name": "关系牌阵",
        "deck": "韦特塔罗",
        "key_cards": "宝剑三、节制、圣杯二",
        "summary": "沟通中存在误解，通过耐心调和可重建信任与平衡。",
    },
]

SEED_DECK_PRESETS = [
    {
        "name": "韦特塔罗",
        "description": "最经典的塔罗牌系，图像直观易懂，适合初学者和日常占卜使用。",
    },
    {
        "name": "马赛塔罗",
        "description": "欧洲传统塔罗体系，注重数字符号与结构，适合深度解读与研究。",
    },
    {
        "name": "托特塔罗",
        "description": "克劳利所创，融合卡巴拉与占星，象征体系深邃，适合进阶研习。",
    },
]

SEED_SPREAD_TEMPLATES = [
    {
        "name": "每日一牌",
        "scenario": "适合日常占卜与快速洞察，每日抽取一张牌作为当日能量指引或提示。",
        "card_count": 1,
    },
    {
        "name": "三牌阵 / 圣三角",
        "scenario": "最经典的基础牌阵，适用于过去、现在、未来的时间流解读，可用于感情、事业、学业等各类问题。",
        "card_count": 3,
    },
    {
        "name": "四元素牌阵",
        "scenario": "从火、水、风、土四元素角度分析问题，适合全面评估现状与行动方向。",
        "card_count": 4,
    },
    {
        "name": "凯尔特十字",
        "scenario": "最经典的复杂牌阵，适用于深入分析具体问题，涵盖现状、挑战、潜意识、外部环境、未来发展等多维度。",
        "card_count": 10,
    },
    {
        "name": "关系牌阵 / 恋人牌阵",
        "scenario": "专门用于情感关系解读，分析双方状态、关系现状、潜在问题与发展建议。",
        "card_count": 6,
    },
]


def get_connection() -> sqlite3.Connection:
    """获取 SQLite 连接，启用 Row 工厂以便按列名访问。"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """创建数据表并在空库时写入 seed 数据。"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS practice_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                spread_name TEXT NOT NULL,
                deck TEXT NOT NULL,
                key_cards TEXT NOT NULL,
                summary TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            )
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM practice_records").fetchone()[0]
        if count == 0:
            conn.executemany(
                """
                INSERT INTO practice_records
                    (date, spread_name, deck, key_cards, summary)
                VALUES
                    (:date, :spread_name, :deck, :key_cards, :summary)
                """,
                SEED_RECORDS,
            )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS deck_presets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            )
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM deck_presets").fetchone()[0]
        if count == 0:
            conn.executemany(
                """
                INSERT INTO deck_presets
                    (name, description)
                VALUES
                    (:name, :description)
                """,
                SEED_DECK_PRESETS,
            )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS spread_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                scenario TEXT NOT NULL DEFAULT '',
                card_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            )
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM spread_templates").fetchone()[0]
        if count == 0:
            conn.executemany(
                """
                INSERT INTO spread_templates
                    (name, scenario, card_count)
                VALUES
                    (:name, :scenario, :card_count)
                """,
                SEED_SPREAD_TEMPLATES,
            )
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    """将 sqlite3.Row 转为可 JSON 序列化的字典。"""
    return {key: row[key] for key in row.keys()}
