# 快速修复 Merchant Profile 问题

## 问题
用户登录后出现错误：`No merchant profile associated with the current user.`

## 原因
数据库中 `merchants` 表缺少 `user_id` 字段，或者用户 19 没有对应的 merchant 记录。

## 解决方案

### 步骤 1：打开 MySQL 客户端
使用 MySQL Workbench、Navicat 或命令行连接到数据库。

### 步骤 2：执行 SQL 脚本
打开文件 `leftover-blind-box-backend-main/fix_merchant_user19.sql` 并执行：

```sql
-- 1. 添加 user_id 字段
ALTER TABLE merchants ADD COLUMN user_id bigint COMMENT '关联的用户ID';

-- 2. 添加 score 字段
ALTER TABLE merchants ADD COLUMN score decimal(3,2) DEFAULT 0.0 COMMENT '商家评分';

-- 3. 为用户 19 创建 merchant 记录
INSERT INTO merchants (
    user_id,
    name,
    phone,
    business_license,
    address,
    latitude,
    longitude,
    status,
    score,
    created_at,
    updated_at
) VALUES (
    19,
    'Test Merchant Store',
    '12345678901',
    'https://example.com/license.jpg',
    '123 Test Street, Test City',
    1.3521,
    103.8198,
    'approved',
    4.5,
    NOW(),
    NOW()
);

-- 4. 验证
SELECT * FROM merchants WHERE user_id = 19;
```

### 步骤 3：重启后端服务
执行完 SQL 后，需要重启后端服务：
1. 关闭当前的后端 PowerShell 窗口
2. 重新打开一个新的 PowerShell 窗口
3. 运行：`cd D:\Myfile\leftoverapp\leftover-blind-box-backend-main; .\mvnw.cmd spring-boot:run`

### 步骤 4：刷新前端页面
访问 `http://localhost:5174` 并刷新页面。

## 注意事项
- 如果 `user_id` 或 `score` 字段已存在，ALTER TABLE 会报错，可以忽略
- 确保 `status` 字段设置为 `'approved'`，否则某些功能可能受限
- 前端现在运行在端口 5174（不是 5173）


