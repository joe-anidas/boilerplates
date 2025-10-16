export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make authenticated requests
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('firebaseToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  return fetch(`${API_BASE}${url}`, config);
};

// Save user to backend
export const saveUserToBackend = async (user, provider) => {
  const providers = [
    ...new Set([
      ...user.providerData.map((p) => p.providerId.replace('.com', '')),
      ...(provider ? [provider] : []),
    ]),
  ];

  const response = await makeAuthenticatedRequest('/auth/users', {
    method: 'POST',
    body: JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providers,
      updatedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save user data');
  }

  return response.json();
};


