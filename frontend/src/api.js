import axios from 'axios';

export default axios.create({
  baseURL: 'https://your-render-backend.onrender.com/api'
});
