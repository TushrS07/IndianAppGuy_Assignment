// API service for backend communication

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    // For 401 responses with requiresVerification, return the data instead of throwing
    if (!response.ok) {
      if (response.status === 401 && data.requiresVerification) {
        // Return the error data so the frontend can handle verification flow
        const error = new Error(data.message || "Verification required");
        error.requiresVerification = true;
        error.data = data;
        throw error;
      }
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Authentication APIs

export const signUpAPI = async (userData) => {
  return await apiCall("/api/user/sign-up", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const signInAPI = async (credentials) => {
  return await apiCall("/api/user/sign-in", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const verifyOtpAPI = async (otp) => {
  return await apiCall("/api/user/verify-otp", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
};

export const resendOtpAPI = async () => {
  return await apiCall("/api/user/resend-otp", {
    method: "POST",
  });
};

export const logoutAPI = async () => {
  return await apiCall("/api/user/logout", {
    method: "POST",
  });
};

export const getProfileAPI = async () => {
  const token = localStorage.getItem("authToken");
  return await apiCall("/api/user/profile", {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const saveProfileAPI = async (profileData) => {
  const token = localStorage.getItem("authToken");
  return await apiCall("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const getUserPlansAPI = async () => {
  const token = localStorage.getItem("authToken");
  return await apiCall("/api/app/plans", {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const getPlanByIdAPI = async (planId) => {
  const token = localStorage.getItem("authToken");
  return await apiCall(`/api/app/plans/${planId}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

// App APIs

export const generateQuoteAPI = async () => {
  const token = localStorage.getItem("authToken");
  return await apiCall("/api/app/generateQuote", {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const generatePlanAPI = async (profileData) => {
  // const token = localStorage.getItem("authToken");
  return await apiCall("/api/app/generatePlan", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
};

export const generateImageAPI = async (query, type = 'exercise') => {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return await apiCall("/api/app/generateImage", {
    method: "POST",
    body: JSON.stringify({ query, type }),
    headers,
  });
};
