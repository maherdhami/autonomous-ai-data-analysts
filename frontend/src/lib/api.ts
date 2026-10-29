import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lightweight isolated session ID per browser tab (No JWT or login required)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('data_analyst_session_id');
    if (!sessionId) {
      sessionId = 'ses_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('data_analyst_session_id', sessionId);
    }
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});
