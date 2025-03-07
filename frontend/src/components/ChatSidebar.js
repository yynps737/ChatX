// src/components/ChatSidebar.js
// 侧边栏组件，用于显示和管理对话列表

import React, { useState, useEffect, useRef } from 'react';
import './ChatSidebar.css';

function ChatSidebar({
                         conversations,       // 所有对话数组
                         activeConversationId, // 当前活跃对话ID
                         onSelectConversation, // 选择对话的回调函数
                         onCreateConversation, // 创建新对话的回调函数
                         onDeleteConversation, // 删除对话的回调函数
                         onRenameConversation, // 重命名对话的回调函数
                         isOpen,              // 移动端视图下侧边栏是否打开
                         onClose              // 关闭侧边栏的回调函数
                     }) {
    const [editingId, setEditingId] = useState(null); // 当前正在编辑的对话ID
    const [editTitle, setEditTitle] = useState('');   // 编辑中的标题内容
    const editInputRef = useRef(null);               // 编辑输入框的引用

    // 当开始编辑时，聚焦到输入框
    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingId]);

    // 开始编辑对话标题
    const handleEdit = (e, id, currentTitle) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发对话选择
        setEditingId(id);
        setEditTitle(currentTitle);
    };

    // 保存编辑后的标题
    const handleSaveEdit = (id) => {
        if (editTitle.trim()) {
            onRenameConversation(id, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle('');
    };

    // 处理删除对话
    const handleDelete = (e, id) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发对话选择
        if (window.confirm('确定要删除这个对话吗？')) {
            onDeleteConversation(id);
        }
    };

    // 格式化日期显示
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>对话历史</h2>
                {/* 移动端关闭按钮 */}
                <button
                    className="sidebar-close-button"
                    onClick={onClose}
                    aria-label="关闭侧边栏"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* 新建对话按钮 */}
            <button className="new-chat-button" onClick={onCreateConversation}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>新对话</span>
            </button>

            {/* 对话列表 */}
            <div className="conversations-list">
                {conversations.length === 0 ? (
                    <div className="no-conversations">
                        <p>没有对话历史</p>
                        <p>点击"新对话"开始聊天</p>
                    </div>
                ) : (
                    conversations.map(conversation => (
                        <div
                            key={conversation.id}
                            className={`conversation-item ${conversation.id === activeConversationId ? 'active' : ''}`}
                            onClick={() => {
                                onSelectConversation(conversation.id);
                                onClose(); // 选择对话后关闭侧边栏（在移动端有效）
                            }}
                        >
                            <div className="conversation-content">
                                {editingId === conversation.id ? (
                                    // 编辑模式
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={() => handleSaveEdit(conversation.id)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(conversation.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    // 显示模式
                                    <>
                                        <div className="conversation-title" title={conversation.title}>
                                            {conversation.title || '新对话'}
                                        </div>
                                        <div className="conversation-date">
                                            {formatDate(conversation.createdAt)}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* 对话操作按钮 */}
                            <div className="conversation-actions">
                                <button
                                    className="edit-button"
                                    onClick={(e) => handleEdit(e, conversation.id, conversation.title)}
                                    title="重命名对话"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={(e) => handleDelete(e, conversation.id)}
                                    title="删除对话"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 侧边栏页脚 */}
            <div className="sidebar-footer">
                <div className="sidebar-version">DeepSeek Chat v1.0.0</div>
            </div>
        </div>
    );
}

export default ChatSidebar;