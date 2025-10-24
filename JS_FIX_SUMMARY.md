# JS 代码修复说明

## 问题诊断

你遇到的 500 错误主要是因为**后端服务没有启动**，但同时也发现了一些 JS 代码的问题。

## 修复内容

### 1. api.js - 添加响应拦截器

**问题**：没有处理 401 未授权错误

**修复**：添加了响应拦截器，自动处理 401 错误并清除无效的 token

```javascript
// 设置响应拦截器，处理 401 未授权错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 401 未授权，清除 token 并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
    return Promise.reject(error);
  }
);
```

### 2. user.js - 移除重复的 Authorization 设置

**问题**：在多个地方手动设置 `api.defaults.headers.common['Authorization']`，与拦截器重复

**修复**：移除了所有手动设置，统一由 `api.js` 的拦截器处理

#### 修改位置1：login 函数
```javascript
// 之前：
api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

// 现在：
// 注意：不需要手动设置 api.defaults.headers.common['Authorization']
// 因为 api.js 的拦截器会自动从 localStorage 读取 token 并添加到请求头
```

#### 修改位置2：initialize 函数
```javascript
// 之前：
api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

// 现在：
// 注意：不需要手动设置 api.defaults.headers.common['Authorization']
// 因为 api.js 的拦截器会自动从 localStorage 读取 token 并添加到请求头
```

#### 修改位置3：logout 函数
```javascript
// 之前：
delete api.defaults.headers.common['Authorization'];

// 现在：
// 注意：不需要手动删除 api.defaults.headers.common['Authorization']
// 因为拦截器会自动检查 localStorage，如果 token 不存在就不会添加 Authorization header
```

## 工作原理

### Token 管理流程

1. **登录时**：
   - 调用 `userStore.login()`
   - 保存 token 到 `localStorage`
   - 拦截器自动从 `localStorage` 读取并添加到请求头

2. **请求时**：
   - `api.js` 的拦截器自动从 `localStorage` 读取 token
   - 添加到 `Authorization` header
   - 发送请求

3. **登出时**：
   - 清除 `localStorage` 中的 token
   - 拦截器检测到没有 token，不添加 `Authorization` header

4. **401 错误时**：
   - 响应拦截器检测到 401
   - 自动清除 `localStorage` 中的 token
   - 用户需要重新登录

## 优势

✅ **统一管理**：所有 token 操作都通过拦截器处理，避免重复代码  
✅ **自动清理**：401 错误时自动清除无效 token  
✅ **易于维护**：只需在一个地方（拦截器）修改逻辑  

## 测试

1. 确保后端服务已启动
2. 刷新前端页面
3. 尝试登录
4. 应该能正常工作

## 如果仍有问题

1. 检查后端服务是否启动：
   ```powershell
   cd D:\Myfile\leftoverapp\leftover-blind-box-backend-main
   .\mvnw.cmd spring-boot:run
   ```

2. 检查浏览器控制台是否有错误信息

3. 检查网络请求：
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 检查请求是否成功发送到后端


