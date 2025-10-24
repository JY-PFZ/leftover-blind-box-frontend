# 管理员激活SQL

## 激活已注册的管理员账号

### 方法1：激活单个账号
```sql
-- 激活 admin@123456.com
UPDATE magicbag.users SET status = 1 WHERE username = 'admin@123456.com';
```

### 方法2：激活所有管理员账号
```sql
-- 激活所有管理员
UPDATE magicbag.users SET status = 1 WHERE role = 'ADMIN';
```

### 方法3：查看所有管理员账号状态
```sql
-- 查看所有管理员账号
SELECT id, username, role, status, created_at FROM magicbag.users WHERE role = 'ADMIN';
```

## 说明

- `status = 0` 表示未激活
- `status = 1` 表示已激活
- 只有激活的账号才能登录

## 使用步骤

1. 打开数据库管理工具（如MySQL Workbench、Navicat等）
2. 连接到数据库
3. 执行上面的SQL
4. 刷新登录页面
5. 使用账号密码登录






