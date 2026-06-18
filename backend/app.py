"""塔罗牌阵练习记录 API 服务。"""

from flask import Flask, jsonify
from flask_cors import CORS

from db import init_db
from routes.records import bp as records_bp
from routes.deck_presets import bp as deck_presets_bp
from routes.spread_templates import bp as spread_templates_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(records_bp)
app.register_blueprint(deck_presets_bp)
app.register_blueprint(spread_templates_bp)


@app.get("/api/health")
def health():
    """健康检查。"""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=4000, debug=True)
