"""SQLite 数据库初始化与连接管理。"""

import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "tarot.db"

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
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    """将 sqlite3.Row 转为可 JSON 序列化的字典。"""
    return {key: row[key] for key in row.keys()}
