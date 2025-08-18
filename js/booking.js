// Meeting Room Booking Module with Full API Integration
class BookingManager {
    constructor() {
        this.rooms = [];
        this.meetings = [];
        this.attendees = [];
        this.init();
    }

    init() {
        this.loadRooms();
        this.setupEventListeners();
        this.setupAttendeeManagement();
        this.setupFormValidation();
        this.initializeDateAndTime();
        this.loadAvailabilityPreview();
    }

    setupEventListeners() {
        // Form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmission();
            });
        }

        // Form field validation
        const titleInput = document.getElementById('meetingTitle');
        const dateInput = document.getElementById('meetingDate');
        const startTimeInput = document.getElementById('startTime');
        const durationInput = document.getElementById('duration');
        const roomInput = document.getElementById('room');

        if (titleInput) {
            titleInput.addEventListener('blur', () => this.validateTitle(titleInput.value));
            titleInput.addEventListener('input', () => this.clearError('titleError'));
        }

        if (dateInput) {
            dateInput.addEventListener('change', () => {
                this.validateDate(dateInput.value);
                this.loadAvailabilityPreview();
            });
            dateInput.addEventListener('blur', () => this.validateDate(dateInput.value));
        }

        if (startTimeInput) {
            startTimeInput.addEventListener('change', () => {
                this.validateStartTime(startTimeInput.value);
                this.loadAvailabilityPreview();
            });
            startTimeInput.addEventListener('blur', () => this.validateStartTime(startTimeInput.value));
        }

        if (durationInput) {
            durationInput.addEventListener('change', () => {
                this.validateDuration(durationInput.value);
                this.loadAvailabilityPreview();
            });
        }

        if (roomInput) {
            roomInput.addEventListener('change', () => this.validateRoom(roomInput.value));
        }

        // Recurring meeting options
        const recurringCheckbox = document.getElementById('recurring');
        if (recurringCheckbox) {
            recurringCheckbox.addEventListener('change', () => this.toggleRecurringOptions());
        }

        // Video conferencing options
        const videoConferenceCheckbox = document.getElementById('videoConference');
        if (videoConferenceCheckbox) {
            videoConferenceCheckbox.addEventListener('change', () => this.toggleVideoConferenceOptions());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.authManager) {
                    window.authManager.logout();
                }
                localStorage.removeItem("jwtToken");
            });
        }
    }

    setupAttendeeManagement() {
        const attendeeInput = document.getElementById('attendeeInput');
        if (attendeeInput) {
            attendeeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addAttendee();
                }
            });

            attendeeInput.addEventListener('blur', () => {
                if (attendeeInput.value.trim()) {
                    this.addAttendee();
                }
            });
        }
    }

    setupFormValidation() {
        // Real-time validation for all required fields
        const requiredFields = ['meetingTitle', 'meetingDate', 'startTime', 'duration', 'room'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId, field.value));
                field.addEventListener('input', () => this.clearError(fieldId + 'Error'));
            }
        });
    }

    initializeDateAndTime() {
        // Set minimum date to today
        const dateInput = document.getElementById('meetingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
        }

        // Set default start time to next hour
        const startTimeInput = document.getElementById('startTime');
        if (startTimeInput) {
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            const timeString = nextHour.toTimeString().slice(0, 5);
            startTimeInput.value = timeString;
        }
    }

    async loadRooms() {
        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.getRooms();
                
                if (response.success) {
                    this.rooms = response.data || [];
                } else {
                    throw new Error(response.error || 'Failed to load rooms');
                }
            } else {
                // Fallback to mock data if API not available
                this.loadMockRooms();
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            // Fallback to mock data
            this.loadMockRooms();
        }

        this.updateRoomOptions();
    }

    loadMockRooms() {
        // Fallback mock data
        this.rooms = [
            { 
                id: 'room1', 
                name: 'Conference Room A', 
                capacity: 10, 
                status: 'available',
                equipment: ['Projector', 'Whiteboard', 'Video Conf'],
                features: ['video-conference', 'presentation', 'whiteboard']
            },
            { 
                id: 'room2', 
                name: 'Conference Room B', 
                capacity: 15, 
                status: 'available',
                equipment: ['Projector', 'Whiteboard', 'Video Conf'],
                features: ['video-conference', 'presentation', 'whiteboard']
            },
            { 
                id: 'room3', 
                name: 'Board Room', 
                capacity: 20, 
                status: 'available',
                equipment: ['Projector', 'Whiteboard', 'Video Conf', 'Audio System'],
                features: ['video-conference', 'presentation', 'whiteboard', 'audio-system']
            },
            { 
                id: 'room4', 
                name: 'Small Meeting Room', 
                capacity: 6, 
                status: 'available',
                equipment: ['Whiteboard'],
                features: ['whiteboard']
            }
        ];
    }

    async loadAvailabilityPreview() {
        const dateInput = document.getElementById('meetingDate');
        const startTimeInput = document.getElementById('startTime');
        const durationInput = document.getElementById('duration');
        
        if (!dateInput?.value || !startTimeInput?.value || !durationInput?.value) {
            return;
        }

        try {
            if (window.apiConfig) {
                // Load availability for all rooms on the selected date
                const availabilityPromises = this.rooms.map(room => 
                    window.apiConfig.getRoomAvailability(room.id, dateInput.value)
                );
                
                const availabilityResults = await Promise.all(availabilityPromises);
                
                // Process availability data
                this.updateAvailabilityCalendar(availabilityResults);
            } else {
                // Fallback to mock availability
                this.updateAvailabilityCalendar([]);
            }
        } catch (error) {
            console.error('Error loading availability:', error);
            this.updateAvailabilityCalendar([]);
        }
    }

    updateAvailabilityCalendar(availabilityResults) {
        const container = document.getElementById('availabilityCalendar');
        if (!container) return;

        container.innerHTML = '';
        
        // Create time slots for the day
        const timeSlots = this.generateTimeSlots();
        
        timeSlots.forEach(timeSlot => {
            const timeSlotElement = document.createElement('div');
            timeSlotElement.className = 'time-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = timeSlot;
            
            const roomAvailability = document.createElement('div');
            roomAvailability.className = 'room-availability-row';
            
            this.rooms.forEach(room => {
                const roomSlot = document.createElement('div');
                roomSlot.className = 'room-slot-mini';
                
                // Check if room is available at this time
                const isAvailable = this.checkRoomAvailabilityAtTime(room, timeSlot, availabilityResults);
                roomSlot.classList.add(isAvailable ? 'available' : 'booked');
                
                roomAvailability.appendChild(roomSlot);
            });
            
            timeSlotElement.appendChild(timeLabel);
            timeSlotElement.appendChild(roomAvailability);
            container.appendChild(timeSlotElement);
        });
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour <= 20; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 20) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return slots;
    }

    checkRoomAvailabilityAtTime(room, time, availabilityResults) {
        // This would check against the actual availability data from API
        // For now, return a simple availability check
        const hour = parseInt(time.split(':')[0]);
        const minute = parseInt(time.split(':')[1]);
        
        // Simulate some rooms being booked at certain times
        if (room.id === 'room2' && hour >= 14 && hour < 16) {
            return false; // Room 2 is booked in the afternoon
        }
        
        return room.status === 'available';
    }

    updateRoomOptions() {
        const roomSelect = document.getElementById('room');
        if (!roomSelect) return;

        roomSelect.innerHTML = '<option value="">Select a room</option>';
        
        this.rooms.forEach(room => {
            if (room.status === 'available') {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.name} (Capacity: ${room.capacity})`;
                roomSelect.appendChild(option);
            }
        });
    }

    addAttendee() {
        const attendeeInput = document.getElementById('attendeeInput');
        const attendeesTags = document.getElementById('attendeesTags');
        
        if (!attendeeInput || !attendeesTags) return;

        const email = attendeeInput.value.trim();
        
        if (!email) return;

        // Validate email format
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Check if attendee already exists
        if (this.attendees.includes(email)) {
            this.showError('This attendee is already added');
            return;
        }

        // Add attendee
        this.attendees.push(email);
        
        // Create attendee tag
        const attendeeTag = document.createElement('div');
        attendeeTag.className = 'attendee-tag';
        attendeeTag.innerHTML = `
            <span class="attendee-email">${email}</span>
            <button type="button" class="remove-attendee" onclick="this.parentElement.remove(); removeAttendee('${email}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        attendeesTags.appendChild(attendeeTag);
        attendeeInput.value = '';
        
        // Update room recommendations based on attendee count
        this.updateRoomRecommendations();
    }

    removeAttendee(email) {
        this.attendees = this.attendees.filter(attendee => attendee !== email);
        this.updateRoomRecommendations();
    }

    updateRoomRecommendations() {
        const roomSelect = document.getElementById('room');
        if (!roomSelect) return;

        const attendeeCount = this.attendees.length;
        
        // Update room options with capacity indicators
        roomSelect.innerHTML = '<option value="">Select a room</option>';
        
        this.rooms.forEach(room => {
            if (room.status === 'available') {
                const option = document.createElement('option');
                option.value = room.id;
                
                let capacityClass = '';
                if (attendeeCount > room.capacity) {
                    capacityClass = ' (Too small)';
                    option.disabled = true;
                } else if (attendeeCount === room.capacity) {
                    capacityClass = ' (Perfect fit)';
                } else if (attendeeCount < room.capacity / 2) {
                    capacityClass = ' (Large room)';
                }
                
                option.textContent = `${room.name} (Capacity: ${room.capacity})${capacityClass}`;
                roomSelect.appendChild(option);
            }
        });
    }

    validateField(fieldId, value) {
        switch (fieldId) {
            case 'meetingTitle':
                return this.validateTitle(value);
            case 'meetingDate':
                return this.validateDate(value);
            case 'startTime':
                return this.validateStartTime(value);
            case 'duration':
                return this.validateDuration(value);
            case 'room':
                return this.validateRoom(value);
            default:
                return true;
        }
    }

    validateTitle(title) {
        if (!title || title.trim().length === 0) {
            this.showFieldError('titleError', 'Meeting title is required');
            return false;
        }
        if (title.trim().length < 3) {
            this.showFieldError('titleError', 'Meeting title must be at least 3 characters');
            return false;
        }
        return true;
    }

    validateDate(date) {
        if (!date) {
            this.showFieldError('dateError', 'Date is required');
            return false;
        }
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.showFieldError('dateError', 'Cannot book meetings in the past');
            return false;
        }
        
        return true;
    }

    validateStartTime(startTime) {
        if (!startTime) {
            this.showFieldError('startTimeError', 'Start time is required');
            return false;
        }
        
        const dateInput = document.getElementById('meetingDate');
        if (dateInput && dateInput.value) {
            const selectedDateTime = new Date(`${dateInput.value} ${startTime}`);
            const now = new Date();
            
            if (selectedDateTime <= now) {
                this.showFieldError('startTimeError', 'Start time must be in the future');
                return false;
            }
        }
        
        return true;
    }

    validateDuration(duration) {
        if (!duration) {
            this.showFieldError('durationError', 'Duration is required');
            return false;
        }
        
        if (duration < 15 || duration > 480) {
            this.showFieldError('durationError', 'Duration must be between 15 minutes and 8 hours');
            return false;
        }
        
        return true;
    }

    validateRoom(roomId) {
        if (!roomId) {
            this.showFieldError('roomError', 'Please select a room');
            return false;
        }
        
        const selectedRoom = this.rooms.find(r => r.id === roomId);
        if (!selectedRoom) {
            this.showFieldError('roomError', 'Invalid room selected');
            return false;
        }
        
        if (selectedRoom.status !== 'available') {
            this.showFieldError('roomError', 'Selected room is not available');
            return false;
        }
        
        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    toggleRecurringOptions() {
        const recurringCheckbox = document.getElementById('recurring');
        const recurringOptions = document.getElementById('recurringOptions');
        
        if (recurringCheckbox && recurringOptions) {
            if (recurringCheckbox.checked) {
                recurringOptions.style.display = 'block';
            } else {
                recurringOptions.style.display = 'none';
            }
        }
    }

    toggleVideoConferenceOptions() {
        const videoCheckbox = document.getElementById('videoConference');
        const videoOptions = document.getElementById('videoOptions');
        
        if (videoCheckbox && videoOptions) {
            if (videoCheckbox.checked) {
                videoOptions.style.display = 'block';
            } else {
                videoOptions.style.display = 'none';
            }
        }
    }

    async handleBookingSubmission() {
        // Validate all fields
        const title = document.getElementById('meetingTitle').value;
        const date = document.getElementById('meetingDate').value;
        const startTime = document.getElementById('startTime').value;
        const duration = document.getElementById('duration').value;
        const room = document.getElementById('room').value;
        const recurring = document.getElementById('recurring')?.checked || false;
        const videoConference = document.getElementById('videoConference')?.checked || false;

        // Validate required fields
        if (!this.validateTitle(title) || 
            !this.validateDate(date) || 
            !this.validateStartTime(startTime) || 
            !this.validateDuration(duration) || 
            !this.validateRoom(room)) {
            return false;
        }

        // Check room availability
        if (!await this.checkRoomAvailability(room, date, startTime, duration)) {
            this.showError('Selected room is not available for the specified time');
            return false;
        }

        try {
            // Show loading state
            this.showLoadingState(true);

            // Create meeting object
            const meeting = {
                title: title.trim(),
                date: date,
                startTime: startTime,
                duration: parseInt(duration),
                roomId: room,
                attendees: [...this.attendees],
                recurring: recurring,
                videoConference: videoConference,
                createdBy: window.authManager?.getCurrentUser()?.email || 'Unknown'
            };

            // Save meeting via API
            const savedMeeting = await this.saveMeeting(meeting);

            if (savedMeeting) {
                // Show success message
                this.showSuccess('Meeting booked successfully!');
                
                // Reset form
                this.resetForm();
                
                // Navigate to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }

            return true;
        } catch (error) {
            console.error('Booking error:', error);
            this.showError('Failed to book meeting. Please try again.');
            return false;
        } finally {
            this.showLoadingState(false);
        }
    }

    async checkRoomAvailability(roomId, date, startTime, duration) {
        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.getRoomAvailability(roomId, date);
                
                if (response.success) {
                    // Check if the requested time slot conflicts with existing bookings
                    const requestedStart = new Date(`${date} ${startTime}`);
                    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);
                    
                    const conflicts = response.data.filter(booking => {
                        const bookingStart = new Date(booking.startTime);
                        const bookingEnd = new Date(booking.endTime);
                        
                        return (requestedStart < bookingEnd && requestedEnd > bookingStart);
                    });
                    
                    return conflicts.length === 0;
                } else {
                    throw new Error(response.error || 'Failed to check availability');
                }
            } else {
                // Fallback availability check
                return true;
            }
        } catch (error) {
            console.error('Error checking room availability:', error);
            // If we can't check availability, allow the booking
            return true;
        }
    }

    getRoomName(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        return room ? room.name : 'Unknown Room';
    }

    async saveMeeting(meeting) {
        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.createMeeting(meeting);
                
                if (response.success) {
                    return response.data;
                } else {
                    throw new Error(response.error || 'Failed to create meeting');
                }
            } else {
                // Fallback to local storage
                const meetingWithId = {
                    ...meeting,
                    id: Date.now(),
                    status: 'confirmed',
                    createdAt: new Date().toISOString()
                };
                
                // Store in localStorage as fallback
                const existingMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
                existingMeetings.push(meetingWithId);
                localStorage.setItem('meetings', JSON.stringify(existingMeetings));
                
                return meetingWithId;
            }
        } catch (error) {
            console.error('Error saving meeting:', error);
            throw error;
        }
    }

    resetForm() {
        const form = document.getElementById('bookingForm');
        if (form) {
            form.reset();
        }

        // Clear attendees
        this.attendees = [];
        const attendeesTags = document.getElementById('attendeesTags');
        if (attendeesTags) {
            attendeesTags.innerHTML = '';
        }

        // Clear errors
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });

        // Reset to default values
        this.initializeDateAndTime();
    }

    showLoadingState(show) {
        const submitButton = document.querySelector('#bookingForm .btn-primary');
        if (submitButton) {
            if (show) {
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
                submitButton.disabled = true;
            } else {
                submitButton.innerHTML = '<i class="fas fa-calendar-check"></i> Book Now';
                submitButton.disabled = false;
            }
        }
    }

    showError(message) {
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(message, 'error');
        } else {
            // Fallback error display
            console.error(message);
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(message, 'success');
        } else {
            // Fallback success display
            console.log(message);
            alert(message);
        }
    }

    // Public methods for external access
    getRooms() {
    const authToken= localStorage.getItem('authToken');
    const apiUrl="https://localhost:7209/api/Room/GetRoom"
    try{
        const res=fetch(apiUrl,{
            method:'GET',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.okay)throw new Error("Connecting Failed or Unauthorized access");
        const room=res.JSON();
        return room
    }catch(error){
        console.error(error);
    }
    }

    getMeetings() {
        return this.meetings;
    }

    checkAvailability(roomId, date, startTime, duration) {
        return this.checkRoomAvailability(roomId, date, startTime, duration);
    }
}

// Global functions for HTML onclick handlers
function addAttendee() {
    const authToken= localStorage.getItem('authToken');
    const apiUrl="https://localhost:7209/api/Attendees/AddAttendee"
    try{
        const res=fetch(apiUrl,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.okay)throw new Error("Connecting Failed or Unauthorized access");
    }catch(error){
        console.error(error);
    } 
}

function removeAttendee(email) {
    const authToken= localStorage.getItem('authToken');
    const apiUrl="https://localhost:7209/api/Attendees/DeleteAttendee"
    try{
        const res=fetch(apiUrl,{
            method:'DELETE',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.okay)throw new Error("Connecting Failed or Unauthorized access");
    }catch(error){
        console.error(error);
    }
}
function BookMeeting(){
    const authToken= localStorage.getItem('authToken');
    const apiUrl="https://localhost:7209/api/Booking/AddBookings"
    try{
        const res=fetch(apiUrl,{
            method:'POST',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Content-Type':'application/json'
            }
        });
        if(!res.okay)throw new Error("Connecting Failed or Unauthorized access");
    }catch(error){
        console.error(error);
    }
}

// Initialize booking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();
}); 