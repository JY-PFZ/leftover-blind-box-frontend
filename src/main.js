import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// This line is crucial. It must run AFTER app.use(pinia).
// It ensures that when you refresh the page, your login session is restored.
const userStore = useUserStore();
userStore.initializeUser();

app.mount('#app')

