import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([]) 
  // item 结构：{ id, title, price, qty, merchantId }

  const count = computed(() => items.value.reduce((s, it) => s + it.qty, 0))
  const total = computed(() => items.value.reduce((s, it) => s + it.qty * it.price, 0))

  function add(product, qty = 1) {
    console.log('Cart.add called with:', { product, qty })
    const idx = items.value.findIndex(i => i.id === product.id)
    if (idx >= 0) {
      items.value[idx].qty += qty
      console.log('Updated existing item:', items.value[idx])
    } else {
      const newItem = { id: product.id, title: product.title, price: product.price, qty, merchantId: product.merchant?.id }
      items.value.push(newItem)
      console.log('Added new item:', newItem)
    }
    console.log('Cart items after add:', items.value)
  }
  function remove(id) { items.value = items.value.filter(i => i.id !== id) }
  function clear() { items.value = [] }

  return { items, count, total, add, remove, clear }
})
