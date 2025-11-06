# AWS 部署指南 - Magic Bag Frontend

## 方案一：S3 + CloudFront（推荐）⭐

### 优点
- ✅ 成本低（S3 存储 + CloudFront CDN 费用）
- ✅ 性能好（全球 CDN 加速）
- ✅ 无需维护服务器
- ✅ 自动扩展
- ✅ SSL 证书自动配置

### 部署步骤

#### 1. 构建项目

```bash
npm install
npm run build
```

这会生成 `dist` 文件夹，包含所有静态文件。

#### 2. 创建 S3 存储桶

1. 登录 AWS Console
2. 进入 **S3** 服务
3. 点击 **Create bucket**
4. 配置：
   - **Bucket name**: `magic-bag-frontend` (或您喜欢的名称)
   - **Region**: 选择离您最近的区域（如 `ap-southeast-1` 新加坡）
   - **Block Public Access**: **取消勾选**（允许公共访问）
   - 勾选 "I acknowledge that the current settings might result in this bucket and the objects within becoming public"
   - 其他保持默认

#### 3. 配置 S3 静态网站托管

1. 进入创建的 bucket
2. 点击 **Properties** 标签
3. 滚动到 **Static website hosting**
4. 点击 **Edit**
5. 配置：
   - **Static website hosting**: Enable
   - **Hosting type**: Host a static website
   - **Index document**: `index.html`
   - **Error document**: `index.html` (用于 Vue Router 的路由)
6. 点击 **Save changes**
7. 记住 **Bucket website endpoint** URL（格式：`http://bucket-name.s3-website-region.amazonaws.com`）

#### 4. 配置 Bucket 策略

1. 点击 **Permissions** 标签
2. 点击 **Bucket policy**
3. 添加以下策略（替换 `YOUR-BUCKET-NAME`）：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

#### 5. 上传构建文件

**方法 A：使用 AWS Console**
1. 进入 bucket
2. 点击 **Upload**
3. 选择 `dist` 文件夹中的所有文件
4. 点击 **Upload**

**方法 B：使用 AWS CLI（推荐）**

```bash
# 安装 AWS CLI（如果还没安装）
# Windows: https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: pip install awscli

# 配置 AWS 凭证
aws configure
# 输入 Access Key ID、Secret Access Key、Region

# 上传文件
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
```

#### 6. 创建 CloudFront 分发（可选但推荐）

1. 进入 **CloudFront** 服务
2. 点击 **Create distribution**
3. 配置：
   - **Origin domain**: 选择您的 S3 bucket（不是 website endpoint）
   - **Origin access**: 选择 "Public"
   - **Default root object**: `index.html`
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS
   - **Price class**: 根据需要选择
4. 点击 **Create distribution**
5. 等待部署完成（通常需要 10-15 分钟）
6. 使用 CloudFront 的域名访问（格式：`https://xxxxx.cloudfront.net`）

#### 7. 配置 CloudFront 错误页面（重要！）

由于 Vue Router 使用 History 模式，需要配置错误页面：

1. 进入 CloudFront 分发
2. 点击 **Error pages** 标签
3. 点击 **Create custom error response**
4. 配置：
   - **HTTP error code**: `403: Forbidden`
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: `200: OK`
5. 重复步骤 3-4，为 `404: Not Found` 也配置相同设置

---

## 方案二：AWS Amplify（最简单）⭐

### 优点
- ✅ 最简单的部署方式
- ✅ 自动 CI/CD（连接 GitHub）
- ✅ 自动构建和部署
- ✅ 自动配置 HTTPS
- ✅ 支持环境变量

### 部署步骤

#### 1. 准备 GitHub 仓库

确保代码已推送到 GitHub（已完成 ✅）

#### 2. 在 AWS Amplify 中创建应用

1. 登录 AWS Console
2. 进入 **AWS Amplify** 服务
3. 点击 **New app** → **Host web app**
4. 选择 **GitHub** 并授权
5. 选择仓库：`JY-PFZ/leftover-blind-box-frontend`
6. 选择分支：`feat/magic-bag-branding-and-i18n`（或您要部署的分支）
7. 配置构建设置：

**buildspec.yml**（Amplify 会自动检测，但可以手动配置）：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

8. 点击 **Save and deploy**

#### 3. 配置环境变量（如果需要）

在 Amplify Console 中：
1. 进入应用设置
2. 点击 **Environment variables**
3. 添加需要的环境变量（如 API URL）

#### 4. 配置重定向规则（Vue Router）

在 Amplify Console 中：
1. 进入应用设置
2. 点击 **Rewrites and redirects**
3. 添加规则：

```
Source address: /<*>
Target address: /index.html
Type: 200 (Rewrite)
```

#### 5. 等待部署完成

Amplify 会自动：
- 从 GitHub 拉取代码
- 运行 `npm install`
- 运行 `npm run build`
- 部署到 CloudFront

完成后会得到一个 URL（格式：`https://xxxxx.amplifyapp.com`）

---

## 方案三：EC2 + Nginx（传统方式）

### 优点
- ✅ 完全控制服务器
- ✅ 可以运行 Node.js 后端

### 缺点
- ❌ 需要维护服务器
- ❌ 需要配置 SSL 证书
- ❌ 成本较高

### 部署步骤

#### 1. 启动 EC2 实例

1. 进入 **EC2** 服务
2. 点击 **Launch Instance**
3. 选择 **Ubuntu Server 22.04 LTS**
4. 选择实例类型：`t2.micro`（免费层）
5. 配置安全组：
   - HTTP (80)
   - HTTPS (443)
   - SSH (22)
6. 启动实例

#### 2. 连接到 EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 3. 安装 Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 4. 上传构建文件

**方法 A：使用 SCP**

```bash
# 在本地执行
scp -r dist/* ubuntu@your-ec2-ip:/var/www/html/
```

**方法 B：使用 Git**

```bash
# 在 EC2 上执行
sudo apt install git -y
git clone https://github.com/JY-PFZ/leftover-blind-box-frontend.git
cd leftover-blind-box-frontend
git checkout feat/magic-bag-branding-and-i18n
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

#### 5. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

替换为：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 或使用 EC2 的公共 IP

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 代理 API 请求到后端
    location /api {
        proxy_pass http://52.77.254.95:10015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. 配置 SSL（使用 Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 环境变量配置

如果需要配置不同的后端 API URL，可以创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://52.77.254.95:10015
```

然后在 `vite.config.js` 中使用：

```js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // ... 其他配置
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://52.77.254.95:10015',
          // ...
        }
      }
    }
  }
})
```

---

## 推荐方案对比

| 方案 | 成本 | 难度 | 维护 | 性能 | 推荐度 |
|------|------|------|------|------|--------|
| S3 + CloudFront | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Amplify | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| EC2 + Nginx | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## 推荐顺序

1. **AWS Amplify** - 最简单，适合快速部署
2. **S3 + CloudFront** - 成本低，性能好
3. **EC2 + Nginx** - 如果需要更多控制

---

## 常见问题

### Vue Router 404 错误

确保配置了重定向规则，将所有路由重定向到 `index.html`。

### API 请求失败

检查 CORS 配置和后端 API 地址是否正确。

### 构建后的文件太大

使用代码分割和压缩：
```bash
npm run build -- --mode production
```

