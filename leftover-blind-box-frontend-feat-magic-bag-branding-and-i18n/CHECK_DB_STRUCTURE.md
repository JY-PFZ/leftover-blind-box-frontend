# 检查数据库结构

请在你的数据库客户端执行以下 SQL：

```sql
-- 1. 查看数据库中有哪些表
SHOW TABLES;

-- 2. 查看 merchants 表是否存在
SHOW TABLES LIKE 'merchants';

-- 3. 如果 merchants 表存在，查看它的结构
DESCRIBE merchants;

-- 4. 如果 merchants 表存在，查看有多少条记录
SELECT COUNT(*) FROM merchants;

-- 5. 查看 users 表的结构（确认是否有 merchant 相关字段）
DESCRIBE users;
```

然后把结果发给我。

这样我就能知道：
1. merchants 表是否存在
2. 如果存在，它有什么字段
3. users 表的结构是怎样的


