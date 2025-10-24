# 修复商家用户 merchant 记录问题

## 问题描述

用户登录为商家后，出现以下错误：
```
[MerchantStore] Error fetching merchant profile: Error: No merchant profile associated with the current user.
Could not load merchant ID, cannot fetch bags.
```

## 原因

商家用户（ID: 19）在 `merchants` 表中没有对应的记录。

## 解决方案

### 方法 1：使用 SQL 脚本（推荐）

1. **打开 MySQL 客户端**（MySQL Workbench、Navicat 等）

2. **连接到数据库**

3. **执行 SQL 脚本**：
   ```sql
   -- 检查 merchants 表是否有 user_id 字段
   DESCRIBE merchants;
   ```

4. **如果没有 user_id 字段，先添加**：
   ```sql
   ALTER TABLE merchants ADD COLUMN user_id bigint COMMENT '关联的用户ID';
   ```

5. **为用户 19 创建 merchant 记录**：
   ```sql
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
       19,  -- user_id
       'Test Merchant Store',  -- name
       '12345678901',  -- phone
       'https://example.com/license.jpg',  -- business_license
       '123 Test Street, Test City',  -- address
       1.3521,  -- latitude (Singapore)
       103.8198,  -- longitude (Singapore)
       'approved',  -- status
       4.5,  -- score
       NOW(),  -- created_at
       NOW()   -- updated_at
   );
   ```

6. **验证记录已创建**：
   ```sql
   SELECT * FROM merchants WHERE user_id = 19;
   ```

### 方法 2：使用后端 API 注册

如果后端提供了商家注册接口，可以调用：

```bash
POST /api/merchants/register
Content-Type: application/json

{
  "name": "Test Merchant Store",
  "phone": "12345678901",
  "businessLicense": "https://example.com/license.jpg",
  "address": "123 Test Street, Test City",
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

## 测试步骤

1. **刷新前端页面**
   - 访问 `http://localhost:5173`
   - 重新登录商家账号：`merchanttest@123456.com` / `123456`

2. **验证功能**
   - 进入 "Products" 页面
   - 应该能看到商品列表（或空列表）
   - 点击 "Add New Bag" 可以添加商品

3. **如果仍有问题**
   - 检查浏览器控制台是否有错误
   - 检查后端日志是否有错误
   - 确认数据库连接正常

## 注意事项

1. **user_id 字段**：
   - 如果 merchants 表没有 user_id 字段，需要先添加
   - 添加后，需要重启后端服务

2. **status 字段**：
   - 必须是 `approved` 才能正常使用
   - 如果是 `pending` 或 `rejected`，某些功能可能受限

3. **多个商家用户**：
   - 如果还有其他商家用户遇到同样问题，需要为每个用户创建对应的 merchant 记录
   - user_id 必须对应 users 表中的 id

## 常见问题

### Q: 为什么会出现这个问题？
A: 商家用户在 users 表中存在，但在 merchants 表中没有对应的记录。这是因为商家注册流程可能不完整。

### Q: 如何避免这个问题？
A: 确保商家注册流程会同时在 users 和 merchants 表中创建记录。

### Q: 数据库中没有 user_id 字段怎么办？
A: 需要先添加 user_id 字段：
```sql
ALTER TABLE merchants ADD COLUMN user_id bigint COMMENT '关联的用户ID';
```

### Q: 执行 SQL 后仍然报错？
A: 检查以下几点：
1. 数据库连接是否正常
2. 后端服务是否重启
3. 浏览器缓存是否清除
4. 后端日志是否有错误信息


