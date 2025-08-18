// Meeting Minutes Module with Full API Integration
class MinutesManager {
    constructor() {
        this.currentMeeting = null;
        this.minutes = {
            agenda: [],
            attendees: [],
            decisions: [],
            actionItems: [],
            notes: '',
            attachments: [],
            nextMeeting: null
        };
        this.templates = {
            standup: {
                agenda: ['Team Updates', 'Blockers', 'Today\'s Goals'],
                structure: 'standup'
            },
            planning: {
                agenda: ['Review Previous Sprint', 'Sprint Planning', 'Resource Allocation'],
                structure: 'planning'
            },
            retrospective: {
                agenda: ['What Went Well', 'What Could Improve', 'Action Items'],
                structure: 'retrospective'
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMeetingData();
        this.setupTemplates();
        this.setupAutoSave();
        this.setupExport();
        this.loadMinutesFromAPI();
    }

    setupEventListeners() {
        // Template selection
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => this.applyTemplate(e.target.value));
        }

        // Agenda management
        const addAgendaItem = document.getElementById('addAgendaItem');
        if (addAgendaItem) {
            addAgendaItem.addEventListener('click', () => this.addAgendaItem());
        }

        // Attendee management
        const addAttendee = document.getElementById('addAttendee');
        if (addAttendee) {
            addAttendee.addEventListener('click', () => this.addAttendee());
        }

        // Decision tracking
        const addDecision = document.getElementById('addDecision');
        if (addDecision) {
            addDecision.addEventListener('click', () => this.addDecision());
        }

        // Action items
        const addActionItem = document.getElementById('addActionItem');
        if (addActionItem) {
            addActionItem.addEventListener('click', () => this.addActionItem());
        }

        // Save and export
        const saveMinutes = document.getElementById('saveMinutes');
        if (saveMinutes) {
            saveMinutes.addEventListener('click', () => this.saveMinutes());
        }

        const exportMinutes = document.getElementById('exportMinutes');
        if (exportMinutes) {
            exportMinutes.addEventListener('click', () => this.exportMinutes());
        }

        // Notes auto-save
        const notesTextarea = document.getElementById('meetingNotes');
        if (notesTextarea) {
            notesTextarea.addEventListener('input', () => this.autoSave());
        }

        // Next meeting scheduling
        const scheduleNextMeeting = document.getElementById('scheduleNextMeeting');
        if (scheduleNextMeeting) {
            scheduleNextMeeting.addEventListener('click', () => this.scheduleNextMeeting());
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

        // File upload handling
        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
        }
    }

    async loadMinutesFromAPI() {
        if (!this.currentMeeting?.id) return;

        try {
            if (window.apiConfig) {
                const response = await window.apiConfig.getMinutesById(this.currentMeeting.id);
                
                if (response.success && response.data) {
                    // Merge API data with local data
                    this.minutes = { ...this.minutes, ...response.data };
                    this.updateDisplay();
                    
                    // Update notes textarea
                    const notesTextarea = document.getElementById('meetingNotes');
                    if (notesTextarea) {
                        notesTextarea.value = this.minutes.notes || '';
                    }
                }
            }
        } catch (error) {
            console.error('Error loading minutes from API:', error);
            // Fallback to local storage
            this.loadFromStorage();
        }
    }

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;

        try {
            for (const file of files) {
                if (window.apiConfig) {
                    const response = await window.apiConfig.uploadFile(file, 'meeting-minutes');
                    
                    if (response.success) {
                        this.minutes.attachments.push({
                            id: response.data.id,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url: response.data.url,
                            uploadedAt: new Date().toISOString()
                        });
                    } else {
                        throw new Error(response.error || 'Failed to upload file');
                    }
                } else {
                    // Fallback to local storage
                    const fileData = {
                        id: Date.now(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: await this.fileToBase64(file),
                        uploadedAt: new Date().toISOString()
                    };
                    this.minutes.attachments.push(fileData);
                }
            }
            
            this.updateAttachmentsDisplay();
            this.showSuccess(`${files.length} file(s) uploaded successfully`);
        } catch (error) {
            console.error('Error uploading files:', error);
            this.showError('Failed to upload files. Please try again.');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    updateAttachmentsDisplay() {
        const container = document.getElementById('uploadedFiles');
        if (!container) return;

        container.innerHTML = '';
        
        this.minutes.attachments.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            
            const fileIcon = this.getFileIcon(file.type);
            const fileSize = this.formatFileSize(file.size);
            
            fileElement.innerHTML = `
                <div class="file-info">
                    <i class="fas ${fileIcon}"></i>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-meta">${fileSize} • ${new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button type="button" class="btn btn-sm btn-outline" onclick="downloadFile('${file.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline" onclick="removeFile(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(fileElement);
        });
    }

    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
        if (fileType.includes('image')) return 'fa-file-image';
        if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'fa-file-excel';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    loadMeetingData() {
        // Get meeting data from global context
        if (window.currentMeetingForMinutes) {
            this.currentMeeting = window.currentMeetingForMinutes;
        } else if (window.currentMeeting) {
            this.currentMeeting = window.currentMeeting;
        } else {
            // Fallback to mock data
            this.currentMeeting = {
                id: 1,
                title: 'Team Standup Meeting',
                date: '2024-01-15',
                startTime: '09:00',
                duration: 60,
                room: 'Conference Room A',
                attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
                status: 'active'
            };
        }

        this.minutes.attendees = [...this.currentMeeting.attendees];
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateMeetingInfo();
        this.updateAgendaDisplay();
        this.updateAttendeesDisplay();
        this.updateDecisionsDisplay();
        this.updateActionItemsDisplay();
        this.updateNextMeetingDisplay();
        this.updateAttachmentsDisplay(); // Update attachments display
    }

    updateMeetingInfo() {
        if (!this.currentMeeting) return;

        const titleElement = document.getElementById('minutesMeetingTitle');
        const dateElement = document.getElementById('minutesMeetingDate');
        const timeElement = document.getElementById('minutesMeetingTime');
        const roomElement = document.getElementById('minutesMeetingRoom');

        if (titleElement) titleElement.textContent = this.currentMeeting.title;
        if (dateElement) dateElement.textContent = this.currentMeeting.date;
        if (timeElement) {
            const endTime = this.calculateEndTime(this.currentMeeting.startTime, this.currentMeeting.duration);
            timeElement.textContent = `${this.currentMeeting.startTime} - ${endTime}`;
        }
        if (roomElement) roomElement.textContent = this.currentMeeting.room;
    }

    updateAgendaDisplay() {
        const agendaContainer = document.getElementById('agendaContainer');
        if (!agendaContainer) return;

        if (this.minutes.agenda.length === 0) {
            agendaContainer.innerHTML = '<p class="no-agenda">No agenda items added yet</p>';
            return;
        }

        const agendaHTML = this.minutes.agenda.map((item, index) => `
            <div class="agenda-item" data-index="${index}">
                <div class="agenda-content">
                    <span class="agenda-number">${index + 1}.</span>
                    <input type="text" class="agenda-text" value="${item.text}" 
                           onchange="window.minutesManager.updateAgendaItem(${index}, this.value)">
                    <span class="agenda-duration">${item.duration || '5'} min</span>
                </div>
                <button type="button" class="remove-agenda" onclick="window.minutesManager.removeAgendaItem(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        agendaContainer.innerHTML = agendaHTML;
    }

    updateAttendeesDisplay() {
        const attendeesContainer = document.getElementById('attendeesContainer');
        if (!attendeesContainer) return;

        if (this.minutes.attendees.length === 0) {
            attendeesContainer.innerHTML = '<p class="no-attendees">No attendees added yet</p>';
            return;
        }

        const attendeesHTML = this.minutes.attendees.map((attendee, index) => `
            <div class="attendee-item" data-index="${index}">
                <div class="attendee-content">
                    <span class="attendee-name">${attendee}</span>
                    <span class="attendee-role">${attendee.role || 'Participant'}</span>
                </div>
                <button type="button" class="remove-attendee" onclick="window.minutesManager.removeAttendee(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        attendeesContainer.innerHTML = attendeesHTML;
    }

    updateDecisionsDisplay() {
        const decisionsContainer = document.getElementById('decisionsContainer');
        if (!decisionsContainer) return;

        if (this.minutes.decisions.length === 0) {
            decisionsContainer.innerHTML = '<p class="no-decisions">No decisions recorded yet</p>';
            return;
        }

        const decisionsHTML = this.minutes.decisions.map((decision, index) => `
            <div class="decision-item" data-index="${index}">
                <div class="decision-content">
                    <textarea class="decision-text" placeholder="Decision description" 
                              onchange="window.minutesManager.updateDecision(${index}, this.value)">${decision.text}</textarea>
                    <div class="decision-meta">
                        <span class="decision-maker">${decision.maker || 'Team'}</span>
                        <span class="decision-date">${decision.date || new Date().toLocaleDateString()}</span>
                    </div>
                </div>
                <button type="button" class="remove-decision" onclick="window.minutesManager.removeDecision(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        decisionsContainer.innerHTML = decisionsHTML;
    }

    updateActionItemsDisplay() {
        const actionItemsContainer = document.getElementById('actionItemsContainer');
        if (!actionItemsContainer) return;

        if (this.minutes.actionItems.length === 0) {
            actionItemsContainer.innerHTML = '<p class="no-action-items">No action items recorded yet</p>';
            return;
        }

        const actionItemsHTML = this.minutes.actionItems.map((item, index) => `
            <div class="action-item" data-index="${index}">
                <div class="action-content">
                    <div class="action-header">
                        <input type="text" class="action-description" placeholder="Action item description" 
                               value="${item.description}" onchange="window.minutesManager.updateActionItem(${index}, 'description', this.value)">
                        <select class="action-priority" onchange="window.minutesManager.updateActionItem(${index}, 'priority', this.value)">
                            <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High</option>
                        </select>
                    </div>
                    <div class="action-details">
                        <input type="text" class="action-assignee" placeholder="Assignee" 
                               value="${item.assignee || ''}" onchange="window.minutesManager.updateActionItem(${index}, 'assignee', this.value)">
                        <input type="date" class="action-due-date" 
                               value="${item.dueDate || ''}" onchange="window.minutesManager.updateActionItem(${index}, 'dueDate', this.value)">
                    </div>
                </div>
                <button type="button" class="remove-action-item" onclick="window.minutesManager.removeActionItem(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        actionItemsContainer.innerHTML = actionItemsHTML;
    }

    updateNextMeetingDisplay() {
        const nextMeetingContainer = document.getElementById('nextMeetingContainer');
        if (!nextMeetingContainer) return;

        if (!this.minutes.nextMeeting) {
            nextMeetingContainer.innerHTML = '<p class="no-next-meeting">No next meeting scheduled</p>';
            return;
        }

        nextMeetingContainer.innerHTML = `
            <div class="next-meeting-info">
                <h4>Next Meeting</h4>
                <p><strong>Date:</strong> ${this.minutes.nextMeeting.date}</p>
                <p><strong>Time:</strong> ${this.minutes.nextMeeting.time}</p>
                <p><strong>Room:</strong> ${this.minutes.nextMeeting.room}</p>
                <p><strong>Purpose:</strong> ${this.minutes.nextMeeting.purpose}</p>
            </div>
        `;
    }

    setupTemplates() {
        const templateSelect = document.getElementById('templateSelect');
        if (!templateSelect) return;

        // Add template options
        Object.keys(this.templates).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ' Meeting';
            templateSelect.appendChild(option);
        });
    }

    applyTemplate(templateKey) {
        if (!templateKey || !this.templates[templateKey]) return;

        const template = this.templates[templateKey];
        
        // Clear existing agenda
        this.minutes.agenda = [];
        
        // Add template agenda items
        template.agenda.forEach(item => {
            this.minutes.agenda.push({
                text: item,
                duration: 5,
                completed: false
            });
        });

        this.updateAgendaDisplay();
        this.showSuccess(`Applied ${templateKey} template`);
    }

    addAgendaItem() {
        const newItem = {
            text: 'New agenda item',
            duration: 5,
            completed: false
        };

        this.minutes.agenda.push(newItem);
        this.updateAgendaDisplay();
        this.autoSave();
    }

    removeAgendaItem(index) {
        if (index >= 0 && index < this.minutes.agenda.length) {
            this.minutes.agenda.splice(index, 1);
            this.updateAgendaDisplay();
            this.autoSave();
        }
    }

    updateAgendaItem(index, text) {
        if (index >= 0 && index < this.minutes.agenda.length) {
            this.minutes.agenda[index].text = text;
            this.autoSave();
        }
    }

    addAttendee() {
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
    removeAttendee(index) {
        if (index >= 0 && index < this.minutes.attendees.length) {
            this.minutes.attendees.splice(index, 1);
            this.updateAttendeesDisplay();
            this.autoSave();
        }
    }

    addDecision() {
        const newDecision = {
            text: '',
            maker: 'Team',
            date: new Date().toLocaleDateString()
        };

        this.minutes.decisions.push(newDecision);
        this.updateDecisionsDisplay();
        this.autoSave();
    }

    removeDecision(index) {
        if (index >= 0 && index < this.minutes.decisions.length) {
            this.minutes.decisions.splice(index, 1);
            this.updateDecisionsDisplay();
            this.autoSave();
        }
    }

    updateDecision(index, text) {
        if (index >= 0 && index < this.minutes.decisions.length) {
            this.minutes.decisions[index].text = text;
            this.autoSave();
        }
    }

    addActionItem() {
        const newActionItem = {
            description: '',
            assignee: '',
            priority: 'medium',
            dueDate: '',
            completed: false
        };

        this.minutes.actionItems.push(newActionItem);
        this.updateActionItemsDisplay();
        this.autoSave();
    }

    removeActionItem(index) {
        if (index >= 0 && index < this.minutes.actionItems.length) {
            this.minutes.actionItems.splice(index, 1);
            this.updateActionItemsDisplay();
            this.autoSave();
        }
    }

    updateActionItem(index, field, value) {
        if (index >= 0 && index < this.minutes.actionItems.length) {
            this.minutes.actionItems[index][field] = value;
            this.autoSave();
        }
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    autoSave() {
        const notesTextarea = document.getElementById('meetingNotes');
        if (notesTextarea) {
            this.minutes.notes = notesTextarea.value;
        }

        // Save to localStorage
        const saveData = {
            meetingId: this.currentMeeting?.id,
            minutes: this.minutes,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem(`meeting_minutes_${this.currentMeeting?.id}`, JSON.stringify(saveData));
        
        // Show auto-save indicator
        this.showAutoSaveIndicator();
    }

    showAutoSaveIndicator() {
        const autoSaveIndicator = document.getElementById('autoSaveIndicator');
        if (autoSaveIndicator) {
            autoSaveIndicator.textContent = 'Auto-saved';
            autoSaveIndicator.style.opacity = '1';
            
            setTimeout(() => {
                autoSaveIndicator.style.opacity = '0.5';
            }, 2000);
        }
    }

    async saveMinutes() {
        try {
            this.autoSave();
            
            if (window.apiConfig) {
                const minutesData = {
                    meetingId: this.currentMeeting.id,
                    agenda: this.minutes.agenda,
                    attendees: this.minutes.attendees,
                    decisions: this.minutes.decisions,
                    actionItems: this.minutes.actionItems,
                    notes: this.minutes.notes,
                    attachments: this.minutes.attachments,
                    nextMeeting: this.minutes.nextMeeting,
                    lastUpdated: new Date().toISOString()
                };

                if (this.minutes.id) {
                    // Update existing minutes
                    const response = await window.apiConfig.updateMinutes(this.minutes.id, minutesData);
                    if (response.success) {
                        this.showSuccess('Minutes updated successfully');
                    } else {
                        throw new Error(response.error || 'Failed to update minutes');
                    }
                } else {
                    // Create new minutes
                    const response = await window.apiConfig.createMinutes(minutesData);
                    if (response.success) {
                        this.minutes.id = response.data.id;
                        this.showSuccess('Minutes saved successfully');
                    } else {
                        throw new Error(response.error || 'Failed to save minutes');
                    }
                }
            } else {
                // Fallback to local storage
                this.showSuccess('Minutes saved to local storage');
            }
            
            // Trigger any save callbacks
            if (window.onMinutesSaved) {
                window.onMinutesSaved(this.minutes);
            }
        } catch (error) {
            console.error('Error saving minutes:', error);
            this.showError('Failed to save minutes. Please try again.');
        }
    }

    setupExport() {
        // Export functionality will be implemented here
    }

    async exportMinutes() {
        try {
            if (window.apiConfig && this.minutes.id) {
                // Export via API
                const response = await window.apiConfig.exportMinutes(this.minutes.id, 'pdf');
                
                if (response.success) {
                    // Download the exported file
                    const link = document.createElement('a');
                    link.href = response.data.downloadUrl;
                    link.download = `meeting_minutes_${this.currentMeeting?.title?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                    link.click();
                    
                    this.showSuccess('Minutes exported successfully');
                } else {
                    throw new Error(response.error || 'Failed to export minutes');
                }
            } else {
                // Fallback to local export
                this.exportMinutesLocally();
            }
        } catch (error) {
            console.error('Error exporting minutes:', error);
            this.showError('Failed to export minutes. Please try again.');
            // Fallback to local export
            this.exportMinutesLocally();
        }
    }

    exportMinutesLocally() {
        const exportData = {
            meeting: this.currentMeeting,
            minutes: this.minutes,
            exportDate: new Date().toISOString()
        };

        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `meeting_minutes_${this.currentMeeting?.title?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showSuccess('Minutes exported locally');
    }

    scheduleNextMeeting() {
        const date = prompt('Enter next meeting date (YYYY-MM-DD):');
        const time = prompt('Enter next meeting time (HH:MM):');
        const room = prompt('Enter room:');
        const purpose = prompt('Enter meeting purpose:');

        if (date && time && room && purpose) {
            this.minutes.nextMeeting = {
                date: date,
                time: time,
                room: room,
                purpose: purpose
            };

            this.updateNextMeetingDisplay();
            this.autoSave();
            this.showSuccess('Next meeting scheduled');
        }
    }

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
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

    showError(message) {
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(message, 'error');
        } else {
            // Fallback error display
            console.error(message);
            alert(message);
        }
    }

    showInfo(message) {
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(message, 'info');
        } else {
            // Fallback info display
            console.log(message);
            alert(message);
        }
    }

    // Public methods for external access
    getMinutes() {
        return this.minutes;
    }

    getCurrentMeeting() {
        return this.currentMeeting;
    }

    // Load minutes from storage
    loadFromStorage() {
        if (!this.currentMeeting?.id) return;

        const savedData = localStorage.getItem(`meeting_minutes_${this.currentMeeting.id}`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.minutes) {
                    this.minutes = { ...this.minutes, ...parsed.minutes };
                    this.updateDisplay();
                    
                    // Update notes textarea
                    const notesTextarea = document.getElementById('meetingNotes');
                    if (notesTextarea) {
                        notesTextarea.value = this.minutes.notes || '';
                    }
                }
            } catch (error) {
                console.error('Error loading saved minutes:', error);
            }
        }
    }

    // Global functions for HTML onclick handlers
    downloadFile(fileId) {
        if (window.minutesManager) {
            window.minutesManager.downloadFile(fileId);
        }
    }

    removeFile(fileIndex) {
        if (window.minutesManager) {
            window.minutesManager.removeFile(fileIndex);
        }
    }
}

// Initialize minutes manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.minutesManager = new MinutesManager();
    
    // Load saved data after a short delay to ensure DOM is ready
    setTimeout(() => {
        window.minutesManager.loadFromStorage();
    }, 100);
}); 