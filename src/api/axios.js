import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost/zhen-aura/api/v2",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Attach token or temp_user_id if exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const tempUserId = localStorage.getItem("temp_user_id");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (tempUserId) {
        config.headers["temp-user-id"] = tempUserId;
    }

    return config;
});

export default api;
