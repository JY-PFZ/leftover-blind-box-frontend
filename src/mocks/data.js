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
    phone: "+1 (555) 123-4567"
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
    phone: "+1 (555) 234-5678"
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
    phone: "+1 (555) 345-6789"
  },
]

export const mockProducts = [
  // merchant 1
  { id: 101, title: "Candy 1", price: 4.99, description: "Yummy candy.", merchant: mockMerchants[0] },
  { id: 102, title: "Candy 2", price: 4.99, description: "Yummy candy.", merchant: mockMerchants[0] },
  { id: 103, title: "Candy 3", price: 4.99, description: "Yummy candy.", merchant: mockMerchants[0] },
  // merchant 2
  { id: 201, title: "Choco 1", price: 6.99, description: "Dark chocolate bar.", merchant: mockMerchants[1] },
  { id: 202, title: "Choco 2", price: 7.49, description: "Milk chocolate bar.", merchant: mockMerchants[1] },
  // merchant 3
  { id: 301, title: "Fruit Snack 1", price: 5.99, description: "Dried mango.", merchant: mockMerchants[2] },
  { id: 302, title: "Fruit Snack 2", price: 5.49, description: "Dried strawberry.", merchant: mockMerchants[2] },
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
