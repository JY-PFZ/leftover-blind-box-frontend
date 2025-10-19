// mock 登录方法，未来连接上api就删掉
export function mockLogin(userStore) {
  console.log('Mock login called, setting user data')
  console.log('userStore:', userStore)
  
  const mockToken = 'mocktoken-' + Date.now()
  const mockUsername = 'MockUser'
  
  // 在Pinia store中，token和username是ref对象，需要使用.value
  userStore.token.value = mockToken
  userStore.username.value = mockUsername
  
  // 同时保存到localStorage
  localStorage.setItem('token', mockToken)
  localStorage.setItem('username', mockUsername)
  
  console.log('Mock login completed:', {
    token: userStore.token.value,
    username: userStore.username.value,
    isLoggedIn: userStore.isLoggedIn.value
  })
}
// src/mocks/data.js
export const mockMerchants = [
  { 
    id: 1, 
    name: "Sweet Candy Shop", 
    bio: "Best candy in town with over 20 years of experience in creating delicious treats",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    rating: 4.8,
    reviewCount: 156,
    address: "123 Sweet Street, Candy City",
    openingHours: "Mon-Sun: 9:00 AM - 8:00 PM",
    phone: "+1 (555) 123-4567",
    latitude: 1.2966,  // 新加坡乌节路附近
    longitude: 103.7764
  },
  { 
    id: 2, 
    name: "Choco Factory", 
    bio: "Handmade chocolate with premium ingredients from around the world",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop",
    rating: 4.9,
    reviewCount: 203,
    address: "456 Chocolate Avenue, Cocoa Town",
    openingHours: "Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM",
    phone: "+1 (555) 234-5678",
    latitude: 1.3048,  // 新加坡滨海湾附近
    longitude: 103.8318
  },
  { 
    id: 3, 
    name: "Fruit Snacks", 
    bio: "Healthy & tasty snacks made from fresh fruits and natural ingredients",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
    rating: 4.7,
    reviewCount: 89,
    address: "789 Fruit Lane, Healthy Valley",
    openingHours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat-Sun: 9:00 AM - 5:00 PM",
    phone: "+1 (555) 345-6789",
    latitude: 1.3521,  // 新加坡北部
    longitude: 103.8198
  },
  { 
    id: 4, 
    name: "Beauty World Bakery", 
    bio: "Traditional bakery with modern twists, specializing in fresh bread and pastries",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
    rating: 4.6,
    reviewCount: 124,
    address: "321 Beauty World Road, Bukit Timah",
    openingHours: "Mon-Sun: 7:00 AM - 9:00 PM",
    phone: "+1 (555) 456-7890",
    latitude: 1.3440,  // 美世界购物中心附近（用户提到的位置）
    longitude: 103.7688
  },
  { 
    id: 5, 
    name: "Marina Bay Delights", 
    bio: "Premium snacks and gourmet treats with stunning marina views",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    rating: 4.9,
    reviewCount: 267,
    address: "555 Marina Bay Drive, Downtown",
    openingHours: "Mon-Sun: 10:00 AM - 10:00 PM",
    phone: "+1 (555) 567-8901",
    latitude: 1.2767,  // 滨海湾金沙附近
    longitude: 103.8618
  },
  { 
    id: 6, 
    name: "Jurong East Treats", 
    bio: "Family-owned snack shop serving the western region for generations",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=300&fit=crop",
    rating: 4.5,
    reviewCount: 98,
    address: "888 Jurong East Street, West Side",
    openingHours: "Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM",
    phone: "+1 (555) 678-9012",
    latitude: 1.3331,  // 裕廊东附近
    longitude: 103.7423
  },
]

// 创建产品数据，确保商家引用正确
const createMockProducts = () => [
  // merchant 1 - Sweet Candy Shop
  { id: 101, title: "Gummy Bears", price: 4.99, description: "Classic gummy bears in assorted flavors.", merchant: mockMerchants[0], category: "糖果" },
  { id: 102, title: "Chocolate Bars", price: 5.99, description: "Rich chocolate bars with nuts.", merchant: mockMerchants[0], category: "巧克力" },
  { id: 103, title: "Lollipops", price: 3.99, description: "Colorful lollipops for kids.", merchant: mockMerchants[0], category: "糖果" },
  
  // merchant 2 - Choco Factory
  { id: 201, title: "Dark Chocolate", price: 6.99, description: "Premium dark chocolate bar.", merchant: mockMerchants[1], category: "巧克力" },
  { id: 202, title: "Milk Chocolate", price: 7.49, description: "Creamy milk chocolate bar.", merchant: mockMerchants[1], category: "巧克力" },
  { id: 203, title: "White Chocolate", price: 6.49, description: "Smooth white chocolate bar.", merchant: mockMerchants[1], category: "巧克力" },
  
  // merchant 3 - Fruit Snacks
  { id: 301, title: "Dried Mango", price: 5.99, description: "Natural dried mango slices.", merchant: mockMerchants[2], category: "果干" },
  { id: 302, title: "Dried Strawberry", price: 5.49, description: "Sweet dried strawberry pieces.", merchant: mockMerchants[2], category: "果干" },
  { id: 303, title: "Fruit Leather", price: 4.99, description: "Healthy fruit leather strips.", merchant: mockMerchants[2], category: "果干" },
  
  // merchant 4 - Beauty World Bakery
  { id: 401, title: "Fresh Bread", price: 3.99, description: "Artisan fresh bread loaf.", merchant: mockMerchants[3], category: "面包" },
  { id: 402, title: "Croissants", price: 2.99, description: "Buttery French croissants.", merchant: mockMerchants[3], category: "面包" },
  { id: 403, title: "Muffins", price: 3.49, description: "Blueberry muffins.", merchant: mockMerchants[3], category: "面包" },
  
  // merchant 5 - Marina Bay Delights
  { id: 501, title: "Premium Nuts", price: 8.99, description: "Mixed premium nuts.", merchant: mockMerchants[4], category: "坚果" },
  { id: 502, title: "Gourmet Cookies", price: 7.99, description: "Artisan gourmet cookies.", merchant: mockMerchants[4], category: "饼干" },
  { id: 503, title: "Tea Biscuits", price: 6.99, description: "Elegant tea biscuits.", merchant: mockMerchants[4], category: "饼干" },
  
  // merchant 6 - Jurong East Treats
  { id: 601, title: "Traditional Cookies", price: 4.99, description: "Homestyle traditional cookies.", merchant: mockMerchants[5], category: "饼干" },
  { id: 602, title: "Local Snacks", price: 3.99, description: "Authentic local snack mix.", merchant: mockMerchants[5], category: "零食" },
  { id: 603, title: "Rice Crackers", price: 3.49, description: "Crispy rice crackers.", merchant: mockMerchants[5], category: "零食" },
]

export const mockProducts = createMockProducts()

// 商品分类数据
export const productCategories = [
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'candy', name: '糖果', icon: '🍬' },
  { id: 'chocolate', name: '巧克力', icon: '🍫' },
  { id: 'fruit', name: '果干', icon: '🍎' },
  { id: 'bread', name: '面包', icon: '🍞' },
  { id: 'nuts', name: '坚果', icon: '🥜' },
  { id: 'cookies', name: '饼干', icon: '🍪' },
  { id: 'snacks', name: '零食', icon: '🍿' }
]

// Mock评论数据
export const mockReviews = [
  // 商家1的评论
  {
    id: 1,
    merchantId: 1,
    userName: "Alice Johnson",
    rating: 5,
    comment: "Amazing candy shop! The quality is outstanding and the staff is super friendly. My kids love their gummy bears!",
    date: new Date('2024-01-15'),
    helpful: 12,
    replies: [
      {
        id: 101,
        userName: "Sweet Candy Shop",
        comment: "谢谢您的支持！我们会继续努力提供最好的糖果！",
        date: new Date('2024-01-16')
      },
      {
        id: 102,
        userName: "Bob Smith",
        comment: "我也很喜欢他们的软糖，质量确实很好！",
        date: new Date('2024-01-17')
      }
    ]
  },
  {
    id: 2,
    merchantId: 1,
    userName: "Bob Smith",
    rating: 4,
    comment: "Great selection of candies. Prices are reasonable and the store is always clean. Will definitely come back!",
    date: new Date('2024-01-10'),
    helpful: 8,
    replies: []
  },
  {
    id: 3,
    merchantId: 1,
    userName: "Carol Davis",
    rating: 5,
    comment: "Best candy shop in town! The homemade fudge is to die for. Highly recommend trying their chocolate-covered pretzels.",
    date: new Date('2024-01-05'),
    helpful: 15,
    replies: []
  },
  
  // 商家2的评论
  {
    id: 4,
    merchantId: 2,
    userName: "David Wilson",
    rating: 5,
    comment: "Incredible chocolate! The dark chocolate bars are rich and smooth. Perfect for gifts or personal indulgence.",
    date: new Date('2024-01-20'),
    helpful: 20,
    replies: []
  },
  {
    id: 5,
    merchantId: 2,
    userName: "Emma Brown",
    rating: 4,
    comment: "Love their chocolate selection! The milk chocolate is creamy and not too sweet. Great customer service too.",
    date: new Date('2024-01-18'),
    helpful: 6,
    replies: []
  },
  {
    id: 6,
    merchantId: 2,
    userName: "Frank Miller",
    rating: 5,
    comment: "Premium quality chocolate at reasonable prices. The white chocolate truffles are absolutely divine!",
    date: new Date('2024-01-12'),
    helpful: 11,
    replies: []
  },
  
  // 商家3的评论
  {
    id: 7,
    merchantId: 3,
    userName: "Grace Lee",
    rating: 5,
    comment: "Perfect for health-conscious snackers! The dried mango is naturally sweet and the packaging is eco-friendly.",
    date: new Date('2024-01-22'),
    helpful: 9,
    replies: []
  },
  {
    id: 8,
    merchantId: 3,
    userName: "Henry Taylor",
    rating: 4,
    comment: "Great healthy snack options. The fruit leather is tasty and the prices are fair. Good variety too.",
    date: new Date('2024-01-16'),
    helpful: 4,
    replies: []
  },
  {
    id: 9,
    merchantId: 3,
    userName: "Ivy Chen",
    rating: 5,
    comment: "Love their commitment to natural ingredients! The dried strawberries are perfect for my kids' lunch boxes.",
    date: new Date('2024-01-08'),
    helpful: 7,
    replies: []
  }
]
