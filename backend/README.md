# DeepSeek AI Chat Backend

该项目是 DeepSeek AI Chat 应用的后端服务，提供与多种大型语言模型API交互的能力。

## 功能特点

- 多模型支持：支持 DeepSeek-V3、DeepSeek-R1、通义千问、元宝等多种模型
- 用户认证：完整的注册/登录系统，使用 JWT 进行身份验证
- 会话管理：支持创建、更新和删除用户会话
- 积分系统：用户积分管理，控制 API 使用额度
- 安全性：环境变量配置，API 密钥保护

## 技术栈

- Node.js + Express
- JWT 认证
- Axios 用于 API 请求
- Bcrypt 密码加密
- 支持 CORS 跨域请求

## 快速开始

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

复制 `.env.example` 文件到 `.env` 并填写必要的环境变量：

```
PORT=5000
DEEPSEEK_API_KEY=your_deepseek_api_key
TONGYI_API_KEY=your_tongyi_api_key
YUANBAO_API_KEY=your_yuanbao_api_key
JWT_SECRET=your_secure_jwt_secret_key_should_be_long_and_random
NODE_ENV=development
```

确保将 `.env` 文件添加到 `.gitignore` 以保护 API 密钥。

### 启动服务器

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

## API 端点

### 认证 API

- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/user` - 获取当前用户信息

### 聊天 API

- `POST /api/chat` - 发送消息到 AI 模型并获取响应
- `POST /api/generate-image` - 使用 AI 生成图像（需要认证）

### 系统 API

- `GET /health` - 服务健康检查

## 部署

本服务可以部署在任何支持 Node.js 的环境中，如：

- Heroku
- DigitalOcean
- AWS EC2
- Azure
- Docker

## 开发指南

### 项目结构

```
backend/
├── .env                 # 环境变量配置
├── auth.js              # 认证相关逻辑
├── package.json         # 项目依赖
└── server.js            # 主服务器文件
```

### 添加新模型

要添加新的 AI 模型支持，请在 `server.js` 中修改 `/api/chat` 路由处理程序，添加模型选择逻辑和相应的 API 调用。

```javascript
// 示例：添加新模型支持
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = "deepseek-chat" } = req.body;
        
        // 根据模型选择合适的 API
        let apiUrl, apiKey, requestBody;
        
        switch (model) {
            case "tongyi":
                apiUrl = "https://api.tongyi.com/v1/chat/completions";
                apiKey = process.env.TONGYI_API_KEY;
                // 构建请求体...
                break;
            case "yuanbao":
                // 配置元宝 API...
                break;
            default: // deepseek 作为默认选项
                apiUrl = "https://api.deepseek.com/v1/chat/completions";
                apiKey = process.env.DEEPSEEK_API_KEY;
                // 构建请求体...
        }
        
        // 发送 API 请求并返回结果...
    } catch (error) {
        // 错误处理...
    }
});
```

## 安全考虑

- 使用环境变量存储敏感信息
- 实施速率限制以防止滥用
- 保持依赖项更新，以修复安全漏洞
- 在生产环境中使用 HTTPS