// src/components/Sidebar.js
import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({
                     conversations,
                     activeConversationId,
                     onSelectConversation,
                     onCreateConversation,
                     onDeleteConversation,
                     onRenameConversation,
                     isOpen,
                     setIsOpen,
                     isMobileOpen,
                     setIsMobileOpen
                 }) {
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [hoveredConversation, setHoveredConversation] = useState(null);

    // 开始编辑对话标题
    const handleEdit = (e, id, currentTitle) => {
        e.stopPropagation();
        setEditingId(id);
        setEditTitle(currentTitle);
    };

    // 保存编辑后的标题
    const handleSaveEdit = (e, id) => {
        e.preventDefault();
        if (editTitle.trim()) {
            onRenameConversation(id, editTitle.trim());
        }
        setEditingId(null);
    };

    // 处理删除对话
    const handleDelete = (e, id) => {
        e.stopPropagation();
        onDeleteConversation(id);
    };

    // 格式化日期显示
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // 获取当前日期
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // 格式化为"今天"或"昨天"
        if (date.toDateString() === today.toDateString()) {
            return "今天";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "昨天";
        } else {
            // 返回月和日
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        }
    };

    // 将对话按日期分组
    const groupConversationsByDate = () => {
        const groups = {};

        conversations.forEach(conv => {
            const date = new Date(conv.createdAt);
            const dateString = formatDate(date);

            if (!groups[dateString]) {
                groups[dateString] = [];
            }

            groups[dateString].push(conv);
        });

        // 按时间降序排序
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });

        return groups;
    };

    const conversationGroups = groupConversationsByDate();

    return (
        <>
            {/* 移动设备遮罩层 */}
            {isMobileOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)}></div>
            )}

            <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${!isOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <button className="new-chat-button" onClick={onCreateConversation}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>新对话</span>
                    </button>

                    <button
                        className="toggle-sidebar-button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "收起侧边栏" : "展开侧边栏"}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {isOpen ? (
                                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            ) : (
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            )}
                        </svg>
                    </button>
                </div>

                {isOpen && (
                    <div className="sidebar-content">
                        <div className="conversations-container">
                            {Object.keys(conversationGroups).length > 0 ? (
                                Object.entries(conversationGroups).map(([date, convs]) => (
                                    <div key={date} className="conversation-group">
                                        <div className="conversation-date">{date}</div>
                                        {convs.map(conversation => (
                                            <div
                                                key={conversation.id}
                                                className={`conversation-item ${conversation.id === activeConversationId ? 'active' : ''}`}
                                                onClick={() => onSelectConversation(conversation.id)}
                                                onMouseEnter={() => setHoveredConversation(conversation.id)}
                                                onMouseLeave={() => setHoveredConversation(null)}
                                            >
                                                <div className="conversation-icon">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>

                                                {editingId === conversation.id ? (
                                                    <form
                                                        className="edit-title-form"
                                                        onSubmit={(e) => handleSaveEdit(e, conversation.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            onBlur={(e) => handleSaveEdit(e, conversation.id)}
                                                            autoFocus
                                                        />
                                                    </form>
                                                ) : (
                                                    <div className="conversation-title">
                                                        {conversation.title || '新对话'}
                                                    </div>
                                                )}

                                                {(hoveredConversation === conversation.id || conversation.id === activeConversationId) && (
                                                    <div className="conversation-actions" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            className="action-button edit"
                                                            onClick={(e) => handleEdit(e, conversation.id, conversation.title)}
                                                            aria-label="编辑"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43739 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="action-button delete"
                                                            onClick={(e) => handleDelete(e, conversation.id)}
                                                            aria-label="删除"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="no-conversations">
                                    <p>没有对话历史</p>
                                    <p>点击"新对话"开始聊天</p>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-footer">
                            <button className="upgrade-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L19 7V17L12 22L5 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>升级账户</span>
                            </button>

                            <div className="user-info">
                                <div className="user-avatar">
                                    <span>用</span>
                                </div>
                                <div className="user-name">用户</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Sidebar;