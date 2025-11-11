<script setup>
const props = defineProps({
  sort: { type: String, default: "default" }, // default | priceAsc | priceDesc | distance
  onChange: { type: Function, default: () => {} },
  isDistanceLoading: { type: Boolean, default: false },
  userLocation: { type: Object, default: null }
})

const set = (v) => props.onChange?.(v)

function safeClick(mode) {
  try {
    console.log('[SortBar] Click:', mode, 'current sort prop =', props.sort)
    props.onChange?.(mode)
  } catch (err) {
    console.error('[SortBar] Click error for', mode, err)
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded-xl2 border border-ink-300/50 bg-white/80 p-3 backdrop-blur">
    <span class="mr-1 text-sm font-medium text-ink-700">Sort by</span>
    <button
      :aria-pressed="sort==='default'"
      @click="safeClick('default')"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="sort==='default' ? 'border-brand text-brand bg-brand-50' : 'border-ink-300 text-ink-700 hover:bg-ink-300/20'"
    >
      Default
    </button>
    <button
      :aria-pressed="sort==='priceAsc'"
      @click="safeClick('priceAsc')"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="sort==='priceAsc' ? 'border-brand text-brand bg-brand-50' : 'border-ink-300 text-ink-700 hover:bg-ink-300/20'"
    >
      Price Low → High
    </button>
    <button
      :aria-pressed="sort==='priceDesc'"
      @click="safeClick('priceDesc')"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="sort==='priceDesc' ? 'border-brand text-brand bg-brand-50' : 'border-ink-300 text-ink-700 hover:bg-ink-300/20'"
    >
      Price High → Low
    </button>
    <button
      :aria-pressed="sort==='distance'"
      @click="safeClick('distance')"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="sort==='distance' ? 'border-brand text-brand bg-brand-50' : 'border-ink-300/60 text-ink-500 hover:bg-ink-300/20'"
      :title="'Sort by distance (temporarily behaves as default)'"
    >
      {{ isDistanceLoading ? 'Locating...' : 'Distance (near)' }}
    </button>
  </div>
</template>

