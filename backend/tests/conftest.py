"""pytest 配置与共享夹具。"""

import sqlite3
from collections.abc import Generator

import pytest

import db
from app import app as flask_app


@pytest.fixture(scope="function")
def mem_conn() -> Generator[sqlite3.Connection, None, None]:
    """创建一个共享的内存 SQLite 连接，初始化表结构，测试结束后关闭。"""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
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
        conn.commit()
        yield conn
    finally:
        conn.close()


@pytest.fixture(scope="function")
def app(mem_conn: sqlite3.Connection, monkeypatch: pytest.MonkeyPatch):
    """返回配置好的 Flask 应用，所有数据库操作指向内存连接。"""

    def fake_get_connection() -> sqlite3.Connection:
        return mem_conn

    monkeypatch.setattr(db, "get_connection", fake_get_connection)
    flask_app.config.update({"TESTING": True})
    yield flask_app


@pytest.fixture(scope="function")
def client(app):
    """返回 Flask 测试客户端。"""
    return app.test_client()
