# 启动后端服务器

## 快速启动

在 **新的 PowerShell 窗口** 中运行：

```powershell
cd D:\Myfile\leftoverapp\leftover-blind-box-backend-main
.\mvnw.cmd spring-boot:run
```

## 等待启动完成

启动过程大约需要 30-60 秒，看到以下信息表示成功：

```
Started LeftoverBlindBoxBackendApplication in X.XXX seconds
```

## 验证

启动成功后：
1. 刷新前端页面 `http://localhost:5173`
2. 产品列表应该能正常加载
3. 控制台不再显示 500 错误

## 常见问题

### 端口被占用
如果端口 10015 被占用，修改 `application.yml` 中的端口配置。

### 数据库连接失败
确保 MySQL 数据库正在运行，并且配置正确。

### 需要 Java
确保已安装 Java（Spring Boot 需要 Java 17 或更高版本）









