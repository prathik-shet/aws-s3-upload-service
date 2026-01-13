import axios from "axios";

const api = axios.create({
  baseURL: "https://aws-s3-upload-service-backend.onrender.com/api",
  withCredentials: false,
  timeout: 60000, // 60s safety for uploads
});

export default api;
