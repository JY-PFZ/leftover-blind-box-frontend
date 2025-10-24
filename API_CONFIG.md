# API 配置说明

## 当前配置

前端目前配置为**本地开发模式**，连接本地后端服务。

## 配置位置

### 1. vite.config.js（开发环境代理）
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:10015', // 本地后端
      changeOrigin: true,
    }
  }
}
```

### 2. src/utils/api.js（API 基础路径）
```javascript
const api = axios.create({
  baseURL: '/api', // 相对路径，通过 Vite 代理转发
  timeout: 10000,
});
```

## 如何切换到远程 API

### 方案1：修改 vite.config.js（推荐用于开发）

直接修改 `vite.config.js` 中的 `target`：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-remote-api.com', // 改为你的远程API地址
      changeOrigin: true,
    }
  }
}
```

### 方案2：使用环境变量（推荐用于生产）

创建 `.env` 文件：

```bash
# .env
VITE_API_URL=https://your-remote-api.com
```

然后修改 `vite.config.js`：

```javascript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:10015',
      changeOrigin: true,
    }
  }
}
```

### 方案3：直接修改 api.js（不推荐）

修改 `src/utils/api.js`：

```javascript
const api = axios.create({
  baseURL: 'https://your-remote-api.com/api', // 直接使用远程API
  timeout: 10000,
});
```

⚠️ **注意**：方案3会绕过 Vite 代理，可能遇到 CORS 问题。

## 为什么现在是本地运行？

1. **开发方便**：本地开发时，前端和后端都在本地运行，调试更方便
2. **避免 CORS**：通过 Vite 代理可以避免跨域问题
3. **数据隔离**：本地开发不影响线上数据

## 推荐配置

- **开发环境**：使用本地后端（当前配置）
- **生产环境**：构建后部署到服务器，使用远程 API

## 快速切换

如果你想快速切换到远程 API，告诉我你的远程 API 地址，我可以帮你修改配置。




