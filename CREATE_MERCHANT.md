# 快速修复 - 创建 Merchant 记录

## 问题
虽然 users 表中有用户 19（merchanttest@123456.com），但 merchants 表中没有对应的商家记录。

## 解决方案

### 方法 1：如果 merchants 表有 user_id 字段

```sql
INSERT INTO merchants (
    user_id, name, phone, business_license, address,
    latitude, longitude, status, score, created_at, updated_at
) VALUES (
    19, 'Test Merchant Store', '12345678901',
    'https://example.com/license.jpg', '123 Test Street',
    1.3521, 103.8198, 'approved', 4.5, NOW(), NOW()
);
```

### 方法 2：如果 merchants 表没有 user_id 字段

```sql
-- 1. 先添加 user_id 字段
ALTER TABLE merchants ADD COLUMN user_id bigint COMMENT '关联的用户ID';

-- 2. 添加 score 字段（如果还没有）
ALTER TABLE merchants ADD COLUMN score decimal(3,2) DEFAULT 0.0 COMMENT '商家评分';

-- 3. 创建商家记录
INSERT INTO merchants (
    user_id, name, phone, business_license, address,
    latitude, longitude, status, score, created_at, updated_at
) VALUES (
    19, 'Test Merchant Store', '12345678901',
    'https://example.com/license.jpg', '123 Test Street',
    1.3521, 103.8198, 'approved', 4.5, NOW(), NOW()
);
```

### 验证
```sql
SELECT * FROM merchants WHERE user_id = 19;
```

## 执行后
1. 刷新浏览器页面（http://localhost:5173）
2. 应该就能正常看到商家界面了

