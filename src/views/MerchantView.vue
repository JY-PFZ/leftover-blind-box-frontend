<template>
  <!-- 淘宝风格商家页面 -->
  <div class="taobao-page">
    <!-- 调试标签 -->
    <div class="debug-tag">
      MerchantView – Taobao skin v1
    </div>
    
    <!-- 返回按钮 -->
    <div class="return-bar">
      <div class="container">
        <button @click="$router.push('/')" class="return-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span class="text-sm">返回首页</span>
        </button>
      </div>
    </div>

    <!-- 商家Banner区域 - 淘宝风格 -->
    <div v-if="merchant" class="banner-section">
      <!-- 背景横幅 -->
      <div class="banner-bg"></div>
      
      <!-- 商家信息卡片 -->
      <div class="merchant-card">
        <div class="merchant-info">
          <div class="merchant-content">
            <div class="merchant-layout">
              <!-- 左侧：店铺头像和基本信息 -->
              <div class="merchant-left">
                <!-- 店铺头像 -->
                <div class="merchant-avatar">
                  <div class="avatar-img">
                    <img :src="merchant.image" alt="店铺头像">
                  </div>
                  <div class="verified-badge">
                    <span>✓</span>
                  </div>
                </div>
                
                <!-- 店铺信息 -->
                <div class="merchant-details">
                  <div class="merchant-name-row">
                    <h1 class="merchant-name">{{ merchant.name }}</h1>
                    <span class="certified-badge">认证商家</span>
                  </div>
                  
                  <!-- 评分和统计 -->
                  <div class="rating-stats">
                    <div class="rating-display">
                      <div class="stars">
                        <span v-for="i in 5" :key="i">★</span>
                      </div>
                      <span class="rating-text">{{ merchant.rating }}/5.0</span>
                      <span class="rating-text">({{ merchant.reviewCount }}条评价)</span>
                    </div>
                    <div v-if="merchantDistance" class="distance-text">
                      📍 {{ merchantDistance }}
                    </div>
                  </div>
                  
                  <!-- 店铺描述 -->
                  <p class="merchant-bio">{{ merchant.bio }}</p>
                </div>
        </div>
              
              <!-- 右侧：操作按钮 -->
              <div class="merchant-actions">
                <button class="action-btn">
                  <span style="margin-right: 8px;">❤️</span>收藏店铺
                </button>
                <button class="action-btn-outline">
                  <span style="margin-right: 8px;">💬</span>联系客服
                </button>
                <div class="contact-buttons">
                  <button class="contact-btn">
                    📞 {{ merchant.phone }}
                  </button>
                  <button class="contact-btn">
                    🕒 {{ merchant.openingHours }}
                  </button>
          </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品区域 - 淘宝风格 -->
    <div class="products-section">
      <div v-if="products.length">
        <!-- 商品标题栏 -->
        <div class="products-header">
          <div class="products-title">
            <div class="products-title-row">
              <h2 class="products-title-text">店铺商品</h2>
              <span class="products-count">共{{ products.length }}件商品</span>
            </div>
          </div>
        </div>
        
        <!-- 商品网格 - 淘宝风格 -->
        <div class="products-grid">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-card"
          >
            <!-- 商品图片 -->
            <div class="product-image">
              <img 
                :src="product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD48L3N2Zz4='"
                :alt="product.title"
              >
              <!-- 分类标签 -->
              <div class="category-tag">{{ product.category }}</div>
              <!-- 悬停时显示加入购物车 -->
              <div class="add-to-cart-overlay">
                <button 
                  @click="addToCart(product)"
                  class="add-to-cart-btn"
                >
                  加入购物车
                </button>
              </div>
    </div>

            <!-- 商品信息 -->
            <div class="product-info">
              <h3 class="product-title">{{ product.title }}</h3>
              <div class="product-price-row">
                <div>
                  <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                  <div class="product-sales">销量 {{ Math.floor(Math.random() * 1000) + 100 }}</div>
                </div>
                <button 
                  @click="openProduct(product)"
                  class="view-details"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="merchant" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3 class="empty-title">暂无商品</h3>
        <p class="empty-desc">商家正在准备更多商品，敬请期待！</p>
      </div>
    </div>

    <!-- 评论区 - 淘宝风格 -->
    <div v-if="merchant" class="reviews-section">
      <div class="reviews-card">
        <!-- 评论标题 -->
        <div class="reviews-header">
          <div class="reviews-title-row">
            <h2 class="reviews-title">用户评价</h2>
            <div class="reviews-stats">
              <div class="reviews-rating">
                <div class="stars">
                  <span v-for="i in 5" :key="i">★</span>
                </div>
                <span class="reviews-count">{{ merchant.rating }}/5.0</span>
              </div>
              <span class="reviews-count">共{{ reviews.length }}条评价</span>
            </div>
          </div>
        </div>

        <!-- 写评价区域 -->
        <div v-if="user.isLoggedIn" class="write-review">
          <div class="review-user">
            <div class="user-avatar">
              {{ user.username.value?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="user-name">{{ user.username.value || 'User' }}</span>
          </div>
          
          <form @submit.prevent="submitReview" class="review-form">
            <!-- 评分 -->
            <div class="rating-input">
              <span class="rating-label">评分：</span>
              <div class="star-buttons">
                <button 
                  v-for="i in 5" 
                  :key="i" 
                  type="button"
                  @click="newReview.rating = i"
                  class="star-btn"
                  :class="{ active: i <= newReview.rating }"
                >
                  ★
                </button>
              </div>
              <span v-if="newReview.rating > 0" class="rating-text">
                {{ newReview.rating }}星评价
              </span>
            </div>
            
            <!-- 评论内容 -->
            <div class="comment-input">
              <textarea 
                v-model="newReview.comment"
                placeholder="分享你的购物体验..."
                class="comment-textarea"
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="char-count">
                {{ newReview.comment.length }}/500
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <button 
              type="submit"
              :disabled="!newReview.rating || !newReview.comment.trim()"
              class="submit-btn"
            >
              发表评价
            </button>
          </form>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-list">
          <div 
            v-for="review in reviews" 
            :key="review.id"
            class="review-item"
          >
            <!-- 评价头部 -->
            <div class="review-header">
              <div class="review-avatar">
                {{ review.userName.charAt(0).toUpperCase() }}
              </div>
              <div class="review-user-info">
                <div class="review-user-row">
                  <span class="review-user-name">{{ review.userName }}</span>
                  <div class="review-stars">
                    <span v-for="i in 5" :key="i">
                      {{ i <= review.rating ? '★' : '☆' }}
                    </span>
                  </div>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 评价内容 -->
            <div class="review-content">
              <p class="review-text">{{ review.comment }}</p>
              
              <!-- 评价操作 -->
              <div class="review-actions">
                <button 
                  @click="likeReview(review.id)"
                  class="review-action"
                >
                  有用 ({{ review.helpful }})
                </button>
                <button 
                  @click="replyToReview(review.id)"
                  class="review-action"
                >
                  回复
                </button>
                <button 
                  @click="reportReview(review.id)"
                  class="review-action report-action"
                >
                  举报
                </button>
              </div>
              
              <!-- 回复区域 -->
              <div v-if="review.replies && review.replies.length > 0" class="replies-section">
                <div v-for="reply in review.replies" :key="reply.id" class="reply-item">
                  <div class="reply-avatar">
                    {{ reply.userName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="reply-content">
                    <div class="reply-header">
                      <span class="reply-user-name">{{ reply.userName }}</span>
                      <span class="reply-date">{{ formatDate(reply.date) }}</span>
                    </div>
                    <p class="reply-text">{{ reply.comment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="reviews.length === 0" class="reviews-empty">
          <div class="reviews-empty-icon">💭</div>
          <h3 class="reviews-empty-title">还没有评价</h3>
          <p class="reviews-empty-desc">成为第一个分享体验的用户吧！</p>
        </div>
      </div>
    </div>

    <!-- 商品详情弹窗 -->
    <ProductModal
      v-if="selected"
      :open="showProduct"
      :product="selected"
      @close="() => { showProduct = false; selected = null }"
      @open-merchant="() => {}"
    />
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import ProductCard from '@/components/ProductCard.vue'
import ProductModal from '@/components/ProductModal.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { mockProducts, mockMerchants, mockReviews } from '@/mocks/data.js'
import { getMerchantDistance, formatDistance } from '@/utils/geoUtils'

const route = useRoute()
const cart = useCartStore()
const user = useUserStore()
const { userLocation } = storeToRefs(user)
const merchant = ref(null)
const products = ref([])
const reviews = ref([])
const showProduct = ref(false)
const selected = ref(null)

// 新评论表单
const newReview = ref({
  rating: 0,
  comment: ''
})

// 从路由参数获取商家ID
const merchantId = computed(() => Number(route.params.id))

// 计算商家距离
const merchantDistance = computed(() => {
  if (!merchant.value || !userLocation.value) {
    return null
  }
  
  const distance = getMerchantDistance(merchant.value, userLocation.value)
  return distance ? formatDistance(distance) : null
})

function openProduct(p) { 
  selected.value = p
  showProduct.value = true 
}

function addToCart(product) {
  cart.add(product)
  // 触发购物车动画
  window.dispatchEvent(new Event('cart-item-added'))
}

// 提交评论
function submitReview() {
  if (!newReview.value.rating || !newReview.value.comment.trim()) return
  
  const review = {
    id: Date.now(),
    userName: user.username.value || 'Anonymous',
    rating: newReview.value.rating,
    comment: newReview.value.comment.trim(),
    date: new Date(),
    helpful: 0,
    replies: []
  }
  
  reviews.value.unshift(review)
  newReview.value = { rating: 0, comment: '' }
  
  console.log('Review submitted:', review)
}

// 点赞评论
function likeReview(reviewId) {
  const review = reviews.value.find(r => r.id === reviewId)
  if (review) {
    review.helpful++
    console.log('Review liked:', reviewId, 'New count:', review.helpful)
  }
}

// 回复评论
function replyToReview(reviewId) {
  const replyText = prompt('请输入回复内容：')
  if (replyText && replyText.trim()) {
    const review = reviews.value.find(r => r.id === reviewId)
    if (review) {
      if (!review.replies) review.replies = []
      review.replies.push({
        id: Date.now(),
        userName: user.username.value || 'Anonymous',
        comment: replyText.trim(),
        date: new Date()
      })
      console.log('Reply added to review:', reviewId)
    }
  }
}

// 举报评论
function reportReview(reviewId) {
  if (confirm('确定要举报这条评论吗？')) {
    console.log('Review reported:', reviewId)
    alert('举报已提交，我们会尽快处理！')
  }
}

// 格式化日期
function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

watchEffect(() => {
  const id = merchantId.value
  console.log('Loading merchant with ID:', id)
  merchant.value = mockMerchants.find(m => Number(m.id) === id) || null
  products.value = mockProducts.filter(p => Number(p.merchant?.id) === id)
  reviews.value = mockReviews.filter(r => Number(r.merchantId) === id)
  console.log('Merchant loaded:', merchant.value)
  console.log('Products loaded:', products.value.length, 'items')
  console.log('Reviews loaded:', reviews.value.length, 'reviews')
})
</script>

<style scoped>
/* 强制覆盖全局背景 */
.taobao-page {
  min-height: 100vh;
  background: #f5f5f5 !important;
  color: #0f172a;
}

/* 调试标签 */
.debug-tag {
  display: inline-flex;
  padding: 4px 8px;
  margin: 8px;
  border-radius: 4px;
  background: #10b981;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

/* 返回按钮区域 */
.return-bar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 16px;
}

.return-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  transition: color 0.2s;
}

.return-btn:hover {
  color: #ff6600;
}

/* 商家Banner区域 */
.banner-section {
  position: relative;
}

.banner-bg {
  height: 256px;
  background: linear-gradient(to right, #ff6600, #ff8533);
  position: relative;
  overflow: hidden;
}

.banner-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.banner-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, transparent, transparent, rgba(0, 0, 0, 0.3));
}

.merchant-card {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.merchant-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.merchant-content {
  padding: 24px;
}

.merchant-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 768px) {
  .merchant-layout {
    flex-direction: row;
  }
}

.merchant-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .merchant-left {
    flex-direction: row;
  }
}

.merchant-avatar {
  position: relative;
}

.avatar-img {
  width: 96px;
  height: 96px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: #ff6600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verified-badge span {
  color: white;
  font-size: 14px;
}

.merchant-details {
  flex: 1;
}

.merchant-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.merchant-name {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
}

.certified-badge {
  padding: 4px 8px;
  background: #ff6600;
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.rating-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  color: #fbbf24;
}

.stars span {
  font-size: 14px;
}

.rating-text {
  font-size: 14px;
  color: #6b7280;
}

.distance-text {
  font-size: 14px;
  color: #6b7280;
}

.merchant-bio {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.merchant-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: auto;
}

@media (min-width: 768px) {
  .merchant-actions {
    margin-left: auto;
  }
}

.action-btn {
  padding: 8px 24px;
  background: #ff6600;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background: #e65c00;
}

.action-btn-outline {
  padding: 8px 24px;
  border: 1px solid #ff6600;
  color: #ff6600;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.action-btn-outline:hover {
  background: #ff6600;
  color: white;
}

.contact-buttons {
  display: flex;
  gap: 8px;
}

.contact-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 6px;
  font-size: 14px;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.contact-btn:hover {
  background: #e5e7eb;
}

/* 商品区域 */
.products-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 16px;
}

.products-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.products-title {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.products-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.products-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.products-count {
  font-size: 14px;
  color: #6b7280;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.product-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  overflow: hidden;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.category-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ff6600;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.add-to-cart-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card:hover .add-to-cart-overlay {
  opacity: 1;
}

.add-to-cart-btn {
  padding: 8px 16px;
  background: #ff6600;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.add-to-cart-btn:hover {
  background: #e65c00;
}

.product-info {
  padding: 12px;
}

.product-title {
  font-size: 14px;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6600;
}

.product-sales {
  font-size: 12px;
  color: #6b7280;
}

.view-details {
  font-size: 12px;
  color: #6b7280;
  transition: color 0.2s;
  cursor: pointer;
}

.view-details:hover {
  color: #ff6600;
}

/* 空状态 */
.empty-state {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 48px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
}

.empty-desc {
  color: #6b7280;
}

/* 评论区 */
.reviews-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.reviews-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.reviews-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.reviews-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reviews-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.reviews-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reviews-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviews-rating .stars {
  color: #fbbf24;
}

.reviews-rating .stars span {
  font-size: 14px;
}

.reviews-count {
  font-size: 14px;
  color: #6b7280;
}

/* 写评价区域 */
.write-review {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #ff6600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  color: #6b7280;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rating-label {
  font-size: 14px;
  color: #6b7280;
}

.star-buttons {
  display: flex;
  gap: 4px;
}

.star-btn {
  font-size: 18px;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
}

.star-btn.active {
  color: #fbbf24;
}

.rating-text {
  font-size: 14px;
  color: #6b7280;
}

.comment-input {
  position: relative;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  resize: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #ff6600;
  box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.1);
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 12px;
  color: #9ca3af;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
}

.submit-btn {
  padding: 8px 24px;
  background: #ff6600;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
  align-self: flex-end;
}

.submit-btn:hover:not(:disabled) {
  background: #e65c00;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 评价列表 */
.reviews-list {
  border-top: 1px solid #e5e7eb;
}

.review-item {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-avatar {
  width: 32px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
  font-weight: bold;
}

.review-user-info {
  flex: 1;
}

.review-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-user-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.review-stars {
  display: flex;
  color: #fbbf24;
}

.review-stars span {
  font-size: 12px;
}

.review-date {
  font-size: 12px;
  color: #6b7280;
}

.review-content {
  margin-left: 44px;
}

.review-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 12px;
}

.review-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.review-action {
  transition: color 0.2s;
  cursor: pointer;
}

.review-action:hover {
  color: #ff6600;
}

.report-action:hover {
  color: #ef4444;
}

/* 回复区域 */
.replies-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: bold;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-user-name {
  font-size: 12px;
  font-weight: 500;
  color: #111827;
}

.reply-date {
  font-size: 12px;
  color: #9ca3af;
}

.reply-text {
  font-size: 12px;
  color: #6b7280;
}

/* 空状态 */
.reviews-empty {
  padding: 48px;
  text-align: center;
}

.reviews-empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.reviews-empty-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.reviews-empty-desc {
  font-size: 12px;
  color: #6b7280;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 按钮悬停效果 */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>