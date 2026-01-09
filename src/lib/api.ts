// API client for backend communication
const API_BASE = 'http://localhost:3000/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper to make authenticated requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    signup: (userData: any) =>
      fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    me: () => fetchAPI('/auth/me'),

    onboard: (data: { password: string }) => 
      fetchAPI('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updatePassword: (data: { oldPassword: string; newPassword: string }) =>
      fetchAPI('/auth/update-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    resetPassword: (email: string) =>
      fetchAPI('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    updateMe: (data: { firstName: string; lastName: string }) =>
      fetchAPI('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Events
  events: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchAPI(`/events${query}`);
    },

    get: (id: string) => fetchAPI(`/events/${id}`),

    create: (eventData: any) =>
      fetchAPI('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),

    update: (id: string, eventData: any) =>
      fetchAPI(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      }),

    delete: (id: string) =>
      fetchAPI(`/events/${id}`, {
        method: 'DELETE',
      }),

    updateStatus: (id: string, status: string, remarks?: string) =>
      fetchAPI(`/events/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, remarks }),
      }),

    checkAvailability: (data: { 
      venueId: string | null; 
      startDate: string; 
      endDate: string; 
      startTime: string; 
      endTime: string; 
      eventId?: string | null 
    }) =>
      fetchAPI('/events/check-availability', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistory: (id: string) => fetchAPI(`/events/${id}/history`),
    getByCode: (code: string) => fetchAPI(`/events/code/${code}`),
  },

  // Venues
  venues: {
    list: () => fetchAPI('/venues'),
    create: (data: any) => fetchAPI('/venues', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/venues/${id}`, { method: 'DELETE' }),
  },

  // Departments
  departments: {
    list: () => fetchAPI('/departments'),
    create: (data: any) => fetchAPI('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/departments/${id}`, { method: 'DELETE' }),
  },

  // Clubs
  clubs: {
    list: () => fetchAPI('/clubs'),
    create: (data: any) => fetchAPI('/clubs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/clubs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/clubs/${id}`, { method: 'DELETE' }),
  },

  // Professional Societies
  societies: {
    list: () => fetchAPI('/societies'),
    create: (data: any) => fetchAPI('/societies',{ method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/societies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/societies/${id}`, { method: 'DELETE' }),
  },

  // Users
  users: {
    list: () => fetchAPI('/users'),
    create: (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (users: any[]) => fetchAPI('/users/bulk', { method: 'POST', body: JSON.stringify({ users }) }),
    update: (id: string, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Uploads
  uploads: {
    single: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // fetchAPI with body as FormData should NOT have Content-Type header
      const token = getToken();
      return fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }).then(res => res.json());
    },
    multiple: (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      const token = getToken();
      return fetch(`${API_BASE}/upload/multiple`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }).then(res => res.json());
    },
  },

  // AI
  ai: {
    generateObjective: (data: { title: string; objective?: string; description?: string }) =>
      fetchAPI('/ai/generate-objective', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Notifications
  notifications: {
    list: () => fetchAPI('/notifications'),
    markAsRead: (id: string) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
  },
};
