import axios from 'axios';

const api3 = axios.create({
  baseURL: 'http://192.168.255.1:5003/api', // Change ça selon ton URL
  timeout: 600000,
});

export default api3;