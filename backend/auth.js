// 文件: backend/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

// 这里应该使用真实的数据库实现
// 这只是一个简化的示例
const users = [];

// 注册新用户
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 基本验证
        if (!username || !email || !password) {
            return res.status(400).json({ message: '所有字段都是必填的' });
        }

        // 检查用户是否已存在
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }

        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            credits: 100, // 初始API使用额度
            createdAt: new Date(),
            lastLogin: new Date()
        };

        users.push(newUser);

        // 创建JWT
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        // 返回用户信息和令牌（不包含密码）
        res.status(201).json({
            message: '注册成功',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                credits: newUser.credits,
                createdAt: newUser.createdAt
            },
            token
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 基本验证
        if (!email || !password) {
            return res.status(400).json({ message: '邮箱和密码是必填的' });
        }

        // 查找用户
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(401).json({ message: '邮箱或密码不正确' });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: '邮箱或密码不正确' });
        }

        // 更新最后登录时间
        user.lastLogin = new Date();

        // 创建JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        // 返回用户信息和令牌
        res.json({
            message: '登录成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                credits: user.credits,
                lastLogin: user.lastLogin
            },
            token
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// 授权中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '需要认证' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: '令牌无效或已过期' });
        }

        req.user = user;
        next();
    });
};

// 获取用户信息
router.get('/user', authenticateToken, (req, res) => {
    const user = users.find(user => user.id === req.user.id);

    if (!user) {
        return res.status(404).json({ message: '用户未找到' });
    }

    res.json({
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            credits: user.credits,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }
    });
});

// 信用点管理 - 减少用户调用AI的额度
const deductCredits = (userId, amount = 1) => {
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return false;
    }

    if (users[userIndex].credits < amount) {
        return false; // 信用点不足
    }

    users[userIndex].credits -= amount;
    return true;
};

module.exports = { router, authenticateToken, deductCredits };