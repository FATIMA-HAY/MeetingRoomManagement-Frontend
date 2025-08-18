// Client-side Router for Meeting Room Booking System
class Router {
    constructor() {
        this.routes = {
            'login': 'login.html',
            'dashboard': 'dashboard.html',
            'booking': 'booking.html',
            'meeting': 'meeting.html',
            'minutes': 'minutes.html',
            'admin': 'admin.html'
        };
        
        this.currentPage = null;
        this.init();
    }

    init() {
        // Check authentication status on page load
        this.checkAuthAndRedirect();
        
        // Set up logout functionality
        this.setupLogout();
        
        // Set up navigation highlighting
        this.setupNavigationHighlighting();
    }

    checkAuthAndRedirect() {
        const token = localStorage.getItem('authToken');
        const currentPage = this.getCurrentPageName();
        
        if (token) {
            // User is authenticated
            if (currentPage === 'login') {
                // Redirect from login to dashboard if already authenticated
                this.redirectTo('dashboard');
            }
            // Update user info display
            this.updateUserInfo();
        } else {
            // User is not authenticated
            if (currentPage !== 'login') {
                // Redirect to login if not authenticated and not on login page
                this.redirectTo('login');
            }
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === '' || filename === 'index.html') {
            return 'login'; // Default to login
        }
        
        // Extract page name from filename (e.g., 'dashboard.html' -> 'dashboard')
        return filename.replace('.html', '');
    }

    redirectTo(page) {
        if (this.routes[page]) {
            window.location.href = this.routes[page];
        } else {
            console.error(`Route not found: ${page}`);
        }
    }

    updateUserInfo() {
        const userInfo = this.getUserInfo();
        if (userInfo) {
            // Update all user name and role elements on the page
            const userNameElements = document.querySelectorAll('[id^="userName"]');
            const userRoleElements = document.querySelectorAll('[id^="userRole"]');
            
            userNameElements.forEach(element => {
                element.textContent = userInfo.name || 'User';
            });
            
            userRoleElements.forEach(element => {
                element.textContent = userInfo.role || 'User';
            });
        }
    }

    getUserInfo() {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    }

    setupLogout() {
        const logoutButtons = document.querySelectorAll('[id^="logoutBtn"]');
        
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    logout() {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        
        // Redirect to login page
        this.redirectTo('login');
    }

    setupNavigationHighlighting() {
        const currentPage = this.getCurrentPageName();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-screen');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Method to handle successful login
    handleSuccessfulLogin(userData) {
        // Store authentication data
        localStorage.setItem('authToken', userData.token || 'demo-token');
        localStorage.setItem('userInfo', JSON.stringify({
            name: userData.name || 'John Doe',
            role: userData.role || 'Manager',
            email: userData.email || 'user@example.com'
        }));
        
        // Also store the full user data for permissions
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect to dashboard
        this.redirectTo('dashboard');
    }

    // Method to check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }

    // Method to get current user's authentication token
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Method to navigate to a specific page programmatically
    navigateTo(page) {
        if (this.isAuthenticated()) {
            this.redirectTo(page);
        } else {
            this.redirectTo('login');
        }
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});

// Global navigation functions for use in HTML
function navigateTo(page) {
    if (window.router) {
        window.router.navigateTo(page);
    }
}

function logout() {
    if (window.router) {
        window.router.logout();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
} 