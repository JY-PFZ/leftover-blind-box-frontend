<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-content">
        <h1 class="logo">🛍️ Magic Bag</h1>
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
                <li 
                  class="nav-item" 
                  :class="{ active: activeTab === 'tasks' }"
                  @click="activeTab = 'tasks'"
                >
                  <span class="nav-icon">📋</span>
                  <span class="nav-text">任务管理</span>
                </li>
                <li 
                  class="nav-item"
                  :class="{ active: activeTab === 'merchants' }"
                  @click="activeTab = 'merchants'"
                >
                  <span class="nav-icon">🏪</span>
                  <span class="nav-text">商家管理</span>
                </li>
                <li 
                  class="nav-item"
                  :class="{ active: activeTab === 'stats' }"
                  @click="activeTab = 'stats'"
                >
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">数据统计</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <!-- 内容区 -->
        <div class="admin-content">
          <!-- 任务管理 -->
          <div v-if="activeTab === 'tasks'">
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

            <!-- 错误提示 -->
            <div v-if="taskError" class="error-alert">
              <div class="error-icon">⚠️</div>
              <div class="error-content">
                <h4 class="error-title">无法加载任务列表</h4>
                <p class="error-message">{{ taskError }}</p>
                <button class="btn btn-primary" @click="fetchTasks">重试</button>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredTasks.length === 0 && !taskError" class="empty-state">
              <div class="empty-icon">📭</div>
              <p class="empty-text">暂无任务</p>
            </div>
            </div>
          </div>

          <!-- 商家管理 -->
          <div v-if="activeTab === 'merchants'" class="tab-content">
            <div class="page-header">
              <h2 class="page-title">商家管理</h2>
              <p class="page-subtitle">管理系统商家</p>
            </div>
            <div class="merchants-container">
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>商家名称</th>
                      <th>联系方式</th>
                      <th>地址</th>
                      <th>评分</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="merchant in merchants" :key="merchant.id">
                      <td>{{ merchant.id }}</td>
                      <td>{{ merchant.name || merchant.shopName || '未知商家' }}</td>
                      <td>{{ merchant.phone || '未知' }}</td>
                      <td>{{ merchant.address || '未知' }}</td>
                      <td>{{ merchant.score || merchant.rating || 0 }}</td>
                      <td><span :class="['status-badge', (merchant.status === 'approved' || merchant.status === 'APPROVED') ? 'active' : 'inactive']">{{ (merchant.status === 'approved' || merchant.status === 'APPROVED') ? '已批准' : '待审核' }}</span></td>
                      <td>
                        <button 
                          class="btn btn-sm btn-primary"
                          @click="viewMerchantDetail(merchant)"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="merchants.length === 0" class="empty-state">
                  <div class="empty-icon">🏪</div>
                  <p class="empty-text">暂无商家数据</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 数据统计 -->
          <div v-if="activeTab === 'stats'" class="tab-content">
            <div class="page-header">
              <h2 class="page-title">数据统计</h2>
              <p class="page-subtitle">系统整体数据概览</p>
            </div>
            <div class="stats-overview">
              <div class="overview-grid">
                <div class="overview-card">
                  <div class="overview-icon">🏪</div>
                  <div class="overview-info">
                    <p class="overview-label">总商家数</p>
                    <p class="overview-value">{{ statsData.totalMerchants || 0 }}</p>
                  </div>
                </div>
                <div class="overview-card">
                  <div class="overview-icon">📦</div>
                  <div class="overview-info">
                    <p class="overview-label">总订单数</p>
                    <p class="overview-value">{{ statsData.totalOrders || 0 }}</p>
                  </div>
                </div>
                <div class="overview-card">
                  <div class="overview-icon">💰</div>
                  <div class="overview-info">
                    <p class="overview-label">总交易额</p>
                    <p class="overview-value">¥{{ (statsData.totalRevenue || 0).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
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

    <!-- 任务详情弹窗 -->
    <div v-if="showTaskDetailDialog && currentTask" class="modal-overlay" @click="showTaskDetailDialog = false">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">任务详情</h3>
          <button class="modal-close" @click="showTaskDetailDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">任务标题:</span>
                <span class="detail-value">{{ currentTask.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">任务类型:</span>
                <span class="detail-value">{{ currentTask.typeLabel }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">任务状态:</span>
                <span class="detail-value status-badge" :class="'status-' + currentTask.statusKey">{{ currentTask.statusLabel }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">申请人ID:</span>
                <span class="detail-value">{{ currentTask.applicant }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">商家名称:</span>
                <span class="detail-value">{{ currentTask.shopName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">联系方式:</span>
                <span class="detail-value">{{ currentTask.phone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">申请时间:</span>
                <span class="detail-value">{{ currentTask.time }}</span>
              </div>
              <div class="detail-item" v-if="currentTask.address">
                <span class="detail-label">商家地址:</span>
                <span class="detail-value">{{ currentTask.address }}</span>
              </div>
              <div class="detail-item" v-if="currentTask.businessLicense">
                <span class="detail-label">营业执照:</span>
                <span class="detail-value">
                  <a :href="currentTask.businessLicense" target="_blank" v-if="currentTask.businessLicense.startsWith('http')">查看图片</a>
                  <span v-else>{{ currentTask.businessLicense }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showTaskDetailDialog = false">关闭</button>
          <button 
            v-if="currentTask.status === 'pending'"
            class="btn btn-primary"
            @click="claimTask(currentTask.id)"
          >
            领取任务
          </button>
          <button 
            v-if="currentTask.status === 'processing'"
            class="btn btn-success"
            @click="approveTask(currentTask.id)"
          >
            批准
          </button>
          <button 
            v-if="currentTask.status === 'processing'"
            class="btn btn-danger"
            @click="showRejectModal(currentTask)"
          >
            拒绝
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

// 状态管理
const currentFilter = ref('all');
const showRejectDialog = ref(false);
const showTaskDetailDialog = ref(false);
const rejectComment = ref('');
const currentTask = ref(null);
const activeTab = ref('tasks'); // 'tasks', 'merchants', 'stats'

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

// 任务数据
const tasks = ref([]);
const merchants = ref([]);
const statsData = ref({
  totalMerchants: 0,
  totalOrders: 0,
  totalRevenue: 0
});

// 错误状态
const taskError = ref(null);

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
    // 清除之前的错误状态
    taskError.value = null;
    
    console.log('[Admin] 开始获取任务列表...');
    // 使用查询字符串方式传递参数
    const response = await api.get('/api/admin/task?pageNum=1&pageSize=100');
    console.log('[Admin] Tasks response:', response);
    console.log('[Admin] Tasks response.data:', response.data);
    console.log('[Admin] Tasks response.data.data:', response.data?.data);
    
    // 检查多种响应格式
    if (response.data?.code === 1 || response.data?.code === 20000) {
      const pageData = response.data.data;
      
      // 如果data为null或undefined
      if (pageData === null || pageData === undefined) {
        console.warn('[Admin] 后端返回的data为null或undefined');
        tasks.value = [];
        updateStats();
        return;
      }
      
      // 如果是分页数据，取records
      if (pageData.records && Array.isArray(pageData.records)) {
        console.log('[Admin] 找到分页数据，records数量:', pageData.records.length);
        tasks.value = pageData.records.map(task => {
          // 解析任务数据
          let taskData = {};
          try {
            if (task.data) {
              taskData = typeof task.data === 'string' ? JSON.parse(task.data) : task.data;
            }
          } catch (e) {
            console.warn('[Admin] 解析任务数据失败:', e);
          }
          
          return {
            id: task.id,
            title: task.title,
            type: task.type,
            typeLabel: '商家注册',
            status: getStatusKey(task.status),
            statusKey: getStatusKey(task.status),
            statusLabel: getStatusLabel(task.status),
            applicant: task.applicant,
            shopName: taskData.shopName || taskData.name || '未知商家',
            phone: taskData.phone || '未知',
            address: taskData.address || '未知',
            businessLicense: taskData.businessLicense || '',
            latitude: taskData.latitude || null,
            longitude: taskData.longitude || null,
            time: formatTime(task.startTime),
            rawData: task // 保存原始数据以便查看详情
          };
        });
        
        // 更新统计
        updateStats();
      } else if (Array.isArray(pageData)) {
        // 如果直接返回数组
        console.log('[Admin] 找到数组数据，数量:', pageData.length);
        tasks.value = pageData.map(task => {
          let taskData = {};
          try {
            if (task.data) {
              taskData = typeof task.data === 'string' ? JSON.parse(task.data) : task.data;
            }
          } catch (e) {
            console.warn('[Admin] 解析任务数据失败:', e);
          }
          
          return {
            id: task.id,
            title: task.title,
            type: task.type,
            typeLabel: '商家注册',
            status: getStatusKey(task.status),
            statusKey: getStatusKey(task.status),
            statusLabel: getStatusLabel(task.status),
            applicant: task.applicant,
            shopName: taskData.shopName || taskData.name || '未知商家',
            phone: taskData.phone || '未知',
            address: taskData.address || '未知',
            businessLicense: taskData.businessLicense || '',
            latitude: taskData.latitude || null,
            longitude: taskData.longitude || null,
            time: formatTime(task.startTime),
            rawData: task
          };
        });
        updateStats();
      } else {
        console.warn('[Admin] 数据格式不符合预期:', pageData);
        tasks.value = [];
        updateStats();
      }
    } else {
      console.warn('[Admin] 响应码不正确:', response.data?.code);
      tasks.value = [];
      updateStats();
    }
  } catch (error) {
    console.error('[Admin] 获取任务失败:', error);
    console.error('[Admin] 错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    });
    // 打印完整的错误响应数据
    if (error.response?.data) {
      console.error('[Admin] 后端错误响应:', JSON.stringify(error.response.data, null, 2));
    }
    
    // 检查是否是数据库错误（缺少 comment 列）
    const errorMessage = error.response?.data?.message || error.message;
    if (errorMessage && errorMessage.includes('Unknown column \'comment\'')) {
      taskError.value = '数据库架构错误：admin_task 表缺少 comment 列。请联系后端开发人员修复数据库。';
    } else if (error.response?.status === 400) {
      taskError.value = `获取任务失败：${errorMessage || '未知错误'}`;
    } else {
      taskError.value = `获取任务失败：${errorMessage || '网络错误，请稍后重试'}`;
    }
    
    tasks.value = [];
    updateStats();
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
    // 如果是从详情弹窗领取的，关闭弹窗
    if (showTaskDetailDialog.value) {
      showTaskDetailDialog.value = false;
    }
  } catch (error) {
    console.error('领取任务失败:', error);
    alert('领取任务失败：' + (error.response?.data?.message || error.message));
  }
};

// 批准任务
const approveTask = async (taskId) => {
  if (!confirm('确定要批准这个商家注册申请吗？')) return;
  
  try {
    // 批准任务（后端会自动更新merchant状态和用户角色）
    await api.post(`/api/admin/task/${taskId}/approve`);
    console.log('[Admin] ✅ 任务已批准，后端会自动更新商家状态和用户角色');
    
    // 刷新任务列表
    await fetchTasks();
    alert('任务已批准！商家现在可以正常登录了。');
    
    // 如果是从详情弹窗批准的，关闭弹窗
    if (showTaskDetailDialog.value) {
      showTaskDetailDialog.value = false;
    }
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
  
  if (!confirm('确定要拒绝这个商家注册申请吗？')) return;
  
  try {
    // 修复：使用查询参数而不是请求体
    await api.post(`/api/admin/task/${currentTask.value.id}/reject?comment=${encodeURIComponent(rejectComment.value)}`);
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
  // 显示任务详情弹窗
  currentTask.value = task;
  showTaskDetailDialog.value = true;
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 获取商家列表 - 从数据库读取
const fetchMerchants = async () => {
  try {
    console.log('[Admin] 开始获取商家列表（从数据库）...');
    
    // 根据后端 MerchantController，正确的路径是 /api/merchant（单数形式）
    const path = '/api/merchant';
    console.log(`[Admin] 请求URL: ${path}`);
    const response = await api.get(path);
    console.log(`[Admin] ${path} 响应:`, response.data);
    
    // 检查响应格式 - 支持code === 1 或 code === 20000
    if (response.data?.code === 1 || response.data?.code === 20000) {
      const merchantsData = response.data.data;
      
      // 如果data为null或undefined，可能是数据库中没有数据
      if (merchantsData === null || merchantsData === undefined) {
        console.warn('[Admin] 后端返回的商家data为null或undefined（数据库可能为空）');
        merchants.value = [];
        return;
      }
      
      // 后端返回的是List<MerchantDto>（从数据库查询）
      if (Array.isArray(merchantsData)) {
        console.log('[Admin] ✅ 成功从数据库获取商家数据，数量:', merchantsData.length);
        merchants.value = merchantsData.map(merchant => ({
          id: merchant.id,
          name: merchant.name,
          shopName: merchant.name, // 兼容字段
          phone: merchant.phone,
          address: merchant.address,
          score: merchant.score || 0,
          status: merchant.status,
          businessLicense: merchant.businessLicense,
          latitude: merchant.latitude,
          longitude: merchant.longitude
        }));
      } else {
        console.warn('[Admin] 商家列表数据格式异常，不是数组:', merchantsData);
        merchants.value = [];
      }
    } else {
      console.warn('[Admin] 商家列表接口返回错误:', response.data);
      merchants.value = [];
    }
  } catch (error) {
    console.error('[Admin] ❌ 获取商家列表失败（接口错误）:', error);
    console.error('[Admin] 错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // 接口失败，显示空列表（只从数据库读取，不使用模拟数据）
    console.warn('[Admin] ⚠️ 商家接口失败，无法从数据库读取数据');
    merchants.value = [];
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取订单统计（从数据库）- 使用正确的接口路径 /api/order/stats
    const ordersResponse = await api.get('/api/order/stats');
    console.log('[Admin] 订单统计响应:', ordersResponse.data);
    if (ordersResponse.data?.code === 1 || ordersResponse.data?.code === 20000) {
      const orderStats = ordersResponse.data.data;
      statsData.value.totalOrders = orderStats?.totalOrders || 0;
      statsData.value.totalRevenue = orderStats?.totalAmount || 0;
    }
    
    // 获取商家数量（从数据库）
    await fetchMerchants();
    statsData.value.totalMerchants = merchants.value.length;
    console.log('[Admin] ✅ 统计数据（从数据库）:', statsData.value);
  } catch (error) {
    console.error('[Admin] 获取统计数据失败:', error);
    console.error('[Admin] 订单统计错误详情:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    // 即使部分失败，也尝试获取其他数据
    try {
      await fetchMerchants();
      statsData.value.totalMerchants = merchants.value.length;
    } catch (e) {
      console.error('[Admin] 获取商家数量失败:', e);
      statsData.value.totalMerchants = 0;
    }
    
    // 如果订单统计失败，使用默认值
    if (!statsData.value.totalOrders && !statsData.value.totalRevenue) {
      statsData.value.totalOrders = 0;
      statsData.value.totalRevenue = 0;
    }
  }
};

// 查看商家详情
const viewMerchantDetail = (merchant) => {
  const name = merchant.name || merchant.shopName || '未知商家';
  const phone = merchant.phone || '未知';
  const address = merchant.address || '未知';
  const score = merchant.score || 0;
  const status = merchant.status || '未知';
  alert(`商家详情：\nID：${merchant.id}\n名称：${name}\n联系方式：${phone}\n地址：${address}\n评分：${score}\n状态：${status}`);
};

// 定时器引用
let refreshTimer = null;

// 根据当前tab刷新数据
const refreshCurrentTab = () => {
  if (activeTab.value === 'tasks') {
    fetchTasks();
  } else if (activeTab.value === 'merchants') {
    fetchMerchants();
  } else if (activeTab.value === 'stats') {
    fetchStats();
  }
};

// 监听tab切换
watch(activeTab, (newTab) => {
  // 立即刷新新tab的数据
  if (newTab === 'merchants') {
    fetchMerchants();
  } else if (newTab === 'stats') {
    fetchStats();
  } else if (newTab === 'tasks') {
    fetchTasks();
  }
});

// 初始化
onMounted(() => {
  // 直接加载任务列表（路由守卫已经确保用户已登录且是管理员）
  fetchTasks();
  
  // 设置定时器，每30秒刷新一次当前tab的数据
  refreshTimer = setInterval(() => {
    console.log('[Admin] 定时刷新数据...');
    refreshCurrentTab();
  }, 30000); // 30秒 = 30000毫秒
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('[Admin] 定时器已清除');
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

