import axios from "axios"

const axiosClient =  axios.create({
    baseURL: 'https://coding-platform-2-1.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Helper function to extract error message from backend response
const extractErrorMessage = (error) => {
    if (!error.response) {
        return error.message || 'Network error. Please check your connection.';
    }

    const data = error.response.data;
    if (!data) {
        return 'An unexpected error occurred';
    }

    // Backend may return error in different fields: message, error, or error.message
    return data.message || data.error || data.error?.message || 'An error occurred';
};

// Response interceptor for centralized error handling
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle network errors (no response from server)
        if (!error.response) {
            const networkError = {
                ...error,
                message: error.message || 'Network error. Please check your connection.',
                networkError: true,
                status: 0
            };
            console.error('Network error:', networkError.message);
            return Promise.reject(networkError);
        }

        // Handle HTTP errors
        const status = error.response?.status;
        const data = error.response?.data;
        const errorMessage = extractErrorMessage(error);

        // Normalize error object for consistent handling
        const normalizedError = {
            ...error,
            message: errorMessage,
            status: status,
            data: data,
            // Preserve original error structure for backward compatibility
            response: error.response
        };

        switch (status) {
            case 400:
                console.error('Bad Request:', errorMessage);
                break;
            case 401:
                // Unauthorized - token expired or invalid
                console.error('Unauthorized:', errorMessage);
                // Clear user data on 401
                try {
                    localStorage.removeItem('user');
                } catch (e) {
                    console.warn('Failed to clear localStorage:', e);
                }
                break;
            case 403:
                console.error('Forbidden:', errorMessage);
                break;
            case 404:
                console.error('Not found:', errorMessage);
                break;
            case 409:
                console.error('Conflict:', errorMessage);
                break;
            case 429:
                console.error('Rate limit exceeded:', errorMessage);
                normalizedError.message = 'Too many requests. Please try again later.';
                break;
            case 500:
                console.error('Server error:', errorMessage);
                normalizedError.message = 'Internal server error. Please try again later.';
                break;
            case 502:
                console.error('Bad Gateway:', errorMessage);
                normalizedError.message = 'Service temporarily unavailable. Please try again later.';
                break;
            case 504:
                console.error('Gateway Timeout:', errorMessage);
                normalizedError.message = 'Request timed out. Please try again.';
                break;
            default:
                console.error(`API error (${status}):`, errorMessage);
        }

        return Promise.reject(normalizedError);
    }
);

export default axiosClient;

