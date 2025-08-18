// Dashboard Module
class DashboardManager {
    constructor() {
        this.meetings = [];
        this.rooms = [];
        this.notifications = [];
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
        this.setupRealTimeUpdates();
    }

    setupEventListeners() {
        // Quick action buttons
        const scheduleMeetingBtn = document.querySelector('.quick-actions .btn-primary');
        if (scheduleMeetingBtn) {
            scheduleMeetingBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.showScreen('booking');
                }
            });
        }

        const joinNowBtn = document.querySelector('.quick-actions .btn-secondary');
        if (joinNowBtn) {
            joinNowBtn.addEventListener('click', () => {
                this.joinNextMeeting();
            });
        }

        const viewMinutesBtn = document.querySelector('.quick-actions .btn-outline');
        if (viewMinutesBtn) {
            viewMinutesBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.showScreen('minutes');
                }
            });
        }

        // Notification interactions
        this.setupNotificationInteractions();
    }

    setupNotificationInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notification = e.target.closest('.notification-item');
                this.handleNotificationClick(notification);
            }
        });
    }

    handleNotificationClick(notification) {
        const notificationId = notification.dataset.id;
        const notificationType = notification.querySelector('.notification-title').textContent;
        
        // Handle different notification types
        switch (notificationType) {
            case 'Meeting Reminder':
                this.showMeetingReminderModal(notificationId);
                break;
            case 'Booking Confirmed':
                this.showBookingDetails(notificationId);
                break;
            default:
                this.markNotificationAsRead(notificationId);
        }
    }

    showMeetingReminderModal(notificationId) {
        const meeting = this.meetings.find(m => m.id == notificationId);
        if (!meeting) return;

        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = 'Meeting Reminder';
            modalBody.innerHTML = `
                <div class="meeting-reminder">
                    <div class="meeting-info">
                        <h4>${meeting.title}</h4>
                        <p><i class="fas fa-clock"></i> ${meeting.startTime} - ${this.calculateEndTime(meeting.startTime, meeting.duration)}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${meeting.room}</p>
                        <p><i class="fas fa-users"></i> ${meeting.attendees.length} attendees</p>
                    </div>
                    <div class="reminder-actions">
                        <button class="btn btn-primary" onclick="joinMeetingNow(${meeting.id})">
                            <i class="fas fa-video"></i> Join Now
                        </button>
                        <button class="btn btn-outline" onclick="snoozeReminder(${meeting.id})">
                            <i class="fas fa-clock"></i> Snooze 5 min
                        </button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }
    }

    showBookingDetails(notificationId) {
        const meeting = this.meetings.find(m => m.id == notificationId);
        if (!meeting) return;

        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = 'Booking Confirmed';
            modalBody.innerHTML = `
                <div class="booking-confirmation">
                    <div class="confirmation-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="booking-details">
                        <h4>${meeting.title}</h4>
                        <p><i class="fas fa-calendar"></i> ${this.formatDate(meeting.date)}</p>
                        <p><i class="fas fa-clock"></i> ${meeting.startTime} - ${this.calculateEndTime(meeting.startTime, meeting.duration)}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${meeting.room}</p>
                        <p><i class="fas fa-users"></i> ${meeting.attendees.join(', ')}</p>
                    </div>
                    <div class="confirmation-actions">
                        <button class="btn btn-primary" onclick="addToCalendar(${meeting.id})">
                            <i class="fas fa-calendar-plus"></i> Add to Calendar
                        </button>
                        <button class="btn btn-outline" onclick="closeModal()">Close</button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }
    }

    markNotificationAsRead(notificationId) {
        const notification = document.querySelector(`[data-id="${notificationId}"]`);
        if (notification) {
            notification.classList.add('read');
            // Remove from notifications array
            this.notifications = this.notifications.filter(n => n.id != notificationId);
            this.updateNotifications();
        }
    }

    loadDashboardData() {
        this.loadMeetings();
        this.loadRooms();
        this.loadNotifications();
        this.updateDashboardStats();
    }

    loadMeetings() {
        // Mock data - in real app this would come from API
        this.meetings = [
            {
                id: 1,
                title: 'Team Standup Meeting',
                date: '2024-01-15',
                startTime: '09:00',
                duration: 60,
                room: 'Conference Room A',
                attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                status: 'upcoming',
                type: 'recurring'
            },
            {
                id: 2,
                title: 'Project Review',
                date: '2024-01-15',
                startTime: '14:00',
                duration: 120,
                room: 'Board Room',
                attendees: ['John Doe', 'Sarah Wilson', 'David Brown'],
                status: 'upcoming',
                type: 'one-time'
            },
            {
                id: 3,
                title: 'Client Presentation',
                date: '2024-01-16',
                startTime: '10:00',
                duration: 90,
                room: 'Conference Room B',
                attendees: ['John Doe', 'Marketing Team'],
                status: 'upcoming',
                type: 'one-time'
            }
        ];

        this.updateUpcomingMeetings();
    }

    loadRooms() {
        // Mock data - in real app this would come from API
        this.rooms = [
            { id: 'room1', name: 'Conference Room A', capacity: 10, status: 'available', equipment: ['Projector', 'Whiteboard', 'Video Conf'] },
            { id: 'room2', name: 'Conference Room B', capacity: 15, status: 'booked', equipment: ['Projector', 'Whiteboard', 'Video Conf'] },
            { id: 'room3', name: 'Board Room', capacity: 20, status: 'available', equipment: ['Projector', 'Whiteboard', 'Video Conf', 'Audio System'] },
            { id: 'room4', name: 'Small Meeting Room', capacity: 6, status: 'maintenance', equipment: ['Whiteboard'] }
        ];

        this.updateRoomAvailability();
    }

    loadNotifications() {
        // Mock data - in real app this would come from API
        this.notifications = [
            { 
                id: 1, 
                type: 'info', 
                title: 'Meeting Reminder', 
                message: 'Team Standup in 15 minutes', 
                time: '5 min ago',
                meetingId: 1,
                priority: 'high'
            },
            { 
                id: 2, 
                type: 'success', 
                title: 'Booking Confirmed', 
                message: 'Project Review confirmed for 2:00 PM', 
                time: '1 hour ago',
                meetingId: 2,
                priority: 'normal'
            },
            { 
                id: 3, 
                type: 'warning', 
                title: 'Room Maintenance', 
                message: 'Small Meeting Room under maintenance until 3:00 PM', 
                time: '2 hours ago',
                priority: 'normal'
            }
        ];

        this.updateNotifications();
    }

    updateUpcomingMeetings() {
        const container = document.getElementById('upcomingMeetingsList');
        if (!container) return;

        container.innerHTML = '';
        
        // Sort meetings by start time
        const sortedMeetings = this.meetings
            .filter(meeting => meeting.status === 'upcoming')
            .sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

        sortedMeetings.forEach(meeting => {
            const meetingElement = document.createElement('div');
            meetingElement.className = 'meeting-item';
            meetingElement.dataset.meetingId = meeting.id;
            
            const timeUntil = this.getTimeUntilMeeting(meeting.date, meeting.startTime);
            const timeClass = this.getTimeClass(timeUntil);
            
            meetingElement.innerHTML = `
                <div class="meeting-time ${timeClass}">
                    <div class="time">${meeting.startTime}</div>
                    <div class="time-until">${timeUntil}</div>
                </div>
                <div class="meeting-details">
                    <div class="meeting-title">${meeting.title}</div>
                    <div class="meeting-meta">
                        <span class="meeting-room"><i class="fas fa-map-marker-alt"></i> ${meeting.room}</span>
                        <span class="meeting-duration"><i class="fas fa-clock"></i> ${meeting.duration} min</span>
                        <span class="meeting-type ${meeting.type}"><i class="fas fa-${meeting.type === 'recurring' ? 'sync' : 'calendar'}"></i> ${meeting.type}</span>
                    </div>
                    <div class="meeting-attendees">
                        <i class="fas fa-users"></i> ${meeting.attendees.length} attendees
                    </div>
                </div>
                <div class="meeting-actions">
                    <button class="btn btn-sm btn-primary" onclick="joinMeeting(${meeting.id})">
                        <i class="fas fa-video"></i> Join
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="viewMeetingDetails(${meeting.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            `;
            
            container.appendChild(meetingElement);
        });

        // Add empty state if no meetings
        if (sortedMeetings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No upcoming meetings</p>
                    <button class="btn btn-primary" onclick="showScreen('booking')">
                        <i class="fas fa-plus"></i> Schedule Meeting
                    </button>
                </div>
            `;
        }
    }

    updateRoomAvailability() {
        const container = document.getElementById('availabilityGrid');
        if (!container) return;

        container.innerHTML = '';
        
        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = `room-slot ${room.status}`;
            roomElement.dataset.roomId = room.id;
            
            const availabilityInfo = this.getRoomAvailabilityInfo(room);
            
            roomElement.innerHTML = `
                <div class="room-header">
                    <div class="room-name">${room.name}</div>
                    <div class="room-status ${room.status}">${room.status}</div>
                </div>
                <div class="room-details">
                    <div class="room-capacity"><i class="fas fa-users"></i> ${room.capacity} people</div>
                    <div class="room-equipment">
                        ${room.equipment.map(item => `<span class="equipment-tag">${item}</span>`).join('')}
                    </div>
                </div>
                <div class="room-availability">
                    ${availabilityInfo}
                </div>
                <div class="room-actions">
                    <button class="btn btn-sm btn-primary" onclick="bookRoom('${room.id}')" ${room.status !== 'available' ? 'disabled' : ''}>
                        <i class="fas fa-calendar-plus"></i> Book
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="viewRoomDetails('${room.id}')">
                        <i class="fas fa-info-circle"></i> Info
                    </button>
                </div>
            `;
            
            container.appendChild(roomElement);
        });
    }

    updateNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;

        container.innerHTML = '';
        
        // Sort notifications by priority and time
        const sortedNotifications = this.notifications
            .sort((a, b) => {
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

        sortedNotifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item ${notification.type} ${notification.priority}`;
            notificationElement.dataset.id = notification.id;
            
            notificationElement.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-sm btn-outline" onclick="markNotificationRead(${notification.id})">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(notificationElement);
        });

        // Add empty state if no notifications
        if (sortedNotifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
        }
    }

    updateDashboardStats() {
        // Calculate dashboard statistics
        const totalMeetings = this.meetings.length;
        const todayMeetings = this.meetings.filter(m => m.date === this.getTodayDate()).length;
        const availableRooms = this.rooms.filter(r => r.status === 'available').length;
        const totalRooms = this.rooms.length;
        //const roomUtilization = ((totalRooms - availableRooms) / totalRooms * 100).toFixed(1);

        // Update stats display if elements exist
        const statsContainer = document.querySelector('.dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${totalMeetings}</div>
                        <div class="stat-label">Total Meetings</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${todayMeetings}</div>
                        <div class="stat-label">Today's Meetings</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-door-open"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${GetUpcomingMeeting}</div>
                        <div class="stat-label">Available Rooms</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${roomUtilization}%</div>
                        <div class="stat-label">Room Utilization</div>
                    </div>
                </div>
            `;
        }
    }

    getRoomAvailabilityInfo(room) {
        if (room.status === 'available') {
            return '<span class="availability-status available">Available Now</span>';
        } else if (room.status === 'booked') {
            const meeting = this.meetings.find(m => m.room === room.name);
            if (meeting) {
                return `<span class="availability-status booked">Booked until ${this.calculateEndTime(meeting.startTime, meeting.duration)}</span>`;
            }
            return '<span class="availability-status booked">Booked</span>';
        } else if (room.status === 'maintenance') {
            return '<span class="availability-status maintenance">Under Maintenance</span>';
        }
        return '';
    }

    getTimeUntilMeeting(date, startTime) {
        const now = new Date();
        const meetingTime = new Date(`${date} ${startTime}`);
        const diff = meetingTime - now;

        if (diff < 0) {
            return 'Started';
        } else if (diff < 60000) { // Less than 1 minute
            return 'Starting now';
        } else if (diff < 300000) { // Less than 5 minutes
            return 'Starting soon';
        } else if (diff < 900000) { // Less than 15 minutes
            const minutes = Math.floor(diff / 60000);
            return `In ${minutes} min`;
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `In ${minutes} min`;
        } else {
            const hours = Math.floor(diff / 3600000);
            return `In ${hours} hour${hours > 1 ? 's' : ''}`;
        }
    }

    getTimeClass(timeUntil) {
        if (timeUntil === 'Starting now' || timeUntil === 'Starting soon') {
            return 'urgent';
        } else if (timeUntil.includes('In') && timeUntil.includes('min')) {
            const minutes = parseInt(timeUntil.match(/\d+/)[0]);
            if (minutes <= 15) return 'warning';
        }
        return 'normal';
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

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    joinNextMeeting() {
        const now = new Date();
        const upcomingMeetings = this.meetings
            .filter(m => m.status === 'upcoming')
            .sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

        if (upcomingMeetings.length > 0) {
            const nextMeeting = upcomingMeetings[0];
            const meetingTime = new Date(`${nextMeeting.date} ${nextMeeting.startTime}`);
            
            if (meetingTime - now < 900000) { // Within 15 minutes
                this.joinMeeting(nextMeeting.id);
            } else {
                this.showInfo('No meetings starting soon. Schedule a meeting or wait for the next one.');
            }
        } else {
            this.showInfo('No upcoming meetings. Schedule a new meeting!');
        }
    }

    joinMeeting(meetingId) {
        if (window.app) {
            window.app.showScreen('meeting');
            // Pass meeting data to meeting screen
            window.currentMeeting = this.meetings.find(m => m.id === meetingId);
        }
    }

    startAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    }

    setupRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateTimeBasedElements();
        }, 60000); // Update every minute
    }

    updateTimeBasedElements() {
        // Update "time until" displays
        const meetingItems = document.querySelectorAll('.meeting-item');
        meetingItems.forEach(item => {
            const meetingId = item.dataset.meetingId;
            const meeting = this.meetings.find(m => m.id == meetingId);
            if (meeting) {
                const timeUntil = this.getTimeUntilMeeting(meeting.date, meeting.startTime);
                const timeElement = item.querySelector('.time-until');
                if (timeElement) {
                    timeElement.textContent = timeUntil;
                    timeElement.className = `time-until ${this.getTimeClass(timeUntil)}`;
                }
            }
        });
    }

    showInfo(message) {
        if (window.app) {
            window.app.showInfo(message);
        }
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Global functions for HTML onclick handlers
function joinMeetingNow(meetingId) {
    if (window.dashboardManager) {
        window.dashboardManager.joinMeeting(meetingId);
    }
    closeModal();
}

function snoozeReminder(meetingId) {
    // Snooze reminder for 5 minutes
    setTimeout(() => {
        if (window.dashboardManager) {
            window.dashboardManager.showMeetingReminderModal(meetingId);
        }
    }, 5 * 60 * 1000);
    closeModal();
}

function addToCalendar(meetingId) {
    // Add meeting to calendar (would integrate with Google Calendar, Outlook, etc.)
    alert('Meeting added to calendar!');
    closeModal();
}

function bookRoom(roomId) {
    if (window.app) {
        window.app.showScreen('booking');
        // Pre-select the room
        const roomSelect = document.getElementById('room');
        if (roomSelect) {
            roomSelect.value = roomId;
        }
    }
}

function viewRoomDetails(roomId) {
    const room = window.dashboardManager?.rooms.find(r => r.id === roomId);
    if (room) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = room.name;
            modalBody.innerHTML = `
                <div class="room-details-modal">
                    <div class="room-info">
                        <p><strong>Capacity:</strong> ${room.capacity} people</p>
                        <p><strong>Status:</strong> <span class="status ${room.status}">${room.status}</span></p>
                        <p><strong>Equipment:</strong></p>
                        <div class="equipment-list">
                            ${room.equipment.map(item => `<span class="equipment-tag">${item}</span>`).join('')}
                        </div>
                    </div>
                    <div class="room-actions">
                        <button class="btn btn-primary" onclick="bookRoom('${room.id}')" ${room.status !== 'available' ? 'disabled' : ''}>
                            <i class="fas fa-calendar-plus"></i> Book Room
                        </button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }
    }
}

function viewMeetingDetails(meetingId) {
    const meeting = window.dashboardManager?.meetings.find(m => m.id == meetingId);
    if (meeting) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = meeting.title;
            modalBody.innerHTML = `
                <div class="meeting-details-modal">
                    <div class="meeting-info">
                        <p><strong>Date:</strong> ${window.dashboardManager.formatDate(meeting.date)}</p>
                        <p><strong>Time:</strong> ${meeting.startTime} - ${window.dashboardManager.calculateEndTime(meeting.startTime, meeting.duration)}</p>
                        <p><strong>Room:</strong> ${meeting.room}</p>
                        <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
                        <p><strong>Type:</strong> ${meeting.type}</p>
                        <p><strong>Attendees:</strong></p>
                        <div class="attendees-list">
                            ${meeting.attendees.map(attendee => `<span class="attendee-tag">${attendee}</span>`).join('')}
                        </div>
                    </div>
                    <div class="meeting-actions">
                        <button class="btn btn-primary" onclick="joinMeeting(${meeting.id})">
                            <i class="fas fa-video"></i> Join Meeting
                        </button>
                        <button class="btn btn-outline" onclick="editMeeting(${meeting.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
            modal.classList.add('active');
        }
    }
}

function editMeeting(meetingId) {
    // Navigate to booking screen with meeting data
    if (window.app) {
        window.app.showScreen('booking');
        // TODO: Populate form with meeting data
    }
    closeModal();
}

function markNotificationRead(notificationId) {
    if (window.dashboardManager) {
        window.dashboardManager.markNotificationAsRead(notificationId);
    }
}

// Modal functions
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
}); 