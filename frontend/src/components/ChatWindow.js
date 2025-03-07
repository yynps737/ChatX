import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWindow.css';

function ChatWindow({
                        conversation,
                        isLoading,
                        onSendMessage,
                        onClearConversation
                    }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // 当消息变化时，滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages, isLoading]);

    // 当切换对话时，聚焦到输入框
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [conversation?.id]);

    // 处理发送消息
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        onSendMessage(input);
        setInput('');
    };

    // 格式化代码块
    const formatMarkdown = (content) => {
        return content.replace(/```([\s\S]*?)```/g, (match) => {
            return match.replace(/\n/g, '\n');
        });
    };

    // 格式化时间显示
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 空状态 - 没有选中对话
    if (!conversation) {
        return (
            <div className="chat-window empty-state">
                <div className="empty-state-content">
                    <div className="ai-avatar large"></div>
                    <h2>欢迎使用 DeepSeek AI 聊天</h2>
                    <p>请选择一个对话或创建一个新的对话来开始</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h2>{conversation.title || '新对话'}</h2>
                <div className="chat-actions">
                    <button
                        className="clear-button"
                        onClick={() => {
                            if (window.confirm('确定要清空当前对话吗？此操作不可撤销。')) {
                                onClearConversation();
                            }
                        }}
                        title="清空对话"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>清空对话</span>
                    </button>
                </div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
                {conversation.messages.length === 0 ? (
                    <div className="welcome-screen">
                        <div className="ai-avatar large"></div>
                        <h2>DeepSeek AI 聊天</h2>
                        <p>我是 DeepSeek AI 助手，请告诉我您需要什么帮助？</p>
                        <div className="suggestion-chips">
                            <button onClick={() => onSendMessage("你能做什么？")}>你能做什么？</button>
                            <button onClick={() => onSendMessage("写一篇关于人工智能的文章")}>写一篇关于人工智能的文章</button>
                            <button onClick={() => onSendMessage("帮我分析一段Python代码")}>帮我分析一段Python代码</button>
                            <button onClick={() => onSendMessage("讲个笑话")}>讲个笑话</button>
                        </div>
                    </div>
                ) : (
                    conversation.messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                        >
                            <div className="message-avatar">
                                {message.role === 'user' ? (
                                    <div className="user-avatar"></div>
                                ) : (
                                    <div className="ai-avatar"></div>
                                )}
                            </div>

                            <div className="message-content">
                                <div className="message-header">
                  <span className="message-sender">
                    {message.role === 'user' ? '您' : 'DeepSeek AI'}
                  </span>
                                    {message.timestamp && (
                                        <span className="message-time">{formatTime(message.timestamp)}</span>
                                    )}
                                </div>

                                <div className="message-bubble">
                                    {message.role === 'assistant' ? (
                                        // 修复：将 className 应用于包装 div 而不是 ReactMarkdown 组件
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

                {isLoading && (
                    <div className="message ai-message">
                        <div className="message-avatar">
                            <div className="ai-avatar"></div>
                        </div>

                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-sender">DeepSeek AI</span>
                            </div>

                            <div className="message-bubble loading">
                                <div className="typing-indicator">
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

            <form onSubmit={handleSubmit} className="chat-input-form">
                <div className="input-container">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="输入消息..."
                        disabled={isLoading}
                    />

                    <button
                        type="button"
                        className="attachment-button"
                        title="添加附件"
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                    </button>
                </div>

                <button
                    type="submit"
                    className="send-button"
                    disabled={isLoading || !input.trim()}
                    title="发送消息"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;