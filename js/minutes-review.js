// Minutes Review Module with Full API Integration
class MinutesReviewManager {
    constructor() {
        this.minutes = [];
        this.filteredMinutes = [];
        this.currentFilters = {
            search: '',
            date: '',
            status: '',
            priority: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMinutes();
        this.setupSearch();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.debounceSearch();
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
    }

    setupSearch() {
        // Debounce search to avoid too many API calls
        this.searchTimeout = null;
    }

    debounceSearch() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    async loadMinutes() {
        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.getMinutes({
                    limit: 100,
                    sortBy: 'date',
                    sortOrder: 'desc'
                });
                
                if (response.success) {
                    this.minutes = response.data || [];
                } else {
                    throw new Error(response.error || 'Failed to load minutes');
                }
            } else {
                // Fallback to mock data
                this.loadMockMinutes();
            }
        } catch (error) {
            console.error('Error loading minutes:', error);
            // Fallback to mock data
            this.loadMockMinutes();
        }

        this.applyFilters();
        this.updateActionItemsSummary();
    }

    loadMockMinutes() {
        // Fallback mock data
        this.minutes = [
            {
                id: 1,
                meetingTitle: 'Team Standup Meeting',
                date: '2024-01-15',
                attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                actionItems: [
                    { description: 'Complete user authentication module', assignee: 'John Doe', priority: 'high', status: 'pending', dueDate: '2024-01-20' },
                    { description: 'Review API documentation', assignee: 'Jane Smith', priority: 'medium', status: 'completed', dueDate: '2024-01-18' },
                    { description: 'Update deployment scripts', assignee: 'Mike Johnson', priority: 'low', status: 'overdue', dueDate: '2024-01-10' }
                ],
                decisions: ['Use JWT for authentication', 'Implement OAuth2 for third-party integrations'],
                notes: 'Team discussed current sprint progress and identified blockers in the authentication module.'
            },
            {
                id: 2,
                meetingTitle: 'Project Review',
                date: '2024-01-14',
                attendees: ['John Doe', 'Sarah Wilson', 'David Brown'],
                actionItems: [
                    { description: 'Prepare quarterly report', assignee: 'Sarah Wilson', priority: 'high', status: 'pending', dueDate: '2024-01-25' },
                    { description: 'Schedule stakeholder meeting', assignee: 'David Brown', priority: 'medium', status: 'pending', dueDate: '2024-01-22' }
                ],
                decisions: ['Extend project timeline by 2 weeks', 'Increase budget for additional resources'],
                notes: 'Project is 85% complete but needs additional time and resources to meet quality standards.'
            }
        ];
    }

    applyFilters() {
        this.filteredMinutes = this.minutes.filter(minutes => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    minutes.meetingTitle,
                    minutes.attendees.join(' '),
                    minutes.notes,
                    minutes.actionItems.map(item => item.description).join(' '),
                    minutes.decisions.join(' ')
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Date filter
            if (this.currentFilters.date) {
                const meetingDate = new Date(minutes.date);
                const today = new Date();
                
                switch (this.currentFilters.date) {
                    case 'today':
                        if (meetingDate.toDateString() !== today.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (meetingDate < weekAgo) return false;
                        break;
                    case 'month':
                        if (meetingDate.getMonth() !== today.getMonth() || meetingDate.getFullYear() !== today.getFullYear()) return false;
                        break;
                    case 'quarter':
                        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                        if (meetingDate < quarterStart) return false;
                        break;
                    case 'year':
                        if (meetingDate.getFullYear() !== today.getFullYear()) return false;
                        break;
                }
            }

            // Status filter
            if (this.currentFilters.status) {
                const hasMatchingStatus = minutes.actionItems.some(item => item.status === this.currentFilters.status);
                if (!hasMatchingStatus) return false;
            }

            // Priority filter
            if (this.currentFilters.priority) {
                const hasMatchingPriority = minutes.actionItems.some(item => item.priority === this.currentFilters.priority);
                if (!hasMatchingPriority) return false;
            }

            return true;
        });

        this.updateMinutesList();
        this.updateActionItemsSummary();
    }

    updateMinutesList() {
        const container = document.getElementById('minutesList');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.filteredMinutes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No minutes found matching your criteria</p>
                    <button class="btn btn-primary" onclick="clearFilters()">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        this.filteredMinutes.forEach(minutes => {
            const minutesElement = document.createElement('div');
            minutesElement.className = 'minutes-card';
            minutesElement.dataset.minutesId = minutes.id;
            
            const actionItemsSummary = this.getActionItemsSummary(minutes.actionItems);
            const priorityClass = this.getHighestPriorityClass(minutes.actionItems);
            
            minutesElement.innerHTML = `
                <div class="minutes-card-header">
                    <div class="minutes-card-title">
                        <h4>${minutes.meetingTitle}</h4>
                        <span class="meeting-date">${this.formatDate(minutes.date)}</span>
                    </div>
                    <div class="minutes-card-meta">
                        <span class="attendees-count">
                            <i class="fas fa-users"></i> ${minutes.attendees.length} attendees
                        </span>
                        <span class="action-items-count ${priorityClass}">
                            <i class="fas fa-tasks"></i> ${minutes.actionItems.length} action items
                        </span>
                    </div>
                </div>
                <div class="minutes-card-content">
                    <div class="action-items-summary">
                        ${actionItemsSummary}
                    </div>
                    <div class="decisions-summary">
                        <strong>Decisions:</strong> ${minutes.decisions.length > 0 ? minutes.decisions.slice(0, 2).join(', ') : 'None'}
                        ${minutes.decisions.length > 2 ? ` +${minutes.decisions.length - 2} more` : ''}
                    </div>
                </div>
                <div class="minutes-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewMinutesDetails(${minutes.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editMinutes(${minutes.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="exportMinutes(${minutes.id})">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            `;
            
            container.appendChild(minutesElement);
        });
    }

    getActionItemsSummary(actionItems) {
        if (actionItems.length === 0) {
            return '<span class="no-actions">No action items</span>';
        }

        const pending = actionItems.filter(item => item.status === 'pending').length;
        const completed = actionItems.filter(item => item.status === 'completed').length;
        const overdue = actionItems.filter(item => item.status === 'overdue').length;

        return `
            <span class="action-item-tag pending">${pending} Pending</span>
            <span class="action-item-tag completed">${completed} Completed</span>
            ${overdue > 0 ? `<span class="action-item-tag overdue">${overdue} Overdue</span>` : ''}
        `;
    }

    getHighestPriorityClass(actionItems) {
        if (actionItems.some(item => item.priority === 'high')) return 'high-priority';
        if (actionItems.some(item => item.priority === 'medium')) return 'medium-priority';
        return 'low-priority';
    }

    updateActionItemsSummary() {
        const allActionItems = this.filteredMinutes.flatMap(minutes => minutes.actionItems);
        
        const totalActions = allActionItems.length;
        const pendingActions = allActionItems.filter(item => item.status === 'pending').length;
        const completedActions = allActionItems.filter(item => item.status === 'completed').length;
        const overdueActions = allActionItems.filter(item => item.status === 'overdue').length;

        // Update summary stats
        const totalElement = document.getElementById('totalActions');
        const pendingElement = document.getElementById('pendingActions');
        const completedElement = document.getElementById('completedActions');
        const overdueElement = document.getElementById('overdueActions');

        if (totalElement) totalElement.textContent = totalActions;
        if (pendingElement) pendingElement.textContent = pendingActions;
        if (completedElement) completedElement.textContent = completedActions;
        if (overdueElement) overdueElement.textContent = overdueActions;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    async viewMinutesDetails(minutesId) {
        const minutes = this.minutes.find(m => m.id === minutesId);
        if (!minutes) return;

        const modal = document.getElementById('minutesDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = minutes.meetingTitle;
            
            modalBody.innerHTML = `
                <div class="minutes-detail-content">
                    <div class="meeting-info">
                        <div class="info-row">
                            <strong>Date:</strong> ${this.formatDate(minutes.date)}
                        </div>
                        <div class="info-row">
                            <strong>Attendees:</strong> ${minutes.attendees.join(', ')}
                        </div>
                    </div>
                    
                    <div class="action-items-detail">
                        <h4>Action Items</h4>
                        ${this.renderActionItemsDetail(minutes.actionItems)}
                    </div>
                    
                    <div class="decisions-detail">
                        <h4>Decisions</h4>
                        ${minutes.decisions.length > 0 ? 
                            `<ul>${minutes.decisions.map(decision => `<li>${decision}</li>`).join('')}</ul>` : 
                            '<p>No decisions recorded</p>'
                        }
                    </div>
                    
                    <div class="notes-detail">
                        <h4>Notes</h4>
                        <p>${minutes.notes || 'No notes recorded'}</p>
                    </div>
                </div>
            `;
            
            modal.classList.add('active');
        }
    }

    renderActionItemsDetail(actionItems) {
        if (actionItems.length === 0) {
            return '<p>No action items recorded</p>';
        }

        const actionItemsHTML = actionItems.map(item => `
            <div class="action-item-detail ${item.status}">
                <div class="action-header">
                    <span class="action-description">${item.description}</span>
                    <span class="action-priority ${item.priority}">${item.priority}</span>
                </div>
                <div class="action-meta">
                    <span class="assignee"><i class="fas fa-user"></i> ${item.assignee}</span>
                    <span class="due-date"><i class="fas fa-calendar"></i> ${item.dueDate}</span>
                    <span class="status ${item.status}">${item.status}</span>
                </div>
            </div>
        `).join('');

        return `<div class="action-items-list">${actionItemsHTML}</div>`;
    }

    // Public methods for external access
    getMinutes() {
        return this.minutes;
    }

    getFilteredMinutes() {
        return this.filteredMinutes;
    }

    clearFilters() {
        this.currentFilters = {
            search: '',
            date: '',
            status: '',
            priority: ''
        };
        
        // Reset form elements
        const searchInput = document.getElementById('searchInput');
        const dateFilter = document.getElementById('dateFilter');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (searchInput) searchInput.value = '';
        if (dateFilter) dateFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (priorityFilter) priorityFilter.value = '';
        
        this.applyFilters();
    }
}

// Global functions for HTML onclick handlers
function performSearch() {
    if (window.minutesReviewManager) {
        window.minutesReviewManager.applyFilters();
    }
}

function applyFilters() {
    if (window.minutesReviewManager) {
        window.minutesReviewManager.applyFilters();
    }
}

function clearFilters() {
    if (window.minutesReviewManager) {
        window.minutesReviewManager.clearFilters();
    }
}

function viewMinutesDetails(minutesId) {
    if (window.minutesReviewManager) {
        window.minutesReviewManager.viewMinutesDetails(minutesId);
    }
}

function editMinutes(minutesId) {
    // Navigate to minutes edit page
    window.location.href = `minutes.html?edit=${minutesId}`;
    closeMinutesModal();
}

function exportMinutes(minutesId) {
    if (window.minutesReviewManager) {
        // Export functionality would be implemented here
        window.minutesReviewManager.showToast('Export functionality would be implemented here', 'info');
    }
    closeMinutesModal();
}

function shareMinutes(minutesId) {
    if (window.minutesReviewManager) {
        // Share functionality would be implemented here
        window.minutesReviewManager.showToast('Share functionality would be implemented here', 'info');
    }
    closeMinutesModal();
}

function closeMinutesModal() {
    const modal = document.getElementById('minutesDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Initialize minutes review manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.minutesReviewManager = new MinutesReviewManager();
}); 