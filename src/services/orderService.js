// src/services/orderService.js

import apiClient from './axiosConfig';

/**
 * Fetches the user's order history with optional filters.
 * @param {object} params - The query parameters for the request.
 * @param {number} params.pageNum - The page number.
 * @param {number} params.pageSize - The number of items per page.
 * @param {string} [params.status] - Optional order status to filter by.
 * @returns {Promise<object>} The response data from the API.
 */
export const fetchOrders = async (params = { pageNum: 1, pageSize: 10 }) => {
  try {
    const response = await apiClient.get('/orders', { params });
    // The data is nested, so we return the core part
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Throw the error so the component can handle it
    throw error;
  }
};

/**
 * Fetches the details for a single order by its ID.
 * @param {string|number} orderId - The ID of the order to fetch.
 * @returns {Promise<object>} The detailed order data.
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};