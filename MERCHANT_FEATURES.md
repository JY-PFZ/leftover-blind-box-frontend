# 商家功能实现总结

## ✅ 已实现的功能

### 1. 管理商品（增删改查）✅

**后端 API**:
- `POST /api/magic-bags` - 创建盲盒商品
- `PUT /api/magic-bags/{id}` - 更新盲盒商品
- `DELETE /api/magic-bags/{id}` - 删除盲盒商品（软删除）
- `GET /api/magic-bags/merchant/{merchantId}` - 获取商家所有商品

**前端实现**:
- `MagicBagForm.vue` - 支持创建和编辑商品
- `MerchantProductsView.vue` - 显示商品列表，有 Add、Edit 和 Delete 按钮
- `magicBag.js` store - 有 `createMagicBag`、`updateMagicBag` 和 `deleteMagicBag` 方法

**使用方法**:

#### 添加商品
1. 登录商家账号
2. 进入 "Products" 页面
3. 点击 "Add New Bag" 按钮
4. 填写商品信息（标题、描述、价格、库存、取货时间、分类、图片等）
5. 点击 "Add Bag" 保存

#### 编辑商品
1. 登录商家账号
2. 进入 "Products" 页面
3. 点击 "Edit" 按钮
4. 修改商品信息
5. 点击 "Save Changes" 保存

#### 删除商品
1. 登录商家账号
2. 进入 "Products" 页面
3. 点击 "Delete" 按钮
4. 确认删除（软删除，商品会标记为 inactive）

---

### 2. 查看订单 ✅

**后端 API**:
- `GET /api/orders` - 获取订单列表（根据角色自动过滤）
- `GET /api/orders/{id}` - 获取订单详情
- `GET /api/orders/stats` - 获取订单统计信息

**前端实现**:
- `MerchantOrdersView.vue` - 显示订单列表
- `order.js` store - 有 `fetchOrders` 方法
- 商家角色会自动过滤只显示自己店铺的订单

**使用方法**:
1. 登录商家账号
2. 进入 "Orders" 页面
3. 查看所有订单（自动过滤只显示自己店铺的订单）

---

### 3. 完成订单 ✅

**后端 API**:
- `PUT /api/orders/{id}/status` - 更新订单状态（管理员和商家可以操作）
- `POST /api/orders/{id}/verify` - 核销订单（只有商家可以操作）
- `PUT /api/orders/{id}/cancel` - 取消订单（用户和管理员可以操作）

**前端实现**:
- `MerchantOrdersView.vue` - 有 "Verify & Complete Order"、"Confirm Payment"、"Cancel Order" 按钮
- `order.js` store - 有 `updateOrderStatus`、`verifyOrder` 和 `cancelOrder` 方法

**使用方法**:

#### 3.1 确认支付
- 当订单状态为 `pending` 时，点击 "Confirm Payment" 按钮
- 订单状态会更新为 `paid`

#### 3.2 核销订单
- 当订单状态为 `paid` 时，点击 "Verify & Complete Order" 按钮
- 输入 4 位取货码
- 验证成功后，订单状态会更新为 `completed`

#### 3.3 取消订单
- 当订单状态为 `pending` 或 `paid` 时，点击 "Cancel Order" 按钮
- 确认后，订单状态会更新为 `cancelled`

---

## 📋 订单状态流程

```
pending (待支付)
  ↓ [商家确认支付]
paid (已支付，待取货)
  ↓ [商家核销]
completed (已完成)
  ↓
cancelled (已取消) - 可以在 pending 或 paid 状态时取消
```

---

## 🧪 测试步骤

### 1. 测试管理商品（增删改查）
```bash
# 1. 登录商家账号
# 2. 进入 Products 页面
# 3. 点击 "Add New Bag" 按钮
# 4. 填写商品信息：
#    - Title: 测试商品
#    - Description: 这是一个测试商品
#    - Price: 50.00
#    - Quantity: 10
#    - Pickup Start Time: 09:00
#    - Pickup End Time: 18:00
#    - Available Date: 选择日期
#    - Category: 食品
#    - Image URL: https://example.com/image.jpg
# 5. 点击 "Add Bag" 保存
# 6. 验证商品已添加到列表
# 7. 点击 "Edit" 按钮修改商品信息
# 8. 点击 "Save Changes" 保存
# 9. 验证商品信息已更新
# 10. 点击 "Delete" 按钮删除商品
# 11. 验证商品已从列表移除
```

### 2. 测试查看订单
```bash
# 1. 登录商家账号
# 2. 进入 Orders 页面
# 3. 验证只显示自己店铺的订单
# 4. 查看订单详情（客户信息、商品信息、取货码等）
```

### 3. 测试完成订单
```bash
# 1. 登录商家账号
# 2. 进入 Orders 页面
# 3. 找到状态为 pending 的订单
# 4. 点击 "Confirm Payment" 按钮
# 5. 验证订单状态变为 paid
# 6. 点击 "Verify & Complete Order" 按钮
# 7. 输入取货码
# 8. 验证订单状态变为 completed
```

---

## 🔧 技术细节

### 后端实现
- 使用 `@PreAuthorize` 注解进行权限控制
- 商家只能查看和操作自己店铺的订单
- 订单状态更新会自动记录时间戳

### 前端实现
- 使用 Pinia store 管理状态
- 使用 axios 进行 API 调用
- 操作成功后自动刷新订单列表

---

## 📝 注意事项

1. **权限控制**：
   - 商家只能查看自己店铺的订单
   - 商家可以更新订单状态和核销订单
   - 商家不能取消订单（只有用户和管理员可以）

2. **取货码验证**：
   - 核销订单时需要输入正确的 4 位取货码
   - 取货码错误时会提示重新输入

3. **订单状态**：
   - 订单状态更新是单向的（pending → paid → completed）
   - 已完成的订单不能取消
   - 已取消的订单不能恢复

4. **数据刷新**：
   - 每次操作成功后会自动刷新订单列表
   - 确保显示最新的订单状态


