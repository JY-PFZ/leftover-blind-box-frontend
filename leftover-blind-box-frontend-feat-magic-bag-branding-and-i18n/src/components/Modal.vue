<template>
  <transition name="fade">
    <div v-if="open" class="overlay" @click="$emit('close')">
      <transition name="pop">
        <!-- .stop 防止点击面板内部触发 overlay 的关闭 -->
        <div class="panel" @click.stop>
          <!-- ❌ 已删除右上角的 X -->
          <slot />
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

// 绑定 ESC 键关闭
function onKey(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 9999;
}
.panel {
  width: min(980px, 96vw);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  position: relative;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active {
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s;
}
.pop-enter-from {
  transform: scale(0.96);
  opacity: 0;
}
.pop-leave-active {
  transition: transform 0.18s ease, opacity 0.18s;
}
.pop-leave-to {
  transform: scale(0.98);
  opacity: 0;
}
</style>
