// 地理位置工具函数

/**
 * 计算两点之间的距离（使用Haversine公式）
 * @param {number} lat1 - 第一个点的纬度
 * @param {number} lon1 - 第一个点的经度
 * @param {number} lat2 - 第二个点的纬度
 * @param {number} lon2 - 第二个点的经度
 * @returns {number} 距离（公里）
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // 地球半径（公里）
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // 保留两位小数
}

/**
 * 将角度转换为弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * 格式化距离显示
 * @param {number} distance - 距离（公里）
 * @returns {string} 格式化后的距离字符串
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

/**
 * 获取用户当前位置
 * @returns {Promise<{latitude: number, longitude: number}>} 用户位置
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置API'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('GPS精度:', position.coords.accuracy, '米')
        console.log('位置坐标:', position.coords.latitude, position.coords.longitude)
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        console.error('获取位置失败:', error)
        // 如果获取失败，返回新加坡默认位置
        resolve({
          latitude: 1.2966,
          longitude: 103.7764,
          accuracy: null
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 增加超时时间
        maximumAge: 60000 // 减少缓存时间到1分钟
      }
    )
  })
}

/**
 * 手动设置用户位置（用于测试或纠正）
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Object} 位置对象
 */
export function setManualLocation(latitude, longitude) {
  console.log('手动设置位置:', latitude, longitude)
  return {
    latitude,
    longitude,
    accuracy: 0, // 手动设置，精度为0
    manual: true
  }
}

/**
 * 计算商家与用户位置的距离
 * @param {Object} merchant - 商家对象
 * @param {Object} userLocation - 用户位置 {latitude, longitude}
 * @returns {number} 距离（公里）
 */
export function getMerchantDistance(merchant, userLocation) {
  if (!merchant.latitude || !merchant.longitude || !userLocation) {
    return null
  }
  
  return calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    merchant.latitude,
    merchant.longitude
  )
}

/**
 * 按距离排序商家列表
 * @param {Array} merchants - 商家列表
 * @param {Object} userLocation - 用户位置
 * @returns {Array} 按距离排序的商家列表
 */
export function sortMerchantsByDistance(merchants, userLocation) {
  if (!userLocation) {
    return merchants
  }

  return merchants
    .map(merchant => ({
      ...merchant,
      distance: getMerchantDistance(merchant, userLocation)
    }))
    .sort((a, b) => {
      // 如果两个商家都有距离，按距离排序
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      // 如果只有一个有距离，有距离的排在前面
      if (a.distance !== null && b.distance === null) {
        return -1
      }
      if (a.distance === null && b.distance !== null) {
        return 1
      }
      // 如果都没有距离，保持原有顺序
      return 0
    })
}
