import api from './client'

// Site
export const siteApi = {
  status: () => api.get('/site/status'),
}

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  user: () => api.get('/auth/user'),
  verifyPhone: (code) => api.post('/auth/verify-phone', { code }),
  resendCode: () => api.post('/auth/resend-code'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  get: (id) => api.get(`/categories/${id}`),
}

// Listings
export const listingsApi = {
  list: (params) => api.get('/listings', { params }),
  get: (slug) => api.get(`/listings/${slug}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  renew: (id) => api.post(`/listings/${id}/renew`),
  markSold: (id) => api.post(`/listings/${id}/mark-sold`),
  uploadImages: (id, formData) =>
    api.post(`/listings/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (listingId, imageId) =>
    api.delete(`/listings/${listingId}/images/${imageId}`),
}

// Search
export const searchApi = {
  search: (params) => api.get('/search', { params }),
}

// Favorites
export const favoritesApi = {
  list: () => api.get('/favorites'),
  toggle: (listingId) => api.post(`/favorites/${listingId}`),
}

// Messages
export const messagesApi = {
  conversations: () => api.get('/conversations'),
  thread: (userId, listingId) => api.get(`/conversations/${userId}/${listingId}`),
  send: (data) => api.post('/messages', data),
  markRead: (id) => api.patch(`/messages/${id}/read`),
  unreadCount: () => api.get('/messages/unread-count'),
}

// Profile
export const profileApi = {
  get: (userId) => api.get(`/users/${userId}`),
  listings: (userId) => api.get(`/users/${userId}/listings`),
  update: (data) => api.put('/profile', data),
  myListings: (params) => api.get('/profile/listings', { params }),
}

// Reports
export const reportsApi = {
  create: (listingId, data) => api.post(`/listings/${listingId}/report`, data),
}

// Ratings
export const ratingsApi = {
  create: (userId, data) => api.post(`/users/${userId}/rate`, data),
  list: (userId) => api.get(`/users/${userId}/ratings`),
}

// Admin
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  listings: (params) => api.get('/admin/listings', { params }),
  updateListing: (id, data) => api.patch(`/admin/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
  reports: (params) => api.get('/admin/reports', { params }),
  updateReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  users: (params) => api.get('/admin/users', { params }),
  userDetail: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  admins: () => api.get('/admin/admins'),
  setRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
  settings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),
  payments: (params) => api.get('/admin/payments', { params }),
  updatePayment: (id, data) => api.patch(`/admin/payments/${id}`, data),
}
