import axios from "axios";

const api = axios.create({
  baseURL: "https://aws-s3-upload-service-backend.onrender.com",
  withCredentials: false,
});

export default api;
