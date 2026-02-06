import axios from 'axios';
import { Platform } from 'react-native';

// Production URL (Hosted on Render)
const BASE_URL = 'https://rice-mill-system.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
