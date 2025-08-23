// Admin Panel Module
class AdminManager {
    constructor() {
        this.users = [];
        this.rooms = [];
        this.systemSettings = {};
        this.reports = {};
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMockData();
        this.setupCharts();
        this.setupDataTables();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Navigation
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                if (view) {
                    this.showView(view);
                }
            });
        });

        // User management
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }

        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleUserSubmission(e));
        }

        // Room management
        const addRoomBtn = document.getElementById('addRoomBtn');
        if (addRoomBtn) {
            addRoomBtn.addEventListener('click', () => PostRoom());
        }

        const roomForm = document.getElementById('roomForm');
        if (roomForm) {
            roomForm.addEventListener('submit', (e) => this.handleRoomSubmission(e));
        }

        // Settings
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSystemSettings());
        }

        // Reports
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }

        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }

        // Search and filters
        const searchInputs = document.querySelectorAll('.admin-search');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleSearch(e));
        });

        // Bulk actions
        const bulkActionSelect = document.getElementById('bulkActionSelect');
        if (bulkActionSelect) {
            bulkActionSelect.addEventListener('change', (e) => this.handleBulkAction(e.target.value));
        }

        const applyBulkActionBtn = document.getElementById('applyBulkActionBtn');
        if (applyBulkActionBtn) {
            applyBulkActionBtn.addEventListener('click', () => this.applyBulkAction());
        }
    }

    loadMockData() {
        // Mock users
        this.users = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@company.com',
                role: 'admin',
                department: 'IT',
                status: 'active',
                lastLogin: '2024-01-15 09:30',
                createdAt: '2023-01-15'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@company.com',
                role: 'user',
                department: 'Marketing',
                status: 'active',
                lastLogin: '2024-01-15 08:45',
                createdAt: '2023-02-20'
            },
            {
                id: 3,
                name: 'Mike Johnson',
                email: 'mike.johnson@company.com',
                role: 'manager',
                department: 'Sales',
                status: 'inactive',
                lastLogin: '2024-01-10 14:20',
                createdAt: '2023-03-10'
            }
        ];

        // Mock rooms
        this.rooms = [
            {
                id: 1,
                name: 'Conference Room A',
                capacity: 20,
                location: 'Floor 1',
                equipment: ['Projector', 'Whiteboard', 'Video Conference'],
                status: 'available',
                maintenance: null
            },
            {
                id: 2,
                name: 'Meeting Room B',
                capacity: 8,
                location: 'Floor 2',
                equipment: ['Whiteboard', 'TV Screen'],
                status: 'maintenance',
                maintenance: '2024-01-20'
            },
            {
                id: 3,
                name: 'Board Room',
                capacity: 15,
                location: 'Floor 3',
                equipment: ['Projector', 'Video Conference', 'Audio System'],
                status: 'available',
                maintenance: null
            }
        ];

        // Mock system settings
        this.systemSettings = {
            bookingAdvanceDays: 30,
            maxBookingDuration: 480, // minutes
            autoCleanupDays: 90,
            emailNotifications: true,
            smsNotifications: false,
            maintenanceMode: false,
            defaultRoomCapacity: 10
        };

        // Mock reports
        this.reports = {
            totalUsers: this.users.length,
            totalRooms: this.rooms.length,
            activeBookings: 12,
            totalBookings: 156,
            utilizationRate: 78.5,
            popularRooms: ['Conference Room A', 'Meeting Room B'],
            peakHours: '09:00-11:00',
            monthlyGrowth: 12.5
        };
    }

    showView(viewName) {
        this.currentView = viewName;
        
        // Hide all views
        const views = document.querySelectorAll('.admin-view');
        views.forEach(view => view.style.display = 'none');
        
        // Show selected view
        const selectedView = document.getElementById(`${viewName}View`);
        if (selectedView) {
            selectedView.style.display = 'block';
        }
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            }
        });
        
        // Update display based on view
        this.updateDisplay();
    }

    updateDisplay() {
        switch (this.currentView) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'users':
                this.updateUsersDisplay();
                break;
            case 'rooms':
                this.updateRoomsDisplay();
                break;
            case 'settings':
                this.updateSettingsDisplay();
                break;
            case 'reports':
                this.updateReportsDisplay();
                break;
        }
    }

    updateDashboard() {
        // Update statistics
        const totalUsersEl = document.getElementById('totalUsers');
        const totalRoomsEl = document.getElementById('totalRooms');
        const activeBookingsEl = document.getElementById('activeBookings');
        const utilizationRateEl = document.getElementById('utilizationRate');

        if (totalUsersEl) totalUsersEl.textContent = this.reports.totalUsers;
        if (totalRoomsEl) totalRoomsEl.textContent = this.reports.totalRooms;
        if (activeBookingsEl) activeBookingsEl.textContent = this.reports.activeBookings;
        if (utilizationRateEl) utilizationRateEl.textContent = `${this.reports.utilizationRate}%`;

        // Update recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        const activities = [
            { type: 'user', action: 'New user registered', details: 'Jane Smith joined Marketing team', time: '2 hours ago' },
            { type: 'booking', action: 'Room booked', details: 'Conference Room A booked for tomorrow', time: '3 hours ago' },
            { type: 'maintenance', action: 'Room maintenance', details: 'Meeting Room B scheduled for maintenance', time: '1 day ago' },
            { type: 'system', action: 'System update', details: 'New features deployed', time: '2 days ago' }
        ];

        const activityHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-action">${activity.action}</div>
                    <div class="activity-details">${activity.details}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    getActivityIcon(type) {
        const icons = {
            user: 'user-plus',
            booking: 'calendar-check',
            maintenance: 'tools',
            system: 'cog'
        };
        return icons[type] || 'info-circle';
    }

    updateUsersDisplay() {
        const usersContainer = document.getElementById('usersContainer');
        if (!usersContainer) return;

        const usersHTML = this.users.map(user => `
            <div class="user-row" data-user-id="${user.id}">
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                        <div class="user-department">${user.department}</div>
                    </div>
                </div>
                <div class="user-role">
                    <span class="role-badge ${user.role}">${user.role}</span>
                </div>
                <div class="user-status">
                    <span class="status-badge ${user.status}">${user.status}</span>
                </div>
                <div class="user-last-login">${user.lastLogin}</div>
                <div class="user-actions">
                    <button type="button" class="btn-edit" onclick="window.adminManager.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-delete" onclick="window.adminManager.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        usersContainer.innerHTML = usersHTML;
    }

    updateRoomsDisplay() {
        const roomsContainer = document.getElementById('roomsContainer');
        if (!roomsContainer) return;

        const roomsHTML = this.rooms.map(room => `
            <div class="room-row" data-room-id="${room.id}">
                <div class="room-info">
                    <div class="room-name">${room.name}</div>
                    <div class="room-location">${room.location}</div>
                    <div class="room-capacity">Capacity: ${room.capacity}</div>
                </div>
                <div class="room-equipment">
                    ${room.equipment.map(eq => `<span class="equipment-tag">${eq}</span>`).join('')}
                </div>
                <div class="room-status">
                    <span class="status-badge ${room.status}">${room.status}</span>
                </div>
                <div class="room-maintenance">
                    ${room.maintenance ? `Maintenance: ${room.maintenance}` : 'No maintenance scheduled'}
                </div>
                <div class="room-actions">
                    <button type="button" class="btn-edit" onclick="window.adminManager.editRoom(${room.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-delete" onclick="window.adminManager.deleteRoom(${room.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        roomsContainer.innerHTML = roomsHTML;
    }

    updateSettingsDisplay() {
        const settingsContainer = document.getElementById('settingsContainer');
        if (!settingsContainer) return;

        const settingsHTML = `
            <div class="setting-group">
                <h4>Booking Settings</h4>
                <div class="setting-item">
                    <label for="bookingAdvanceDays">Maximum advance booking days:</label>
                    <input type="number" id="bookingAdvanceDays" value="${this.systemSettings.bookingAdvanceDays}" min="1" max="365">
                </div>
                <div class="setting-item">
                    <label for="maxBookingDuration">Maximum booking duration (minutes):</label>
                    <input type="number" id="maxBookingDuration" value="${this.systemSettings.maxBookingDuration}" min="30" max="1440">
                </div>
                <div class="setting-item">
                    <label for="defaultRoomCapacity">Default room capacity:</label>
                    <input type="number" id="defaultRoomCapacity" value="${this.systemSettings.defaultRoomCapacity}" min="1" max="100">
                </div>
            </div>
            
            <div class="setting-group">
                <h4>System Settings</h4>
                <div class="setting-item">
                    <label for="autoCleanupDays">Auto-cleanup old data (days):</label>
                    <input type="number" id="autoCleanupDays" value="${this.systemSettings.autoCleanupDays}" min="30" max="365">
                </div>
                <div class="setting-item">
                    <label for="maintenanceMode">Maintenance mode:</label>
                    <input type="checkbox" id="maintenanceMode" ${this.systemSettings.maintenanceMode ? 'checked' : ''}>
                </div>
            </div>
            
            <div class="setting-group">
                <h4>Notification Settings</h4>
                <div class="setting-item">
                    <label for="emailNotifications">Email notifications:</label>
                    <input type="checkbox" id="emailNotifications" ${this.systemSettings.emailNotifications ? 'checked' : ''}>
                </div>
                <div class="setting-item">
                    <label for="smsNotifications">SMS notifications:</label>
                    <input type="checkbox" id="smsNotifications" ${this.systemSettings.smsNotifications ? 'checked' : ''}>
                </div>
            </div>
        `;

        settingsContainer.innerHTML = settingsHTML;
    }

    updateReportsDisplay() {
        const reportsContainer = document.getElementById('reportsContainer');
        if (!reportsContainer) return;

        const reportsHTML = `
            <div class="report-summary">
                <div class="report-card">
                    <h4>Total Bookings</h4>
                    <div class="report-number">${this.reports.totalBookings}</div>
                    <div class="report-trend positive">+${this.reports.monthlyGrowth}% this month</div>
                </div>
                <div class="report-card">
                    <h4>Room Utilization</h4>
                    <div class="report-number">${this.reports.utilizationRate}%</div>
                    <div class="report-trend">Peak: ${this.reports.peakHours}</div>
                </div>
                <div class="report-card">
                    <h4>Popular Rooms</h4>
                    <div class="report-list">
                        ${this.reports.popularRooms.map(room => `<div class="popular-room">${room}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;

        reportsContainer.innerHTML = reportsHTML;
    }

    showAddUserModal() {
        // In a real app, this would show a modal
        const userData = {
            name: prompt('Enter user name:'),
            email: prompt('Enter user email:'),
            role: prompt('Enter user role (admin/user/manager):'),
            department: prompt('Enter department:')
        };

        if (userData.name && userData.email && userData.role && userData.department) {
            this.addUser(userData);
        }
    }

    addUser(userData) {
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            role: userData.role,
            department: userData.department,
            status: 'active',
            lastLogin: 'Never',
            createdAt: new Date().toISOString().split('T')[0]
        };

        this.users.push(newUser);
        this.updateUsersDisplay();
        this.showSuccess('User added successfully');
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const newName = prompt('Enter new name:', user.name);
        const newRole = prompt('Enter new role:', user.role);
        const newDepartment = prompt('Enter new department:', user.department);

        if (newName && newRole && newDepartment) {
            user.name = newName;
            user.role = newRole;
            user.department = newDepartment;
            this.updateUsersDisplay();
            this.showSuccess('User updated successfully');
        }
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                this.users.splice(userIndex, 1);
                this.updateUsersDisplay();
                this.showSuccess('User deleted successfully');
            }
        }
    }

    showAddRoomModal() {
        const roomData = {
            capacity: prompt('Enter room capacity:'),
            location: prompt('Enter room location:'),
            equipment:prompt('projector,video conference,white board...:'),
        };

        if (roomData.name && roomData.capacity && roomData.location) {
            this.addRoom(roomData);
        }
    }

    addRoom(roomData) {
        const newRoom = {
            id: Date.now(),
            capacity: parseInt(roomData.capacity),
            location: roomData.location,
            equipment: ['Whiteboard'],
            status: 'available',
            maintenance: null
        };

        this.rooms.push(newRoom);
        this.updateRoomsDisplay();
        this.showSuccess('Room added successfully');
    }

    editRoom(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;

        const newName = prompt('Enter new room name:', room.name);
        const newCapacity = prompt('Enter new capacity:', room.capacity);
        const newLocation = prompt('Enter new location:', room.location);

        if (newName && newCapacity && newLocation) {
            room.name = newName;
            room.capacity = parseInt(newCapacity);
            room.location = newLocation;
            this.updateRoomsDisplay();
            this.showSuccess('Room updated successfully');
        }
    }

    deleteRoom(roomId) {
        if (confirm('Are you sure you want to delete this room?')) {
            const roomIndex = this.rooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                this.rooms.splice(roomIndex, 1);
                this.updateRoomsDisplay();
                this.showSuccess('Room deleted successfully');
            }
        }
    }

    saveSystemSettings() {
        // Get values from form
        this.systemSettings.bookingAdvanceDays = parseInt(document.getElementById('bookingAdvanceDays')?.value) || 30;
        this.systemSettings.maxBookingDuration = parseInt(document.getElementById('maxBookingDuration')?.value) || 480;
        this.systemSettings.defaultRoomCapacity = parseInt(document.getElementById('defaultRoomCapacity')?.value) || 10;
        this.systemSettings.autoCleanupDays = parseInt(document.getElementById('autoCleanupDays')?.value) || 90;
        this.systemSettings.maintenanceMode = document.getElementById('maintenanceMode')?.checked || false;
        this.systemSettings.emailNotifications = document.getElementById('emailNotifications')?.checked || false;
        this.systemSettings.smsNotifications = document.getElementById('smsNotifications')?.checked || false;

        // In a real app, this would save to database
        this.showSuccess('Settings saved successfully');
    }

    generateReport() {
        // In a real app, this would generate a comprehensive report
        this.showInfo('Report generation started. This may take a few minutes.');
        
        // Simulate report generation
        setTimeout(() => {
            this.showSuccess('Report generated successfully');
        }, 2000);
    }

    exportReport() {
        const reportData = {
            users: this.users,
            rooms: this.rooms,
            settings: this.systemSettings,
            reports: this.reports,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `admin_report_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showSuccess('Report exported successfully');
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const searchType = event.target.dataset.searchType;

        if (searchType === 'users') {
            this.filterUsers(searchTerm);
        } else if (searchType === 'rooms') {
            this.filterRooms(searchTerm);
        }
    }

    filterUsers(searchTerm) {
        const userRows = document.querySelectorAll('.user-row');
        userRows.forEach(row => {
            const userName = row.querySelector('.user-name').textContent.toLowerCase();
            const userEmail = row.querySelector('.user-email').textContent.toLowerCase();
            const userDept = row.querySelector('.user-department').textContent.toLowerCase();

            if (userName.includes(searchTerm) || userEmail.includes(searchTerm) || userDept.includes(searchTerm)) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
    }

    filterRooms(searchTerm) {
        const roomRows = document.querySelectorAll('.room-row');
        roomRows.forEach(row => {
            const roomName = row.querySelector('.room-name').textContent.toLowerCase();
            const roomLocation = row.querySelector('.room-location').textContent.toLowerCase();

            if (roomName.includes(searchTerm) || roomLocation.includes(searchTerm)) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
    }

    handleBulkAction(action) {
        // Store selected action for later use
        this.selectedBulkAction = action;
    }

    applyBulkAction() {
        if (!this.selectedBulkAction) return;

        const selectedItems = document.querySelectorAll('.user-row.selected, .room-row.selected');
        if (selectedItems.length === 0) {
            this.showError('No items selected');
            return;
        }

        switch (this.selectedBulkAction) {
            case 'delete':
                if (confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
                    selectedItems.forEach(item => {
                        const id = parseInt(item.dataset.userId || item.dataset.roomId);
                        if (item.classList.contains('user-row')) {
                            this.deleteUser(id);
                        } else {
                            this.deleteRoom(id);
                        }
                    });
                }
                break;
            case 'activate':
                selectedItems.forEach(item => {
                    if (item.classList.contains('user-row')) {
                        const statusBadge = item.querySelector('.status-badge');
                        if (statusBadge) {
                            statusBadge.textContent = 'active';
                            statusBadge.className = 'status-badge active';
                        }
                    }
                });
                this.showSuccess(`${selectedItems.length} items activated`);
                break;
            case 'deactivate':
                selectedItems.forEach(item => {
                    if (item.classList.contains('user-row')) {
                        const statusBadge = item.querySelector('.status-badge');
                        if (statusBadge) {
                            statusBadge.textContent = 'inactive';
                            statusBadge.className = 'status-badge inactive';
                        }
                    }
                });
                this.showSuccess(`${selectedItems.length} items deactivated`);
                break;
        }

        // Clear selection
        this.clearSelection();
    }

    clearSelection() {
        const selectedItems = document.querySelectorAll('.user-row.selected, .room-row.selected');
        selectedItems.forEach(item => item.classList.remove('selected'));
    }

    setupCharts() {
        // In a real app, this would initialize charts using a library like Chart.js
        console.log('Charts would be initialized here');
    }

    setupDataTables() {
        // In a real app, this would initialize data tables using a library like DataTables
        console.log('Data tables would be initialized here');
    }

    showSuccess(message) {
        if (window.app) {
            window.app.showSuccess(message);
        }
    }

    showError(message) {
        if (window.app) {
            window.app.showError(message);
        }
    }

    showInfo(message) {
        if (window.app) {
            window.app.showInfo(message);
        }
    }

    // Public methods for external access
    getUsers() {
        return this.users;
    }

    getRooms() {
        return this.rooms;
    }

    getSystemSettings() {
        return this.systemSettings;
    }

    getReports() {
        return this.reports;
    }
}

async function PostRoom() {
    const container=document.getElementById("roomsList");
    container.innerHTML=`
        <form id="roomForm">
            <input types="number" id="roomCapacity" placeholder="Room Capacity" required><br>
            <input types="number" id="roomLocation" placeholder="Room Location" required><br>
            <h4>Features</h4>
            <label>
                <input type="checkbox" id="projector" value="1">Projector
            </label><br>
            <label>
                <input type="checkbox" id="VideoConference" value="2">VideoConference
            </label><br>
            <label>
                <input type="checkbox" id="whiteboard" value="1">WhiteBoard
            </label><br>
            <button class="btn btn-primary" type="submit">Save Room</button>
            <button class="btn btn-ghost" type="cancel">Cancel</button>
        </form>
    `
    document.getElementById("roomForm").addEventListener('submit',function(e){
        const authToken=localStorage.getItem('authToken');
        const url="https://localhost:7209/api/Room/AddRoom"
        const payload=JSON.parse(atob(token.split('.')[1]));
        const UserId=payload.id;
        const roomData={
            userId: userId,
            roomCapacity: parseInt(document.getElementById("roomCapacity").value),
            roomLocation: parseInt(document.getElementById("roomLocation").value),
            features: {
                projector:document.getElementById('projector').checked,
                videoconference:document.getElementById('VideoConference').checked,
                whiteBoard:document.getElementById('whiteboard').checked
                }
        };
        fetch (url,{
            method:'POSt',
            headers:{
                'Authorization':`Bearer ${authToken}`,
                'Contebt-Type':'application/json'
            },
            body:JSON.stringify(roomData)
        }).then(res=>res.json())
          .then(data=>{
            alert('Room added successfully');
            container.innerHTML="";
          }).catch(console.error(error));
    })
}
// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
}); 

