<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="pm">
      <!-- 顶部彩带 -->
      <div class="ribbon"></div>

      <div class="body">
        <!-- 左：媒体区 -->
        <section class="media">
          <div class="main">
            <img v-if="activeImage" :src="activeImage" :alt="product?.title || 'Product'"/>
            <div v-else class="fallback"></div>

            <!-- 角标标签 -->
            <div v-if="badge" class="badge">{{ badge }}</div>
          </div>

          <div v-if="images.length>1" class="thumbs">
            <button
              v-for="(src,i) in images" :key="i"
              class="thumb" :class="{active:i===activeIndex}"
              @click="activeIndex=i"
            >
              <img :src="src" alt=""/>
            </button>
          </div>
        </section>

        <!-- 右：信息与动作 -->
        <section class="info">
          <h2 class="title">{{ product?.title }}</h2>

          <div class="subrow">
            <div class="price">
              <span class="now">${{ priceNow }}</span>
              <span v-if="product?.originalPrice" class="old">${{ priceOld }}</span>
            </div>
            <div v-if="rating" class="rating">
              <span class="star">★</span> {{ rating.toFixed(1) }}
            </div>
          </div>

          <p class="desc">{{ product?.description || 'Delicious dessert made with premium ingredients.' }}</p>

          <!-- 商家卡片：点击直达店铺 -->
          <div v-if="product?.merchant" class="merchant">
            <img v-if="product.merchant.image" :src="product.merchant.image" class="avatar" alt=""/>
            <div class="meta">
              <div class="m-name">{{ product.merchant.name }}</div>
              <div class="m-sub">
                <span v-if="product.merchant.rating">★ {{ product.merchant.rating }}</span>
                <span v-if="merchantDistance" class="distance">📍 {{ merchantDistance }}</span>
                <span v-if="product.merchant.address"> · {{ product.merchant.address }}</span>
              </div>
            </div>
            <RouterLink
              class="shop"
              :to="{ name: 'merchant', params: { id: product.merchant.id } }"
              @click="$emit('close')"
            >View Shop →</RouterLink>
          </div>

          <!-- 规格 -->
          <div v-if="variants.length" class="variants">
            <div class="label">Flavor</div>
            <div class="pills">
              <button
                v-for="v in variants" :key="v"
                class="pill" :class="{active:selectedVariant===v}"
                @click="selectedVariant=v"
              >{{ v }}</button>
            </div>
          </div>

          <!-- 数量 -->
          <div class="qty">
            <div class="label">Quantity</div>
            <div class="stepper">
              <button @click="dec">−</button>
              <input type="number" min="1" v-model.number="qty">
              <button @click="inc">＋</button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <button class="btn add" @click="addToCart">Add to Cart</button>
            <button class="btn buy" @click="buyNow">Buy Now</button>
          </div>
        </section>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import Modal from './Modal.vue';
import { useUserStore } from '@/stores/user';
import { getMerchantDistance, formatDistance } from '@/utils/geoUtils';

const props = defineProps({
  open: { type: Boolean, default: false },
  product: { type: Object, required: true }
});
const emit = defineEmits(['close', 'add-to-cart']);
const user = useUserStore();
const { userLocation } = storeToRefs(user);

const images = computed(() => {
  const arr = [];
  if (props.product?.imageUrl) arr.push(props.product.imageUrl);
  if (Array.isArray(props.product?.images)) arr.push(...props.product.images);
  return arr;
});
const activeIndex = ref(0);
const activeImage = computed(() => images.value[activeIndex.value] || '');

const badge = computed(() => props.product?.badge || '');
const rating = computed(() => props.product?.rating || props.product?.merchant?.rating || 0);
const priceNow = computed(() => Number(props.product?.price || 0).toFixed(2));
const priceOld = computed(() => Number(props.product?.originalPrice || 0).toFixed(2));

const merchantDistance = computed(() => {
  if (!props.product?.merchant || !userLocation.value) {
    return null;
  }
  const distance = getMerchantDistance(props.product.merchant, userLocation.value);
  return distance ? formatDistance(distance) : null;
});

const variants = computed(() => props.product?.variants ?? []);
const selectedVariant = ref(variants.value[0] || null);
const qty = ref(1);
function inc() { qty.value++; }
function dec() { if (qty.value > 1) qty.value--; }
watch(() => props.open, o => { if (o) { qty.value = 1; activeIndex.value = 0; } });

watchEffect(() => {
  if (props.open && props.product?.merchant && userLocation.value) {
    // console.log('ProductModal: User location changed, recalculating distance')
  }
});

watch(() => props.open, async (isOpen) => {
  if (isOpen && !userLocation.value) {
    console.log('ProductModal: Modal opened but no user location, fetching...');
    await user.getUserLocation();
  }
});

function addToCart() {
  emit('add-to-cart', props.product, qty.value);
}
function buyNow() {
  addToCart();
  emit('close');
}
</script>

<style scoped>
.pm {
  position: relative;
}
.ribbon {
  height: 8px;
  background: linear-gradient(90deg, #ff9a9e, #fad0c4, #fbc2eb, #a1c4fd);
}
.body {
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 22px;
  padding: 20px;
}
@media (max-width: 920px) {
  .body {
    grid-template-columns: 1fr;
  }
}

.media {}
.main {
  position: relative;
  height: 380px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffd2d2, #e2b6ff);
  box-shadow: 0 10px 28px rgba(211, 47, 47, .12);
}
.main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #9dd1ff, #f6a4ff);
}
.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #d32f2f;
  color: #fff;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  box-shadow: 0 4px 14px rgba(211, 47, 47, .35);
}
.thumbs {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.thumb {
  width: 68px;
  height: 68px;
  border-radius: 10px;
  overflow: hidden;
  padding: 0;
  border: none;
  cursor: pointer;
  outline: 2px solid transparent;
  transition: outline-color .15s;
  background: #fff;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb.active,
.thumb:hover {
  outline-color: #ff9800;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.title {
  font: 800 24px/1.2 system-ui, -apple-system, Segoe UI, Roboto;
  color: #231f20;
  margin: 0;
}
.subrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.price .now {
  color: #d32f2f;
  font-weight: 900;
  font-size: 20px;
}
.price .old {
  color: #9b9b9b;
  text-decoration: line-through;
  font-weight: 700;
  margin-left: 8px;
}
.rating {
  color: #555;
  font-weight: 800;
}
.star {
  color: #f59e0b;
  margin-right: 4px;
}
.desc {
  color: #4a4a4a;
  line-height: 1.65;
}

.merchant {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
}
.meta {
  flex: 1;
}
.m-name {
  font-weight: 800;
}
.m-sub {
  color: #777;
  font-size: 12px;
  margin-top: 2px;
}
.distance {
  color: #3b82f6;
  font-weight: 600;
}
.shop {
  text-decoration: none;
  background: #ff9800;
  color: #fff;
  font-weight: 900;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
  transition: background .2s, transform .06s;
}
.shop:hover {
  background: #e68900;
}
.shop:active {
  transform: translateY(1px) scale(.99);
}

.variants {}
.label {
  color: #7a7a7a;
  font-size: 12px;
  margin-bottom: 6px;
}
.pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill {
  border: none;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  background: #f5f5f5;
  color: #333;
  font-weight: 700;
  font-size: 12px;
}
.pill.active,
.pill:hover {
  background: #111827;
  color: #fff;
}

.qty {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stepper {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
}
.stepper button {
  width: 34px;
  height: 34px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  font-weight: 900;
  font-size: 16px;
}
.stepper input {
  width: 56px;
  height: 34px;
  border: none;
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  outline: none;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}
.btn {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: .2px;
  font-size: 14px;
  transition: transform .06s, filter .06s, background .2s;
}
.btn:active {
  transform: translateY(1px) scale(.99);
}
.btn.add {
  background: #22c55e;
  color: #fff;
}
.btn.add:hover {
  filter: brightness(1.05)
}
.btn.buy {
  background: #d32f2f;
  color: #fff;
}
.btn.buy:hover {
  filter: brightness(1.05)
}
</style>