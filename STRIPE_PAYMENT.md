# Stripe 支付集成说明

## 后端 API

### 1. 创建支付会话
```
POST /api/payment/checkout?orderId={orderId}
```

**响应**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/...",
  "message": "Payment session created"
}
```

### 2. 验证支付
```
POST /api/payment/verify?orderId={orderId}&sessionId={sessionId}
```

**响应**:
```json
{
  "success": true,
  "message": "Payment verified and order updated"
}
```

### 3. 支付成功页面
```
GET /api/payment/success?orderId={orderId}&session_id={sessionId}
```

### 4. 支付取消页面
```
GET /api/payment/cancel?orderId={orderId}
```

## 前端流程

### 1. 用户点击 "Confirm Payment" 按钮
- 调用 `POST /api/payment/checkout?orderId={orderId}`
- 获取 Stripe Checkout URL

### 2. 跳转到 Stripe 支付页面
- `window.location.href = checkoutUrl`
- 用户在 Stripe 页面完成支付

### 3. Stripe 重定向回前端
- 支付成功：重定向到 `/api/payment/success?orderId={orderId}&session_id={sessionId}`
- 支付取消：重定向到 `/api/payment/cancel?orderId={orderId}`

### 4. 前端验证支付
- 调用 `POST /api/payment/verify?orderId={orderId}&sessionId={sessionId}`
- 后端验证 Stripe session 并更新订单状态为 `paid`

## 配置要求

### 后端配置
在 `application.yml` 中配置 Stripe API Key：
```yaml
stripe:
  api:
    key: sk_test_...  # Stripe 测试密钥
```

### Stripe 配置
1. 登录 Stripe Dashboard
2. 获取 API Keys（测试环境使用 `sk_test_...`）
3. 配置 Webhook（可选，用于支付成功通知）
4. 配置重定向 URL：
   - Success URL: `http://localhost:5173/api/payment/success`
   - Cancel URL: `http://localhost:5173/api/payment/cancel`

## 测试流程

1. **创建订单**（状态为 `pending`）
2. **点击 "Confirm Payment"**
3. **跳转到 Stripe 测试页面**
4. **使用测试卡号**：
   - 卡号：`4242 4242 4242 4242`
   - 过期日期：任意未来日期
   - CVC：任意 3 位数字
   - 邮编：任意 5 位数字
5. **完成支付**
6. **重定向回前端**
7. **订单状态自动更新为 `paid`**

## 注意事项

1. **测试环境**：使用 Stripe 测试密钥 `sk_test_...`
2. **生产环境**：使用 Stripe 生产密钥 `sk_live_...`
3. **Webhook**：建议配置 Webhook 监听支付事件
4. **安全性**：不要在客户端暴露 Stripe 密钥
5. **错误处理**：前端需要处理支付失败的情况

## 修改的文件

- `OrderHistoryView.vue`：添加了 Stripe 支付流程
- 按钮文本：从 "Confirm Payment" 改为调用 Stripe API

