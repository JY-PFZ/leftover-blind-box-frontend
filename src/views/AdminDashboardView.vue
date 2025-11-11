<template>
  <div class="admin-dashboard">
    <!-- Top Bar -->
    <header class="admin-header">
      <div class="header-content">
        <h1 class="logo">🛍️ Magic Bag</h1>
        <div class="header-right">
          <span class="admin-badge">Admin</span>
          <span class="username">{{ username }}</span>
          <button class="btn-logout" @click="handleLogout">Logout</button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="admin-main">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
          <nav class="sidebar-nav">
            <div class="nav-section">
              <h2 class="nav-title">Admin Console</h2>
              <ul class="nav-list">
                <li 
                  class="nav-item" 
                  :class="{ active: activeTab === 'tasks' }"
                  @click="activeTab = 'tasks'"
                >
                  <span class="nav-icon">📋</span>
                  <span class="nav-text">Tasks</span>
                </li>
                <li 
                  class="nav-item"
                  :class="{ active: activeTab === 'merchants' }"
                  @click="activeTab = 'merchants'"
                >
                  <span class="nav-icon">🏪</span>
                  <span class="nav-text">Merchants</span>
                </li>
                <li 
                  class="nav-item"
                  :class="{ active: activeTab === 'stats' }"
                  @click="activeTab = 'stats'"
                >
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">Analytics</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <!-- Content -->
        <div class="admin-content">
          <!-- Tasks -->
          <div v-if="activeTab === 'tasks'">
        <!-- Page header -->
        <div class="page-header">
          <h2 class="page-title">Task Management</h2>
          <p class="page-subtitle">Review merchant registration requests</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card stat-pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <p class="stat-label">Pending</p>
              <p class="stat-value">{{ stats.pending }}</p>
            </div>
          </div>
          <div class="stat-card stat-processing">
            <div class="stat-icon">🔄</div>
            <div class="stat-info">
              <p class="stat-label">In Progress</p>
              <p class="stat-value">{{ stats.processing }}</p>
            </div>
          </div>
          <div class="stat-card stat-approved">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <p class="stat-label">Approved</p>
              <p class="stat-value">{{ stats.approved }}</p>
            </div>
          </div>
          <div class="stat-card stat-rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-info">
              <p class="stat-label">Rejected</p>
              <p class="stat-value">{{ stats.rejected }}</p>
            </div>
          </div>
        </div>

        <!-- Task list -->
        <div class="tasks-container">
          <div class="tasks-header">
            <h3 class="tasks-title">Tasks</h3>
            <div class="filter-tabs">
              <button 
                v-for="status in statusTabs" 
                :key="status.key"
                :class="['filter-tab', { active: currentFilter === status.key }]"
                @click="currentFilter = status.key"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <div class="tasks-list">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id"
              class="task-card"
            >
              <div class="task-header">
                <div class="task-info">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <div class="task-meta">
                    <span class="task-type">{{ task.typeLabel }}</span>
                    <span class="task-time">{{ task.time }}</span>
                  </div>
                </div>
                <span class="task-status" :class="'status-' + task.statusKey">
                  {{ task.statusLabel }}
                </span>
              </div>

              <div class="task-content">
                <div class="task-detail">
                  <div class="detail-item">
                    <span class="detail-label">Applicant:</span>
                    <span class="detail-value">{{ task.applicant }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Merchant Name:</span>
                    <span class="detail-value">{{ task.shopName }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">{{ task.phone }}</span>
                  </div>
                </div>

                <div class="task-actions">
                  <button 
                    v-if="task.status === 'pending'"
                    class="btn btn-primary"
                    @click="claimTask(task.id)"
                  >
                    📝 Claim Task
                  </button>
                  <button 
                    v-if="task.status === 'processing'"
                    class="btn btn-success"
                    @click="approveTask(task.id)"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    v-if="task.status === 'processing'"
                    class="btn btn-danger"
                    @click="showRejectModal(task)"
                  >
                    ❌ Reject
                  </button>
                  <button 
                    v-if="task.status === 'processing'"
                    class="btn btn-secondary"
                    @click="viewDetails(task)"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
                </div>
              </div>

            <!-- Error -->
            <div v-if="taskError" class="error-alert">
              <div class="error-icon">⚠️</div>
              <div class="error-content">
                <h4 class="error-title">Failed to load tasks</h4>
                <p class="error-message">{{ taskError }}</p>
                <button class="btn btn-primary" @click="fetchTasks">Retry</button>
            </div>
          </div>

          <!-- Empty -->
            <div v-if="filteredTasks.length === 0 && !taskError" class="empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-text">No tasks</p>
          </div>
            </div>
          </div>

          <!-- Merchants -->
          <div v-if="activeTab === 'merchants'" class="tab-content">
            <div class="page-header">
              <h2 class="page-title">Merchant Management</h2>
              <p class="page-subtitle">Manage merchants</p>
            </div>
            <div class="merchants-container">
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Merchant Name</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="merchant in merchants" :key="merchant.id">
                      <td>{{ merchant.id }}</td>
                      <td>{{ merchant.name || merchant.shopName || 'Unknown Merchant' }}</td>
                      <td>{{ merchant.phone || 'Unknown' }}</td>
                      <td>{{ merchant.address || 'Unknown' }}</td>
                      <td>{{ merchant.score || merchant.rating || 0 }}</td>
                      <td><span :class="['status-badge', (merchant.status === 'approved' || merchant.status === 'APPROVED') ? 'active' : 'inactive']">{{ (merchant.status === 'approved' || merchant.status === 'APPROVED') ? 'Approved' : 'Pending Review' }}</span></td>
                      <td>
                        <button 
                          class="btn btn-sm btn-primary"
                          @click="viewMerchantDetail(merchant)"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="merchants.length === 0" class="empty-state">
                  <div class="empty-icon">🏪</div>
                  <p class="empty-text">No merchant data</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics -->
          <div v-if="activeTab === 'stats'" class="tab-content">
            <div class="page-header">
              <h2 class="page-title">Analytics</h2>
              <p class="page-subtitle">Overview</p>
            </div>
            <div class="stats-overview">
              <div class="overview-grid">
                <div class="overview-card">
                  <div class="overview-icon">🏪</div>
                  <div class="overview-info">
                    <p class="overview-label">Total Merchants</p>
                    <p class="overview-value">{{ statsData.totalMerchants || 0 }}</p>
                  </div>
                </div>
                <div class="overview-card">
                  <div class="overview-icon">📦</div>
                  <div class="overview-info">
                    <p class="overview-label">Total Orders</p>
                    <p class="overview-value">{{ statsData.totalOrders || 0 }}</p>
                  </div>
                </div>
                <div class="overview-card">
                  <div class="overview-icon">💰</div>
                  <div class="overview-info">
                    <p class="overview-label">Total Revenue</p>
                    <p class="overview-value">¥{{ (statsData.totalRevenue || 0).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </main>

    <!-- Reject Modal -->
    <div v-if="showRejectDialog" class="modal-overlay" @click="showRejectDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Reject Task</h3>
          <button class="modal-close" @click="showRejectDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Rejection Reason</label>
            <textarea 
              v-model="rejectComment"
              class="form-textarea"
              placeholder="Please enter a reason..."
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRejectDialog = false">Cancel</button>
          <button class="btn btn-danger" @click="confirmReject">Confirm Reject</button>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <div v-if="showTaskDetailDialog && currentTask" class="modal-overlay" @click="showTaskDetailDialog = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Task Details</h3>
          <button class="modal-close" @click="showTaskDetailDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Basic Info</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Title:</span>
                <span class="detail-value">{{ currentTask.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ currentTask.typeLabel }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value status-badge" :class="'status-' + currentTask.statusKey">{{ currentTask.statusLabel }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Applicant ID:</span>
                <span class="detail-value">{{ currentTask.applicant }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Merchant Name:</span>
                <span class="detail-value">{{ currentTask.shopName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">{{ currentTask.phone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Applied At:</span>
                <span class="detail-value">{{ currentTask.time }}</span>
              </div>
              <div class="detail-item" v-if="currentTask.address">
                <span class="detail-label">Address:</span>
                <span class="detail-value">{{ currentTask.address }}</span>
              </div>
              <div class="detail-item" v-if="currentTask.businessLicense">
                <span class="detail-label">Business License:</span>
                <span class="detail-value">
                  <a :href="currentTask.businessLicense" target="_blank" v-if="currentTask.businessLicense.startsWith('http')">View Image</a>
                  <span v-else>{{ currentTask.businessLicense }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showTaskDetailDialog = false">Close</button>
          <button 
            v-if="currentTask.status === 'pending'"
            class="btn btn-primary"
            @click="claimTask(currentTask.id)"
          >
            Claim Task
          </button>
          <button 
            v-if="currentTask.status === 'processing'"
            class="btn btn-success"
            @click="approveTask(currentTask.id)"
          >
            Approve
          </button>
          <button 
            v-if="currentTask.status === 'processing'"
            class="btn btn-danger"
            @click="showRejectModal(currentTask)"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { api } from '@/utils/api';
import { useUserStore } from '@/stores/user.js';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// State
const currentFilter = ref('all');
const showRejectDialog = ref(false);
const showTaskDetailDialog = ref(false);
const rejectComment = ref('');
const currentTask = ref(null);
const activeTab = ref('tasks'); // 'tasks', 'merchants', 'stats'

// Stats
const stats = ref({
  pending: 0,
  processing: 0,
  approved: 0,
  rejected: 0
});

// Computed
const isLoggedIn = computed(() => userStore.isLoggedIn);
const username = computed(() => userStore.username);

// Status tabs
const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'In Progress' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' }
];

// Data
const tasks = ref([]);
const merchants = ref([]);
const statsData = ref({
  totalMerchants: 0,
  totalOrders: 0,
  totalRevenue: 0
});

// Error state
const taskError = ref(null);

// Filter
const filteredTasks = computed(() => {
  if (currentFilter.value === 'all') {
    return tasks.value;
  }
  return tasks.value.filter(task => task.status === currentFilter.value);
});

// Logout
const handleLogout = async () => {
  await userStore.logout();
  router.push({ name: 'Home' });
};

// Fetch tasks
const fetchTasks = async () => {
  try {
    // reset error state
    taskError.value = null;
    
    console.log('[Admin] Start fetching tasks...');
    // pass params via query string
    const response = await api.get('/api/admin/task?pageNum=1&pageSize=100');
    console.log('[Admin] Tasks response:', response);
    console.log('[Admin] Tasks response.data:', response.data);
    console.log('[Admin] Tasks response.data.data:', response.data?.data);
    
    // handle multiple response formats
    if (response.data?.code === 1 || response.data?.code === 20000) {
      const pageData = response.data.data;
      
      // data null/undefined
      if (pageData === null || pageData === undefined) {
        console.warn('[Admin] data is null/undefined');
        tasks.value = [];
        updateStats();
        return;
      }
      
      // paged data: use records
      if (pageData.records && Array.isArray(pageData.records)) {
        console.log('[Admin] paged records:', pageData.records.length);
        tasks.value = pageData.records.map(task => {
          // parse task data
          let taskData = {};
          try {
            if (task.data) {
              taskData = typeof task.data === 'string' ? JSON.parse(task.data) : task.data;
            }
          } catch (e) {
            console.warn('[Admin] failed to parse task.data:', e);
          }
          
          return {
          id: task.id,
          title: task.title,
          type: task.type,
          typeLabel: 'Merchant Registration',
          status: getStatusKey(task.status),
          statusKey: getStatusKey(task.status),
          statusLabel: getStatusLabel(task.status),
          applicant: task.applicant,
            shopName: taskData.shopName || taskData.name || 'Unknown Merchant',
            phone: taskData.phone || 'Unknown',
            address: taskData.address || 'Unknown',
            businessLicense: taskData.businessLicense || '',
            latitude: taskData.latitude || null,
            longitude: taskData.longitude || null,
            time: formatTime(task.startTime),
            rawData: task
          };
        });
        
        // update stats
        updateStats();
      } else if (Array.isArray(pageData)) {
        // array response
        console.log('[Admin] array data, length:', pageData.length);
        tasks.value = pageData.map(task => {
          let taskData = {};
          try {
            if (task.data) {
              taskData = typeof task.data === 'string' ? JSON.parse(task.data) : task.data;
            }
          } catch (e) {
            console.warn('[Admin] failed to parse task.data:', e);
          }
          
          return {
            id: task.id,
            title: task.title,
            type: task.type,
            typeLabel: 'Merchant Registration',
            status: getStatusKey(task.status),
            statusKey: getStatusKey(task.status),
            statusLabel: getStatusLabel(task.status),
            applicant: task.applicant,
            shopName: taskData.shopName || taskData.name || 'Unknown Merchant',
            phone: taskData.phone || 'Unknown',
            address: taskData.address || 'Unknown',
            businessLicense: taskData.businessLicense || '',
            latitude: taskData.latitude || null,
            longitude: taskData.longitude || null,
            time: formatTime(task.startTime),
            rawData: task
          };
        });
        updateStats();
      } else {
        console.warn('[Admin] unexpected data format:', pageData);
        tasks.value = [];
        updateStats();
      }
    } else {
      console.warn('[Admin] response code not ok:', response.data?.code);
      tasks.value = [];
      updateStats();
    }
  } catch (error) {
    console.error('[Admin] fetch tasks failed:', error);
    console.error('[Admin] error detail:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    });
    // show full response
    if (error.response?.data) {
      console.error('[Admin] backend error response:', JSON.stringify(error.response.data, null, 2));
    }
    
    // detect possible DB error (missing column)
    const errorMessage = error.response?.data?.message || error.message;
    if (errorMessage && errorMessage.includes('Unknown column \'comment\'')) {
      taskError.value = 'Database schema error: admin_task.comment column missing. Please contact backend to fix DB.';
    } else if (error.response?.status === 400) {
      taskError.value = `Failed to fetch tasks: ${errorMessage || 'Unknown error'}`;
    } else {
      taskError.value = `Failed to fetch tasks: ${errorMessage || 'Network error, please try again later'}`;
    }
    
    tasks.value = [];
    updateStats();
  }
};

// Status key
const getStatusKey = (status) => {
  const statusMap = {
    1: 'pending',
    2: 'processing',
    3: 'approved',
    4: 'rejected'
  };
  return statusMap[status] || 'pending';
};

// Status label
const getStatusLabel = (status) => {
  const labelMap = {
    1: 'Pending',
    2: 'In Progress',
    3: 'Approved',
    4: 'Rejected'
  };
  return labelMap[status] || 'Pending';
};

// Update stats
const updateStats = () => {
  stats.value = {
    pending: tasks.value.filter(t => t.status === 'pending').length,
    processing: tasks.value.filter(t => t.status === 'processing').length,
    approved: tasks.value.filter(t => t.status === 'approved').length,
    rejected: tasks.value.filter(t => t.status === 'rejected').length
  };
};

// Format time
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-US');
};

// Claim task
const claimTask = async (taskId) => {
  try {
    await api.post(`/api/admin/task/${taskId}/claim`);
    await fetchTasks();
    alert('Task claimed!');
    // close modal if from details
    if (showTaskDetailDialog.value) {
      showTaskDetailDialog.value = false;
    }
  } catch (error) {
    console.error('Claim task failed:', error);
    alert('Failed to claim: ' + (error.response?.data?.message || error.message));
  }
};

// Approve task
const approveTask = async (taskId) => {
  if (!confirm('Are you sure you want to approve this merchant registration?')) return;
  
  try {
    // Approve (backend updates merchant status and user role)
    await api.post(`/api/admin/task/${taskId}/approve`);
    console.log('[Admin] ✅ Approved, backend will update merchant status and user role');
    
    // refresh
    await fetchTasks();
    alert('Task approved! Merchant can now login.');
    
    // close modal
    if (showTaskDetailDialog.value) {
      showTaskDetailDialog.value = false;
    }
  } catch (error) {
    console.error('Approve task failed:', error);
    alert('Failed to approve: ' + (error.response?.data?.message || error.message));
  }
};

// Show reject
const showRejectModal = (task) => {
  currentTask.value = task;
  rejectComment.value = '';
  showRejectDialog.value = true;
};

// Confirm reject
const confirmReject = async () => {
  if (!rejectComment.value.trim()) {
    alert('Please enter a rejection reason');
    return;
  }
  
  if (!confirm('Are you sure you want to reject this merchant registration?')) return;
  
  try {
    // use query param
    await api.post(`/api/admin/task/${currentTask.value.id}/reject?comment=${encodeURIComponent(rejectComment.value)}`);
    showRejectDialog.value = false;
    await fetchTasks();
    alert('Task rejected!');
  } catch (error) {
    console.error('Reject task failed:', error);
    alert('Failed to reject: ' + (error.response?.data?.message || error.message));
  }
};

// View details
const viewDetails = (task) => {
  // show modal
  currentTask.value = task;
  showTaskDetailDialog.value = true;
};

// Format datetime
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US');
};

// Fetch merchant list - DB
const fetchMerchants = async () => {
  try {
    console.log('[Admin] Fetching merchants (DB)...');
    
    // correct path is /api/merchant
    const path = '/api/merchant';
    console.log(`[Admin] request URL: ${path}`);
    const response = await api.get(path);
    console.log(`[Admin] ${path} response:`, response.data);
    
    // support code === 1 or 20000
    if (response.data?.code === 1 || response.data?.code === 20000) {
      const merchantsData = response.data.data;
      
      // null/undefined => empty DB
      if (merchantsData === null || merchantsData === undefined) {
        console.warn('[Admin] merchant data is null/undefined (DB may be empty)');
        merchants.value = [];
        return;
      }
      
      // List<MerchantDto> from DB
      if (Array.isArray(merchantsData)) {
        console.log('[Admin] ✅ merchants from DB, count:', merchantsData.length);
        merchants.value = merchantsData.map(merchant => ({
          id: merchant.id,
          name: merchant.name,
          shopName: merchant.name,
          phone: merchant.phone,
          address: merchant.address,
          score: merchant.score || 0,
          status: merchant.status,
          businessLicense: merchant.businessLicense,
          latitude: merchant.latitude,
          longitude: merchant.longitude
        }));
      } else {
        console.warn('[Admin] merchants data not array:', merchantsData);
        merchants.value = [];
      }
    } else {
      console.warn('[Admin] merchant list error:', response.data);
      merchants.value = [];
    }
  } catch (error) {
    console.error('[Admin] ❌ fetch merchants failed:', error);
    console.error('[Admin] error detail:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // show empty
    console.warn('[Admin] ⚠️ merchant API failed, cannot read from DB');
    merchants.value = [];
  }
};

// Fetch analytics
const fetchStats = async () => {
  try {
    // fetch order stats
    const ordersResponse = await api.get('/api/order/stats');
    console.log('[Admin] order stats response:', ordersResponse.data);
    if (ordersResponse.data?.code === 1 || ordersResponse.data?.code === 20000) {
      const orderStats = ordersResponse.data.data;
      statsData.value.totalOrders = orderStats?.totalOrders || 0;
      statsData.value.totalRevenue = orderStats?.totalAmount || 0;
    }
    
    // fetch merchant count
    await fetchMerchants();
    statsData.value.totalMerchants = merchants.value.length;
    console.log('[Admin] ✅ analytics (DB):', statsData.value);
  } catch (error) {
    console.error('[Admin] fetch analytics failed:', error);
    console.error('[Admin] order stats error detail:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    // try other parts
    try {
      await fetchMerchants();
      statsData.value.totalMerchants = merchants.value.length;
    } catch (e) {
      console.error('[Admin] fetch merchant count failed:', e);
      statsData.value.totalMerchants = 0;
    }
    
    // defaults
    if (!statsData.value.totalOrders && !statsData.value.totalRevenue) {
      statsData.value.totalOrders = 0;
      statsData.value.totalRevenue = 0;
    }
  }
};

// View merchant detail
const viewMerchantDetail = (merchant) => {
  const name = merchant.name || merchant.shopName || 'Unknown Merchant';
  const phone = merchant.phone || 'Unknown';
  const address = merchant.address || 'Unknown';
  const score = merchant.score || 0;
  const status = merchant.status || 'Unknown';
  alert(`Merchant Detail:\nID: ${merchant.id}\nName: ${name}\nContact: ${phone}\nAddress: ${address}\nRating: ${score}\nStatus: ${status}`);
};

// Timer
let refreshTimer = null;

// Refresh by tab
const refreshCurrentTab = () => {
  if (activeTab.value === 'tasks') {
    fetchTasks();
  } else if (activeTab.value === 'merchants') {
    fetchMerchants();
  } else if (activeTab.value === 'stats') {
    fetchStats();
  }
};

// Watch tab
watch(activeTab, (newTab) => {
  // refresh immediately
  if (newTab === 'merchants') {
    fetchMerchants();
  } else if (newTab === 'stats') {
    fetchStats();
  } else if (newTab === 'tasks') {
    fetchTasks();
  }
});

// Init
onMounted(() => {
  // load tasks (guard ensures logged in and admin)
  fetchTasks();
  
  // set interval to refresh every 30s
  refreshTimer = setInterval(() => {
    console.log('[Admin] refresh interval...');
    refreshCurrentTab();
  }, 30000); // 30秒 = 30000毫秒
});

// Cleanup
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('[Admin] timer cleared');
  }
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部导航栏 */
.admin-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #dc2626;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.username {
  color: #6b7280;
  font-size: 0.875rem;
}

.btn-logout {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  background: #ef4444;
  color: white;
}

.btn-logout:hover {
  background: #dc2626;
}

/* 主布局 */
.admin-main {
  display: flex;
  height: calc(100vh - 73px);
}

/* 侧边栏 */
.admin-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem 0;
}

.nav-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  padding: 0 1.5rem;
  margin-bottom: 1rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.nav-item:hover {
  background: #f9fafb;
  color: #1f2937;
}

.nav-item.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* 内容区 */
.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.stat-pending { border-left: 4px solid #f59e0b; }
.stat-processing { border-left: 4px solid #3b82f6; }
.stat-approved { border-left: 4px solid #10b981; }
.stat-rejected { border-left: 4px solid #ef4444; }

/* 任务列表 */
.tasks-container {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.tasks-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #6b7280;
}

.filter-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.task-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.task-type {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.task-status {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.task-detail {
  flex: 1;
}

.detail-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  width: 80px;
}

.detail-value {
  color: #1f2937;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1.125rem;
}

/* 错误提示 */
.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 2rem 0;
  display: flex;
  gap: 1rem;
}

.error-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-title {
  color: #991b1b;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #7f1d1d;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.error-content .btn {
  margin-top: 0.5rem;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* 按钮样式 */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  margin: 0 0.25rem;
}

/* 角色徽章 */
.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-admin {
  background: #fef3c7;
  color: #d97706;
}

.role-merchant {
  background: #dbeafe;
  color: #1e40af;
}

.role-user, .role-customer {
  background: #d1fae5;
  color: #065f46;
}

/* 状态徽章 */
.status-badge.active {
  background: #d1fae5;
  color: #065f46;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* 统计概览 */
.stats-overview {
  margin-top: 2rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.overview-card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.overview-icon {
  font-size: 3rem;
}

.overview-info {
  flex: 1;
}

.overview-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.overview-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

/* 任务详情弹窗 */
.modal-large {
  max-width: 700px;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-value {
  color: #1f2937;
  font-size: 0.875rem;
}

/* Tab内容 */
.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

