// // =================================================================
// // 快答AI - 智能笔试辅助系统 (后端服务)
// // 文件: index.js (最终图片处理版)
// // =================================================================

// const express = require('express');
// const http = require('http');
// const { Server } = require("socket.io");
// const cors = require('cors');
// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// require('dotenv').config();

// // --- 初始化 ---
// const prisma = new PrismaClient();
// const app = express();
// app.use(cors());
// app.use(express.json({ limit: '50mb' })); // 提高请求体大小限制以容纳截图数据
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });
// const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY';

// // --- API 路由 (保持不变) ---
// app.post('/register', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ message: '邮箱和密码不能为空' });
//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) return res.status(409).json({ message: '该邮箱已被注册' });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await prisma.user.create({ data: { email, password: hashedPassword } });
//     res.status(201).json({ message: '用户注册成功', userId: newUser.id });
//   } catch (error) {
//     console.error('注册失败:', error);
//     res.status(500).json({ message: '服务器内部错误' });
//   }
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ message: '邮箱和密码不能为空' });
//   try {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) return res.status(401).json({ message: '认证失败：用户不存在' });
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ message: '认证失败：密码错误' });
//     const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
//     res.json({ message: '登录成功', token: token, userId: user.id });
//   } catch (error) {
//     console.error('登录失败:', error);
//     res.status(500).json({ message: '服务器内部错误' });
//   }
// });

// // --- WebSocket 逻辑 ---
// io.on('connection', (socket) => {
//   console.log(`[Socket.IO] 一个客户端已连接: ${socket.id}`);
//   socket.on('authenticate', (token) => {
//     if (!token) return socket.disconnect();
//     try {
//       const decoded = jwt.verify(token, JWT_SECRET);
//       const userId = decoded.userId;
//       socket.join(userId);
//       console.log(`[Socket.IO] 客户端 ${socket.id} 认证成功，已加入房间 ${userId}`);
//       socket.emit('authenticated');
//     } catch (error) {
//       console.log(`[Socket.IO] 认证失败: ${error.message}`);
//       socket.disconnect();
//     }
//   });
  
//   // ## 核心修改：恢复对 image 字段的正确处理 ##
//   socket.on('submitQuestion', async (data) => {
//     const { userId, image, prompt, model } = data;
    
//     // 我们现在只关心图片问题
//     if (image) {
//       console.log(`[Socket.IO] 收到来自用户 ${userId} 的【图片】问题, 使用模型: ${model}`);
//     } else {
//       console.log(`[Socket.IO] 警告: 收到一个不包含图片的问题请求。`);
//       return; // 如果没有图片，直接忽略
//     }

//     try {
//       const answer = await callGeminiAPI({ base64Image: image, prompt, model });
//       io.to(userId).emit('newAnswer', { answer, model, timestamp: new Date() });
//     } catch (error) {
//       console.error("[Gemini] AI 处理流程最终失败:", error.message);
//       io.to(userId).emit('error', { message: 'AI处理失败，请检查API密钥或全局代理设置。' });
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log(`[Socket.IO] 客户端已断开: ${socket.id}`);
//   });
// });

// // --- Gemini API 调用函数 (只处理图片) ---
// async function callGeminiAPI({ base64Image, prompt, model }) {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env file');
  
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
//   // 构建包含图片数据的请求体
//   const requestBody = {
//     "contents": [{
//       "parts": [
//         { "text": prompt },
//         { "inline_data": { "mime_type": "image/jpeg", "data": base64Image } }
//       ]
//     }]
//   };
  
//   try {
//     console.log(`[Gemini] 正在向模型 [${model}] 发起【图片】请求 (依赖系统级代理)...`);
    
//     const response = await axios.post(url, requestBody, {
//       headers: { 'Content-Type': 'application/json' },
//     });

//     if (response.data.candidates && response.data.candidates.length > 0) {
//       const answer = response.data.candidates[0].content.parts[0].text;
//       console.log("[Gemini] 成功获取到回答。");
//       return answer;
//     } else {
//       console.warn("[Gemini] API 返回了空的 candidates 列表。");
//       console.log("[Gemini] 完整响应:", JSON.stringify(response.data, null, 2));
//       return "AI模型返回了空结果，可能是触发了安全限制。";
//     }
//   } catch (error) {
//     console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
//     console.error("[Gemini] API 调用时捕获到致命错误!");
//     if (error.response) {
//       console.error("[Gemini] 响应状态码:", error.response.status);
//       console.error("[Gemini] 完整的响应体 (Response Body):", JSON.stringify(error.response.data, null, 2));
//       throw new Error(`Google API returned an error: ${error.response.status}`);
//     } else {
//       console.error("[Gemini] 网络或未知错误:", error.message);
//       throw new Error(error.message);
//     }
//   }
// }

// // --- 启动服务器 ---
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`🚀 服务器正在端口 ${PORT} 上运行`);
//   console.log(`🔗 本地访问地址: http://localhost:${PORT}`);
// });








// =================================================================
// 快答AI - 智能笔试辅助系统 (后端服务)
// 文件: index.js (最终绝对防崩溃版)
// =================================================================

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// !! 核心：添加全局异常捕获，防止程序因任何意外错误而崩溃 !!
process.on('uncaughtException', (error, origin) => {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('FATAL: 捕获到未处理的异常 (Uncaught Exception):', error);
  console.error('FATAL: 异常来源:', origin);
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('FATAL: 捕获到未处理的 Promise Rejection:', reason);
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
});


// --- 初始化 ---
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingInterval: 30000,
  pingTimeout: 15000,
});
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY';

// --- API 路由 ---
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: '邮箱和密码不能为空' });
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: '该邮箱已被注册' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({ data: { email, password: hashedPassword } });
    res.status(201).json({ message: '用户注册成功', userId: newUser.id });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: '邮箱和密码不能为空' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: '认证失败：用户不存在' });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: '认证失败：密码错误' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: '登录成功', token: token, userId: user.id });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// --- WebSocket 逻辑 ---
io.on('connection', (socket) => {
  console.log(`[Socket.IO] 一个客户端已连接: ${socket.id}`);
  socket.on('authenticate', (token) => {
    if (!token) return socket.disconnect();
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      socket.join(userId);
      console.log(`[Socket.IO] 客户端 ${socket.id} 认证成功，已加入房间 ${userId}`);
      socket.emit('authenticated');
    } catch (error) {
      console.log(`[Socket.IO] 认证失败: ${error.message}`);
      socket.disconnect();
    }
  });
  
  socket.on('submitQuestion', async (data) => {
    const { userId, image, prompt, model } = data;
    if (!image) {
      console.log(`[Socket.IO] 警告: 收到一个不包含图片的问题请求。`);
      return;
    }
    console.log(`[Socket.IO] 收到来自用户 ${userId} 的【图片】问题, 使用模型: ${model}`);
    try {
      const answer = await callGeminiAPI({ base64Image: image, prompt, model });
      io.to(userId).emit('newAnswer', { answer, model, timestamp: new Date() });
    } catch (error) {
      console.error("[Gemini] AI 处理流程最终失败:", error.message);
      io.to(userId).emit('error', { message: 'AI处理失败，请检查API密钥或网络代理。' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] 客户端已断开: ${socket.id}, 原因: ${reason}`);
  });
});

// --- Gemini API 调用函数 ---
async function callGeminiAPI({ base64Image, prompt, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in .env file');
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const requestBody = {
    "contents": [{
      "parts": [
        { "text": prompt },
        { "inline_data": { "mime_type": "image/jpeg", "data": base64Image } }
      ]
    }]
  };
  
  try {
    console.log(`[Gemini] 正在向模型 [${model}] 发起【图片】请求 (依赖系统级代理)...`);
    
    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 设置30秒的请求超时
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      const answer = response.data.candidates[0].content.parts[0].text;
      console.log("[Gemini] 成功获取到回答。");
      return answer;
    } else {
      console.warn("[Gemini] API 返回了空的 candidates 列表。可能是内容安全问题。");
      console.log("[Gemini] 完整响应:", JSON.stringify(response.data, null, 2));
      return "AI模型返回了空结果，可能是图片内容触发了安全限制。";
    }
  } catch (error) {
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("[Gemini] API 调用时捕获到致命错误!");
    if (error.response) {
      console.error("[Gemini] 响应状态码:", error.response.status);
      console.error("[Gemini] 完整的响应体 (Response Body):", JSON.stringify(error.response.data, null, 2));
      throw new Error(`Google API returned an error: ${error.response.status}`);
    } else if (error.request) {
        console.error("[Gemini] 网络错误: 请求已发出但没有收到响应。");
        console.error("[Gemini] 错误信息:", error.message);
        throw new Error('Network error, no response received from Gemini API.');
    } else {
      console.error("[Gemini] 发生未知错误:", error.message);
      throw new Error('An unknown error occurred while calling Gemini API.');
    }
  }
}

// --- 启动服务器 ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 服务器正在端口 ${PORT} 上运行`);
  console.log(`🔗 本地访问地址: http://localhost:${PORT}`);
});