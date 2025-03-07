// 文件: server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { router: authRouter, authenticateToken } = require('./auth');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 认证路由
app.use('/api/auth', authRouter);

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// API路由 - 聊天功能 (可选使用认证中间件)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        // 清除消息中的多余字段，只保留role和content
        const cleanedMessages = messages.map(({ role, content }) => ({ role, content }));

        const response = await axios.post(
            DEEPSEEK_API_URL,
            {
                model: "deepseek-chat",
                messages: cleanedMessages,
                max_tokens: 2000,
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('DeepSeek API调用错误:', error.response?.data || error.message);
        res.status(500).json({
            error: '调用AI服务时出错',
            details: error.response?.data || error.message
        });
    }
});

// 图像生成API路由
app.post('/api/generate-image', authenticateToken, async (req, res) => {
    try {
        const { prompt } = req.body;

        // 假设的图像生成API调用
        const response = await axios.post(
            'https://api.deepseek.com/v1/images/generations',
            {
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('图像生成API调用错误:', error.response?.data || error.message);
        res.status(500).json({
            error: '生成图像时出错',
            details: error.response?.data || error.message
        });
    }
});

// 服务健康检查
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查端点: http://localhost:${PORT}/health`);
});