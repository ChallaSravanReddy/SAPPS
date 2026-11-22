import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Intercept requests to inject the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sapps_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired (avoid looping on login page)
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('sapps_token');
        localStorage.removeItem('sapps_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const studentsApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },
  create: async (studentData) => {
    const response = await apiClient.post('/students', studentData);
    return response.data;
  },
  getMyProfile: async () => {
    const response = await apiClient.get('/students/me/profile');
    return response.data;
  },
};

export const assessmentsApi = {
  create: async (assessmentData) => {
    const response = await apiClient.post('/assessments', assessmentData);
    return response.data;
  },
  getByStudent: async (studentId) => {
    const response = await apiClient.get(`/assessments/student/${studentId}`);
    return response.data;
  },
  batchUploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/assessments/batch-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const predictionsApi = {
  evaluate: async (studentId) => {
    const response = await apiClient.post(`/predictions/evaluate/${studentId}`);
    return response.data;
  },
  getStudentHistory: async (studentId) => {
    const response = await apiClient.get(`/predictions/student/${studentId}`);
    return response.data;
  },
  simulate: async (simulationFeatures) => {
    const response = await apiClient.post('/predictions/simulate', simulationFeatures);
    return response.data;
  },
};

export const analyticsApi = {
  getDashboardSummary: async () => {
    const response = await apiClient.get('/analytics/dashboard-summary');
    return response.data;
  },
};

export default apiClient;

