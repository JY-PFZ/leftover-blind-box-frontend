<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-content">
        <h1 class="logo">🍭 Sugar Rush</h1>
        <div class="header-right">
          <span class="admin-badge">管理员</span>
          <span class="username">{{ username }}</span>
          <button class="btn-logout" @click="handleLogout">退出</button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="admin-main">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar">
          <nav class="sidebar-nav">
            <div class="nav-section">
              <h2 class="nav-title">管理后台</h2>
              <ul class="nav-list">
                <li class="nav-item active">
                  <span class="nav-icon">📋</span>
                  <span class="nav-text">任务管理</span>
                </li>
                <li class="nav-item">
                  <span class="nav-icon">👥</span>
                  <span class="nav-text">用户管理</span>
                </li>
                <li class="nav-item">
                  <span class="nav-icon">🏪</span>
                  <span class="nav-text">商家管理</span>
                </li>
                <li class="nav-item">
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">数据统计</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <!-- 内容区 -->
        <div class="admin-content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h2 class="page-title">任务管理</h2>
          <p class="page-subtitle">审核商家注册申请</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card stat-pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <p class="stat-label">待处理</p>
              <p class="stat-value">{{ stats.pending }}</p>
            </div>
          </div>
          <div class="stat-card stat-processing">
            <div class="stat-icon">🔄</div>
            <div class="stat-info">
              <p class="stat-label">处理中</p>
              <p class="stat-value">{{ stats.processing }}</p>
            </div>
          </div>
          <div class="stat-card stat-approved">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <p class="stat-label">已通过</p>
              <p class="stat-value">{{ stats.approved }}</p>
            </div>
          </div>
          <div class="stat-card stat-rejected">
            <div class="stat-icon">❌</div>
            <div class="stat-info">
              <p class="stat-label">已拒绝</p>
              <p class="stat-value">{{ stats.rejected }}</p>
            </div>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="tasks-container">
          <div class="tasks-header">
            <h3 class="tasks-title">任务列表</h3>
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
                    <span class="detail-label">申请人:</span>
                    <span class="detail-value">{{ task.applicant }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">商家名称:</span>
                    <span class="detail-value">{{ task.shopName }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">联系方式:</span>
                    <span class="detail-value">{{ task.phone }}</span>
                  </div>
                </div>

                <div class="task-actions">
                  <button 
                    v-if="task.status === 'pending'"
                    class="btn btn-primary"
                    @click="claimTask(task.id)"
                  >
                    📝 领取任务
                  </button>
                  <button 
                    v-if="task.status === 'processing'"
                    class="btn btn-success"
                    @click="approveTask(task.id)"
                  >
                    ✅ 批准
                  </button>
                  <button 
                    v-if="task.status === 'processing'"
                    class="btn btn-danger"
                    @click="showRejectModal(task)"
                  >
                    ❌ 拒绝
                  </button>
                  <button 
                    v-if="task.status === 'processing'"
                    class="btn btn-secondary"
                    @click="viewDetails(task)"
                  >
                    👁️ 查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-text">暂无任务</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 拒绝弹窗 -->
    <div v-if="showRejectDialog" class="modal-overlay" @click="showRejectDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">拒绝任务</h3>
          <button class="modal-close" @click="showRejectDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">拒绝原因</label>
            <textarea 
              v-model="rejectComment"
              class="form-textarea"
              placeholder="请输入拒绝原因..."
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRejectDialog = false">取消</button>
          <button class="btn btn-danger" @click="confirmReject">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/utils/api';
import { useUserStore } from '@/stores/user.js';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 状态管理
const currentFilter = ref('all');
const showRejectDialog = ref(false);
const rejectComment = ref('');
const currentTask = ref(null);

// 统计
const stats = ref({
  pending: 0,
  processing: 0,
  approved: 0,
  rejected: 0
});

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn);
const username = computed(() => userStore.username);

// 状态标签
const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' }
];

// 模拟任务数据
const tasks = ref([]);

// 过滤任务
const filteredTasks = computed(() => {
  if (currentFilter.value === 'all') {
    return tasks.value;
  }
  return tasks.value.filter(task => task.status === currentFilter.value);
});

// 退出登录
const handleLogout = async () => {
  await userStore.logout();
  router.push({ name: 'Home' });
};

// 获取任务列表
const fetchTasks = async () => {
  try {
    const response = await api.get('/api/admin/task');
    console.log('[Admin] Tasks response:', response.data);
    
    if (response.data?.code === 1 && response.data?.data) {
      const pageData = response.data.data;
      if (pageData.records) {
        tasks.value = pageData.records.map(task => ({
          id: task.id,
          title: task.title,
          type: task.type,
          typeLabel: '商家注册',
          status: getStatusKey(task.status),
          statusKey: getStatusKey(task.status),
          statusLabel: getStatusLabel(task.status),
          applicant: task.applicant,
          shopName: task.data ? JSON.parse(task.data).shopName : '未知商家',
          phone: task.data ? JSON.parse(task.data).phone : '未知',
          time: formatTime(task.startTime)
        }));
        
        // 更新统计
        updateStats();
      }
    }
  } catch (error) {
    console.error('[Admin] 获取任务失败:', error);
  }
};

// 获取状态键
const getStatusKey = (status) => {
  const statusMap = {
    1: 'pending',
    2: 'processing',
    3: 'approved',
    4: 'rejected'
  };
  return statusMap[status] || 'pending';
};

// 获取状态标签
const getStatusLabel = (status) => {
  const labelMap = {
    1: '待处理',
    2: '处理中',
    3: '已通过',
    4: '已拒绝'
  };
  return labelMap[status] || '待处理';
};

// 更新统计
const updateStats = () => {
  stats.value = {
    pending: tasks.value.filter(t => t.status === 'pending').length,
    processing: tasks.value.filter(t => t.status === 'processing').length,
    approved: tasks.value.filter(t => t.status === 'approved').length,
    rejected: tasks.value.filter(t => t.status === 'rejected').length
  };
};

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
};

// 领取任务
const claimTask = async (taskId) => {
  try {
    await api.post(`/api/admin/task/${taskId}/claim`);
    await fetchTasks();
    alert('任务领取成功！');
  } catch (error) {
    console.error('领取任务失败:', error);
    alert('领取任务失败：' + (error.response?.data?.message || error.message));
  }
};

// 批准任务
const approveTask = async (taskId) => {
  try {
    await api.post(`/api/admin/task/${taskId}/approve`);
    await fetchTasks();
    alert('任务已批准！');
  } catch (error) {
    console.error('批准任务失败:', error);
    alert('批准任务失败：' + (error.response?.data?.message || error.message));
  }
};

// 显示拒绝弹窗
const showRejectModal = (task) => {
  currentTask.value = task;
  rejectComment.value = '';
  showRejectDialog.value = true;
};

// 确认拒绝
const confirmReject = async () => {
  if (!rejectComment.value.trim()) {
    alert('请输入拒绝原因');
    return;
  }
  
  try {
    await api.post(`/api/admin/task/${currentTask.value.id}/reject`, null, {
      params: { comment: rejectComment.value }
    });
    showRejectDialog.value = false;
    await fetchTasks();
    alert('任务已拒绝！');
  } catch (error) {
    console.error('拒绝任务失败:', error);
    alert('拒绝任务失败：' + (error.response?.data?.message || error.message));
  }
};

// 查看详情
const viewDetails = (task) => {
  alert(`查看任务详情：${task.title}`);
};

// 初始化
onMounted(() => {
  // 直接加载任务列表（路由守卫已经确保用户已登录且是管理员）
  fetchTasks();
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
</style>

