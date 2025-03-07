# DeepSeek AI Chat 应用

![DeepSeek AI](https://your-image-url-here.com/deepseek-logo.png)

一个基于多种大语言模型的智能对话应用，支持 DeepSeek-V3、DeepSeek-R1、通义千问、元宝等多模型，提供丰富的对话管理功能。

## 🌟 功能特点

- **多模型支持**：集成多种顶尖大语言模型，满足不同场景需求
- **多对话管理**：轻松创建、切换、重命名和删除对话
- **本地存储**：自动保存对话历史，随时继续之前的对话
- **Markdown 渲染**：AI 回复支持 Markdown 格式，包括代码高亮
- **响应式设计**：完美适配桌面和移动设备
- **用户认证**：完整的注册/登录系统，管理个人对话和使用额度

## 🚀 快速开始

### 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的 API 密钥

# 启动服务器
npm run dev
```

## 📋 系统要求

- Node.js 16+
- npm 或 yarn
- 现代浏览器（Chrome、Firefox、Safari、Edge 等）

## 🔧 项目结构

```
deepseek-chat/
├── frontend/               # React 前端
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── components/     # UI 组件
│       └── App.js          # 主应用组件
│
└── backend/                # Node.js 后端
    ├── auth.js             # 认证相关逻辑
    └── server.js           # 主服务器文件
```

## 🧩 主要技术栈

### 前端
- React 19.0
- Axios 用于 API 请求
- React Markdown 用于渲染 Markdown
- CSS3 用于响应式设计

### 后端
- Node.js + Express
- JWT 用于身份验证
- Axios 用于与 AI API 交互
- bcrypt 用于密码加密

## 📱 使用指南

1. **注册/登录**：首次使用需要创建账户
2. **选择模型**：从支持的多种 AI 模型中选择一个
3. **开始对话**：点击"新对话"按钮开始
4. **管理对话**：通过侧边栏查看和管理历史对话
5. **清空对话**：点击"清空对话"按钮或输入"清空对话"命令

## 🛠️ 自定义配置

### 添加新模型

可以通过修改后端 `server.js` 和前端 `ChatWindow.js` 来添加对新 AI 模型的支持。

### 自定义界面主题

可以通过编辑 CSS 文件来自定义界面颜色和样式。

## 📄 许可证

[MIT 许可证](LICENSE)

## 🤝 贡献指南

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解更多信息。

## 📞 联系方式

如有问题或建议，请通过以下方式联系我们：

- 邮箱：ysa@kiki20.com
- GitHub Issues：[提交问题](https://github.com/yynps737/deepseek-chat/issues)
