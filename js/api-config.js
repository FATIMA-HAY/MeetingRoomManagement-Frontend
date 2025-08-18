// API Configuration for Meeting Room Booking System
class APIConfig {
    constructor() {
        // Base API URL - change this to your actual backend URL
        this.baseURL = 'https://localhost:7209/api';
        
        // API endpoints
        this.endpoints = {
            // Authentication
            login: '/Authentication/login',
            logout: '/Authentication/logout',
            refresh: '/Authentication/refresh',
            forgotPassword: '/Authentication/forgot-password',
            resetPassword: '/Authentication/reset-password',
            
            // User Management
            user: '/User/profile',
            users: '/User',
            userPermissions: '/User/permissions',
            
            // Room Management
            rooms: '/Room',
            roomAvailability: '/Room/availability',
            roomEquipment: '/Room/equipment',
            roomStats: '/Room/statistics',
            
            // Meeting Management
            meetings: '/Bookings',
            meetingBookings: '/Bookings',
            meetingJoin: '/Meeting/join',
            meetingEnd: '/Meeting/end',
            meetingAttendees: '/Meeting/attendees',
            
            // Minutes Management
            minutes: '/Minutes',
            minutesTemplate: '/Minutes/template',
            minutesAttachments: '/Minutes/attachments',
            minutesExport: '/Minutes/export',
            
            // Admin Management
            adminRooms: '/Admin/rooms',
            adminUsers: '/Admin/users',
            adminStats: '/Admin/statistics',
            adminReports: '/Admin/reports',
            
            // Notifications
            notifications: '/Notification',
            notificationSettings: '/Notification/settings',
            
            // File Management
            fileUpload: '/File/upload',
            fileDownload: '/File/download',
            fileDelete: '/File/delete'
        };
        
        // Default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Get full URL for an endpoint
    getURL(endpoint) {
        return `${this.baseURL}${endpoint}`;
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

    // Authentication methods
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

    async forgotPassword(email) {
        return this.request(this.endpoints.forgotPassword, {
            method: 'POST',
            body: { email },
            includeAuth: false
        });
    }

    async resetPassword(token, newPassword) {
        return this.request(this.endpoints.resetPassword, {
            method: 'POST',
            body: { token, newPassword },
            includeAuth: false
        });
    }

    // User management methods
    async getUserProfile() {
        return this.request(this.endpoints.user);
    }

    async updateUserProfile(userData) {
        return this.request(this.endpoints.user, {
            method: 'PUT',
            body: userData
        });
    }

    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.users}?${queryString}` : this.endpoints.users;
        return this.request(endpoint);
    }

    async getUserPermissions() {
        return this.request(this.endpoints.userPermissions);
    }

    // Room management methods
    async getRooms(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.rooms}?${queryString}` : this.endpoints.rooms;
        return this.request(endpoint);
    }

    async getRoom(roomId) {
        return this.request(`${this.endpoints.rooms}/${roomId}`);
    }

    async createRoom(roomData) {
        return this.request(this.endpoints.rooms, {
            method: 'POST',
            body: roomData
        });
    }

    async updateRoom(roomId, roomData) {
        return this.request(`${this.endpoints.rooms}/${roomId}`, {
            method: 'PUT',
            body: roomData
        });
    }

    async deleteRoom(roomId) {
        return this.request(`${this.endpoints.rooms}/${roomId}`, {
            method: 'DELETE'
        });
    }

    async getRoomAvailability(roomId, date) {
        return this.request(`${this.endpoints.roomAvailability}/${roomId}`, {
            method: 'GET',
            body: { date }
        });
    }

    async getRoomStatistics(roomId, period = 'month') {
        return this.request(`${this.endpoints.roomStats}/${roomId}`, {
            method: 'GET',
            body: { period }
        });
    }

    // Meeting management methods
    async getMeetings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.meetings}?${queryString}` : this.endpoints.meetings;
        return this.request(endpoint);
    }

    async getMeeting(meetingId) {
        return this.request(`${this.endpoints.meetings}/${meetingId}`);
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

    async joinMeeting(meetingId) {
        return this.request(`${this.endpoints.meetingJoin}/${meetingId}`, {
            method: 'POST'
        });
    }

    async endMeeting(meetingId) {
        return this.request(`${this.endpoints.meetingEnd}/${meetingId}`, {
            method: 'POST'
        });
    }

    async getMeetingAttendees(meetingId) {
        return this.request(`${this.endpoints.meetingAttendees}/${meetingId}`);
    }

    async addMeetingAttendee(meetingId, attendeeData) {
        return this.request(`${this.endpoints.meetingAttendees}/${meetingId}`, {
            method: 'POST',
            body: attendeeData
        });
    }

    async removeMeetingAttendee(meetingId, attendeeId) {
        return this.request(`${this.endpoints.meetingAttendees}/${meetingId}/${attendeeId}`, {
            method: 'DELETE'
        });
    }

    // Minutes management methods
    async getMinutes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.minutes}?${queryString}` : this.endpoints.minutes;
        return this.request(endpoint);
    }

    async getMinutesById(minutesId) {
        return this.request(`${this.endpoints.minutes}/${minutesId}`);
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

    async getMinutesTemplate(meetingId) {
        return this.request(`${this.endpoints.minutesTemplate}/${meetingId}`);
    }

    async exportMinutes(minutesId, format = 'pdf') {
        return this.request(`${this.endpoints.minutesExport}/${minutesId}`, {
            method: 'GET',
            body: { format }
        });
    }

    // Admin management methods
    async getAdminRooms(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.adminRooms}?${queryString}` : this.endpoints.adminRooms;
        return this.request(endpoint);
    }

    async getAdminUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.adminUsers}?${queryString}` : this.endpoints.adminUsers;
        return this.request(endpoint);
    }

    async getAdminStatistics(period = 'month') {
        return this.request(`${this.endpoints.adminStats}`, {
            method: 'GET',
            body: { period }
        });
    }

    async getAdminReports(reportType, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.adminReports}/${reportType}?${queryString}` : `${this.endpoints.adminReports}/${reportType}`;
        return this.request(endpoint);
    }

    // Notification methods
    async getNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${this.endpoints.notifications}?${queryString}` : this.endpoints.notifications;
        return this.request(endpoint);
    }

    async markNotificationRead(notificationId) {
        return this.request(`${this.endpoints.notifications}/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    async getNotificationSettings() {
        return this.request(this.endpoints.notificationSettings);
    }

    async updateNotificationSettings(settings) {
        return this.request(this.endpoints.notificationSettings, {
            method: 'PUT',
            body: settings
        });
    }

    // File management methods
    async uploadFile(file, folder = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        return this.request(this.endpoints.fileUpload, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set content-type for FormData
        });
    }

    async downloadFile(fileId) {
        return this.request(`${this.endpoints.fileDownload}/${fileId}`);
    }

    async deleteFile(fileId) {
        return this.request(`${this.endpoints.fileDelete}/${fileId}`, {
            method: 'DELETE'
        });
    }

    // Utility methods
    async handleApiError(response) {
        if (!response.success) {
            // Handle specific error cases
            if (response.status === 401) {
                // Token expired, try to refresh
                const refreshResult = await this.refreshToken();
                if (refreshResult.success) {
                    // Retry original request
                    return this.request(response.endpoint, response.options);
                } else {
                    // Redirect to login
                    if (window.authManager) {
                        window.authManager.logout('Session expired. Please login again.');
                    }
                }
            }
            throw new Error(response.error || 'API request failed');
        }
        return response;
    }
}

// Initialize API config globally
window.apiConfig = new APIConfig();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
} 