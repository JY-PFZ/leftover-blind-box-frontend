import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/utils/api';
import { useUserStore } from './user';

export const useMerchantStore = defineStore('merchant', () => {
  // --- 状态 ---
  const currentMerchant = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // --- Actions ---

  /**
   * 注册一个新商家
   */
  const registerMerchant = async (merchantData) => {
    // ⚡️ 这是一个版本标记，如果您在控制台看不到这行字，说明浏览器还没更新到新代码！请强制刷新！
    console.log("%c ⚡️ MERCHANT STORE VERSION: FIXED_V2 ", "background: #222; color: #bada55; font-size: 12px; padding: 4px; border-radius: 2px;");
    
    console.group("🚀 [MerchantStore] 开始商家注册流程");
    console.log("1. 原始参数:", JSON.stringify(merchantData, null, 2));
    
    isLoading.value = true;
    error.value = null;
    
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) {
      error.value = 'Please login as a customer first.';
      isLoading.value = false;
      console.groupEnd();
      return { success: false, message: error.value };
    }
    
    try {
      // 1. 提取营业执照 (优先级：入参 > 占位符)
      // 只要前端传了，这里一定能取到
      const licenseValue = merchantData.businessLicense || merchantData.business_license || merchantData.license || 'LICENSE_PLACEHOLDER_' + Date.now();
      console.log("2. 提取到的 License 值:", licenseValue);

      // 2. 处理手机号
      let validPhone = null;
      if (merchantData.phone && merchantData.phone.trim()) {
        const phoneStr = merchantData.phone.trim().replace(/\s+/g, '');
        if (/^\d{8,}$/.test(phoneStr)) {
           validPhone = phoneStr;
        }
      }

      // 3. 直接构建最终请求体 (不再依赖 requestData 中间变量，防止漏字段)
      const finalPayload = {
        name: merchantData.merchantName || '',
        address: merchantData.address || '',
        latitude: merchantData.latitude || null,
        longitude: merchantData.longitude || null,
        // 如果有手机号则添加
        ...(validPhone && { phone: validPhone }),
        // [强制添加] 同时发送两种格式，确保后端 100% 能收到
        business_license: licenseValue,
        businessLicense: licenseValue
      };

      console.log("3. 最终发送给后端的 Payload:", JSON.stringify(finalPayload, null, 2));

      // 4. 发送请求
      const path = '/api/merchant/register';
      const response = await api.post(path, finalPayload);
      
      console.log("4. 后端响应:", response);
      console.groupEnd();

      // 兼容成功判断
      const isSuccess = response.data?.code == 1 || response.data?.code == 20000 || (response.status === 200 && response.data?.code !== 0);
      
      if (isSuccess) {
        return { success: true };
      } else {
        const errorMsg = response.data?.message || 'Registration failed.';
        throw new Error(errorMsg);
      }

    } catch (err) {
      console.error("❌ 注册异常:", err);
      let msg = err.response?.data?.message || err.message || 'Unknown Error';
      error.value = msg;
      console.groupEnd();
      return { success: false, message: msg };
    } finally {
      isLoading.value = false;
    }
  };

  // 获取商家信息
  const fetchMyMerchantProfile = async () => {
    isLoading.value = true;
    error.value = null;
    currentMerchant.value = null;
    const userStore = useUserStore();

    if (!userStore.isLoggedIn || userStore.role !== 'merchant') {
      isLoading.value = false;
      return;
    }

    try {
      const response = await api.get('/api/merchant/my');
      const successCode = response.data?.code == 1 || response.data?.code == 20000;
      
      if (successCode && response.data?.data) {
        currentMerchant.value = response.data.data;
      } else {
        error.value = response.data?.message;
      }
    } catch (err) {
      console.error(err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const clearMerchantProfile = () => {
    currentMerchant.value = null;
    error.value = null;
  };

  return {
    currentMerchant,
    isLoading,
    error,
    registerMerchant,
    fetchMyMerchantProfile,
    clearMerchantProfile
  };
});