# 塔罗牌阵练习记录

记录塔罗牌阵练习的 MVP 应用：列表（日期倒序）+ 新建/编辑表单，支持基础 CRUD。

| 模块 | 技术栈 | 端口 |
|------|--------|------|
| 前端 | React + MUI、TanStack Query、dayjs | **4101** |
| 后端 | Flask + SQLite (`backend/data/tarot.db`) | **4000** |

## 环境要求

- **Node.js** 18+（前端依赖用项目内 `npm install` 安装）
- **Python** 3.10+（后端依赖用项目内虚拟环境安装）

## 首次安装

### 后端

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS / Linux：

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 前端

```powershell
cd frontend
npm install
```

## 启动

需要**两个终端**，先后端、再前端。

### 后端（一条命令）

在项目根目录执行（Windows PowerShell）：

```powershell
cd backend; .\venv\Scripts\Activate.ps1; python app.py
```

macOS / Linux：

```bash
cd backend && source venv/bin/activate && python app.py
```

服务地址：`http://localhost:4000`  
首次启动会自动创建 `backend/data/tarot.db` 并写入练习记录、牌组预设、牌阵模板等 seed 数据。

### 前端

```powershell
cd frontend
npm run dev
```

浏览器访问：**http://localhost:4101**

前端通过 Vite 代理将 `/api` 转发到后端 `4000` 端口。

## 功能说明

- **练习记录**：列表页按日期倒序展示，支持编辑、删除；点击牌阵名进入详情页；表单页新建/编辑记录
- **练习记录详情页**（路径 `/records/:id`）：展示日期、牌阵名、牌组、关键牌、解读摘要、创建时间与更新时间；底部提供编辑和返回列表按钮
- **练习记录字段**：日期、牌阵名、牌组、关键牌、解读摘要
- **牌阵模板库**（导航入口：顶部「牌阵模板」菜单项，路径 `/templates`）：
  - 模板列表页：展示所有模板的名称、适用场景、建议牌位数量
  - 详情查看：点击「详情」查看完整的适用场景说明
  - 完整 CRUD：支持新建、编辑、删除模板
  - 五条默认模板：每日一牌、三牌阵/圣三角、四元素牌阵、凯尔特十字、关系牌阵/恋人牌阵
- **记录表单集成**：新建/编辑记录时，牌阵名字段旁提供「从模板选择」按钮，点击弹出模板列表，选中后自动填充牌阵名

## API 概览

### 练习记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/records` | 列表（日期倒序） |
| GET | `/api/records/:id` | 单条详情 |
| POST | `/api/records` | 新建 |
| PUT | `/api/records/:id` | 更新 |
| DELETE | `/api/records/:id` | 删除 |

### 牌阵模板

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/spread-templates` | 模板列表（按创建顺序） |
| GET | `/api/spread-templates/:id` | 单条模板详情 |
| POST | `/api/spread-templates` | 新建模板 |
| PUT | `/api/spread-templates/:id` | 更新模板 |
| DELETE | `/api/spread-templates/:id` | 删除模板 |

## 目录结构

```
├── backend/
│   ├── app.py              # Flask 入口与路由（记录、牌组预设、牌阵模板 API）
│   ├── db.py               # SQLite 初始化与 seed
│   ├── requirements.txt
│   └── data/tarot.db       # 运行时生成
├── frontend/
│   ├── src/
│   │   ├── pages/          # 各功能页面
│   │   │   ├── RecordListPage.tsx       # 练习记录列表
│   │   │   ├── RecordDetailPage.tsx     # 练习记录详情
│   │   │   ├── RecordFormPage.tsx       # 新建/编辑记录
│   │   │   ├── SpreadTemplatePage.tsx   # 牌阵模板库
│   │   │   ├── DeckPresetPage.tsx       # 牌组预设管理
│   │   │   └── StatisticsPage.tsx       # 练习统计
│   │   ├── components/     # 布局、表单组件
│   │   ├── types.ts        # TypeScript 类型定义
│   │   └── api.ts          # API 封装
│   └── package.json
└── README.md
```
