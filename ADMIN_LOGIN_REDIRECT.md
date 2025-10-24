# Admin 登录跳转功能

## 功能说明

现在 admin 用户登录后会自动跳转到 admin 专属界面，而不是顾客界面。

## 修改内容

### 1. LoginModal.vue (首页登录弹窗)
修改了登录成功后的跳转逻辑：

```javascript
if (res.success) {
  successMsg.value = '✅ Login Successful! Redirecting...';
  
  setTimeout(() => {
    emit('close');
    // 根据角色跳转到不同界面
    if (userStore.role === 'merchant') {
      router.push('/merchant/dashboard');
    } else if (userStore.role === 'admin') {
      router.push('/admin');
    }
    // customer 和其他角色留在当前页面
  }, 1000);
}
```

## 登录入口

### 1. 首页登录弹窗 (`/`)
- 访问首页，点击登录按钮
- 输入 admin 账号密码
- 登录成功后自动跳转到 `/admin`

### 2. Admin 专用登录页面 (`/admin/login`)
- 访问 `http://localhost:5173/admin/login`
- 输入 admin 账号密码
- 登录成功后自动跳转到 `/admin`

## 角色跳转规则

| 角色 | 跳转目标 |
|------|---------|
| `admin` | `/admin` (管理员界面) |
| `merchant` | `/merchant/dashboard` (商家界面) |
| `customer` | 留在当前页面 |

## 测试步骤

1. 确保 admin 用户已创建并激活（参考 `ACTIVATE_ADMIN.md`）
2. 访问首页 `http://localhost:5173`
3. 点击登录按钮
4. 输入：
   - 账号：`admin@123456.com`
   - 密码：`123456`
5. 点击登录
6. 等待 1 秒后，应该自动跳转到 `/admin` 界面

## 验证

登录成功后，应该看到：
- ✅ 页面跳转到 `/admin`
- ✅ 显示 admin 专属的仪表板
- ✅ 顶部显示 "Admin Dashboard"
- ✅ 侧边栏显示管理员功能菜单

