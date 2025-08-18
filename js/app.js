// Main Application JavaScript
class MeetingRoomApp {
    constructor() {
        this.currentScreen = 'login';
        this.currentUser = null;
        this.meetings = [];
        this.rooms = [];
        this.notifications = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
        this.setupNavigation();
    }

    bindEvents() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupGlobalEventListeners();
        });

        // Navigation events
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = e.currentTarget.dataset.screen;
                this.showScreen(screen);
            });
        });

        // Logout events
        document.querySelectorAll('[id^="logoutBtn"]').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
    }

    setupGlobalEventListeners() {
        // Password toggle functionality
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const icon = passwordToggle.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBooking();
            });
        }

        const minutesForm = document.getElementById('minutesForm');
        if (minutesForm) {
            minutesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMinutes();
            });
        }
    }

    setupNavigation() {
        // Update active navigation based on current screen
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Update navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.screen === screenName) {
                    link.classList.add('active');
                }
            });

            // Load screen-specific data
            this.loadScreenData(screenName);
        }
    }

    loadScreenData(screenName) {
        switch (screenName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'booking':
                this.loadBookingData();
                break;
            case 'minutes':
                this.loadMinutesData();
                break;
            case 'admin':
                this.loadAdminData();
                break;
        }
    }

    loadInitialData() {
        // Load mock data for demonstration
        this.meetings = [
            {
                id: 1,
                title: 'Team Standup Meeting',
                date: '2024-01-15',
                startTime: '09:00',
                duration: 60,
                room: 'Conference Room A',
                attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                status: 'upcoming'
            },
            {
                id: 2,
                title: 'Project Review',
                date: '2024-01-15',
                startTime: '14:00',
                duration: 120,
                room: 'Board Room',
                attendees: ['John Doe', 'Sarah Wilson', 'David Brown'],
                status: 'upcoming'
            }
        ];

        this.rooms = [
            { id: 'room1', name: 'Conference Room A', capacity: 10, status: 'available' },
            { id: 'room2', name: 'Conference Room B', capacity: 15, status: 'booked' },
            { id: 'room3', name: 'Board Room', capacity: 20, status: 'available' },
            { id: 'room4', name: 'Small Meeting Room', capacity: 6, status: 'maintenance' }
        ];

        this.notifications = [
            { id: 1, type: 'info', title: 'Meeting Reminder', message: 'Team Standup in 15 minutes', time: '5 min ago' },
            { id: 2, type: 'success', title: 'Booking Confirmed', message: 'Project Review confirmed for 2:00 PM', time: '1 hour ago' }
        ];
    }

    loadDashboardData() {
        this.updateUpcomingMeetings();
        this.updateRoomAvailability();
        this.updateNotifications();
    }

    loadBookingData() {
        this.updateAvailabilityCalendar();
    }

    loadMinutesData() {
        this.loadMinutesList();
    }

    loadAdminData() {
        this.loadRoomsList();
        this.loadAnalytics();
        this.loadUsersList();
    }

    updateUpcomingMeetings() {
        const container = document.getElementById('upcomingMeetingsList');
        if (!container) return;

        container.innerHTML = '';
        
        this.meetings.forEach(meeting => {
            const meetingElement = document.createElement('div');
            meetingElement.className = 'meeting-item';
            meetingElement.innerHTML = `
                <div class="meeting-time">${meeting.startTime}</div>
                <div class="meeting-title">${meeting.title}</div>
                <div class="meeting-room">${meeting.room}</div>
            `;
            container.appendChild(meetingElement);
        });
    }

    updateRoomAvailability() {
        const container = document.getElementById('availabilityGrid');
        if (!container) return;

        container.innerHTML = '';
        
        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = `room-slot ${room.status}`;
            roomElement.innerHTML = `
                <div class="room-name">${room.name}</div>
                <div class="room-capacity">${room.capacity} people</div>
                <div class="room-status">${room.status}</div>
            `;
            container.appendChild(roomElement);
        });
    }

    updateNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        container.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item ${notification.type}`;
            notificationElement.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            `;
            container.appendChild(notificationElement);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateAvailabilityCalendar() {
        const container = document.getElementById('availabilityCalendar');
        if (!container) return;

        // Generate calendar for next 7 days
        const today = new Date();
        container.innerHTML = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day ${i === 0 ? 'today' : ''}`;
            
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();
            
            dayElement.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-number">${dayNumber}</div>
            `;
            
            container.appendChild(dayElement);
        }
    }

    loadMinutesList() {
        const container = document.getElementById('minutesList');
        if (!container) return;

        // Mock minutes data
        const minutes = [
            { id: 1, title: 'Team Standup Meeting', date: '2024-01-14', status: 'finalized', attendees: 8, actionItems: 3 },
            { id: 2, title: 'Project Review', date: '2024-01-13', status: 'draft', attendees: 12, actionItems: 5 }
        ];

        container.innerHTML = '';
        minutes.forEach(minute => {
            const minuteElement = document.createElement('div');
            minuteElement.className = 'minutes-card';
            minuteElement.innerHTML = `
                <div class="minutes-card-header">
                    <div class="minutes-card-title">${minute.title}</div>
                    <div class="minutes-card-meta">${minute.date} • ${minute.attendees} attendees</div>
                </div>
                <div class="minutes-card-content">
                    <div class="action-items-summary">
                        <span class="action-item-tag ${minute.status}">${minute.status}</span>
                        <span>${minute.actionItems} action items</span>
                    </div>
                </div>
                <div class="minutes-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="editMinutes(${minute.id})">Edit</button>
                    <button class="btn btn-primary btn-sm" onclick="viewMinutes(${minute.id})">View</button>
                </div>
            `;
            container.appendChild(minuteElement);
        });
    }

    loadRoomsList() {
        const container = document.getElementById('roomsList');
        if (!container) return;

        container.innerHTML = '';
        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-card';
            roomElement.innerHTML = `
                <div class="room-info">
                    <div class="room-name">${room.name}</div>
                    <div class="room-details">Capacity: ${room.capacity} people</div>
                </div>
                <div class="room-status ${room.status}">${room.status}</div>
                <div class="room-actions">
                    <button class="btn btn-outline btn-sm" onclick="editRoom('${room.id}')">Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="toggleRoomStatus('${room.id}')">Toggle</button>
                </div>
            `;
            container.appendChild(roomElement);
        });
    }

    loadAnalytics() {
        // Update statistics
        const totalMeetings = document.getElementById('totalMeetings');
        const avgDuration = document.getElementById('avgDuration');
        const utilization = document.getElementById('utilization');

        if (totalMeetings) totalMeetings.textContent = this.meetings.length;
        if (avgDuration) avgDuration.textContent = '1.2h';
        if (utilization) utilization.textContent = '75%';
    }

    loadUsersList() {
        const container = document.getElementById('usersList');
        if (!container) return;

        // Mock users data
        const users = [
            { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Manager', status: 'active' },
            { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Developer', status: 'active' },
            { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Designer', status: 'inactive' }
        ];

        container.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-card';
            userElement.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-role">${user.role}</div>
                </div>
                <div class="user-status ${user.status}">${user.status}</div>
                <div class="user-actions">
                    <button class="btn btn-outline btn-sm" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="toggleUserStatus(${user.id})">Toggle</button>
                </div>
            `;
            container.appendChild(userElement);
        });
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Mock authentication
        if (email === 'admin@company.com' && password === 'password') {
            this.currentUser = {
                name: 'John Doe',
                email: email,
                role: 'Manager'
            };
            this.updateUserInfo();
            this.showScreen('dashboard');
            this.showSuccess('Login successful!');
        } else {
            this.showError('Invalid credentials');
        }
    }

    handleBooking() {
        const title = document.getElementById('meetingTitle').value;
        const date = document.getElementById('meetingDate').value;
        const startTime = document.getElementById('startTime').value;
        const duration = document.getElementById('duration').value;
        const room = document.getElementById('room').value;

        if (!title || !date || !startTime || !duration || !room) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Create new meeting
        const newMeeting = {
            id: Date.now(),
            title,
            date,
            startTime,
            duration: parseInt(duration),
            room: this.getRoomName(room),
            attendees: this.getAttendees(),
            status: 'upcoming'
        };

        this.meetings.push(newMeeting);
        this.showSuccess('Meeting booked successfully!');
        this.showScreen('dashboard');
    }

    handleMinutes() {
        // Handle minutes form submission
        this.showSuccess('Minutes saved successfully!');
    }

    getRoomName(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        return room ? room.name : 'Unknown Room';
    }

    getAttendees() {
        const attendeeTags = document.querySelectorAll('.attendee-tag .attendee-email');
        return Array.from(attendeeTags).map(tag => tag.textContent);
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        document.querySelectorAll('[id^="userName"]').forEach(element => {
            element.textContent = this.currentUser.name;
        });

        document.querySelectorAll('[id^="userRole"]').forEach(element => {
            element.textContent = this.currentUser.role;
        });
    }

    logout() {
        this.currentUser = null;
        this.showScreen('login');
        this.showInfo('Logged out successfully');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function showScreen(screenName) {
    if (window.app) {
        window.app.showScreen(screenName);
    }
}

function joinMeeting() {
    if (window.app) {
        window.app.showScreen('meeting');
    }
}

function openMinutes() {
    if (window.app) {
        window.app.showScreen('minutes');
    }
}

function shareScreen() {
    alert('Screen sharing functionality would be implemented here');
}

function inviteParticipant() {
    alert('Participant invitation functionality would be implemented here');
}

function joinZoom() {
    alert('Zoom integration would be implemented here');
}

function joinTeams() {
    alert('Teams integration would be implemented here');
}

function addAttendee() {
    alert('Add attendee functionality would be implemented here');
}

function addAgendaItem() {
    alert('Add agenda item functionality would be implemented here');
}

function addActionItem() {
    alert('Add action item functionality would be implemented here');
}

function saveDraft() {
    alert('Save draft functionality would be implemented here');
}

function editMinutes(id) {
    alert(`Edit minutes ${id} functionality would be implemented here`);
}

function viewMinutes(id) {
    alert(`View minutes ${id} functionality would be implemented here`);
}

function editRoom(id) {
    alert(`Edit room ${id} functionality would be implemented here`);
}

function toggleRoomStatus(id) {
    alert(`Toggle room status ${id} functionality would be implemented here`);
}

function editUser(id) {
    alert(`Edit user ${id} functionality would be implemented here`);
}

function toggleUserStatus(id) {
    alert(`Toggle user status ${id} functionality would be implemented here`);
}

function addRoom() {
    alert('Add room functionality would be implemented here');
}

function addUser() {
    alert('Add user functionality would be implemented here');
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MeetingRoomApp();
}); 