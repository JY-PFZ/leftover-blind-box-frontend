<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
    <section class="max-w-7xl mx-auto p-4 sm:p-6">
      <!-- 返回按钮 - 美化设计 -->
      <div class="mb-8">
        <button @click="$router.push('/')" class="group flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl text-gray-700 hover:text-gray-900 transition-all duration-300 border border-gray-200">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
            <span class="text-lg">←</span>
          </div>
          <span class="font-semibold text-lg">返回首页</span>
          <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
        </button>
      </div>
      
      <!-- 商家头部 - 现代化面板设计 -->
      <div v-if="merchant" class="merchant-header mb-8">
        <!-- 主面板 -->
        <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <!-- 顶部装饰条 -->
          <div class="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
          
          <div class="p-8">
            <div class="flex flex-col lg:flex-row gap-8 items-start">
              <!-- 商家图片区域 -->
              <div class="lg:w-1/3">
                <div class="relative group">
                  <div class="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div class="relative overflow-hidden rounded-3xl shadow-2xl">
                    <img :src="merchant.image" alt="cover" class="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    <!-- 图片装饰 -->
                    <div class="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span class="text-white text-xl">🏪</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 商家信息区域 -->
              <div class="lg:w-2/3">
                <!-- 商家名称和认证 -->
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative">
                    <h1 class="text-5xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                      {{ merchant.name }}
                    </h1>
                    <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-60"></div>
                  </div>
                  <div class="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg">
                    ⭐ 认证商家
                  </div>
                </div>
                
                <!-- 评分区域 -->
                <div class="flex items-center mb-6" v-if="merchant.rating !== undefined">
                  <div class="flex text-yellow-400 text-2xl drop-shadow-lg">
                    <span v-for="i in 5" :key="i" class="animate-pulse" :style="{ animationDelay: `${i * 0.1}s` }">★</span>
                  </div>
                  <div class="ml-4 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full shadow-md">
                    <span class="text-2xl font-bold text-gray-800">{{ Number(merchant.rating).toFixed(1) }}</span>
                    <span class="text-gray-600 ml-2">({{ merchant.reviewCount }}条评价)</span>
                  </div>
                </div>
                
                <!-- 商家描述 -->
                <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                  <p class="text-gray-700 text-xl leading-relaxed font-medium">{{ merchant.bio }}</p>
                </div>
                
                <!-- 联系信息卡片 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div class="group p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300" v-if="merchant.address">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span class="text-white text-2xl">📍</span>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 font-medium mb-1">地址</p>
                        <p class="font-bold text-gray-800 text-lg">{{ merchant.address }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300" v-if="merchant.openingHours">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span class="text-white text-2xl">🕒</span>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 font-medium mb-1">营业时间</p>
                        <p class="font-bold text-gray-800 text-lg">{{ merchant.openingHours }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300" v-if="merchant.phone">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span class="text-white text-2xl">📞</span>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 font-medium mb-1">联系电话</p>
                        <p class="font-bold text-gray-800 text-lg">{{ merchant.phone }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <div v-else class="text-center py-10 text-gray-500">
      <div v-if="merchantId">
        <h2 class="text-2xl font-semibold mb-4">Merchant Not Found</h2>
        <p>Sorry, we couldn't find a merchant with ID {{ merchantId }}.</p>
        <button @click="$router.push('/')" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Back to Home
        </button>
      </div>
      <div v-else>
        Loading merchant information...
      </div>
    </div>

    <!-- 商品列表 - 现代化面板 -->
    <div v-if="products.length" class="mb-12">
      <!-- 商品区域面板 -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"></div>
        
        <div class="p-8">
          <!-- 商品标题区域 -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white text-3xl">🍭</span>
              </div>
              <div>
                <h2 class="text-4xl font-black bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  我们的商品
                </h2>
                <p class="text-gray-500 text-lg">精心挑选的美味佳品</p>
              </div>
            </div>
            <div class="px-6 py-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl shadow-md border border-orange-200">
              <span class="text-orange-700 font-bold text-lg">{{ products.length }} 件商品</span>
            </div>
          </div>
          
          <!-- 商品网格 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <ProductCard
              v-for="p in products"
              :key="p.id"
              :product="p"
              :require-login="true"
              @add="cart.add(p)"
              @open="openProduct(p)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 - 美化设计 -->
    <div v-else-if="merchant" class="mb-12">
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="h-2 bg-gradient-to-r from-gray-400 to-gray-600"></div>
        <div class="p-16 text-center">
          <div class="relative mb-8">
            <div class="text-8xl mb-4 animate-bounce">🍭</div>
            <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-ping"></div>
          </div>
          <h3 class="text-3xl font-bold text-gray-800 mb-4">暂无商品</h3>
          <p class="text-gray-600 text-xl mb-8">商家正在准备更多美味商品，敬请期待！</p>
          <div class="flex justify-center">
            <button @click="$router.push('/')" class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              🏠 返回首页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论区 - 论坛风格 -->
    <div v-if="merchant" class="mb-12">
      <div class="max-w-5xl mx-auto">
        <!-- 评论标题栏 -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <h2 class="text-3xl font-bold">💬 评论区</h2>
                <div class="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                  <span class="text-yellow-300 text-xl">⭐</span>
                  <span class="font-bold text-lg">{{ merchant.rating }}/5.0</span>
                  <span class="text-white/90">({{ merchant.reviewCount }}条评论)</span>
                </div>
              </div>
              <div class="text-lg text-white/90 font-medium">
                共{{ reviews.length }}条评论
              </div>
            </div>
          </div>

          <!-- 写评论区域 -->
          <div v-if="user.isLoggedIn" class="p-6 border-b border-gray-200">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                {{ user.username.value?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-lg">{{ user.username.value || 'User' }}</h3>
                <p class="text-gray-500">发表评论</p>
              </div>
            </div>
            
            <form @submit.prevent="submitReview" class="space-y-6">
              <div class="flex items-center gap-6">
                <span class="text-gray-700 font-semibold text-lg">评分：</span>
                <div class="flex gap-2">
                  <button 
                    v-for="i in 5" 
                    :key="i" 
                    type="button"
                    @click="newReview.rating = i"
                    class="text-3xl transition-all duration-200 hover:scale-110 transform"
                    :class="i <= newReview.rating ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-300'"
                  >
                    ★
                  </button>
                </div>
                <span v-if="newReview.rating > 0" class="text-lg text-gray-700 font-medium bg-yellow-100 px-3 py-1 rounded-full">
                  {{ newReview.rating }}星评价
                </span>
              </div>
              
              <div class="relative">
                <textarea 
                  v-model="newReview.comment"
                  placeholder="分享你的购物体验，帮助其他用户做出更好的选择..."
                  class="w-full p-6 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 text-lg"
                  rows="6"
                  maxlength="500"
                ></textarea>
                <div class="absolute bottom-4 right-4 text-sm text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                  {{ newReview.comment.length }}/500
                </div>
              </div>
              
              <div class="flex justify-end">
                <button 
                  type="submit"
                  :disabled="!newReview.rating || !newReview.comment.trim()"
                  class="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🚀 发表评论
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 评论列表 - 独立卡片 -->
        <div class="space-y-6">
          <div 
            v-for="review in reviews" 
            :key="review.id"
            class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <!-- 评论头部 -->
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {{ review.userName.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-2">
                    <h4 class="font-bold text-gray-800 text-xl">{{ review.userName }}</h4>
                    <div class="flex text-yellow-400 text-lg">
                      <span v-for="i in 5" :key="i">
                        {{ i <= review.rating ? '★' : '☆' }}
                      </span>
                    </div>
                    <span class="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {{ formatDate(review.date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 评论内容 -->
            <div class="p-6">
              <div class="bg-gray-50 rounded-xl p-6 mb-4">
                <p class="text-gray-800 leading-relaxed text-lg">{{ review.comment }}</p>
              </div>
              
              <!-- 评论操作栏 -->
              <div class="flex items-center gap-8 text-base">
                <button 
                  @click="likeReview(review.id)"
                  class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  <span class="text-2xl">👍</span>
                  <span>有用 ({{ review.helpful }})</span>
                </button>
                <button 
                  @click="replyToReview(review.id)"
                  class="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium"
                >
                  <span class="text-2xl">💬</span>
                  <span>回复</span>
                </button>
                <button 
                  @click="reportReview(review.id)"
                  class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium"
                >
                  <span class="text-2xl">⚠️</span>
                  <span>举报</span>
                </button>
              </div>
              
              <!-- 回复区域 -->
              <div v-if="review.replies && review.replies.length > 0" class="mt-6 pt-6 border-t border-gray-200">
                <h5 class="text-lg font-semibold text-gray-700 mb-4">💬 回复 ({{ review.replies.length }})</h5>
                <div class="space-y-4">
                  <div v-for="reply in review.replies" :key="reply.id" class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {{ reply.userName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <span class="font-semibold text-gray-800">{{ reply.userName }}</span>
                          <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {{ formatDate(reply.date) }}
                          </span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">
                          {{ reply.comment }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="reviews.length === 0" class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="text-8xl mb-6">💭</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-4">还没有评论</h3>
          <p class="text-gray-600 text-lg">成为第一个分享体验的用户吧！</p>
        </div>

        <!-- 评论底部 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div class="flex items-center justify-between text-gray-600">
            <div class="flex items-center gap-2">
              <span class="text-2xl">💡</span>
              <span class="font-medium">评论请遵守社区规范，文明发言</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">📊</span>
              <span class="font-medium">共{{ reviews.length }}条评论</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 这里修改了 @close -->
    <ProductModal
      v-if="selected"
      :open="showProduct"
      :product="selected"
      @close="() => { showProduct = false; selected = null }"
      @open-merchant="() => {}"
    />
  </section>
</div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import ProductModal from '@/components/ProductModal.vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { mockProducts, mockMerchants, mockReviews } from '@/mocks/data.js'

const route = useRoute()
const cart = useCartStore()
const user = useUserStore()
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

function openProduct(p){ selected.value = p; showProduct.value = true }

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
  return new Intl.DateTimeFormat('en-US', {
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
.merchant-header { opacity:0; transform: translateY(20px); animation: fadeIn .5s ease forwards; }
@keyframes fadeIn { to { opacity:1; transform:none; } }
</style>
