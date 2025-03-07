// src/components/ChatArea.js
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatArea.css';

function ChatArea({
                      conversation,
                      isLoading,
                      onSendMessage,
                      onClearConversation,
                      activeModel,
                      modelsInfo,
                      onChangeModel,
                      isNewChat,
                      isSidebarOpen,
                      setIsSidebarOpen,
                      setIsMobileSidebarOpen
                  }) {
    const [input, setInput] = useState('');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('24px');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const modelDropdownRef = useRef(null);

    // 处理点击外部关闭模型下拉菜单
    useEffect(() => {
        function handleClickOutside(event) {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
                setIsModelDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 当消息变化时，滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages, isLoading]);

    // 自动调整文本框高度
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = scrollHeight + 'px';
            setTextareaHeight(scrollHeight + 'px');
        }
    }, [input]);

    // 处理发送消息
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        onSendMessage(input);
        setInput('');
        setTextareaHeight('24px');
    };

    // 处理按键事件
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // 格式化代码块
    const formatMarkdown = (content) => {
        return content.replace(/```([\s\S]*?)```/g, (match) => {
            return match.replace(/\n/g, '\n');
        });
    };

    return (
        <div className="chat-area">
            <div className="chat-header">
                {/* 移动端菜单按钮 */}
                <button
                    className="mobile-menu-button"
                    onClick={() => setIsMobileSidebarOpen(true)}
                    aria-label="菜单"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* 模型选择器 */}
                <div className="model-selector" ref={modelDropdownRef}>
                    <button
                        className="model-button"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    >
                        {activeModel.name}
                        <svg className={`dropdown-icon ${isModelDropdownOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    {isModelDropdownOpen && (
                        <div className="model-dropdown">
                            {modelsInfo.map(model => (
                                <div
                                    key={model.id}
                                    className={`model-option ${model.id === activeModel.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onChangeModel(model);
                                        setIsModelDropdownOpen(false);
                                    }}
                                >
                                    <div className="model-name">{model.name}</div>
                                    <div className="model-description">{model.description}</div>
                                    {model.id === activeModel.id && (
                                        <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="messages-container">
                {isNewChat || !conversation || !conversation.messages || conversation.messages.length === 0 ? (
                    <div className="welcome-screen">
                        <h1>有什么可以帮忙的?</h1>

                        <div className="suggestions">
                            <div className="suggestion-group">
                                <div className="suggestion" onClick={() => onSendMessage("你能用简单的术语解释量子计算吗?")}>
                                    <div className="suggestion-title">你能用简单的术语解释量子计算吗?</div>
                                </div>
                                <div className="suggestion" onClick={() => onSendMessage("创建一个关于深度学习和神经网络的学习计划")}>
                                    <div className="suggestion-title">创建一个关于深度学习和神经网络的学习计划</div>
                                </div>
                            </div>

                            <div className="suggestion-group">
                                <div className="suggestion" onClick={() => onSendMessage("写一段Python代码来分析CSV文件中的数据")}>
                                    <div className="suggestion-title">写一段Python代码来分析CSV文件中的数据</div>
                                </div>
                                <div className="suggestion" onClick={() => onSendMessage("帮我准备一个技术面试的问题清单")}>
                                    <div className="suggestion-title">帮我准备一个技术面试的问题清单</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {conversation.messages.map((message, index) => (
                            <div key={index} className={`message ${message.role}`}>
                                <div className="message-content">
                                    {message.role === 'assistant' ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown>
                                                {formatMarkdown(message.content)}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-content">
                                    <div className="loading-indicator">
                                        <div className="loading-dot"></div>
                                        <div className="loading-dot"></div>
                                        <div className="loading-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <form onSubmit={handleSubmit}>
                    <div className="textarea-container">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`发送消息给 ${activeModel.name}...`}
                rows="1"
                style={{ height: textareaHeight }}
                disabled={isLoading}
            />
                        <button
                            type="submit"
                            className={`send-button ${!input.trim() || isLoading ? 'disabled' : ''}`}
                            disabled={!input.trim() || isLoading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className="input-footer">
                        <p className="disclaimer">
                            {activeModel.name} 可能会产生错误。请考虑验证重要信息。
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatArea;