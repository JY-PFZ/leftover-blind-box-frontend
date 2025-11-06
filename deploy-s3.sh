#!/bin/bash

# AWS S3 部署脚本
# 使用方法: ./deploy-s3.sh YOUR-BUCKET-NAME

set -e

BUCKET_NAME=${1:-magic-bag-frontend}
REGION=${2:-ap-southeast-1}

echo "🚀 开始部署到 S3..."
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "📦 构建项目..."
    npm run build
fi

# 检查 AWS CLI 是否安装
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI 未安装，请先安装: https://aws.amazon.com/cli/"
    exit 1
fi

# 上传文件
echo "📤 上传文件到 S3..."
aws s3 sync dist/ s3://$BUCKET_NAME \
    --region $REGION \
    --delete \
    --exclude "*.map" \
    --cache-control "public, max-age=31536000, immutable"

echo "✅ 部署完成！"
echo "🌐 网站地址: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

