<template>
  <div class="card">
    <div class="thumb">
      <div class="thumb-fallback"></div>
    </div>
    <div class="content">
      <h3 class="title">{{ product.title }}</h3>
      <div class="price-row">
        <span class="price">${{ product.price.toFixed(2) }}</span>
      </div>
      <p class="description">{{ product.description }}</p>
      <div class="actions">
        <button class="btn add" @click="$emit('add', product)">
          Add to Cart
        </button>
        <button class="btn view" @click="$emit('open', product)">
           <svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
           </svg>
           <span>View</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
});
defineEmits(['add', 'open']);
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}
.thumb {
  height: 150px;
  position: relative;
  overflow: hidden;
}
.thumb-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fee8d2, #ffd1dc);
}
.content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.2;
  min-height: 2.4em; /* Ensures title takes up at least 2 lines */
}
.price-row {
  margin-bottom: 8px;
}
.price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.1rem;
}
.description {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
  flex-grow: 1;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 10px;
  transition: all 0.2s ease;
}
.btn.add {
  flex-grow: 1;
  background: #22c55e;
  color: #fff;
}
.btn.add:hover {
  background: #16a34a;
}
.btn.view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef2ff;
  color: #4338ca;
}
.btn.view .i {
  width: 16px;
  height: 16px;
}
.btn.view:hover {
  background: #e0e7ff;
}
</style>

