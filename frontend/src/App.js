// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { v4 as uuidv4 } from 'uuid';

// 支持的模型列表
const SUPPORTED_MODELS = [
    {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: '通用大语言模型',
        avatar: '/models/deepseek-logo.png',
        apiEndpoint: '/api/chat',
        apiParams: {
            model: 'deepseek-chat',
            max_tokens: 2000,
            temperature: 0.7
        }
    },
    {
        id: 'deepseek-v3',
        name: 'DeepSeek V3',
        description: '功能更强大的新版模型',
        avatar: '/models/deepseek-v3-logo.png',
        apiEndpoint: '/api/chat',
        apiParams: {
            model: 'deepseek-v3',
            max_tokens: 2000,
            temperature: 0.7
        }
    },
    {
        id: 'deepseek-r1',
        name: 'DeepSeek R1',
        description: '专为代码设计的模型',
        avatar: '/models/deepseek-r1-logo.png',
        apiEndpoint: '/api/chat',
        apiParams: {
            model: 'deepseek-r1',
            max_tokens: 2000,
            temperature: 0.7
        }
    },
    {
        id: 'tongyi',
        name: '通义千问',
        description: '阿里通义大语言模型',
        avatar: '/models/tongyi-logo.png',
        apiEndpoint: '/api/chat',
        apiParams: {
            model: 'tongyi',
            max_tokens: 2000,
            temperature: 0.7
        }
    },
    {
        id: 'yuanbao',
        name: '元宝',
        description: '适合中文对话的模型',
        avatar: '/models/yuanbao-logo.png',
        apiEndpoint: '/api/chat',
        apiParams: {
            model: 'yuanbao',
            max_tokens: 2000,
            temperature: 0.7
        }
    }
];

function App() {
    // 状态管理
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeModel, setActiveModel] = useState(SUPPORTED_MODELS[0]);
    const [isNewChat, setIsNewChat] = useState(true);

    // 初始化时从本地存储加载对话数据
    useEffect(() => {
        const savedConversations = localStorage.getItem('deepseek-conversations');
        const savedActiveId = localStorage.getItem('deepseek-active-conversation');
        const savedModelId = localStorage.getItem('deepseek-active-model');

        if (savedConversations) {
            try {
                const parsedConversations = JSON.parse(savedConversations);
                setConversations(parsedConversations);

                // 如果有保存的活跃对话ID，则设置为当前活跃对话
                if (savedActiveId && parsedConversations.find(c => c.id === savedActiveId)) {
                    setActiveConversationId(savedActiveId);
                    setIsNewChat(false);
                } else if (parsedConversations.length > 0) {
                    // 如果没有保存活跃ID或该ID不存在，则使用第一个对话
                    setActiveConversationId(parsedConversations[0].id);
                    setIsNewChat(false);
                }
            } catch (error) {
                console.error('加载保存的对话时出错:', error);
                createNewConversation(); // 出错时创建新对话
            }
        } else {
            // 如果没有保存的对话，创建一个新对话
            createNewConversation();
        }

        // 加载保存的模型选择
        if (savedModelId) {
            const savedModel = SUPPORTED_MODELS.find(m => m.id === savedModelId);
            if (savedModel) {
                setActiveModel(savedModel);
            }
        }
    }, []);

    // 保存状态到本地存储
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('deepseek-conversations', JSON.stringify(conversations));
        }

        if (activeConversationId) {
            localStorage.setItem('deepseek-active-conversation', activeConversationId);
        }

        if (activeModel) {
            localStorage.setItem('deepseek-active-model', activeModel.id);
        }
    }, [conversations, activeConversationId, activeModel]);

    // 获取当前活跃对话
    const activeConversation = conversations.find(conv => conv.id === activeConversationId);

    // 创建新对话
    const createNewConversation = () => {
        const newId = uuidv4();
        const newConversation = {
            id: newId,
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString(),
            modelId: activeModel.id
        };

        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newId);
        setIsNewChat(true);
        setIsMobileSidebarOpen(false);
    };

    // 删除对话
    const deleteConversation = (id) => {
        const updatedConversations = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversations);

        // 如果删除的是当前活跃对话，则切换到其他对话
        if (id === activeConversationId) {
            if (updatedConversations.length > 0) {
                setActiveConversationId(updatedConversations[0].id);
                setIsNewChat(false);
            } else {
                // 如果没有其他对话，创建一个新对话
                createNewConversation();
            }
        }
    };

    // 重命名对话
    const renameConversation = (id, newTitle) => {
        const updatedConversations = conversations.map(conv =>
            conv.id === id ? { ...conv, title: newTitle } : conv
        );
        setConversations(updatedConversations);
    };

    // 清空对话消息
    const clearConversation = () => {
        createNewConversation();
    };

    // 选择对话
    const selectConversation = (id) => {
        setActiveConversationId(id);
        setIsNewChat(false);
        setIsMobileSidebarOpen(false);
    };

    // 添加消息到对话
    const addMessageToConversation = (id, message) => {
        setConversations(prevConversations => {
            return prevConversations.map(conv => {
                if (conv.id === id) {
                    const updatedMessages = [...conv.messages, message];

                    // 如果是第一条用户消息，并且标题仍为默认，则自动更新标题
                    let updatedTitle = conv.title;
                    if (conv.title === '新对话' && message.role === 'user' && updatedMessages.length === 1) {
                        updatedTitle = message.content.slice(0, 28) + (message.content.length > 28 ? '...' : '');
                    }

                    return {
                        ...conv,
                        messages: updatedMessages,
                        title: updatedTitle,
                        modelId: activeModel.id
                    };
                }
                return conv;
            });
        });

        setIsNewChat(false);
    };

    // 切换模型
    const handleModelChange = (model) => {
        setActiveModel(model);
    };

    // 处理发送消息
    const handleSendMessage = async (input) => {
        if (!input.trim() || !activeConversationId) return;

        // 添加用户消息
        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
            modelId: activeModel.id
        };
        addMessageToConversation(activeConversationId, userMessage);

        setIsLoading(true);
        try {
            // 获取当前对话的所有消息用于API调用
            const currentConversation = conversations.find(conv => conv.id === activeConversationId);
            const currentMessages = [...(currentConversation.messages || []), userMessage]
                .map(({ role, content }) => ({ role, content })); // 仅发送role和content字段

            // 构建API请求参数
            const requestBody = {
                messages: currentMessages,
                ...activeModel.apiParams
            };

            // 调用API
            const response = await fetch(activeModel.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '与AI服务通信时出错');
            }

            // 添加AI响应
            addMessageToConversation(activeConversationId, {
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: new Date().toISOString(),
                modelId: activeModel.id
            });
        } catch (error) {
            console.error('发送消息时出错:', error);

            // 添加错误消息
            addMessageToConversation(activeConversationId, {
                role: 'assistant',
                content: `出错了: ${error.message}`,
                timestamp: new Date().toISOString(),
                modelId: activeModel.id
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={selectConversation}
                onCreateConversation={createNewConversation}
                onDeleteConversation={deleteConversation}
                onRenameConversation={renameConversation}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
            />
            <ChatArea
                conversation={activeConversation}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onClearConversation={clearConversation}
                activeModel={activeModel}
                modelsInfo={SUPPORTED_MODELS}
                onChangeModel={handleModelChange}
                isNewChat={isNewChat}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            />
        </div>
    );
}

export default App;