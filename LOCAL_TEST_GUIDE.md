# 本地测试指南

## 当前配置

- **前端地址**: `http://localhost:5173`
- **后端地址**: `http://localhost:10015`
- **API 代理**: `/api` → `http://localhost:10015/api`

## 启动步骤

### 1. 启动后端服务

```bash
cd leftover-blind-box-backend-main
.\mvnw.cmd spring-boot:run
```

等待后端启动完成（约 30-60 秒），看到 "Started LeftoverBlindBoxBackendApplication" 表示成功。

### 2. 启动前端服务

```bash
cd leftover-blind-box-frontend-main
npm run dev
```

前端会在 `http://localhost:5173` 启动。

## 测试账号

### 管理员账号
- **用户名**: `admin@123456.com`
- **密码**: `123456`
- **角色**: ADMIN
- **登录后**: 跳转到管理员界面 (`/admin`)

### 商家账号（示例）
- **用户名**: `merchanttest@123456.com`
- **密码**: `123456`
- **角色**: MERCHANT
- **登录后**: 跳转到商家界面 (`/merchant`)

## 测试功能

### 管理员功能
1. 登录管理员账号
2. 查看待处理任务
3. 审批商家注册申请
4. 查看现有商家列表
5. 执行各种管理操作

### 商家功能
1. 登录商家账号
2. 查看订单管理
3. 创建和管理盲盒产品
4. 查看统计数据

### 客户功能
1. 浏览盲盒产品
2. 下单购买
3. 查看订单状态

## 常见问题

### 后端无法启动
- 检查端口 10015 是否被占用
- 检查 MySQL 数据库是否运行
- 查看后端日志获取详细错误信息

### 前端无法连接后端
- 确认后端服务已启动
- 检查 `vite.config.js` 中的代理配置
- 查看浏览器控制台是否有 CORS 错误

### 500 内部服务器错误
- 后端服务可能未运行
- 数据库连接可能有问题
- 查看后端日志获取详细错误信息

## 日志查看

### 后端日志
- 日志文件位置: `leftover-blind-box-backend-main/logs/magic-bag-mono.log`
- 实时查看: 在启动后端的 PowerShell 窗口中查看

### 前端日志
- 浏览器控制台 (F12)
- 查看网络请求和响应

## 切换远程 API

如果需要切换到远程 API，修改 `vite.config.js`:

```javascript
target: 'http://54.169.196.90:10015',  // 远程 API
```

然后重启前端服务。

## Git 分支

当前分支: `feat/admin-login-redirect`

最新提交: `c227a5f` - feat: 更新管理员登录重定向和API配置文档



