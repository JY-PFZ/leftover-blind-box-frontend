<template>
  <Modal :open="open" @close="$emit('close')">
    <div>
      <div class="mb-4">
        <h2 class="text-xl font-semibold">{{ merchant?.name || 'Merchant' }}</h2>
        <p class="text-gray-600">{{ merchant?.bio || 'No profile yet.' }}</p>
      </div>

      <h3 class="font-semibold mb-2">Other Products</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="p in products" :key="p.id" class="bg-white rounded-xl border p-3">
          <div class="h-28 rounded-lg bg-gradient-to-br from-blue-300 to-pink-300 mb-2"></div>
          <div class="font-medium">{{ p.title }}</div>
          <div class="text-red-600 font-semibold mb-2">\${{ p.price.toFixed(2) }}</div>
          <div class="flex gap-2">
            <button class="px-3 py-1 rounded border" @click="$emit('open-product', p)">View</button>
            <button class="px-3 py-1 rounded bg-emerald-600 text-white" @click="add(p)">Add</button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'
import { useCartStore } from '@/stores/cart'

defineProps({
  open: Boolean,
  merchant: Object,
  products: { type: Array, default: () => [] }
})
const emit = defineEmits(['close','open-product'])
const cart = useCartStore()
const add = (p) => cart.add(p, 1)
</script>
