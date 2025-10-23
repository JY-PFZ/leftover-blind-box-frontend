<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>管理员控制台</h1>
      <p>管理用户和商家账户</p>
    </div>

    <div class="admin-tabs">
      <button 
        @click="activeTab = 'users'" 
        :class="{ active: activeTab === 'users' }"
        class="tab-button"
      >
        用户管理 ({{ users.length }})
      </button>
      <button 
        @click="activeTab = 'merchants'" 
        :class="{ active: activeTab === 'merchants' }"
        class="tab-button"
      >
        商家管理 ({{ merchants.length }})
      </button>
    </div>

    <!-- 用户管理 -->
    <div v-if="activeTab === 'users'" class="management-section">
      <div class="section-header">
        <h2>用户管理</h2>
        <div class="search-box">
          <input 
            v-model="userSearchQuery" 
            type="text" 
            placeholder="搜索用户..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>注册时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="`role-badge role-${user.role?.toLowerCase()}`">
                  {{ user.role || 'CUSTOMER' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <span :class="`status-badge status-${user.isActive ? 'active' : 'inactive'}`">
                  {{ user.isActive ? '激活' : '未激活' }}
                </span>
              </td>
              <td>
                <button 
                  @click="deleteUser(user.id)" 
                  class="delete-btn"
                  :disabled="loading"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 商家管理 -->
    <div v-if="activeTab === 'merchants'" class="management-section">
      <div class="section-header">
        <h2>商家管理</h2>
        <div class="search-box">
          <input 
            v-model="merchantSearchQuery" 
            type="text" 
            placeholder="搜索商家..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>商家名称</th>
              <th>联系人</th>
              <th>邮箱</th>
              <th>电话</th>
              <th>地址</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="merchant in filteredMerchants" :key="merchant.id">
              <td>{{ merchant.id }}</td>
              <td>{{ merchant.name }}</td>
              <td>{{ merchant.contactPerson }}</td>
              <td>{{ merchant.email }}</td>
              <td>{{ merchant.phone }}</td>
              <td>{{ merchant.address }}</td>
              <td>
                <span :class="`status-badge status-${merchant.isActive ? 'active' : 'inactive'}`">
                  {{ merchant.isActive ? '营业中' : '已关闭' }}
                </span>
              </td>
              <td>
                <button 
                  @click="deleteMerchant(merchant.id)" 
                  class="delete-btn"
                  :disabled="loading"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>处理中...</p>
    </div>

    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h3>确认删除</h3>
        <p>{{ deleteConfirmMessage }}</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="confirm-btn">确认删除</button>
          <button @click="showDeleteConfirm = false" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

export default {
  name: 'AdminView',
  setup() {
    const adminStore = useAdminStore()
    
    // 响应式数据
    const activeTab = ref('users')
    const userSearchQuery = ref('')
    const merchantSearchQuery = ref('')
    const loading = ref(false)
    const showDeleteConfirm = ref(false)
    const deleteConfirmMessage = ref('')
    const deleteTarget = ref(null)
    const deleteType = ref('') // 'user' or 'merchant'

    // 计算属性
    const users = computed(() => adminStore.users)
    const merchants = computed(() => adminStore.merchants)

    const filteredUsers = computed(() => {
      if (!userSearchQuery.value) return users.value
      const query = userSearchQuery.value.toLowerCase()
      return users.value.filter(user => 
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id?.toString().includes(query)
      )
    })

    const filteredMerchants = computed(() => {
      if (!merchantSearchQuery.value) return merchants.value
      const query = merchantSearchQuery.value.toLowerCase()
      return merchants.value.filter(merchant => 
        merchant.name?.toLowerCase().includes(query) ||
        merchant.contactPerson?.toLowerCase().includes(query) ||
        merchant.email?.toLowerCase().includes(query) ||
        merchant.id?.toString().includes(query)
      )
    })

    // 方法
    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const deleteUser = (userId) => {
      deleteTarget.value = userId
      deleteType.value = 'user'
      const user = users.value.find(u => u.id === userId)
      deleteConfirmMessage.value = `确定要删除用户 "${user?.username || userId}" 吗？此操作不可撤销。`
      showDeleteConfirm.value = true
    }

    const deleteMerchant = (merchantId) => {
      deleteTarget.value = merchantId
      deleteType.value = 'merchant'
      const merchant = merchants.value.find(m => m.id === merchantId)
      deleteConfirmMessage.value = `确定要删除商家 "${merchant?.name || merchantId}" 吗？此操作不可撤销。`
      showDeleteConfirm.value = true
    }

    const confirmDelete = async () => {
      if (!deleteTarget.value || !deleteType.value) return

      loading.value = true
      try {
        if (deleteType.value === 'user') {
          await adminStore.deleteUser(deleteTarget.value)
        } else if (deleteType.value === 'merchant') {
          await adminStore.deleteMerchant(deleteTarget.value)
        }
        
        // 重新加载数据
        await loadData()
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败，请重试')
      } finally {
        loading.value = false
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          adminStore.fetchUsers(),
          adminStore.fetchMerchants()
        ])
      } catch (error) {
        console.error('加载数据失败:', error)
        alert('加载数据失败，请刷新页面重试')
      } finally {
        loading.value = false
      }
    }

    // 生命周期
    onMounted(() => {
      loadData()
    })

    return {
      activeTab,
      userSearchQuery,
      merchantSearchQuery,
      loading,
      showDeleteConfirm,
      deleteConfirmMessage,
      users,
      merchants,
      filteredUsers,
      filteredMerchants,
      formatDate,
      deleteUser,
      deleteMerchant,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.admin-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #ecf0f1;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-button:hover {
  color: #3498db;
}

.management-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-customer {
  background: #e3f2fd;
  color: #1976d2;
}

.role-merchant {
  background: #f3e5f5;
  color: #7b1fa2;
}

.role-admin {
  background: #ffebee;
  color: #c62828;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-inactive {
  background: #ffebee;
  color: #c62828;
}

.delete-btn {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

.delete-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-btn:hover {
  background: #c0392b;
}

.cancel-btn {
  padding: 10px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #7f8c8d;
}
</style>
