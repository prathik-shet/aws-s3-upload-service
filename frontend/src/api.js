import axios from "axios";

const api = axios.create({
  baseURL: "https://aws-s3-upload-service-pr2s.onrender.com/api",
  withCredentials: false,
});

export default api;
