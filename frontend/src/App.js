// src/App.js
// 主应用组件，负责管理状态和协调子组件

import React, { useState, useEffect } from 'react';
import './App.css';
import ChatSidebar from './components/ChatSidebar';  // 导入侧边栏组件
import ChatWindow from './components/ChatWindow';    // 导入聊天窗口组件
import { v4 as uuidv4 } from 'uuid';  // 导入UUID生成库，用于创建唯一ID

function App() {
    // 状态定义
    const [conversations, setConversations] = useState([]); // 存储所有对话
    const [activeConversationId, setActiveConversationId] = useState(null); // 当前活跃对话ID
    const [isLoading, setIsLoading] = useState(false); // 加载状态（等待AI响应时）
    const [isMobileOpen, setIsMobileOpen] = useState(false); // 移动端侧边栏显示状态

    // 初始化时从本地存储加载对话数据
    useEffect(() => {
        const savedConversations = localStorage.getItem('deepseek-conversations');
        const savedActiveId = localStorage.getItem('deepseek-active-conversation');

        if (savedConversations) {
            try {
                const parsedConversations = JSON.parse(savedConversations);
                setConversations(parsedConversations);

                // 如果有保存的活跃对话ID，则设置为当前活跃对话
                if (savedActiveId && parsedConversations.find(c => c.id === savedActiveId)) {
                    setActiveConversationId(savedActiveId);
                } else if (parsedConversations.length > 0) {
                    // 如果没有保存活跃ID或该ID不存在，则使用第一个对话
                    setActiveConversationId(parsedConversations[0].id);
                }
            } catch (error) {
                console.error('加载保存的对话时出错:', error);
                createNewConversation(); // 出错时创建新对话
            }
        } else {
            // 如果没有保存的对话，创建一个新对话
            createNewConversation();
        }
    }, []);

    // 当对话数据变化时保存到本地存储
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('deepseek-conversations', JSON.stringify(conversations));
        }

        if (activeConversationId) {
            localStorage.setItem('deepseek-active-conversation', activeConversationId);
        }
    }, [conversations, activeConversationId]);

    // 获取当前活跃对话
    const activeConversation = conversations.find(conv => conv.id === activeConversationId);

    // 创建新对话
    const createNewConversation = () => {
        const newId = uuidv4();
        const newConversation = {
            id: newId,
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString()
        };

        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newId);
        setIsMobileOpen(false); // 创建新对话后关闭移动端侧边栏
    };

    // 删除对话
    const deleteConversation = (id) => {
        const updatedConversations = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversations);

        // 如果删除的是当前活跃对话，则切换到其他对话
        if (id === activeConversationId) {
            if (updatedConversations.length > 0) {
                setActiveConversationId(updatedConversations[0].id);
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
    const clearConversation = (id) => {
        const updatedConversations = conversations.map(conv =>
            conv.id === id ? { ...conv, messages: [] } : conv
        );
        setConversations(updatedConversations);
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

                    return { ...conv, messages: updatedMessages, title: updatedTitle };
                }
                return conv;
            });
        });
    };

    // 处理发送消息
    const handleSendMessage = async (input) => {
        if (!input.trim() || !activeConversationId) return;

        // 特殊命令: 清空对话
        if (input.toLowerCase() === '清空对话') {
            clearConversation(activeConversationId);
            return;
        }

        // 添加用户消息
        const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
        addMessageToConversation(activeConversationId, userMessage);

        setIsLoading(true);
        try {
            // 获取当前对话的所有消息用于API调用
            const currentConversation = conversations.find(conv => conv.id === activeConversationId);
            const currentMessages = [...currentConversation.messages, userMessage]
                .map(({ role, content }) => ({ role, content })); // 仅发送role和content字段

            // 调用API
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: currentMessages,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '与AI服务通信时出错');
            }

            // 添加AI响应
            addMessageToConversation(activeConversationId, {
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('发送消息时出错:', error);

            // 添加错误消息
            addMessageToConversation(activeConversationId, {
                role: 'assistant',
                content: `出错了: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                {/* 移动端菜单按钮 */}
                <button
                    className="mobile-menu-button"
                    onClick={() => setIsMobileOpen(true)}
                    aria-label="打开菜单"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <h1>DeepSeek AI 聊天</h1>
            </header>

            <div className="app-container">
                {/* 侧边栏组件 */}
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={setActiveConversationId}
                    onCreateConversation={createNewConversation}
                    onDeleteConversation={deleteConversation}
                    onRenameConversation={renameConversation}
                    isOpen={isMobileOpen}
                    onClose={() => setIsMobileOpen(false)}
                />

                {/* 聊天窗口组件 */}
                <ChatWindow
                    conversation={activeConversation}
                    isLoading={isLoading}
                    onSendMessage={handleSendMessage}
                    onClearConversation={() => clearConversation(activeConversationId)}
                />
            </div>
        </div>
    );
}

export default App;