<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 侧边导航栏 -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800">Merchant Center</h2>
      </div>
      <nav class="mt-6">
        <ul>
          <li>
            <RouterLink 
              to="/merchant" 
              class="nav-link flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200"
              active-class="active-nav-link"
              exact
            >
              <!-- <span class="mr-3">📊</span> -->
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/merchant/orders" 
              class="nav-link flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200"
              active-class="active-nav-link"
            >
              <!-- <span class="mr-3">📋</span> -->
              <span>Manage Orders</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/merchant/products" 
              class="nav-link flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200"
              active-class="active-nav-link"
            >
              <!-- <span class="mr-3">📦</span> -->
              <span>Manage Products</span>
            </RouterLink>
          </li>
          <!-- 更多链接... -->
        </ul>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- 
        RouterView 将根据子路由显示内容。
        为了让 /merchant 页面显示仪表板内容，
        我们需要将仪表板内容保留在这里，
        或者设置一个 /merchant/dashboard 子路由。
        
        为了简单起见，我们假设 /merchant 是仪表板，
        而 /merchant/orders 等是其它页面。
        因此，我们需要 <router-view> 来显示子页面。
      -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- 
        如果希望 /merchant 路径本身显示仪表板，
        而 /merchant/orders 替换它，
        我们需要在 router.js 中配置子路由。
        
        当前设置：/merchant, /merchant/orders, /merchant/products 是同级路由。
        这意味着 MerchantDashboardView.vue 需要一个 <router-view> 
        或者 router.js 需要修改。
        
        让我们修改此文件，使其成为一个包含 <router-view> 的布局。
      -->
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
// 仪表板的特定逻辑（如图表）可以移至
//一个新的 MerchantDashboardIndexView.vue 文件，
//然后在 router.js 中将其设置为 /merchant 的组件。

// 为了简单起见，我们将保留这个文件作为布局，
// 并期望 /merchant/orders 或 /merchant/products 被渲染。
// 我们需要修改 router.js 来支持这一点。
</script>

<style scoped>
/* 手动添加的 CSS (如果 Tailwind 失效)
  和一些 Tailwind 无法轻易实现的过渡效果
*/
.h-screen { height: 100vh; }
.bg-gray-100 { background-color: #f3f4f6; }
.flex { display: flex; }
.w-64 { width: 16rem; }
.bg-white { background-color: #ffffff; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
.p-6 { padding: 1.5rem; }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.text-gray-800 { color: #1f2937; }
.mt-6 { margin-top: 1.5rem; }
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem; /* px-6 py-3 */
  color: #374151; /* text-gray-700 */
  text-decoration: none;
}
.nav-link:hover {
  background-color: #e5e7eb; /* hover:bg-gray-200 */
}
/* 匹配 active-class */
.active-nav-link {
  background-color: #e5e7eb; /* bg-gray-200 */
  font-weight: 600; /* font-semibold */
}
.flex-1 { flex: 1; }
.p-8 { padding: 2rem; }
.overflow-y-auto { overflow-y: auto; }

/* 页面切换过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

