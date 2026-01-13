import axios from 'axios';

export default axios.create({
  baseURL: 'https://aws-s3-upload-service-pr2s.onrender.com'
});
