import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:1337/api
});

export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        localStorage.setItem('handicapp_jwt', token);
    } else {
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem('handicapp_jwt');
    }
}