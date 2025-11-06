<script setup>
import { computed } from "vue"
import { ImageOff, Eye, ShoppingCart } from "lucide-vue-next"
import { useUserStore } from '@/stores/user'

const props = defineProps({
  product: { type: Object, required: true },
  requireLogin: { type: Boolean, default: true }
})

const user = useUserStore()
const isLoggedIn = computed(() => user.isLoggedIn)

const emit = defineEmits(['add', 'open'])

const displayPrice = computed(() => {
  const price = props.product.price || 0
  return price < 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(2)}`
})

function handleAdd() {
  if (props.requireLogin && !isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  emit('add', props.product)
  window.dispatchEvent(new Event('cart-item-added'))
}

function handleView() {
  if (props.requireLogin && !isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'))
    return
  }
  emit('open', props.product)
}
</script>

<template>
  <div
    class="group relative flex flex-col rounded-2xl border border-white/20 bg-white/80 backdrop-blur-md p-4 shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
  >
    <!-- 图片区域：固定 1:1，缺图显示占位 -->
    <div class="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-ink-100 to-ink-200">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.title || product.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div v-else class="flex h-full w-full items-center justify-center text-ink-400">
        <ImageOff class="h-12 w-12" />
      </div>
      <!-- 右上角价格徽标 -->
      <div
        class="absolute right-2 top-2 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-1.5 text-sm font-bold text-brand shadow-lg transition-all duration-300 group-hover:scale-110"
      >
        {{ displayPrice }}
      </div>
    </div>

    <!-- 文本 -->
    <h3 class="line-clamp-1 text-lg font-bold text-ink-900 mb-1">
      {{ product.title || product.name }}
    </h3>
    <p class="line-clamp-2 text-sm text-ink-600 mb-4 min-h-[2.5rem]">
      {{ product.description || "Delicious item prepared today." }}
    </p>

    <!-- 底部操作栏 - Apple Store 风格：默认隐藏，hover 时淡入 -->
    <div class="mt-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        @click="handleAdd"
        class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-600 active:scale-95 shadow-lg"
      >
        <ShoppingCart class="h-4 w-4" />
        Add to Cart
      </button>
      <button
        @click="handleView"
        class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:bg-ink-50 hover:border-brand active:scale-95"
        aria-label="View"
      >
        <Eye class="h-4 w-4" />
      </button>
    </div>

    <!-- 移动端始终显示按钮（因为无法 hover） -->
    <div class="mt-4 flex items-center gap-2 md:hidden">
      <button
        @click="handleAdd"
        class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-600 active:scale-95 shadow-lg"
      >
        <ShoppingCart class="h-4 w-4" />
        Add
      </button>
      <button
        @click="handleView"
        class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-all hover:bg-ink-50 active:scale-95"
        aria-label="View"
      >
        <Eye class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
