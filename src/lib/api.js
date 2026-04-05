import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data.data,
  err => Promise.reject(err.response?.data?.error ?? err.message)
)

export const authApi = {
  login: body => api.post('/auth/login', body),
  register: body => api.post('/auth/register', body),
  me: () => api.get('/auth/me'),
}

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: body => api.post('/categories', body),
  update: (id, body) => api.put(`/categories/${id}`, body),
  remove: id => api.delete(`/categories/${id}`),
}

export const transactionsApi = {
  getAll: (params) => api.get('/transactions', { params }),
  create: body => api.post('/transactions', body),
  update: (id, body) => api.put(`/transactions/${id}`, body),
  remove: id => api.delete(`/transactions/${id}`),
}

export const budgetsApi = {
  getAll: () => api.get('/budgets'),
  create: body => api.post('/budgets', body),
  update: (id, body) => api.put(`/budgets/${id}`, body),
  remove: id => api.delete(`/budgets/${id}`),
}

export const goalsApi = {
  getAll: () => api.get('/goals'),
  create: body => api.post('/goals', body),
  update: (id, body) => api.put(`/goals/${id}`, body),
  remove: id => api.delete(`/goals/${id}`),
}

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  create: body => api.post('/accounts', body),
  update: (id, body) => api.put(`/accounts/${id}`, body),
  remove: id => api.delete(`/accounts/${id}`),
}

export const billsApi = {
  getAll: () => api.get('/bills'),
  create: body => api.post('/bills', body),
  update: (id, body) => api.put(`/bills/${id}`, body),
  remove: id => api.delete(`/bills/${id}`),
}
