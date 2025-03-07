// 文件: server.js
// 修改支持多模型

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { router: authRouter, authenticateToken, deductCredits } = require('./auth');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 认证路由
app.use('/api/auth', authRouter);

// API密钥配置
const API_KEYS = {
    deepseek: process.env.DEEPSEEK_API_KEY,
    tongyi: process.env.TONGYI_API_KEY,
    yuanbao: process.env.YUANBAO_API_KEY
};

// 模型配置
const MODEL_CONFIG = {
    'deepseek-chat': {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: API_KEYS.deepseek,
        provider: 'deepseek'
    },
    'deepseek-v3': {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: API_KEYS.deepseek,
        provider: 'deepseek'
    },
    'deepseek-r1': {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: API_KEYS.deepseek,
        provider: 'deepseek'
    },
    'tongyi': {
        apiUrl: 'https://api.tongyi.aliyun.com/v1/chat/completions',
        apiKey: API_KEYS.tongyi,
        provider: 'tongyi'
    },
    'yuanbao': {
        apiUrl: 'https://api.yuanbao.ai/v1/chat/completions',
        apiKey: API_KEYS.yuanbao,
        provider: 'yuanbao'
    }
};

// API路由 - 聊天功能 (可选使用认证中间件)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = "deepseek-chat", max_tokens = 2000, temperature = 0.7 } = req.body;

        // 获取模型配置
        const modelConfig = MODEL_CONFIG[model] || MODEL_CONFIG['deepseek-chat'];

        if (!modelConfig) {
            return res.status(400).json({ error: '不支持的模型类型' });
        }

        // 检查API密钥是否配置
        if (!modelConfig.apiKey) {
            return res.status(500).json({ error: `${model} 模型的API密钥未配置` });
        }

        // 清除消息中的多余字段，只保留role和content
        const cleanedMessages = messages.map(({ role, content }) => ({ role, content }));

        // 构建请求体，根据不同提供商调整格式
        let requestBody;

        switch (modelConfig.provider) {
            case 'tongyi':
                requestBody = {
                    model: "qwen-max", // 通义千问默认模型
                    messages: cleanedMessages,
                    max_tokens: max_tokens,
                    temperature: temperature
                };
                break;
            case 'yuanbao':
                requestBody = {
                    model: "Yuan2.0", // 元宝默认模型
                    messages: cleanedMessages,
                    max_tokens: max_tokens,
                    temperature: temperature
                };
                break;
            case 'deepseek':
            default:
                requestBody = {
                    model: model,
                    messages: cleanedMessages,
                    max_tokens: max_tokens,
                    temperature: temperature
                };
                break;
        }

        // 发送请求到相应的API
        const response = await axios.post(
            modelConfig.apiUrl,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.apiKey}`
                }
            }
        );

        // 统一响应格式，确保与OpenAI格式兼容
        let standardResponse;

        switch (modelConfig.provider) {
            case 'tongyi':
                // 通义千问响应格式转换
                standardResponse = {
                    id: response.data.id || `chatcmpl-${Date.now()}`,
                    object: "chat.completion",
                    created: Math.floor(Date.now() / 1000),
                    model: model,
                    choices: [
                        {
                            message: {
                                role: "assistant",
                                content: response.data.choices[0].message.content
                            },
                            finish_reason: response.data.choices[0].finish_reason,
                            index: 0
                        }
                    ],
                    usage: response.data.usage
                };
                break;
            case 'yuanbao':
                // 元宝响应格式转换
                standardResponse = {
                    id: response.data.id || `chatcmpl-${Date.now()}`,
                    object: "chat.completion",
                    created: Math.floor(Date.now() / 1000),
                    model: model,
                    choices: [
                        {
                            message: {
                                role: "assistant",
                                content: response.data.choices[0].message.content
                            },
                            finish_reason: response.data.choices[0].finish_reason,
                            index: 0
                        }
                    ],
                    usage: response.data.usage
                };
                break;
            case 'deepseek':
            default:
                // DeepSeek格式已经与OpenAI兼容，直接使用
                standardResponse = response.data;
                break;
        }

        res.json(standardResponse);
    } catch (error) {
        console.error('AI API调用错误:', error.response?.data || error.message);
        res.status(500).json({
            error: '调用AI服务时出错',
            details: error.response?.data || error.message
        });
    }
});

// 图像生成API路由
app.post('/api/generate-image', authenticateToken, async (req, res) => {
    try {
        const { prompt, provider = "deepseek" } = req.body;

        // 根据提供商选择适当的API
        let apiUrl, apiKey, requestBody;

        switch (provider) {
            case 'tongyi':
                apiUrl = 'https://api.tongyi.aliyun.com/v1/images/generations';
                apiKey = API_KEYS.tongyi;
                requestBody = {
                    model: "wanx-v1",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024"
                };
                break;
            case 'deepseek':
            default:
                apiUrl = 'https://api.deepseek.com/v1/images/generations';
                apiKey = API_KEYS.deepseek;
                requestBody = {
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024"
                };
                break;
        }

        // 检查API密钥是否配置
        if (!apiKey) {
            return res.status(500).json({ error: `${provider} 提供商的API密钥未配置` });
        }

        // 扣除用户积分
        if (!deductCredits(req.user.id, 2)) { // 图像生成消耗更多积分
            return res.status(403).json({ error: '积分不足，无法生成图像' });
        }

        const response = await axios.post(
            apiUrl,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
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
        version: '1.0.0',
        supportedModels: Object.keys(MODEL_CONFIG)
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查端点: http://localhost:${PORT}/health`);
});