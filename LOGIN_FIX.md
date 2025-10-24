# 登录问题修复说明

## 🔍 问题分析

根据你的报错，有两个主要问题：

### 1. 首页 401 错误
```
GET 54.169.196.90:10015/api/magic-bags?page=1&size=999 → 401
```
**原因**：首页在路由守卫初始化完成前就发送了请求

### 2. Token 获取失败
```
Login response did not contain a token
```
**原因**：你的 baseURL 是远程服务器 `54.169.196.90:10015`，朋友用的是 `localhost:10015`
- 浏览器默认不会暴露自定义响应头给 JavaScript（CORS 限制）
- 需要后端设置 `Access-Control-Expose-Headers: x-new-token`

## ✅ 修复方案（不改后端）

### 已修复的文件：

1. **`src/stores/user.js`** - 添加了 token 的多重获取逻辑和调试日志
   - 尝试从响应头获取（多种大小写格式）
   - 尝试从响应体获取
   - 添加详细的调试日志

2. **`src/views/HomeView.vue`** - 修复首页请求时机
   - 等待用户状态初始化完成后再请求数据
   - 监听登录状态变化，自动重新获取数据

3. **`src/utils/api.js`** - 改用相对路径
   - 从 `http://localhost:10015/api` 改为 `/api`
   - 让 Vite 代理处理跨域问题

4. **`vite.config.js`** - 支持环境变量配置后端地址
   - 默认使用远程服务器 `http://54.169.196.90:10015`
   - 可以通过环境变量切换

## 🚀 使用方法

### 方式一：使用远程服务器（默认）
```bash
npm run dev
```

### 方式二：使用本地服务器
创建 `.env.local` 文件：
```env
VITE_API_URL=http://localhost:10015
```

然后运行：
```bash
npm run dev
```

## 🔍 调试步骤

1. **启动前端**：
   ```bash
   cd leftover-blind-box-frontend-feat-v2.24
   npm run dev
   ```

2. **打开浏览器控制台**，查看登录时的调试信息：
   - `[Login Debug] Full response:` - 完整的响应对象
   - `[Login Debug] Response headers:` - 响应头
   - `[Login Debug] Response data:` - 响应体
   - `[Login Debug] Checking for token in multiple locations...` - 检查 token 的位置
   - `[Login Debug] Extracted token:` - 是否找到 token

3. **尝试登录**，观察控制台输出

4. **如果还是拿不到 token**，请截图：
   - Network 面板中的 `POST /api/auth/login` 请求
   - Response Headers 部分
   - Response 部分

## 💡 为什么朋友能登录？

可能的原因：
1. **朋友用的是 localhost**：没有跨域问题，浏览器可以读取所有响应头
2. **朋友的浏览器或代理配置不同**：可能设置了允许读取自定义响应头
3. **朋友的网络环境不同**：可能通过某个代理或网关转发

## 🎯 现在的改进

1. ✅ **多重 token 获取**：尝试多个位置获取 token
2. ✅ **详细的调试日志**：方便定位问题
3. ✅ **Vite 代理解决跨域**：不再直接请求远程服务器
4. ✅ **请求时机优化**：等待初始化完成后再请求

## 📝 下一步

如果修复后还是拿不到 token，请提供：
1. 控制台中的 `[Login Debug]` 日志
2. Network 面板中登录请求的截图
3. 说明你用的是远程服务器还是本地服务器

