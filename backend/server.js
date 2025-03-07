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

// 模型配置 - 修正API端点
const MODEL_CONFIG = {
    'deepseek-chat': {
        apiUrl: 'https://api.deepseek.com/v1/chat/completions', // 修正为正确的v1端点
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

// API连接测试端点
app.get('/api/test-connection', async (req, res) => {
    try {
        // 确认API密钥已配置
        if (!API_KEYS.deepseek) {
            return res.status(400).json({
                status: '错误',
                message: 'DeepSeek API密钥未配置'
            });
        }

        // 尝试简单请求
        const response = await axios.get('https://api.deepseek.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${API_KEYS.deepseek}`,
                'Accept': 'application/json'
            }
        });

        res.json({
            status: '成功',
            message: 'API连接成功',
            models: response.data
        });
    } catch (error) {
        res.status(500).json({
            status: '错误',
            message: '连接测试失败',
            error: error.message,
            response: error.response?.data,
            statusCode: error.response?.status
        });
    }
});

// API路由 - 聊天功能 (可选使用认证中间件)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = "deepseek-chat", max_tokens = 2000, temperature = 0.7 } = req.body;

        // 获取模型配置
        const modelConfig = MODEL_CONFIG[model];

        // 更严格的验证
        if (!modelConfig) {
            return res.status(400).json({
                error: '不支持的模型类型',
                model: model,
                supportedModels: Object.keys(MODEL_CONFIG)
            });
        }

        // 检查API密钥是否配置
        if (!modelConfig.apiKey) {
            return res.status(500).json({
                error: `${model} 模型的API密钥未配置`,
                envVarStatus: process.env.DEEPSEEK_API_KEY ? '已设置但可能无效' : '未设置'
            });
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

        console.log(`正在发送请求到 ${modelConfig.apiUrl}，使用模型 ${model}`);

        // 创建带超时的axios实例
        const axiosInstance = axios.create({
            timeout: 30000, // 30秒超时
            validateStatus: (status) => status < 500 // 允许400系列错误以便正确处理
        });

        // 发送请求到相应的API
        const response = await axiosInstance.post(
            modelConfig.apiUrl,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.apiKey}`,
                    'Accept': 'application/json' // 明确告知服务器期望JSON响应
                }
            }
        );

        // 记录响应状态码和头部，但不记录整个响应对象
        console.log('API响应状态码:', response.status);
        console.log('API响应头部:', JSON.stringify(response.headers));

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
        console.error('AI API调用错误:', error.message);

        if (error.response) {
            // 服务器响应了错误状态码
            console.error('状态码:', error.response.status);
            console.error('响应头:', JSON.stringify(error.response.headers));
            console.error('响应数据:', error.response.data);

            res.status(error.response.status).json({
                error: `API服务返回错误: ${error.response.status}`,
                details: error.response.data,
                message: error.message
            });
        } else if (error.request) {
            // 请求已发送但未收到响应
            console.error('请求已发送但未收到响应:', error.request.method, error.request.path);

            res.status(500).json({
                error: '未收到API服务响应',
                details: '请求超时或服务不可用',
                message: error.message
            });
        } else {
            // 设置请求时出错
            console.error('请求配置错误:', error.message);

            res.status(500).json({
                error: '请求配置错误',
                details: error.message
            });
        }
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
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30秒超时
            }
        );

        // 记录响应状态码，但不记录整个响应对象
        console.log('图像生成API响应状态码:', response.status);

        res.json(response.data);
    } catch (error) {
        console.error('图像生成API调用错误:', error.message);

        if (error.response) {
            res.status(error.response.status).json({
                error: '生成图像时出错',
                details: error.response.data,
                status: error.response.status
            });
        } else {
            res.status(500).json({
                error: '生成图像时出错',
                details: error.message
            });
        }
    }
});

// 服务健康检查
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        supportedModels: Object.keys(MODEL_CONFIG),
        apiKeys: {
            deepseek: API_KEYS.deepseek ? '已配置' : '未配置',
            tongyi: API_KEYS.tongyi ? '已配置' : '未配置',
            yuanbao: API_KEYS.yuanbao ? '已配置' : '未配置'
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查端点: http://localhost:${PORT}/health`);
    console.log(`API连接测试: http://localhost:${PORT}/api/test-connection`);
});