# 后端服务启动指南

## 问题诊断

你遇到的 **500 Internal Server Error** 是因为后端服务没有启动。

## 解决方案

### 方法1：手动启动后端服务

1. 打开一个新的 PowerShell 窗口
2. 导航到后端目录：
   ```powershell
   cd D:\Myfile\leftoverapp\leftover-blind-box-backend-main
   ```
3. 启动后端服务：
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
4. 等待服务启动完成（大约30-60秒）
5. 看到类似以下信息表示启动成功：
   ```
   Started LeftoverBlindBoxBackendApplication in X.XXX seconds
   ```

### 方法2：使用IDE启动

如果你使用 IntelliJ IDEA 或其他IDE：
1. 打开 `leftover-blind-box-backend-main` 项目
2. 找到 `LeftoverBlindBoxBackendApplication.java` 文件
3. 右键点击，选择 "Run" 或 "Debug"

## 验证服务是否启动

启动成功后，你应该能看到：
- ✅ 后端服务运行在 `http://localhost:10015`
- ✅ 前端可以正常访问 API
- ✅ 登录功能正常工作

## 常见问题

### 1. 端口被占用
如果端口 10015 被占用，修改 `application.yml` 中的端口配置。

### 2. 数据库连接失败
确保 MySQL 数据库正在运行，并且配置正确。

### 3. Nacos 连接超时
日志中的 Nacos 连接超时错误可以忽略，不影响基本功能。

## 启动后测试

1. 访问前端：`http://localhost:5173`
2. 尝试登录
3. 如果仍然出现 500 错误，检查后端日志：
   ```powershell
   Get-Content D:\Myfile\leftoverapp\leftover-blind-box-backend-main\logs\magic-bag-mono.log -Tail 50
   ```





