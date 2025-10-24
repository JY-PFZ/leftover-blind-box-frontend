# 权限错误说明

## 问题

后端 OrderController 第 67 行有权限限制：

```java
@PutMapping("/{id}/status")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MERCHANT')")
```

这意味着只有管理员和商家可以更新订单状态，普通用户不能。

## 解决方案

### 方案 1：修改后端权限（推荐）
在后端 OrderController.java 第 67 行修改：

```java
// 修改前
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MERCHANT')")

// 修改后
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MERCHANT', 'USER')")
```

然后重启后端服务。

### 方案 2：使用商家账号测试
使用商家账号登录（merchanttest@123456.com），商家可以更新订单状态。

### 方案 3：创建支付接口（不修改后端）
如果需要保持后端不变，可以在前端使用 mock 支付功能，模拟支付成功后自动更新状态。

## 建议

如果这是测试环境，建议使用方案 1，允许用户更新自己订单的状态。

