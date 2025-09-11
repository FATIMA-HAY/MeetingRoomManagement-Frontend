// Dashboard Module with Real API Integration
class DashboardManager {
    constructor() {
        this.meetings = [];
        this.rooms = [];
        this.notifications = [];
        this.refreshInterval = null;
        this.isLoading = false;
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
                window.location.href = 'booking.html';
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
                window.location.href = 'minutes.html';
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.authManager) {
                    window.authManager.logout();
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
                        <p><i class="fas fa-users"></i> ${meeting.attendees.length} attendees</p>
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

    async markNotificationAsRead(notificationId) {
        try {
            if (window.apiConfig) {
                await window.apiConfig.markNotificationRead(notificationId);
            }
            
            const notification = document.querySelector(`[data-id="${notificationId}"]`);
            if (notification) {
                notification.classList.add('read');
                // Remove from notifications array
                this.notifications = this.notifications.filter(n => n.id != notificationId);
                this.updateNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            this.showToast('Failed to mark notification as read', 'error');
        }
    }

    async loadDashboardData() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoadingState(true);
            
            await Promise.all([
                this.loadMeetings(),
                this.loadRooms(),
                this.loadNotifications()
            ]);
            
            this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Failed to load dashboard data', 'error');
        } finally {
            this.isLoading = false;
            this.showLoadingState(false);
        }
    }
    async loadMeetings() {
        try {
                const response= await GetUpcomingMeeting();
                if (response.success) {
                      this.meetings = response.upcomingMeeting;
                      console.log("Meetings:",this.meetings);
                } else {
                 // Assume it's a single object and wrap it in an array
                 // to make it consistent with the rest of your code (e.g., `forEach`).
                    throw new error("Api response is not in the expected format or is empty")
                    // this.meetings = [response];
                }
        } catch (error) {
            console.error('Error loading meetings:', error);
            this.meetings=[];
        }
        this.updateUpcomingMeetings(this.meetings);
        const meetings= await LastWeekMeeting();
        this.updateLastWeekMeeting(meetings);
    }

    async loadRooms() {
        try {
                const response=await getRoomAvailability();   
                if(response.success){
                    this.rooms=response.rooms;
                }else{
                    throw new error("Api response is not in the expected format or is empty");
                }
            }
        catch (error) {
            console.error('Error loading rooms:', error);
            
        }
        this.updateRoomAvailability(this.rooms);
    }

    loadMockRooms() {
        // Fallback mock data
        this.rooms = [
            { id: 'room1', name: 'Conference Room A', capacity: 10, status: 'available', equipment: ['Projector', 'Whiteboard', 'Video Conf'] },
            { id: 'room2', name: 'Conference Room B', capacity: 15, status: 'booked', equipment: ['Projector', 'Whiteboard', 'Video Conf'] },
            { id: 'room3', name: 'Board Room', capacity: 20, status: 'available', equipment: ['Projector', 'Whiteboard', 'Video Conf', 'Audio System'] },
            { id: 'room4', name: 'Small Meeting Room', capacity: 6, status: 'maintenance', equipment: ['Whiteboard'] }
        ];
    }

    async loadNotifications() {
        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.getNotifications({
                    limit: 10,
                    unreadOnly: true
                });
                
                if (response.success) {
                    this.notifications = response.data || [];
                } else {
                    throw new Error(response.error || 'Failed to load notifications');
                }
            } else {
                // Fallback to mock data
                this.loadMockNotifications();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Fallback to mock data
            this.loadMockNotifications();
        }

        this.updateNotifications();
    }

    loadMockNotifications() {
        // Fallback mock data
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
            }
        ];
    }

    updateUpcomingMeetings(meeting) {
        const container = document.getElementById('upcomingMeetingsList');
        //console.log(meeting)
        if (!container) return;
        const startTime = new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTime = new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        container.innerHTML = '';
         // Add empty state if no meetings
        if(meeting.length==0){
            container.textContent="No Upcoming Meeting";
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No upcoming meetings</p>
                    <button class="btn btn-primary" onclick="window.location.href='booking.html'">
                        <i class="fas fa-plus"></i> Schedule Meeting
                    </button>
                </div>
            `;
            return;
        }
        meeting.forEach( meeting => {
            const meetingElement = document.createElement('div');
            meetingElement.className = 'meeting-item';
           // meetingElement.dataset.meetingId = meeting.id;
            const timeUntil = this.getTimeUntilMeeting(meeting.date, startTime);
            const timeClass = this.getTimeClass(timeUntil);
            const [datePart1,timePart1]=meeting.startTime.split('T');
            const [datePart2,timePart2]=meeting.endTime.split('T');
            meetingElement.innerHTML = `
                <div class="meeting-time">
                    <div claas="time">${datePart1}</div>
                    <div class="time">${timePart1.slice(0,5)}</div>
                    <div class="time">${timePart2.slice(0,5)}</div>
                </div>
                <div class="meeting-details">
                    <div class="meeting-title">${meeting.title}</div>
                    <div class="meeting-meta">
                        <span class="meeting-room"><i class="fas fa-map-marker-alt"></i> ${meeting.roomId}</span>
                    </div>
                </div>
                <div class="meeting-actions">
                    <button class="btn btn-sm btn-primary" onclick="joinMeeting(${meeting.id})">
                        <i class="fas fa-video"></i> Join
                    </button>
                    <button id="CancelMeetingBtn" class="btn btn-sm btn-outline" onclick="CancelMeeting(meeting.id)">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
                
            `;
            
            container.appendChild(meetingElement);
        });        
    }
    updateLastWeekMeeting(meeting){
        const container=document.getElementById("LastWeekMeetingsList");
        if(!container)return;
        container.innerHTML = '';
        if(meeting.length==0){
            container.textContent="No Upcoming Meeting";
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa fa-times"></i>
                    <p>No meetings Last Week</p>
                </div>
            `;
            return;
        }
         meeting.forEach( meeting => {
            const [DatePart,TimePart]=meeting.startTime.split("T");
            const meetingElement = document.createElement('div');
            meetingElement.className = 'meeting-item';
            meetingElement.innerHTML = `
                <div class="meeting-time">
                    <div class="time">${DatePart}</div>
                </div>
                <div class="meeting-details">
                    <div class="meeting-title">${meeting.title}</div>
                </div>
            `;
            
            container.appendChild(meetingElement);
        });        
    }

    updateRoomAvailability(rooms) {
        const container = document.getElementById('availabilityGrid');
        if (!container) return;
        container.innerHTML = '';
        //console.log("Room Status:",rooms[0].roomStatus);
        rooms.forEach( room => {
            const availabilityInfo = this.getRoomAvailabilityInfo(room);
            console.log(availabilityInfo);
            const roomElement = document.createElement('div');
            roomElement.className = `room-slot ${room.roomStatus}`;
            //roomElement.dataset.roomId = room.id;
            let roomFeaturesHtml = 'No specific features listed.';
            if (room.features) {
                const featuresArray = [];
                for (const featureKey in room.features) {
                    // تأكد أن الـ property هو خاص بالـ object وليس من الـ prototype chain
                    if (room.features.hasOwnProperty(featureKey) && room.features[featureKey] === true) {
                        // Capitalize the first letter for display (e.g., "projector" -> "Projector")
                        featuresArray.push(`<span class="equipment-tag">${featureKey.charAt(0).toUpperCase() + featureKey.slice(1)}</span>`);
                    }
                }
                if (featuresArray.length > 0) {
                    roomFeaturesHtml = featuresArray.join('');
                }
            }
            console.log(room);
            roomElement.innerHTML = `
                <div class="room-header"> 
                    <div class="room-name">${room.name}</div>
                    <div class="room-status ${room.roomStatus}">${room.roomStatus}</div>
                </div>
                <div class="room-details">
                    <div class="room-capacity"><i class="fas fa-users"></i> ${room.capacity} people</div>
                    <div class="room-equipment">
                        <i class="fas fa-desktop"></i> Features: ${roomFeaturesHtml}
                    </div>
                    <div class="room-location">
                        <i class="fas fa-map-marker-alt"></i> Location: ${room.location}
                    </div>
                </div>
                <div class="room-availability">
                    ${availabilityInfo}
                </div>
                <div class="room-actions">
                    <button class="btn btn-sm btn-primary" onclick="bookRoom('${room.id}')" ${room.roomStatus !== 'Available' ? 'disabled' : ''}>
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

    async updateDashboardStats() {
        // Calculate dashboard statistics
        const totalMeetings =  GetTotalMeetings();
        const todayMeetings =  GetTodayMeetings();
        const availableRooms=  getAvialableRoom();
        const Mostusedroom=  MostUsedRoom();
        const totalRooms = this.rooms.length;

        // Update stats display if elements exist
        const statsContainer = document.querySelector('.dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <div id="TotalMeetings" class="stat-number">${totalMeetings}</div>
                        <div class="stat-label">Total Meetings</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-content">
                        <div id="TodayMeetings" class="stat-number">${todayMeetings}</div>
                        <div class="stat-label">Today's Meetings</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-content">
                        <div id="MostUsedRoom" class="stat-number">${Mostusedroom}</div>
                        <div class="stat-label">Most Used Room</div>
                    </div>
                </div>
            `;
        }
    }

    getRoomAvailabilityInfo(rooms) {
        if (rooms.roomStatus === 'Available') {
            return '<span class="availability-status available">Available Now</span>';
        } else if (rooms.roomStatus=== 'Booked') {
            const meeting =this.meetings.find(m => m.roomId === rooms.id);
             const [DatePart,TimePart]=meeting.endTime.split("T");
            if (meeting) {
            // Check if meeting.endTime exists and is a valid string
            if (meeting.endTime ) {
                const endTimeObject = new Date(meeting.endTime.trim()); // Create Date object from endTime string
                if (!isNaN(endTimeObject.getTime())) { // Validate the Date object
                    const formattedEndTime = endTimeObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    console.log(formattedEndTime);
                    return `<span class=\"availability-status booked\">Booked Now</span>`;
                } else {
                    console.warn(`Invalid meeting.endTime for meeting ID ${meeting.id}: '${meeting.endTime}'`);
                    return "<span class=\"availability-status booked\">Booked (Invalid End Time)</span>";
                }
            } else {
                console.warn(`meeting.endTime is missing or invalid for meeting ID ${meeting.id}`);
                return "<span class=\"availability-status booked\">Booked (End Time Missing)</span>";
            }
        }
            return "<span class=\"availability-status booked\">Booked</span>";
        } else if (room.roomStatus === 'maintenance') {
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

    async joinNextMeeting() {
        const now = new Date();
        const upcomingMeetings = this.meetings
            .filter(m => m.status === 'upcoming')
            .sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

        if (upcomingMeetings.length > 0) {
            const nextMeeting = upcomingMeetings[0];
            const meetingTime = new Date(`${nextMeeting.date} ${nextMeeting.startTime}`);
            
            if (meetingTime - now < 900000) { // Within 15 minutes
                await this.joinMeeting(nextMeeting.id);
            } else {
                this.showToast('No meetings starting soon. Schedule a meeting or wait for the next one.', 'info');
            }
        } else {
            this.showToast('No upcoming meetings. Schedule a new meeting!', 'info');
        }
    }

    async joinMeeting(meetingId) {
        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.joinMeeting(meetingId);
                if (response.success) {
                    // Navigate to meeting screen
                    window.location.href = `meeting.html?id=${meetingId}`;
                } else {
                    throw new Error(response.error || 'Failed to join meeting');
                }
            } else {
                // Fallback navigation
                window.location.href = `meeting.html?id=${meetingId}`;
            }
        } catch (error) {
            console.error('Error joining meeting:', error);
            this.showToast('Failed to join meeting. Please try again.', 'error');
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

    showLoadingState(show) {
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(element => {
            element.style.display = show ? 'block' : 'none';
        });
    }

    showToast(message, type = 'info', duration = 5000) {
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(message, type, duration);
        } else {
            // Fallback toast implementation
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

}//hun niheyet l class

// Global functions for HTML onclick handlers
async function joinMeetingNow(meetingId) {
    if (window.dashboardManager) {
        await window.dashboardManager.joinMeeting(meetingId);
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
    if (window.dashboardManager) {
        window.dashboardManager.showToast('Meeting added to calendar!', 'success');
    }
    closeModal();
}

function bookRoom(roomId) {
    window.location.href = `booking.html?room=${roomId}`;
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
    window.location.href = `booking.html?edit=${meetingId}`;
    closeModal();
}

async function markNotificationRead(notificationId) {
    if (window.dashboardManager) {
        await window.dashboardManager.markNotificationAsRead(notificationId);
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
async function GetTotalMeetings() {
    const authToken= localStorage.getItem("authToken");
    const apiUrl="https://localhost:7209/api/Bookings/Total-Meeting"
    try{
        const res=await fetch(apiUrl,{
            method: 'GET',
            headers: {
                'Authorization':`Bearer ${authToken}` ,
                'Content-Type' : 'application/json'
            }
        });
        if(!res.ok) throw new Error("Connecting failed or unauthorized access.");
        //la ne5ud l ra2em l raja3o l api 
        const count= await res.json();
        //3m n3rd l result bl element
        document.getElementById("TotalMeetings").textContent=count;
    }catch(error){
        console.error(error);
        document.getElementById("TotalMeetings").textContent="failed to bring data"
    }
}
async function GetTodayMeetings() {
    const authToken= localStorage.getItem("authToken");
    const apiUrl="https://localhost:7209/api/Bookings/Todays-Meeting"
    try{
        const res=await fetch(apiUrl,{
            method: 'GET',
            headers: {
                'Authorization':`Bearer ${authToken}` ,
                'Content-Type' : 'application/json'
            }
        });
        if(!res.ok) throw new Error("Connecting failed or unauthorized access.");;
        //la ne5ud l ra2em l raja3o l api 
        const count= await res.json();
        //3m n3rd l result bl element
        document.getElementById("TodayMeetings").textContent=count;
    }catch(error){
        console.error(error);
        document.getElementById("TodayMeetings").textContent="failed to bring data";
    }
}
async function getAvialableRoom() {
    const authToken= localStorage.getItem("authToken");
    const url="https://localhost:7209/api/Room/AvailableRoom"
    try{
        const res=await fetch(url,{
            method:'GET',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.ok)throw new Error("connecting failed or unauthorized access");
        const availableroom=await res.json();
       // document.getElementById("AvailableRoom").textContent=availableroom;
       // return availableroom;
    }catch(error){
        console.error(error);
       // return [];
        //document.getElementById("AvailableRoom").textContent="failed to bring data"
    }
}
async function GetUpcomingMeeting() {
    const authToken= localStorage.getItem("authToken");
    const url="https://localhost:7209/api/Bookings/Upcoming-Meetings"
    const payload=JSON.parse(atob(authToken.split('.')[1]))
    const Role= payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    try{
        const res= await fetch(url,{
            method:'GET',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.ok)throw new Error("Conneting Failed Or Unauthorized Access");
        const data=await res.json();
        console.log(Role)
        document.getElementById('userRole').textContent=Role;
        return data;
    }catch(error){
        console.error(error);
        return[];
    }
}
async function LastWeekMeeting() {
    const authToken= localStorage.getItem("authToken");
    const url="https://localhost:7209/api/Bookings/MeetingsPerWeek"
    try{
        const res=await fetch(url,{
            method:'GET',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.ok)throw new error("Connecting Failed or Unauthorized Access");
        const data=await res.json();
        return data;
    }catch(error){
        console.error(error);
        return[];
    }
}
async function getRoomAvailability() {
    const authToken= localStorage.getItem("authToken");
    const url="https://localhost:7209/api/Room/GetRoom"
    try{
        const res=await fetch(url,{
            method:'GET',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.ok)throw new Error("connecting failed or unauthorized access");
        const availableroom=await res.json();
        console.log("RoomAvailability",availableroom);
        return availableroom;
    }catch(error){
        console.error(error);
        return [];
    }
}
async function CancelMeeting(meetingId) {
    const authToken= localStorage.getItem("authToken");
    const url=`https://localhost:7209/api/Bookings/DeleteBooking?id=${meetingId}`
    console.log(meetingId);
    try{
        const res=await fetch(url,{
            method:'DELETE',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        console.log(res.status);
        if(!res.ok)console.log("Failed To Cancel Meeting");
        else console.log("Meeting has been cancelled");
        GetUpcomingMeeting();
    }catch(error){
        console.error(error);
    }
}
async function MostUsedRoom() {
    const authToken= localStorage.getItem("authToken");
    const url=`https://localhost:7209/api/Room/MostUsedRoom`
    try{
        const res=await fetch(url,{
            method:'GET',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        console.log(res.status); 
        if(!res.ok)throw new error("Connection Failed or Unauthorized Access");
        const data = await res.json(); 
        console.log(data);  
        if (data && data.room && data.room.name) {
        document.getElementById("MostUsedRoom").textContent = data.room.name;
      } else{
        document.getElementById("MostUsedRoom").textContent="Failed To Load Data";
      }
      return data.room.name;
    }catch(error){
        console.error(error);
        //document.getElementById("TodayMeetings").textContent="failed to bring data"
        return;
    }
}

