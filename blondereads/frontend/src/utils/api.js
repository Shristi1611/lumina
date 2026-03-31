import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://lumina-nzog.onrender.com/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const booksAPI = {
  search: (q, page = 1) => API.get(`/books/search?q=${encodeURIComponent(q)}&page=${page}`),
  trending: () => API.get('/books/trending'),
  getBook: (id) => API.get(`/books/${id}`),
  bySubject: (subject) => API.get(`/books/subject/${subject}`),
};

export const shelfAPI = {
  getShelf: (status) => API.get(`/shelf${status ? `?status=${status}` : ''}`),
  addBook: (data) => API.post('/shelf', data),
  updateBook: (id, data) => API.put(`/shelf/${id}`, data),
  removeBook: (id) => API.delete(`/shelf/${id}`),
  getStats: () => API.get('/shelf/stats/overview'),
};

export const pomodoroAPI = {
  getSettings: () => API.get('/pomodoro/settings'),
  updateSettings: (data) => API.put('/pomodoro/settings', data),
  saveSession: (data) => API.post('/pomodoro/session', data),
  getStats: () => API.get('/pomodoro/stats'),
  getHistory: () => API.get('/pomodoro/history'),
};

export const notesAPI = {
  getNotes: (bookId) => API.get(`/notes/${bookId}`),
  createNote: (data) => API.post('/notes', data),
  updateNote: (id, data) => API.put(`/notes/${id}`, data),
  deleteNote: (id) => API.delete(`/notes/${id}`),
};

export default API;
