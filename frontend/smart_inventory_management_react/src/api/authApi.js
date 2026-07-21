import api from "./axios";

export const getCurrentUser = () => api.get("/inventory_welcome/auth/me");