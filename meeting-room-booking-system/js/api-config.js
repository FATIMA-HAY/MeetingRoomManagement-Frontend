// API Configuration for Meeting Room Booking System
/*class APIConfig {
    constructor() {
        // Base API URL - change this to your actual backend URL
        this.baseURL = 'https://localhost:7209';
        
        // API endpoints
        this.endpoints = {
            login: '/api/Authentication/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            user: '/Users',
            rooms: '/api/Room',
            bookings: '/api/Bookings',
            meetings: '/meetings',
            minutes: '/minutes'
        };
        
        // Default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Get full URL for an endpoint
    getURL(endpoint) {
       // return `${this.baseURL}${endpoint}`;
       return new URL(endpoint, this.baseURL).href;
    }

    // Get headers with authentication token
    getHeaders(includeAuth = true) {
        const headers = { ...this.defaultHeaders };
        
        if (includeAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = this.getURL(endpoint);
        const headers = this.getHeaders(options.includeAuth !== false);
        
        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        // Add body for POST/PUT/PATCH requests
        if (options.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parse response
            const data = await response.json();
            return {
                success: true,
                data,
                status: response.status
            };
            
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 0
            };
        }
    }

    // API methods
    async login(credentials) {
        return this.request(this.endpoints.login, {
            method: 'POST',
            body: credentials,
            includeAuth: false
        });
    }

    async logout() {
        return this.request(this.endpoints.logout, {
            method: 'POST'
        });
    }

    async refreshToken() {
        return this.request(this.endpoints.refresh, {
            method: 'POST'
        });
    }

    async getUserProfile() {
        return this.request(this.endpoints.user);
    }

    async getRooms() {
        return this.request(this.endpoints.rooms);
    }

    async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.bookings}?${queryString}` : this.endpoints.bookings;
        return this.request(endpoint);
    }

    async createBooking(bookingData) {
        return this.request(this.endpoints.bookings, {
            method: 'POST',
            body: bookingData
        });
    }

    async updateBooking(bookingId, bookingData) {
        return this.request(`${this.endpoints.bookings}/${bookingId}`, {
            method: 'PUT',
            body: bookingData
        });
    }

    async deleteBooking(bookingId) {
        return this.request(`${this.endpoints.bookings}/${bookingId}`, {
            method: 'DELETE'
        });
    }

    async getMeetings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.meetings}?${queryString}` : this.endpoints.meetings;
        return this.request(endpoint);
    }

    async createMeeting(meetingData) {
        return this.request(this.endpoints.meetings, {
            method: 'POST',
            body: meetingData
        });
    }

    async updateMeeting(meetingId, meetingData) {
        return this.request(`${this.endpoints.meetings}/${meetingId}`, {
            method: 'PUT',
            body: meetingData
        });
    }

    async deleteMeeting(meetingId) {
        return this.request(`${this.endpoints.meetings}/${meetingId}`, {
            method: 'DELETE'
        });
    }

    async getMinutes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.minutes}?${queryString}` : this.endpoints.minutes;
        return this.request(endpoint);
    }

    async createMinutes(minutesData) {
        return this.request(this.endpoints.minutes, {
            method: 'POST',
            body: minutesData
        });
    }

    async updateMinutes(minutesId, minutesData) {
        return this.request(`${this.endpoints.minutes}/${minutesId}`, {
            method: 'PUT',
            body: minutesData
        });
    }

    async deleteMinutes(minutesId) {
        return this.request(`${this.endpoints.minutes}/${minutesId}`, {
            method: 'DELETE'
        });
    }
}

// Initialize API config globally
window.apiConfig = new APIConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
} */