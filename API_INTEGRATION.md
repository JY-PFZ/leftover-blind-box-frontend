# API 集成说明

## 🎯 设计理念

本项目采用 **Mock优先 + API备选** 的策略，确保功能完整可用：

1. **功能完整性**：所有功能都有Mock实现，无需后端即可完整使用
2. **API就绪**：当后端可用时，只需简单配置即可切换到API模式
3. **优雅降级**：API失败时自动回退到Mock数据

## 🔧 配置方式

### 启用API模式

在 `src/stores/merchant.js` 中：

```javascript
// 设置为 true 启用API模式
const useApiData = ref(true)
```

### API端点配置

在 `src/utils/api.js` 中配置后端地址：

```javascript
const api = axios.create({
  baseURL: 'http://localhost:10015/api', // 修改为你的后端地址
  timeout: 10000,
});
```

## 📋 API接口规范

### 商品管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/magic-bags` | 获取所有商品 |
| GET | `/merchants/{id}/products` | 获取商家商品 |
| POST | `/products` | 添加商品 |
| PUT | `/products/{id}` | 更新商品 |
| DELETE | `/products/{id}` | 删除商品 |
| PATCH | `/products/{id}/price` | 更新商品价格 |
| PATCH | `/products/{id}/sold-out` | 切换售罄状态 |

### 商家接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/merchants/nearby` | 获取附近商家 |
| GET | `/merchants/{id}` | 获取商家详情 |

### 订单接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/orders` | 创建订单 |
| GET | `/orders` | 获取用户订单 |
| PATCH | `/orders/{id}/status` | 更新订单状态 |

## 🔄 数据格式

### 商品数据格式

```javascript
{
  id: "p-1001",
  title: "商品名称",
  price: 3.5,
  category: "bread|drink|dessert|other",
  cover: "图片URL",
  soldOut: false,
  merchantId: 1,
  merchantName: "商家名称"
}
```

### API响应格式

```javascript
{
  success: true,
  data: {
    // 具体数据
  },
  message: "操作成功"
}
```

## 🚀 使用方式

### 当前状态（Mock模式）

- ✅ 所有功能完整可用
- ✅ 商品管理（增删改查）
- ✅ 价格修改
- ✅ 售罄状态切换
- ✅ 用户登录/注册
- ✅ 订单管理

### 切换到API模式

1. 确保后端服务运行
2. 修改 `useApiData.value = true`
3. 配置正确的API地址
4. 重启前端服务

## 🛠️ 开发建议

1. **优先使用Mock**：开发阶段使用Mock数据，确保功能完整
2. **API就绪**：所有API调用代码已准备就绪
3. **错误处理**：API失败时自动回退到Mock
4. **数据一致性**：Mock数据格式与API格式保持一致

## 📝 注意事项

- Mock数据存储在内存中，刷新页面会重置
- API模式需要后端服务支持
- 所有API调用都有超时和错误处理
- 支持Token认证（当后端启用时）
