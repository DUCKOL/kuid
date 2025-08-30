# 快答AI - 智能笔试辅助系统 (kuda 0.020v)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-37.x-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 📖 项目愿景与核心原则

**愿景**：创建一个技术领先、绝对隐蔽的智能笔试辅助工具。它将桌面端的实时捕捉能力与云端顶尖AI的分析能力无缝结合，通过一个独立的、跨设备的Web界面，为用户提供即时、准确的答案支持。

**核心原则**:

*   **⚡ 极致实时 (Real-time)**: 从截图到答案呈现，整个流程的延迟控制在秒级。WebSocket是实现这一目标的技术基石。
*   **👻 绝对隐形 (Stealth)**: 在考试电脑上运行时，做到“零感知”。无窗口、无明显进程、无异常网络行为，最大化规避所有已知和未知的自动化监考系统。
*   **🧩 架构灵活 (Flexibility)**: 前后端分离，前端部署于Vercel，后端可部署于任何支持长连接的云平台。客户端可通过配置连接到指定后端，保证系统的可维护性和扩展性。

## 🏛️ 系统架构

本项目采用 Monorepo（单一代码库）管理，包含三个独立的项目模块：

1.  **`kuai-da-ai-backend`**: 后端服务，负责用户认证、WebSocket 通信、数据库操作和调用 Gemini AI 模型。
2.  **`kuai-da-ai-webapp`**: Web 前端应用，作为答案接收和展示端，可在任意浏览器设备上运行。
3.  **`kuai-da-ai-desktop`**: 桌面客户端，运行在考试电脑上，负责登录、全局热键监听和高清截图。

```
/ (root)
├── 📂 kuai-da-ai-backend/     # 后端服务 (Node.js)
├── 📂 kuai-da-ai-webapp/      # Web 前端 (Vue.js)
└── 📂 kuai-da-ai-desktop/     # 桌面客户端 (Electron + Vue)
```

## 🛠️ 环境与技术栈

### 1. 必需软件安装

在开始之前，请确保您的开发环境中安装了以下所有软件。

| 软件 | 版本推荐 | 安装指南 |
| :--- | :--- | :--- |
| 🐘 **PostgreSQL** | `15.x` 或更高 | 数据库服务。访问 [官网下载](https://www.postgresql.org/download/)，安装时请务必**记下您为 `postgres` 用户设置的密码**。 |
| 🟩 **Node.js (通过 NVM)** | `v20.x` (LTS) | JavaScript 运行环境。**强烈推荐使用 NVM 安装**以管理多版本。 |
| 📦 **Git** | 最新版 | 版本控制工具。访问 [官网下载](https://git-scm.com/downloads)。 |
| ⚡ **pnpm** | `v10.x` 或更高 | 高性能的包管理器。用于 `kuai-da-ai-desktop` 项目。 |
| 🌐 **网络代理** | (可选) | V2Ray, Clash 等。确保能稳定访问 Google API。 |

#### **通过 NVM (Node Version Manager) 安装 Node.js (推荐)**

NVM 允许您轻松切换 Node.js 版本，避免环境冲突。

1.  **安装 NVM for Windows**: 访问 [NVM-Windows GitHub](https://github.com/coreybutler/nvm-windows/releases) 并下载 `nvm-setup.zip` 进行安装。
2.  **配置国内镜像 (加速下载)**:
    ```bash
    nvm node_mirror https://npmmirror.com/mirrors/node/
    nvm npm_mirror https://npmmirror.com/mirrors/npm/
    ```
3.  **安装并使用 Node.js v20**:
    ```bash
    nvm install 20
    nvm use 20
    ```

#### **安装 pnpm**

在安装并切换到 Node.js v20 后，运行以下命令全局安装 pnpm：
```bash
npm install -g pnpm
```

### 2. 核心库与框架

| 模块 | 主要技术栈 |
| :--- | :--- |
| **后端 (`/backend`)** | `Node.js`, `Express.js`, `Socket.IO`, `Prisma`, `Axios`, `jsonwebtoken`, `bcryptjs` |
| **Web前端 (`/webapp`)** | `Vue.js 3`, `Vite`, `Vue Router`, `Pinia`, `Socket.IO-client`, `Axios` |
| **桌面客户端 (`/desktop`)** | `Electron`, `Vue.js 3`, `TypeScript`, `Vite`, `Pinia`, `Socket.IO-client`, `Axios` |

## 🚀 项目安装与配置

### 第一步：克隆仓库

```bash
git clone https://github.com/YourUsername/KuaiDa-AI.git
cd KuaiDa-AI
```

### 第二步：配置后端 (`kuai-da-ai-backend`)

1.  **进入目录**: `cd kuai-da-ai-backend`
2.  **安装依赖**: `npm install`
3.  **配置环境变量**:
    *   复制 `.env.example` 文件并重命名为 `.env`。
    *   修改 `.env` 文件，填入你的配置：
        ```env
        # 数据库连接字符串 (请将 YOUR_PASSWORD 替换为您安装 PostgreSQL 时设置的密码)
        DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"

        # 你的 Gemini API 密钥
        GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX"

        # JWT 密钥 (可以自定义一个复杂的随机字符串)
        JWT_SECRET="YOUR_CUSTOM_JWT_SECRET_KEY"
        ```
4.  **应用数据库迁移**: `npx prisma migrate dev --name init`

### 第三步：配置 Web 前端 (`kuai-da-ai-webapp`)

1.  **进入目录**: `cd ../kuai-da-ai-webapp`
2.  **安装依赖**: `npm install`

### 第四步：配置桌面客户端 (`kuai-da-ai-desktop`)

1.  **进入目录**: `cd ../kuai-da-ai-desktop`
2.  **安装依赖 (必须使用 pnpm)**: `pnpm install`

## 🎮 运行指南

为了使整个系统正常工作，你需要**同时打开 3 个独立的终端窗口**，并按顺序启动所有服务。

### 1. 启动后端服务 (终端 1)

> **注意**: 如果你无法直接访问 Google API，请确保你的代理软件（如 V2Ray, Clash）已开启**全局+TUN模式**，并使用以下命令启动。

```bash
cd kuai-da-ai-backend
# 启动命令 (已包含内存扩容和DNS优化)
node --max-old-space-size=4096 --dns-result-order=ipv4first index.js
```
*成功标志：看到 `🚀 服务器正在端口 3000 上运行`。*

### 2. 启动 Web 前端 (终端 2)

```bash
cd kuai-da-ai-webapp
npm run dev
```
*成功标志：看到 `➜ Local: http://localhost:XXXX/`。在手机或备用电脑的浏览器中访问此地址。*

### 3. 启动桌面客户端 (终端 3 - 需管理员权限)

> **重要**: 请以**管理员权限**打开此终端，否则全局热键可能无法注册。

```bash
cd kuai-da-ai-desktop
pnpm run dev
```
*成功标志：自动弹出一个桌面应用窗口。*

## ✨ 使用流程

1.  **双端登录**: 在**桌面客户端**和**Web前端**上，使用同一个账号登录。
2.  **截图**: 在考试电脑上，按下全局热键 **`Ctrl + Alt + S`** 进行高清全屏截图。
3.  **切换模型**: 按下全局热键 **`Alt + Z`** 可在 `gemini-1.5-flash` 和 `gemini-1.5-pro` 等模型间循环切换。
4.  **查看答案**: 在 Web 前端的浏览器页面上，实时查看 Gemini 返回的答案。
5.  **点击截图**: (可选) 在桌面客户端勾选“点击客户端窗口3秒后全屏截图”，之后点击客户端任意位置，等待3秒即可自动截图。

---
