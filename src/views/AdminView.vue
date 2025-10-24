<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>🛠️ 管理员控制台</h1>
      <p>管理用户和商家账户</p>
    </div>

    <div class="admin-tabs">
      <button 
        @click="activeTab = 'users'" 
        :class="{ active: activeTab === 'users' }"
        class="tab-button"
      >
        👥 用户管理 ({{ users.length }})
      </button>
      <button 
        @click="activeTab = 'merchants'" 
        :class="{ active: activeTab === 'merchants' }"
        class="tab-button"
      >
        🏪 商家管理 ({{ merchants.length }})
      </button>
      <button 
        @click="activeTab = 'stats'" 
        :class="{ active: activeTab === 'stats' }"
        class="tab-button"
      >
        📊 数据统计
      </button>
    </div>

    <!-- 用户管理 -->
    <div v-if="activeTab === 'users'" class="management-section">
      <div class="section-header">
        <h2>👥 用户管理</h2>
        <div class="search-box">
          <input 
            v-model="userSearchQuery" 
            type="text" 
            placeholder="🔍 搜索用户..." 
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
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <span :class="`status-badge status-${user.isActive ? 'active' : 'inactive'}`">
                  {{ user.isActive ? '✅ 激活' : '❌ 未激活' }}
                </span>
              </td>
              <td>
                <button 
                  @click="toggleUserStatus(user)" 
                  :class="user.isActive ? 'deactivate-btn' : 'activate-btn'"
                >
                  {{ user.isActive ? '禁用' : '启用' }}
                </button>
                <button 
                  @click="deleteUser(user)" 
                  class="delete-btn"
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
        <h2>🏪 商家管理</h2>
        <div class="search-box">
          <input 
            v-model="merchantSearchQuery" 
            type="text" 
            placeholder="🔍 搜索商家..." 
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
                  {{ merchant.isActive ? '✅ 营业中' : '❌ 已关闭' }}
                </span>
              </td>
              <td>
                <button 
                  @click="toggleMerchantStatus(merchant)" 
                  :class="merchant.isActive ? 'deactivate-btn' : 'activate-btn'"
                >
                  {{ merchant.isActive ? '关闭' : '开启' }}
                </button>
                <button 
                  @click="deleteMerchant(merchant)" 
                  class="delete-btn"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 数据统计 -->
    <div v-if="activeTab === 'stats'" class="management-section">
      <div class="section-header">
        <h2>📊 数据统计</h2>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ users.length }}</h3>
            <p>总用户数</p>
            <small>活跃: {{ activeUsersCount }}</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏪</div>
          <div class="stat-content">
            <h3>{{ merchants.length }}</h3>
            <p>总商家数</p>
            <small>营业中: {{ activeMerchantsCount }}</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>{{ totalProducts }}</h3>
            <p>商品总数</p>
            <small>在售: {{ activeProductsCount }}</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>¥{{ totalRevenue.toLocaleString() }}</h3>
            <p>总收入</p>
            <small>本月: ¥{{ monthlyRevenue.toLocaleString() }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h3>⚠️ 确认删除</h3>
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
import { ref, computed } from 'vue'

export default {
  name: 'AdminView',
  setup() {
    // 响应式数据
    const activeTab = ref('users')
    const userSearchQuery = ref('')
    const merchantSearchQuery = ref('')
    const showDeleteConfirm = ref(false)
    const deleteConfirmMessage = ref('')
    const deleteTarget = ref(null)

    // Mock 数据
    const users = ref([
      {
        id: 1,
        username: '张三',
        email: 'zhangsan@example.com',
        role: 'CUSTOMER',
        createdAt: '2024-01-15',
        isActive: true
      },
      {
        id: 2,
        username: '李四',
        email: 'lisi@example.com',
        role: 'CUSTOMER',
        createdAt: '2024-01-20',
        isActive: true
      },
      {
        id: 3,
        username: '王五',
        email: 'wangwu@example.com',
        role: 'MERCHANT',
        createdAt: '2024-01-10',
        isActive: true
      },
      {
        id: 4,
        username: '赵六',
        email: 'zhaoliu@example.com',
        role: 'CUSTOMER',
        createdAt: '2024-02-01',
        isActive: false
      },
      {
        id: 5,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: '2024-01-01',
        isActive: true
      }
    ])

    const merchants = ref([
      {
        id: 1,
        name: '美味餐厅',
        contactPerson: '王五',
        email: 'wangwu@example.com',
        phone: '138-0000-0001',
        address: '北京市朝阳区xxx街道',
        isActive: true
      },
      {
        id: 2,
        name: '新鲜水果店',
        contactPerson: '陈七',
        email: 'chenqi@example.com',
        phone: '138-0000-0002',
        address: '上海市浦东新区xxx路',
        isActive: true
      },
      {
        id: 3,
        name: '烘焙工坊',
        contactPerson: '刘八',
        email: 'liuba@example.com',
        phone: '138-0000-0003',
        address: '广州市天河区xxx大道',
        isActive: false
      }
    ])

    // 计算属性
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

    const activeUsersCount = computed(() => 
      users.value.filter(user => user.isActive).length
    )

    const activeMerchantsCount = computed(() => 
      merchants.value.filter(merchant => merchant.isActive).length
    )

    const totalProducts = ref(156)
    const activeProductsCount = ref(142)
    const totalRevenue = ref(125680)
    const monthlyRevenue = ref(15680)

    // 方法
    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const getRoleText = (role) => {
      const roleMap = {
        'CUSTOMER': '👤 普通用户',
        'MERCHANT': '🏪 商家',
        'ADMIN': '👑 管理员'
      }
      return roleMap[role] || role
    }

    const toggleUserStatus = (user) => {
      user.isActive = !user.isActive
    }

    const toggleMerchantStatus = (merchant) => {
      merchant.isActive = !merchant.isActive
    }

    const deleteUser = (user) => {
      deleteTarget.value = user
      deleteConfirmMessage.value = `确定要删除用户 "${user.username}" 吗？此操作不可撤销。`
      showDeleteConfirm.value = true
    }

    const deleteMerchant = (merchant) => {
      deleteTarget.value = merchant
      deleteConfirmMessage.value = `确定要删除商家 "${merchant.name}" 吗？此操作不可撤销。`
      showDeleteConfirm.value = true
    }

    const confirmDelete = () => {
      if (deleteTarget.value) {
        if (users.value.includes(deleteTarget.value)) {
          const index = users.value.indexOf(deleteTarget.value)
          users.value.splice(index, 1)
        } else if (merchants.value.includes(deleteTarget.value)) {
          const index = merchants.value.indexOf(deleteTarget.value)
          merchants.value.splice(index, 1)
        }
        showDeleteConfirm.value = false
        deleteTarget.value = null
      }
    }

    return {
      activeTab,
      userSearchQuery,
      merchantSearchQuery,
      showDeleteConfirm,
      deleteConfirmMessage,
      users,
      merchants,
      filteredUsers,
      filteredMerchants,
      activeUsersCount,
      activeMerchantsCount,
      totalProducts,
      activeProductsCount,
      totalRevenue,
      monthlyRevenue,
      formatDate,
      getRoleText,
      toggleUserStatus,
      toggleMerchantStatus,
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
  background: #f8f9fa;
  min-height: 100vh;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.admin-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.admin-header p {
  color: #7f8c8d;
  font-size: 18px;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tab-button {
  padding: 15px 25px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #7f8c8d;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #3498db;
  background: #e3f2fd;
}

.tab-button:hover {
  color: #3498db;
  background: #f0f8ff;
}

.management-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5em;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  width: 250px;
  background: rgba(255,255,255,0.9);
}

.search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
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
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
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
  padding: 6px 12px;
  border-radius: 20px;
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

.activate-btn {
  padding: 8px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
  transition: background 0.3s ease;
}

.activate-btn:hover {
  background: #229954;
}

.deactivate-btn {
  padding: 8px 16px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
  transition: background 0.3s ease;
}

.deactivate-btn:hover {
  background: #e67e22;
}

.delete-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
}

.delete-btn:hover {
  background: #c0392b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 25px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 3em;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 2.5em;
  font-weight: bold;
}

.stat-content p {
  margin: 0 0 5px 0;
  font-size: 16px;
  opacity: 0.9;
}

.stat-content small {
  font-size: 14px;
  opacity: 0.7;
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
  border-radius: 12px;
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
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.confirm-btn:hover {
  background: #c0392b;
}

.cancel-btn {
  padding: 12px 24px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.cancel-btn:hover {
  background: #7f8c8d;
}
</style>







