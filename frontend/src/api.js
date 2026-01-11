import axios from 'axios';

export default axios.create({
  baseURL: 'https://aws-upload-backend.onrender.com/api'
});
