# 检查 merchants 表结构

请在你的 MySQL 客户端执行以下 SQL，然后把结果告诉我：

```sql
-- 1. 查看 merchants 表结构
DESCRIBE merchants;

-- 2. 查看 merchants 表中有多少条记录
SELECT COUNT(*) as total_merchants FROM merchants;

-- 3. 查看前 3 条记录（如果有的话）
SELECT * FROM merchants LIMIT 3;
```

这将帮助我了解：
1. merchants 表有哪些字段
2. 是否有 user_id 字段
3. 表中有多少条记录

然后把结果发给我，我帮你创建正确的 INSERT 语句。


