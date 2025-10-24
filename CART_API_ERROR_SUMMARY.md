# Cart API 400错误问题总结

## 问题描述
Cart API调用返回400错误，无法添加商品到购物车。

## 错误信息
```
POST /api/cart/15/items?magicbagId=102&quantity=1
400 Bad Request

Error response:
{
  "code": 0,
  "message": "FAIL: Error querying database. Cause: java.s…gicbag_id' in 'where clause'; bad SQL grammar []",
  "data": null
}
```

## 错误分析

### 1. 前端修复（已完成）
- ✅ 修复用户名存储问题
- ✅ 使用真实存在的用户ID `15` 替代不存在的ID `999`
- ✅ 添加详细的错误日志

### 2. 后端问题（需要后端团队修复）
**根本原因**：后端Cart服务在查询数据库时，SQL语法错误。

**可能的SQL问题**：
- 表名错误（如 `magicbag` 应该是 `magic_bags`）
- 字段名错误（如 `magicbag_id` 字段不存在）
- 表结构不匹配

**需要检查的后端代码**：
- `magic-bag-parent-main/magic-bag-cart/src/main/java/nus/iss/se/cart/service/impl/CartServiceImpl.java`
- 检查 `addItemToCart` 方法中的数据库查询逻辑
- 确认 `magicbag_id` 字段在数据库表中的存在性

## 前端修复记录

### Commit 1: Fix username storage and use numeric ID for Cart API
- 修复用户名保存问题
- 使用临时数字ID 999

### Commit 2: Use existing user ID 15 instead of non-existent ID 999
- 改用真实存在的用户ID 15
- 处理null ID情况

### Commit 3: Add detailed logging for user profile and cart API debugging
- 添加详细的错误日志
- 便于调试后端问题

## 建议的后端修复步骤

1. **检查数据库表结构**
   ```sql
   SHOW COLUMNS FROM cart_items;
   SHOW COLUMNS FROM magic_bags;
   ```

2. **检查CartServiceImpl.java中的SQL查询**
   - 查看 `addItemToCart` 方法
   - 确认使用的表名和字段名

3. **检查Product服务**
   - 确认 `magicbagId=102` 对应的商品是否存在
   - 检查商品表的主键字段名

4. **修复SQL查询**
   - 确保表名正确
   - 确保字段名正确
   - 确保查询逻辑正确

## 测试建议

修复后端后，使用以下请求测试：
```bash
POST http://13.215.158.65:10016/api/cart/15/items?magicbagId=102&quantity=1
Headers:
  Authorization: Bearer <valid_token>
```

## 相关文件
- `leftover-blind-box-frontend-main/src/stores/user.js` - 前端用户状态管理
- `leftover-blind-box-frontend-main/src/stores/cart.js` - 前端购物车状态管理
- `magic-bag-parent-main/magic-bag-cart/src/main/java/nus/iss/se/cart/service/impl/CartServiceImpl.java` - 后端购物车服务实现

