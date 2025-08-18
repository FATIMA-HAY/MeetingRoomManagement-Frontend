// Active Meeting Module
class MeetingManager {
    constructor() {
        this.currentMeeting = null;
        this.timer = {
            isRunning: false,
            startTime: null,
            elapsedTime: 0,
            interval: null
        };
        this.transcription = {
            isEnabled: false,
            content: [],
            recognition: null
        };
        this.meetingNotes = {
            agenda: [],
            decisions: [],
            actionItems: [],
            attachments: []
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMeetingData();
        this.initializeTimer();
        this.setupTranscription();
        this.setupFileUpload();
    }

    setupEventListeners() {
        // Timer controls
        const startTimer = document.getElementById('startTimer');
        const pauseTimer = document.getElementById('pauseTimer');
        const resetTimer = document.getElementById('resetTimer');

        if (startTimer) {
            startTimer.addEventListener('click', () => this.startTimer());
        }

        if (pauseTimer) {
            pauseTimer.addEventListener('click', () => this.pauseTimer());
        }

        if (resetTimer) {
            resetTimer.addEventListener('click', () => this.resetTimer());
        }

        // Transcription toggle
        const transcriptionToggle = document.getElementById('transcriptionToggle');
        if (transcriptionToggle) {
            transcriptionToggle.addEventListener('change', () => this.toggleTranscription());
        }

        // Meeting notes
        const takeNotesBtn = document.querySelector('[onclick="openMinutes()"]');
        if (takeNotesBtn) {
            takeNotesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMinutes();
            });
        }

        // Screen sharing
        const shareScreenBtn = document.querySelector('[onclick="shareScreen()"]');
        if (shareScreenBtn) {
            shareScreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.shareScreen();
            });
        }

        // Invite participant
        const inviteParticipantBtn = document.querySelector('[onclick="inviteParticipant()"]');
        if (inviteParticipantBtn) {
            inviteParticipantBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.inviteParticipant();
            });
        }

        // Video conferencing integration
        const joinZoomBtn = document.querySelector('[onclick="joinZoom()"]');
        if (joinZoomBtn) {
            joinZoomBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.joinZoom();
            });
        }

        const joinTeamsBtn = document.querySelector('[onclick="joinTeams()"]');
        if (joinTeamsBtn) {
            joinTeamsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.joinTeams();
            });
        }
    }

    loadMeetingData() {
        // Get meeting data from global context or URL parameters
        if (window.currentMeeting) {
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

        this.updateMeetingDisplay();
    }

    updateMeetingDisplay() {
        if (!this.currentMeeting) return;

        // Update meeting title
        const titleElement = document.getElementById('meetingTitle');
        if (titleElement) {
            titleElement.textContent = this.currentMeeting.title;
        }

        // Update meeting time
        const timeElement = document.getElementById('meetingTime');
        if (timeElement) {
            const endTime = this.calculateEndTime(this.currentMeeting.startTime, this.currentMeeting.duration);
            timeElement.textContent = `Today at ${this.currentMeeting.startTime} - ${endTime}`;
        }

        // Update attendees
        const attendeesElement = document.getElementById('meetingAttendees');
        if (attendeesElement) {
            attendeesElement.textContent = this.currentMeeting.attendees.join(', ');
        }

        // Update room
        const roomElement = document.getElementById('meetingRoom');
        if (roomElement) {
            roomElement.textContent = this.currentMeeting.room;
        }

        // Update duration
        const durationElement = document.getElementById('meetingDuration');
        if (durationElement) {
            durationElement.textContent = `${this.currentMeeting.duration} minutes`;
        }
    }

    initializeTimer() {
        this.timer.elapsedTime = 0;
        this.updateTimerDisplay();
    }

    startTimer() {
        if (this.timer.isRunning) return;

        this.timer.isRunning = true;
        this.timer.startTime = Date.now() - this.timer.elapsedTime;
        
        this.timer.interval = setInterval(() => {
            this.timer.elapsedTime = Date.now() - this.timer.startTime;
            this.updateTimerDisplay();
        }, 1000);

        // Update button states
        this.updateTimerButtonStates();
    }

    pauseTimer() {
        if (!this.timer.isRunning) return;

        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        this.timer.interval = null;

        // Update button states
        this.updateTimerButtonStates();
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.elapsedTime = 0;
        this.updateTimerDisplay();
        this.updateTimerButtonStates();
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('meetingTimer');
        if (!timerElement) return;

        const hours = Math.floor(this.timer.elapsedTime / 3600000);
        const minutes = Math.floor((this.timer.elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((this.timer.elapsedTime % 60000) / 1000);

        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTimerButtonStates() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        if (startBtn) {
            startBtn.disabled = this.timer.isRunning;
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.timer.isRunning;
        }

        if (resetBtn) {
            resetBtn.disabled = this.timer.isRunning;
        }
    }

    setupTranscription() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.transcription.recognition = new SpeechRecognition();
            
            this.transcription.recognition.continuous = true;
            this.transcription.recognition.interimResults = true;
            this.transcription.recognition.lang = 'en-US';

            this.transcription.recognition.onresult = (event) => {
                if (this.transcription.isEnabled) {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        this.addTranscriptionEntry(finalTranscript, 'final');
                    }
                    if (interimTranscript) {
                        this.updateInterimTranscription(interimTranscript);
                    }
                }
            };

            this.transcription.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showError('Speech recognition error: ' + event.error);
            };
        } else {
            // Hide transcription toggle if not supported
            const transcriptionToggle = document.getElementById('transcriptionToggle');
            if (transcriptionToggle) {
                transcriptionToggle.parentElement.style.display = 'none';
            }
        }
    }

    toggleTranscription() {
        const toggle = document.getElementById('transcriptionToggle');
        if (!toggle) return;

        this.transcription.isEnabled = toggle.checked;

        if (this.transcription.isEnabled) {
            this.startTranscription();
        } else {
            this.stopTranscription();
        }
    }

    startTranscription() {
        if (this.transcription.recognition) {
            try {
                this.transcription.recognition.start();
                this.showInfo('Transcription started');
            } catch (error) {
                console.error('Failed to start transcription:', error);
                this.showError('Failed to start transcription');
            }
        }
    }

    stopTranscription() {
        if (this.transcription.recognition) {
            try {
                this.transcription.recognition.stop();
                this.showInfo('Transcription stopped');
            } catch (error) {
                console.error('Failed to stop transcription:', error);
            }
        }
    }

    addTranscriptionEntry(text, type = 'final') {
        const entry = {
            id: Date.now(),
            text: text,
            type: type,
            timestamp: new Date().toLocaleTimeString(),
            speaker: 'Unknown' // In a real app, this would identify the speaker
        };

        this.transcription.content.push(entry);
        this.updateTranscriptionDisplay();
    }

    updateInterimTranscription(text) {
        const contentElement = document.getElementById('transcriptionContent');
        if (!contentElement) return;

        // Find and update the interim entry or create a new one
        const interimEntry = this.transcription.content.find(entry => entry.type === 'interim');
        if (interimEntry) {
            interimEntry.text = text;
        } else {
            this.addTranscriptionEntry(text, 'interim');
        }

        this.updateTranscriptionDisplay();
    }

    updateTranscriptionDisplay() {
        const contentElement = document.getElementById('transcriptionContent');
        if (!contentElement) return;

        if (this.transcription.content.length === 0) {
            contentElement.innerHTML = '<p class="transcription-placeholder">Transcription will appear here when enabled...</p>';
            return;
        }

        const transcriptHTML = this.transcription.content
            .filter(entry => entry.type === 'final')
            .map(entry => `
                <div class="transcription-entry">
                    <div class="transcription-header">
                        <span class="transcription-speaker">${entry.speaker}</span>
                        <span class="transcription-time">${entry.timestamp}</span>
                    </div>
                    <div class="transcription-text">${entry.text}</div>
                </div>
            `)
            .join('');

        contentElement.innerHTML = transcriptHTML;
        contentElement.scrollTop = contentElement.scrollHeight;
    }

    setupFileUpload() {
        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            this.addAttachment(file);
        });
    }

    addAttachment(file) {
        const attachment = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: this.formatFileSize(file.size),
            type: file.type,
            file: file
        };

        this.meetingNotes.attachments.push(attachment);
        this.updateAttachmentsDisplay();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateAttachmentsDisplay() {
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (!uploadedFiles) return;

        if (this.meetingNotes.attachments.length === 0) {
            uploadedFiles.innerHTML = '<p class="no-files">No files uploaded yet</p>';
            return;
        }

        const filesHTML = this.meetingNotes.attachments.map(attachment => `
            <div class="uploaded-file">
                <div class="file-info">
                    <i class="fas fa-file"></i>
                    <span class="file-name">${attachment.name}</span>
                    <span class="file-size">${attachment.size}</span>
                </div>
                <button type="button" class="remove-file" onclick="removeAttachment(${attachment.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        uploadedFiles.innerHTML = filesHTML;
    }

    openMinutes() {
        if (window.app) {
            window.app.showScreen('minutes');
            // Pass meeting data to minutes screen
            window.currentMeetingForMinutes = this.currentMeeting;
        }
    }

    shareScreen() {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true })
                .then(stream => {
                    this.showSuccess('Screen sharing started');
                    // In a real app, this would integrate with video conferencing
                })
                .catch(error => {
                    console.error('Screen sharing error:', error);
                    this.showError('Failed to start screen sharing');
                });
        } else {
            this.showError('Screen sharing not supported in this browser');
        }
    }

    inviteParticipant() {
        const email = prompt('Enter email address to invite:');
        if (email && this.validateEmail(email)) {
            // In a real app, this would send an invitation
            this.showSuccess(`Invitation sent to ${email}`);
        } else if (email) {
            this.showError('Please enter a valid email address');
        }
    }

    joinZoom() {
        // In a real app, this would integrate with Zoom API
        this.showInfo('Zoom integration would be implemented here');
    }

    joinTeams() {
        // In a real app, this would integrate with Teams API
        this.showInfo('Teams integration would be implemented here');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    showError(message) {
        if (window.app) {
            window.app.showError(message);
        }
    }

    showSuccess(message) {
        if (window.app) {
            window.app.showSuccess(message);
        }
    }

    showInfo(message) {
        if (window.app) {
            window.app.showInfo(message);
        }
    }

    // Public methods for external access
    getCurrentMeeting() {
        return this.currentMeeting;
    }

    getMeetingNotes() {
        return this.meetingNotes;
    }

    getTranscription() {
        return this.transcription.content;
    }

    getTimerStatus() {
        return {
            isRunning: this.timer.isRunning,
            elapsedTime: this.timer.elapsedTime
        };
    }

    // Cleanup method
    destroy() {
        if (this.timer.interval) {
            clearInterval(this.timer.interval);
        }
        if (this.transcription.recognition) {
            this.transcription.recognition.stop();
        }
    }
}

// Global functions for HTML onclick handlers
function removeAttachment(attachmentId) {
    if (window.meetingManager) {
        const attachmentIndex = window.meetingManager.meetingNotes.attachments.findIndex(a => a.id === attachmentId);
        if (attachmentIndex !== -1) {
            window.meetingManager.meetingNotes.attachments.splice(attachmentIndex, 1);
            window.meetingManager.updateAttachmentsDisplay();
        }
    }
}

// Initialize meeting manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.meetingManager = new MeetingManager();
}); 
