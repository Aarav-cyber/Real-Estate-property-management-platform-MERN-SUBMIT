import api from '../lib/axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const propertiesAPI = {
  getAll: () => api.get('/properties'),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  assignTenant: (id, data) => api.put(`/properties/assign/${id}`, data),
};

export const leasesAPI = {
  getAll: () => api.get('/leases'),
  getById: (id) => api.get(`/leases/${id}`),
  create: (data) => api.post('/leases', data),
  upload: (formData) =>
    api.post('/leases/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  add: (data) => api.post('/payments', data),
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  issue: (data) => api.post('/payments/issue', data),
};

export const requestsAPI = {
  getAll: () => api.get('/requests'),
  create: (data) => api.post('/requests', data),
  accept: (id) => api.put(`/requests/accept/${id}`),
  reject: (id) => api.put(`/requests/reject/${id}`),
};
