# MeetingHub - Professional Meeting Room Management System

A comprehensive, modern web application for managing meeting rooms, scheduling meetings, and tracking meeting minutes with full API integration.

## 🚀 Features

### 1. **Authentication & User Management**
- Secure login with email/password
- JWT token-based authentication
- Session management with auto-logout
- User role-based permissions
- Forgot password functionality

### 2. **Dashboard**
- **Upcoming Meetings**: List with time, title, room, and attendee count
- **Quick Actions**: Schedule Meeting, Join Now, View Minutes
- **Room Availability**: Real-time calendar/grid view with color coding
- **Notifications**: Meeting reminders, booking confirmations, and system alerts
- **Statistics**: Total meetings, today's meetings, available rooms, room utilization

### 3. **Meeting Room Booking**
- **Smart Form**: Title, date/time, duration, attendees, room selection
- **Room Availability Preview**: Color-coded time slots showing availability
- **Attendee Management**: Add/remove attendees with email validation
- **Advanced Options**: Recurring meetings, video conferencing toggle
- **Room Recommendations**: Based on attendee count and requirements

### 4. **Active Meeting Screen**
- **Meeting Information**: Title, time, attendees, room details
- **Meeting Controls**: Start/End meeting, timer with pause/reset
- **Live Transcription**: Toggle on/off with real-time display
- **Action Buttons**: Take Notes, Share Screen, Invite Participants
- **Integration**: Zoom/Teams join links

### 5. **Minutes Management**
- **Template System**: Pre-built templates for different meeting types
- **Attendee Tracking**: Auto-populated + editable attendee list
- **Agenda Management**: Dynamic agenda items with time allocation
- **Decision Tracking**: Record key decisions and decision makers
- **Action Items**: Assign tasks with priority, due dates, and status
- **File Attachments**: Upload and manage meeting documents
- **Auto-save**: Automatic saving every 30 seconds

### 6. **Post-Meeting Review**
- **Minutes Search**: Search by keyword, attendee, or meeting title
- **Advanced Filtering**: Date ranges, action item status, priority levels
- **Action Items Overview**: Summary statistics and tracking
- **Export Options**: PDF, Word, and JSON formats
- **Sharing**: Share minutes with team members

### 7. **Admin Panel**
- **Room Management**: Add/edit rooms with capacity and equipment
- **User Management**: Manage user accounts and permissions
- **Analytics**: Room usage statistics and meeting reports
- **System Reports**: Generate comprehensive usage reports

## 🎨 Design & Theme

### **Color Palette**
- **Primary**: Professional blue (#3b82f6) for main actions and branding
- **Secondary**: Neutral grays for text and backgrounds
- **Accent**: Green (#22c55e) for success states and positive actions
- **Warning**: Orange (#f59e0b) for alerts and pending items
- **Error**: Red (#ef4444) for errors and overdue items

### **Typography**
- **Font Family**: Inter - Modern, highly readable sans-serif
- **Font Weights**: 300 (Light) to 700 (Bold) for hierarchy
- **Responsive**: Scales appropriately across all device sizes

### **Logo & Branding**
- **Icon**: Building icon representing professional workspace
- **Name**: "MeetingHub" - Clear, professional, memorable
- **Tagline**: "Professional Meeting Room Management"

## 🏗️ Architecture

### **Frontend Structure**
```
meeting-room-booking-system/
├── index.html          # Landing page with authentication check
├── login.html          # Login screen
├── dashboard.html      # Main dashboard
├── booking.html        # Meeting room booking
├── meeting.html        # Active meeting screen
├── minutes.html        # Minutes creation/editing
├── minutes-review.html # Minutes review and search
├── admin.html          # Admin panel
├── css/
│   ├── style.css      # Main styles and variables
│   └── components.css # Component-specific styles
└── js/
    ├── api-config.js  # API configuration and methods
    ├── auth.js        # Authentication management
    ├── dashboard.js   # Dashboard functionality
    ├── booking.js     # Booking management
    ├── meeting.js     # Meeting controls
    ├── minutes.js     # Minutes management
    ├── minutes-review.js # Minutes review
    ├── admin.js       # Admin functionality
    ├── utils.js       # Utility functions
    └── router.js      # Navigation routing
```

### **API Integration**
- **Base URL**: Configurable API endpoint
- **Authentication**: Bearer token in headers
- **Error Handling**: Comprehensive error handling with fallbacks
- **Fallback Mode**: Local storage when API unavailable
- **Real-time Updates**: Automatic data refresh

## 🚀 Getting Started

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server or local development environment
- Backend API (optional - system works offline)

### **Installation**
1. Clone or download the repository
2. Place files in your web server directory
3. Configure API endpoints in `js/api-config.js` (optional)
4. Open `index.html` in your browser

### **Configuration**
Edit `js/api-config.js` to point to your backend:
```javascript
this.baseURL = 'https://your-api-domain.com/api';
```

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive grid layouts
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Optimized for touch interactions

## 🔧 Customization

### **Colors**
Modify CSS variables in `css/style.css`:
```css
:root {
    --primary-500: #3b82f6;    /* Main brand color */
    --accent-500: #22c55e;     /* Success color */
    --warning-500: #f59e0b;    /* Warning color */
    --error-500: #ef4444;      /* Error color */
}
```

### **Features**
- Enable/disable features in respective JavaScript files
- Modify form fields and validation rules
- Customize meeting templates and workflows

## 🌐 Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## 📊 Performance Features

- **Lazy Loading**: Components load on demand
- **Debounced Search**: Optimized search performance
- **Auto-save**: Prevents data loss
- **Offline Support**: Works without internet connection
- **Caching**: Intelligent data caching strategies

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Session Management**: Automatic session timeout
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based request validation

## 📈 Future Enhancements

- **Real-time Collaboration**: Live editing of minutes
- **Calendar Integration**: Google Calendar, Outlook sync
- **Video Conferencing**: Built-in video calls
- **Mobile App**: Native iOS/Android applications
- **AI Features**: Smart meeting scheduling, transcription
- **Advanced Analytics**: Predictive insights and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🎯 Use Cases

### **Corporate Offices**
- Conference room management
- Team meeting scheduling
- Executive meeting coordination

### **Educational Institutions**
- Classroom booking
- Faculty meeting management
- Student group meetings

### **Co-working Spaces**
- Shared workspace booking
- Meeting room rentals
- Community event scheduling

### **Healthcare Facilities**
- Medical staff meetings
- Patient consultation rooms
- Administrative meetings

---

**Built with ❤️ for modern workplace collaboration** 