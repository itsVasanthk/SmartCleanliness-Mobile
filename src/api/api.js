import axios from 'axios';

const HOST = '10.52.36.3';
const PORT = '5000';
const BASE_URL = `http://${HOST}:${PORT}/api`;
export const UPLOAD_URL = `http://${HOST}:${PORT}/static/uploads`;
export const IMAGE_URL = `http://${HOST}:${PORT}/static/images`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const registerUser = async (data) => {
  try {
    const response = await apiClient.post('/register', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchDashboardStats = async (userId) => {
  try {
    const response = await apiClient.get(`/citizen/dashboard/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchMyReports = async (userId) => {
  try {
    const response = await apiClient.get(`/citizen/reports/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// For image upload, we need to use FormData
export const submitReport = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Volunteer APIs
export const fetchVolunteerStats = async (userId) => {
  try {
    const response = await apiClient.get(`/volunteer/stats/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchVolunteerEvents = async (userId) => {
  try {
    const response = await apiClient.get(`/volunteer/events?user_id=${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const joinEvent = async (userId, eventId) => {
  try {
    const response = await apiClient.post('/volunteer/join', { user_id: userId, event_id: eventId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const joinTask = async (userId, complaintId) => {
  try {
    const response = await apiClient.post('/volunteer/join_task', { user_id: userId, complaint_id: complaintId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const registerVehicleApi = async (data) => {
  try {
    const response = await apiClient.post('/volunteer/register_vehicle', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const markTransportComplete = async (complaintId) => {
  try {
    const response = await apiClient.post('/volunteer/transport_complete', { complaint_id: complaintId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchLeaderboard = async () => {
  try {
    const response = await apiClient.get('/volunteer/leaderboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Awareness APIs
export const fetchAwarenessData = async () => {
  try {
    const response = await apiClient.get('/awareness/content');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchWasteAreas = async () => {
  try {
    const response = await apiClient.get('/locate-waste');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Authority APIs
export const fetchAuthorityStats = async () => {
  try {
    const response = await apiClient.get('/authority/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchAllComplaints = async () => {
  try {
    const response = await apiClient.get('/authority/complaints');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchAvailableVehicles = async () => {
  try {
    const response = await apiClient.get('/authority/vehicles/available');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const assignVehicle = async (complaintId, volunteerId) => {
  try {
    const response = await apiClient.post('/authority/assign_vehicle', { complaint_id: complaintId, volunteer_id: volunteerId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/authority/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchEventParticipants = async (eventId) => {
  try {
    const response = await apiClient.get(`/authority/events/${eventId}/participants`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Fund & Donation APIs
export const fetchFundBalance = async () => {
  try {
    const response = await apiClient.get('/fund/balance');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const createRazorpayOrder = async (amount) => {
  try {
    const response = await apiClient.post('/create-order', { amount });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/verify-payment', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Emergency Assistance APIs
export const submitEmergencyRequest = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/emergency/request`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchEmergencyStatus = async (userId) => {
  try {
    const response = await apiClient.get(`/emergency/status/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Authority Emergency Management APIs
export const fetchAllEmergencyRequests = async () => {
  try {
    const response = await apiClient.get('/authority/emergency/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const approveEmergencyRequest = async (requestId) => {
  try {
    const response = await apiClient.post('/authority/emergency/approve', { request_id: requestId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Authority Decison
export const authorityDecide = async (complaintId, decision, reason) => {
  try {
    const response = await apiClient.post('/authority/decide', { complaint_id: complaintId, decision, reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Admin APIs
export const fetchAdminStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchEscalatedComplaints = async () => {
  try {
    const response = await apiClient.get('/admin/complaints/escalated');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const assignVehicleAdmin = async (complaintId, volunteerId) => {
  try {
    const response = await apiClient.post('/admin/assign_vehicle', { complaint_id: complaintId, volunteer_id: volunteerId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const fetchAvailableVehiclesAdmin = async () => {
  try {
    const response = await apiClient.get('/admin/vehicles/available');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const createEventAdmin = async (eventData) => {
  try {
    const response = await apiClient.post('/admin/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const escalateToHub = async (complaintId) => {
  try {
    const response = await apiClient.post('/admin/escalate_to_hub', { complaint_id: complaintId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const getJoinedVolunteers = async (complaintId) => {
  try {
    const response = await apiClient.get(`/admin/complaints/${complaintId}/volunteers`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Citizen Feedback & Edit
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await apiClient.post('/report/feedback', feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const editReport = async (complaintId, formData) => {
  try {
    const response = await axios.put(`${BASE_URL}/report/edit/${complaintId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export default apiClient;
