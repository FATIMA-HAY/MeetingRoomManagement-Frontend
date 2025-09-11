// auth.js
// Authentication Module with Enhanced Validation and API Integration

(function () {
    'use strict';

    class AuthManager {
        constructor() {
            this.currentUser = null;
            this.isAuthenticated = false;
            this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
            this.sessionTimer = null;
            this.isSubmitting = false;
            this.init();
        }

        init() {
            this.checkExistingSession();
            this.setupEventListeners();
            this.setupSessionMonitoring();
        }

        setupEventListeners() {
            // Login form submission
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.handleLoginSubmit();
                });
            }

            // Real-time validation
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (emailInput) {
                emailInput.addEventListener('blur', () => this.validateField('email', emailInput.value));
                emailInput.addEventListener('input', () => this.clearFieldError('email'));
                emailInput.addEventListener('focus', () => this.clearFieldError('email'));
            }

            if (passwordInput) {
                passwordInput.addEventListener('blur', () => this.validateField('password', passwordInput.value));
                passwordInput.addEventListener('input', () => this.clearFieldError('password'));
                passwordInput.addEventListener('focus', () => this.clearFieldError('password'));
            }

            // Password toggle
            const passwordToggle = document.getElementById('passwordToggle');
            if (passwordToggle) {
                passwordToggle.addEventListener('click', () => {
                    const passwordInputEl = document.getElementById('password');
                    if (!passwordInputEl) return;
                    if (passwordInputEl.type === 'password') {
                        passwordInputEl.type = 'text';
                        passwordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    } else {
                        passwordInputEl.type = 'password';
                        passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                });
            }

            // Forgot password
           /*const forgotPasswordLink = document.querySelector('.forgot-password');
            if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener('click', (e) => {
                    window.open("ForgotPassword.html")
                });
            }*/
        }

        async handleLoginSubmit() {
            if (this.isSubmitting) return;

            const email = (document.getElementById('email')?.value || '').trim();
            const password = document.getElementById('password')?.value || '';

            // Clear previous errors
            this.clearAllErrors();

            // Validate form
            if (!this.validateForm(email, password)) {
                return;
            }

            // Submit form
            await this.login(email, password);
        }

        validateForm(email, password) {
            let isValid = true;

            // Validate email
            if (!this.validateField('email', email)) {
                isValid = false;
            }

            // Validate password
            if (!this.validateField('password', password)) {
                isValid = false;
            }

            return isValid;
        }

        validateField(fieldName, value) {
            const input = document.getElementById(fieldName);
            const errorElement = document.getElementById(`${fieldName}Error`);
            const helperElement = document.getElementById(`${fieldName}Helper`);

            if (!input || !errorElement) return false;

            let isValid = true;
            let errorMessage = '';

            switch (fieldName) {
                case 'email':
                    if (!value) {
                        errorMessage = 'Email address is required';
                        isValid = false;
                    } else if (!this.isValidEmail(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    }
                    break;

                case 'password':
                    if (!value) {
                        errorMessage = 'Password is required';
                        isValid = false;
                    }
                    // If you want a minimum length, uncomment:
                    // else if (value.length < 6) {
                    //     errorMessage = 'Password must be at least 6 characters long';
                    //     isValid = false;
                    // }
                    break;
            }

            if (!isValid) {
                this.showFieldError(fieldName, errorMessage);
                input.classList.add('error');
                if (helperElement) helperElement.style.display = 'none';
            } else {
                this.clearFieldError(fieldName);
                input.classList.remove('error', 'success');
                if (helperElement) helperElement.style.display = 'block';
            }

            return isValid;
        }

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        showFieldError(fieldName, message) {
            const errorElement = document.getElementById(`${fieldName}Error`);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        }

        clearFieldError(fieldName) {
            const errorElement = document.getElementById(`${fieldName}Error`);
            const input = document.getElementById(fieldName);
            const helperElement = document.getElementById(`${fieldName}Helper`);

            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }

            if (input) {
                input.classList.remove('error', 'success');
            }

            if (helperElement) {
                helperElement.style.display = 'block';
            }
        }

        clearAllErrors() {
            const fields = ['email', 'password'];
            fields.forEach(field => this.clearFieldError(field));
        }

        async login(email, password) {
            if (this.isSubmitting) return false;

            try {
                this.setSubmittingState(true);

                // Call API
                const response = await this.callLoginAPI(email, password);

                if (response.success) {
                    // Handle successful login
                    this.currentUser = response.user;
                    this.isAuthenticated = true;
                    this.createSession(response.user);
                    this.startSessionTimer();
                    this.updateUIForAuthenticatedUser();

                    // Show success message
                    this.showToast('Login successful!', 'success');

                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        if (window.router && typeof window.router.handleSuccessfulLogin === 'function') {
                            window.router.handleSuccessfulLogin(response.user);
                        }
                    }, 800);

                    return true;
                } else {
                    // Handle API error
                    this.showToast(response.message || 'Login failed. Please try again.', 'error');
                    return false;
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showToast('An error occurred during login. Please try again.', 'error');
                return false;
            } finally {
                this.setSubmittingState(false);
            }
        }

        // === THE IMPORTANT PART: CALLS YOUR BACKEND /api/Authentication/login ===
        async callLoginAPI(email, password) {
            // Use global APIConfig if available, else fallback to your dev URL
            const url =
                (window.APIConfig && window.APIConfig.endpoints && window.APIConfig.endpoints.login)
                    ? window.APIConfig.endpoints.login
                    : 'https://localhost:7209/api/Authentication/login';

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain'
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) { 
                let msg = '';
                try {
                    const errJson = await res.json();
                    msg = errJson?.message || '';
                } catch {
                    try { msg = await res.text(); } catch {  }
                }
                return { success: false, message: msg || `Login failed (${res.status})` };
            } 

            const ct = res.headers.get('content-type') || '';
            let data;
            if (ct.includes('application/json')) {
                data = await res.json();
                console.log(data);
            } else {
                const txt = await res.text();
                try { data = JSON.parse(txt); } catch { data = { token: txt }; }
            }
 
            if(!data.success){
                return { success: false, message: data.message };
            }
            const token =data.token;
            //store the token in local storage.
            if(token){
                localStorage.setItem("authToken",token);
                console.log("token stored in localStorage")
            } else{
                console.log("Login successful, but no token found in response");
            }
            const srcUser = data.user || data?.data?.user || data;

            const firstName =
                srcUser?.firstname || srcUser?.firstName || data.firstname || data.firstName || '';

            const roleName =
                (srcUser?.role && (srcUser.role.name || srcUser.role.nameRole)) ||
                data.roleName || data?.role?.name || data?.role?.nameRole || '';

             
            const user = {
                id: srcUser?.id ?? null,
                firstName,
                lastName: srcUser?.lastname || srcUser?.lastName || '',
                email: srcUser?.email || email,
                role: roleName,
                name: [firstName, (srcUser?.lastname || srcUser?.lastName || '')].filter(Boolean).join(' '),
                permissions: srcUser?.permissions || [],
                token
            };

            return { success: true, user };
        }

        setSubmittingState(submitting) {
            this.isSubmitting = submitting;
            const submitBtn = document.getElementById('loginSubmitBtn');

            if (submitBtn) {
                if (submitting) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                } else {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            }
        }

        showToast(message, type = 'info', duration = 5000) {
            // Ensure container exists
            let container = document.getElementById('toastContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toastContainer';
                container.style.position = 'fixed';
                container.style.top = '20px';
                container.style.right = '20px';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.style.minWidth = '280px';
            toast.style.marginBottom = '10px';
            toast.style.padding = '12px 14px';
            toast.style.borderRadius = '10px';
            toast.style.boxShadow = '0 6px 24px rgba(0,0,0,.08)';
            toast.style.background = '#fff';
            toast.style.borderLeft = type === 'success' ? '4px solid #22c55e'
                : type === 'error' ? '4px solid #ef4444'
                    : type === 'warning' ? '4px solid #f59e0b'
                        : '4px solid #3b82f6';

            toast.innerHTML = `
                <div class="toast-header" style="display:flex;align-items:center;justify-content:space-between;font-weight:600;margin-bottom:6px;">
                    <span class="toast-title">${this.getToastTitle(type)}</span>
                    <button class="toast-close" style="all:unset;cursor:pointer;font-size:14px;opacity:.6;">✕</button>
                </div>
                <div class="toast-message" style="font-size:14px;">${message}</div>
            `;

            toast.querySelector('.toast-close')?.addEventListener('click', () => {
                toast.remove();
            });

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(10px)';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        getToastTitle(type) {
            switch (type) {
                case 'success': return 'Success';
                case 'error': return 'Error';
                case 'warning': return 'Warning';
                case 'info': return 'Information';
                default: return 'Notification';
            }
        }

        setupSessionMonitoring() {
            // Monitor user activity
            ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, () => this.resetSessionTimer(), true);
            });

            // Check session validity periodically
            setInterval(() => this.checkSessionValidity(), 60000); // Every minute
        }

        checkExistingSession() {
            const token = localStorage.getItem('authToken');
            const userInfo = localStorage.getItem('userInfo');

            if (token && userInfo) {
                try {
                    const user = JSON.parse(userInfo);
                    const tokenExpiry = localStorage.getItem('tokenExpiry');

                    if (tokenExpiry && Date.now() < parseInt(tokenExpiry, 10)) {
                        this.currentUser = user;
                        this.isAuthenticated = true;
                        this.startSessionTimer();
                        this.updateUIForAuthenticatedUser();
                        return true;
                    } else {
                        this.clearSession();
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    this.clearSession();
                }
            }
            return false;
        }

        createSession(user) {
            const token = user.token || this.generateToken();
            const expiry = Date.now() + this.sessionTimeout;

            localStorage.setItem('authToken', token);
            localStorage.setItem('firstName', user.firstName || '');
            localStorage.setItem('roleName', user.role || '');
            localStorage.setItem('userInfo', JSON.stringify(user));
            localStorage.setItem('tokenExpiry', expiry.toString());
            localStorage.setItem('loginTime', Date.now().toString());
        }

        generateToken() {
            return 'token_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
        }

        startSessionTimer() {
            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
            }

            this.sessionTimer = setTimeout(() => {
                this.logout('Session expired due to inactivity');
            }, this.sessionTimeout);
        }

        resetSessionTimer() {
            if (this.isAuthenticated) {
                this.startSessionTimer();
            }
        }

        checkSessionValidity() {
            if (!this.isAuthenticated) return;

            const tokenExpiry = localStorage.getItem('tokenExpiry');
            if (tokenExpiry && Date.now() >= parseInt(tokenExpiry, 10)) {
                this.logout('Session expired');
            }
        }

        logout(reason = 'User logged out') {
            this.currentUser = null;
            this.isAuthenticated = false;

            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
                this.sessionTimer = null;
            }

            this.clearSession();
            this.updateUIForLoggedOutUser();

            if (reason !== 'User logged out') {
                this.showToast(reason, 'warning');
            }

            if (window.router && typeof window.router.logout === 'function') {
                setTimeout(() => window.router.logout(), 600);
            }
        }

        clearSession() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('firstName');
            localStorage.removeItem('roleName');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('loginTime');
        }

        updateUIForAuthenticatedUser() {
            this.updateUserInfoAcrossScreens();
            this.clearLoginForm();
        }

        updateUIForLoggedOutUser() {
            this.clearLoginForm();
        }

        updateUserInfoAcrossScreens() {
            if (!this.currentUser) return;

            // Update user name and role in all navigation bars
            document.querySelectorAll('[id^="userName"]').forEach(el => {
                el.textContent = this.currentUser.name || this.currentUser.firstName || '';
            });

            document.querySelectorAll('[id^="userRole"]').forEach(el => {
                el.textContent = this.currentUser.role || '';
            });

            // Update navigation permissions
            this.updateNavigationPermissions();
        }

        updateNavigationPermissions() {
            if (!this.currentUser || !this.currentUser.permissions) return;

            const navItems = {
                'dashboard': document.querySelectorAll('[data-screen="dashboard"]'),
                'booking': document.querySelectorAll('[data-screen="booking"]'),
                'minutes': document.querySelectorAll('[data-screen="minutes"]'),
                'admin': document.querySelectorAll('[data-screen="admin"]')
            };

            Object.entries(navItems).forEach(([permission, elements]) => {
                elements.forEach(element => {
                    element.style.display = this.currentUser.permissions.includes(permission) ? 'block' : 'none';
                });
            });
        }

        clearLoginForm() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.reset();
            }

            // Clear error messages and reset input states
            this.clearAllErrors();

            // Reset input classes
            const inputs = loginForm?.querySelectorAll('.input-field');
            if (inputs) {
                inputs.forEach(input => input.classList.remove('error', 'success'));
            }
        }

        showForgotPasswordModal() {
            this.showToast('Password reset functionality would be implemented here', 'info');
        }

        // Public methods for external access
        getCurrentUser() {
            return this.currentUser;
        }

        isUserAuthenticated() {
            return this.isAuthenticated;
        }

        hasPermission(permission) {
            return !!(this.currentUser && this.currentUser.permissions && this.currentUser.permissions.includes(permission));
        }

        refreshSession() {
            if (this.isAuthenticated) {
                this.startSessionTimer();
            }
        }
    }
  /* async function ResetPassword() {
            const apiUrl='https://localhost:7209/api/Authentication/ForgotPassword'
            const email=document.getElementById("ResetEmail");
            const password=document.getElementById("ResetPassword");
            const pass2=document.getElementById("ConfirmResetPassword");
            try{
                const res=fetch(apiUrl,{
                    method:'PUT',
                    headers:{
                        'Content-Type':'application/json',
                      },
                    body:JSON.stringify(email,password,pass2)
            })
                if(!res.ok)throw new error("Failed");
                else{
                    console.log("Your password has changes successfully!");
                    alert("Your password has changes successfully!");
                    this.showToast('Login successful!', 'success');
                }
            }catch(error){
                throw new error(error);
            }
            window.close();
    }
   // document.getElementById("ForgotPassBtn").addEventListener("click",Rese);
    // Initialize auth manager when DOM is loaded
    document.getElementById("ForgotPassBtn").addEventListener("click",function(){
        ResetPassword();
    })*/
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthManager();
    });
})();
