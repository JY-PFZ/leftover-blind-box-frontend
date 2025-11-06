import JSEncrypt from 'jsencrypt';

/**
 * RSA加密工具类
 */
class RsaUtil {
  constructor() {
    this.encrypt = null;
    this.publicKey = null;
  }

  /**
   * 从后端获取RSA公钥
   */
  async fetchPublicKey() {
    try {
      const { api } = await import('@/utils/api');
      const response = await api.get('/api/auth/key');
      
      if (response.data?.code === 1 && response.data?.data) {
        this.publicKey = response.data.data;
        this.encrypt = new JSEncrypt();
        this.encrypt.setPublicKey(this.publicKey);
        return this.publicKey;
      }
      throw new Error('Failed to get public key');
    } catch (error) {
      console.error('[RSA] Failed to fetch public key:', error);
      throw error;
    }
  }

  /**
   * 加密密码
   * @param {string} password - 明文密码
   * @returns {Promise<string>} - 加密后的密码
   */
  async encryptPassword(password) {
    if (!this.encrypt || !this.publicKey) {
      await this.fetchPublicKey();
    }
    
    try {
      const encrypted = this.encrypt.encrypt(password);
      if (!encrypted) {
        throw new Error('Encryption failed');
      }
      return encrypted;
    } catch (error) {
      console.error('[RSA] Encryption error:', error);
      throw error;
    }
  }
}

// 导出单例实例
export default new RsaUtil();
