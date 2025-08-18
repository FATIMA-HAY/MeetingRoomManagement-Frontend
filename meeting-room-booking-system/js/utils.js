// Utility Functions for Meeting Room Booking System
class Utils {
    constructor() {
        this.dateFormats = {
            short: 'MM/DD/YYYY',
            long: 'MMMM DD, YYYY',
            iso: 'YYYY-MM-DD',
            time: 'HH:mm',
            datetime: 'MM/DD/YYYY HH:mm'
        };
        
        this.timeSlots = this.generateTimeSlots();
        this.init();
    }

    init() {
        this.setupGlobalFunctions();
    }

    setupGlobalFunctions() {
        // Make utility functions globally available
        window.formatDate = this.formatDate.bind(this);
        window.formatTime = this.formatTime.bind(this);
        window.validateEmail = this.validateEmail.bind(this);
        window.validatePhone = this.validatePhone.bind(this);
        window.generateTimeSlots = this.generateTimeSlots.bind(this);
        window.calculateDuration = this.calculateDuration.bind(this);
        window.isTimeConflict = this.isTimeConflict.bind(this);
        window.debounce = this.debounce.bind(this);
        window.throttle = this.throttle.bind(this);
        window.showNotification = this.showNotification.bind(this);
        window.hideNotification = this.hideNotification.bind(this);
        window.exportToCSV = this.exportToCSV.bind(this);
        window.exportToPDF = this.exportToPDF.bind(this);
        window.generateUUID = this.generateUUID.bind(this);
        window.formatFileSize = this.formatFileSize.bind(this);
        window.sanitizeHTML = this.sanitizeHTML.bind(this);
        window.parseQueryParams = this.parseQueryParams.bind(this);
        window.setQueryParam = this.setQueryParam.bind(this);
        window.removeQueryParam = this.removeQueryParam.bind(this);
    }

    // Date and Time Utilities
    formatDate(date, format = 'short') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        const hours = d.getHours();
        const minutes = d.getMinutes();

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthNamesShort = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        switch (format) {
            case 'short':
                return `${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
            case 'long':
                return `${monthNames[month]} ${day}, ${year}`;
            case 'iso':
                return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            case 'time':
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            case 'datetime':
                return `${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            case 'relative':
                return this.getRelativeTime(d);
            default:
                return d.toLocaleDateString();
        }
    }

    formatTime(time, format = '24h') {
        if (!time) return '';
        
        let d;
        if (typeof time === 'string') {
            d = new Date(`2000-01-01T${time}`);
        } else {
            d = new Date(time);
        }

        if (isNaN(d.getTime())) return '';

        const hours = d.getHours();
        const minutes = d.getMinutes();

        if (format === '12h') {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }

    getRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return this.formatDate(date, 'short');
        }
    }

    generateTimeSlots(interval = 30, startTime = '08:00', endTime = '18:00') {
        const slots = [];
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);

        for (let time = start; time <= end; time += interval) {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        }

        return slots;
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    calculateDuration(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        return end - start;
    }

    addMinutes(timeString, minutes) {
        const totalMinutes = this.parseTime(timeString) + minutes;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    isTimeConflict(start1, end1, start2, end2) {
        const s1 = this.parseTime(start1);
        const e1 = this.parseTime(end1);
        const s2 = this.parseTime(start2);
        const e2 = this.parseTime(end2);

        return (s1 < e2 && s2 < e1);
    }

    isDateInPast(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    }

    isDateInFuture(date, days = 0) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const checkDate = new Date(date);
        return checkDate > futureDate;
    }

    getWeekDays(startDate = new Date()) {
        const week = [];
        const start = new Date(startDate);
        start.setDate(start.getDate() - start.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            week.push(day);
        }

        return week;
    }

    getMonthDays(year, month) {
        const days = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }

        return days;
    }

    // Validation Utilities
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    validateDate(date) {
        const d = new Date(date);
        return !isNaN(d.getTime());
    }

    validateTime(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    validateLength(value, min, max) {
        const length = value ? value.toString().length : 0;
        return length >= min && length <= max;
    }

    validateNumber(value, min = null, max = null) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }

    // Performance Utilities
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Notification Utilities
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        this.hideNotification();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="hideNotification()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => this.hideNotification(), duration);
        }
    }

    hideNotification() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    // Export Utilities
    exportToCSV(data, filename = 'export.csv') {
        if (!Array.isArray(data) || data.length === 0) {
            this.showNotification('No data to export', 'error');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    exportToPDF(elementId, filename = 'export.pdf') {
        // This is a placeholder for PDF export functionality
        // In a real app, you would use a library like jsPDF or html2pdf
        this.showNotification('PDF export functionality would be implemented here', 'info');
    }

    // Utility Functions
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    parseQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');

        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            if (pair[0]) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }

        return params;
    }

    setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    }

    removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    }

    // Local Storage Utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    clearLocalStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Array and Object Utilities
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            // Handle date strings
            if (this.isDateString(aVal) && this.isDateString(bVal)) {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                const itemValue = item[key];

                if (filterValue === null || filterValue === undefined || filterValue === '') {
                    return true;
                }

                if (typeof filterValue === 'string') {
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                }

                if (typeof filterValue === 'number') {
                    return itemValue === filterValue;
                }

                if (Array.isArray(filterValue)) {
                    return filterValue.includes(itemValue);
                }

                return itemValue === filterValue;
            });
        });
    }

    isDateString(str) {
        if (typeof str !== 'string') return false;
        const date = new Date(str);
        return !isNaN(date.getTime());
    }

    // String Utilities
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    truncate(str, length = 100, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    }

    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Number Utilities
    formatNumber(num, decimals = 2) {
        if (isNaN(num)) return '0';
        return parseFloat(num).toFixed(decimals);
    }

    formatCurrency(amount, currency = 'USD') {
        if (isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatPercentage(value, decimals = 1) {
        if (isNaN(value)) return '0%';
        return `${parseFloat(value).toFixed(decimals)}%`;
    }

    // Color Utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Random Utilities
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    randomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Initialize utilities when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.utils = new Utils();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} 