# Cart API 问题 - 需要后端修复

## 问题描述
Cart API调用返回400错误，无法添加商品到购物车。

## 错误信息
```
POST /api/cart/15/items?magicbagId=102&quantity=1
400 Bad Request

Error message:
FAIL: Error querying database. Cause: java.sql.SQLSyntaxErrorException: 
Unknown column 'magicbag_id' in 'where clause'
```

## 根本原因
**后端SQL语句字段名错误**

### 错误的SQL
```sql
SELECT cart_item_id, cart_id, magic_bag_id, quantity, added_at 
FROM cart_items 
WHERE cart_id = ? AND magicbag_id = ?  -- ❌ 错误：magicbag_id
```

### 正确的SQL
```sql
SELECT cart_item_id, cart_id, magic_bag_id, quantity, added_at 
FROM cart_items 
WHERE cart_id = ? AND magic_bag_id = ?  -- ✅ 正确：magic_bag_id
```

## 问题位置
**文件**：`magic-bag-parent-main/magic-bag-cart/src/main/java/nus/iss/se/cart/mapper/CartItemMapper.java`

**问题SQL**：
- Line 18: `INSERT INTO cart_items (cart_id, magicbag_id, ...)`
- Line 26: `SELECT ... magicbag_id ...`
- Line 31: `@Result(property = "magicBagId", column = "magicbag_id")`
- Line 40: `WHERE cart_id = ? AND magicbag_id = ?`
- Line 68: `SELECT ... magicbag_id ...`

## 数据库表结构
```sql
CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY,
    cart_id INT,
    magic_bag_id INT,  -- ✅ 数据库字段名是 magic_bag_id (下划线)
    quantity INT,
    added_at DATETIME,
    status VARCHAR(20)
);
```

## 为什么前端无法修复？
1. **字段名在SQL中硬编码**：错误字段名 `magicbag_id` 写在后端SQL语句中
2. **前端不生成SQL**：前端只发送 `magicbagId=102`，不涉及SQL字段名
3. **后端才是问题源头**：只有修改后端代码才能修复

## 已完成的修复
✅ 修复已提交到本地仓库：
```
commit 5a3f51f
Fix SQL column name: magicbag_id -> magic_bag_id
```

## 需要的操作
1. 手动推送修复到远程仓库
2. 重新部署Cart服务
3. 测试Add to Cart功能

## 测试步骤
修复后测试：
```bash
POST http://13.215.158.65:10016/api/cart/15/items?magicbagId=102&quantity=1
Headers:
  Authorization: Bearer <valid_token>
```

应该返回200成功，而不是400错误。

