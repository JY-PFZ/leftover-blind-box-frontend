# 不修改后端 - 直接在数据库创建 merchant 记录

## 解决方案

后端代码会查找 `merchants` 表，所以我们需要在数据库中创建一条记录。

### 执行以下 SQL：

```sql
-- 1. 检查 merchants 表是否有 user_id 字段
DESCRIBE merchants;

-- 2. 如果没有 user_id 字段，先添加
ALTER TABLE merchants ADD COLUMN user_id bigint COMMENT '关联的用户ID';

-- 3. 如果没有 score 字段，先添加
ALTER TABLE merchants ADD COLUMN score decimal(3,2) DEFAULT 0.0 COMMENT '商家评分';

-- 4. 为用户 19 创建商家记录
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
    19,  -- user_id (关联到 users.id = 19)
    'Test Merchant Store',  -- name
    '12345678901',  -- phone
    'https://example.com/license.jpg',  -- business_license
    '123 Test Street, Test City',  -- address
    1.3521,  -- latitude
    103.8198,  -- longitude
    'approved',  -- status (必须是 approved)
    4.5,  -- score
    NOW(),  -- created_at
    NOW()   -- updated_at
);

-- 5. 验证
SELECT * FROM merchants WHERE user_id = 19;
```

### 执行后
刷新浏览器页面（http://localhost:5173），应该就能正常工作了。


