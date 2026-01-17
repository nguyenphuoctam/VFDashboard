/**
 * API Configuration
 * Centralized endpoints and base URL
 */

let API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

// Auto-add protocol if missing (useful for Render/Cloud platforms)
if (API_BASE_URL && !API_BASE_URL.startsWith("http")) {
  API_BASE_URL = `https://${API_BASE_URL}`;
}


export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  USER: `${API_BASE_URL}/api/user`,
  VEHICLES: `${API_BASE_URL}/api/vehicles`,
  TELEMETRY: (vin) => `${API_BASE_URL}/api/telemetry/${vin}`,
  LOGOUT: `${API_BASE_URL}/api/logout`, // Logic for logout endpoint if implemented
};

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS,
};
