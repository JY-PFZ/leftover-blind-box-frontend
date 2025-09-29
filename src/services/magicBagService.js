import axios from 'axios';

// 后端 API 的基础 URL。Vite 代理会处理这个
const API_URL = '/api';

/**
 * 获取魔法口袋（商品）列表
 * @param {object} params - 包含排序和筛选条件的参数对象
 * e.g., { sortBy: 'distance', category: 'bakery', page: 1, limit: 10 }
 */
export const fetchMagicBags = (params) => {
  // 使用 axios 发送 GET 请求，并通过 params 传递查询参数
  return axios.get(`${API_URL}/magic-bags`, { params });
};

