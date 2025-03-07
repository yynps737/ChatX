// src/components/ChatWindow.js
// Minimalist chat window component inspired by ChatGPT's interface

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWindow.css';

function ChatWindow({
                        conversation,
                        isLoading,
                        onSendMessage,
                        onClearConversation,
                        activeModel,
                        modelsInfo,
                        onChangeModel
                    }) {
    const [input, setInput] = useState('');
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const modelSelectorRef = useRef(null);

    // Handle clicks outside the model selector
    useEffect(() => {
        function handleClickOutside(event) {
            if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
                setIsModelSelectorOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages, isLoading]);

    // Focus input when conversation changes
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [conversation?.id]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        onSendMessage(input);
        setInput('');
    };

    // Format markdown code blocks
    const formatMarkdown = (content) => {
        return content.replace(/```([\s\S]*?)```/g, (match) => {
            return match.replace(/\n/g, '\n');
        });
    };

    // Format time display
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get model info
    const getModelInfo = (modelId) => {
        return modelsInfo.find(model => model.id === modelId) || activeModel;
    };

    // Empty state
    if (!conversation) {
        return (
            <div className="chat-window empty-state">
                <div className="empty-state-content">
                    <img src="/logo.png" alt="DeepSeek AI" className="logo" />
                    <h2>欢迎使用 DeepSeek AI 聊天</h2>
                    <p>请从左侧选择一个对话或创建一个新的对话</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            {/* Minimal header with only model selector */}
            <div className="chat-header-minimal">
                <div
                    className="model-selector-minimal"
                    onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                    ref={modelSelectorRef}
                >
                    <img src={activeModel.avatar} alt="" className="model-icon" />
                    <span className="model-name">{activeModel.name}</span>
                    <svg className="dropdown-icon" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>

                    {isModelSelectorOpen && (
                        <div className="model-dropdown-minimal">
                            <div className="model-dropdown-header">选择模型</div>

                            {modelsInfo.map(model => (
                                <div
                                    key={model.id}
                                    className={`model-option ${model.id === activeModel.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeModel(model);
                                        setIsModelSelectorOpen(false);
                                    }}
                                >
                                    <img src={model.avatar} alt="" />
                                    <div>
                                        <div className="option-name">{model.name}</div>
                                        <div className="option-description">{model.description}</div>
                                    </div>
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

                {/* Minimal actions */}
                <button
                    className="clear-chat-button"
                    onClick={() => {
                        if (window.confirm('确定要清空当前对话吗？')) {
                            onClearConversation();
                        }
                    }}
                    title="清空对话"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            {/* Messages container */}
            <div className="messages-container-minimal" ref={messagesContainerRef}>
                {conversation.messages.length === 0 ? (
                    <div className="welcome-minimal">
                        <h2>开始与 {activeModel.name} 的对话</h2>
                        <div className="suggestions-minimal">
                            <div className="suggestion" onClick={() => onSendMessage("请介绍一下你自己")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span>请介绍一下你自己</span>
                            </div>
                            <div className="suggestion" onClick={() => onSendMessage("你能帮我做什么？")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>你能帮我做什么？</span>
                            </div>
                            <div className="suggestion" onClick={() => onSendMessage("写一段Python代码计算斐波那契数列")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>写一段Python代码计算斐波那契数列</span>
                            </div>
                            <div className="suggestion" onClick={() => onSendMessage("用简洁的语言解释量子计算")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M3 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M16 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 3V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 16V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span>用简洁的语言解释量子计算</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Message rendering
                    conversation.messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message-minimal ${message.role === 'user' ? 'user' : 'assistant'}`}
                        >
                            <div className="message-avatar-minimal">
                                {message.role === 'user' ? (
                                    <div className="user-avatar-minimal">您</div>
                                ) : (
                                    <div className="assistant-avatar-minimal">
                                        <img src={getModelInfo(message.modelId).avatar} alt="" />
                                    </div>
                                )}
                            </div>

                            <div className="message-content-minimal">
                                <div className="message-header-minimal">
                                    <span className="message-sender-minimal">
                                        {message.role === 'user' ? '您' : getModelInfo(message.modelId).name}
                                    </span>
                                    {message.timestamp && (
                                        <span className="message-time-minimal">{formatTime(message.timestamp)}</span>
                                    )}
                                </div>

                                <div className="message-body-minimal">
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
                        </div>
                    ))
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="message-minimal assistant">
                        <div className="message-avatar-minimal">
                            <div className="assistant-avatar-minimal">
                                <img src={activeModel.avatar} alt="" />
                            </div>
                        </div>

                        <div className="message-content-minimal">
                            <div className="message-header-minimal">
                                <span className="message-sender-minimal">{activeModel.name}</span>
                            </div>

                            <div className="message-body-minimal loading">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Simplified input form */}
            <div className="input-area-minimal">
                <form onSubmit={handleSubmit} className="input-form-minimal">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`发送消息给 ${activeModel.name}...`}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        rows="1"
                        className="message-input"
                    />
                    <button
                        type="submit"
                        className={`send-button ${input.trim() ? 'active' : ''}`}
                        disabled={isLoading || !input.trim()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatWindow;