// Demo Data for MeetingHub System
// This file provides sample data when the API is not available

window.demoData = {
    // Sample users
    users: [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            role: 'Manager',
            permissions: ['dashboard', 'booking', 'minutes', 'admin'],
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            role: 'Developer',
            permissions: ['dashboard', 'booking', 'minutes'],
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=22c55e&color=fff'
        },
        {
            id: 3,
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@company.com',
            role: 'Designer',
            permissions: ['dashboard', 'booking'],
            avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=f59e0b&color=fff'
        },
        {
            id: 4,
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@company.com',
            role: 'Product Manager',
            permissions: ['dashboard', 'booking', 'minutes'],
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=8b5cf6&color=fff'
        }
    ],

    // Sample rooms
    rooms: [
        {
            id: 'room1',
            name: 'Conference Room A',
            capacity: 10,
            status: 'available',
            equipment: ['Projector', 'Whiteboard', 'Video Conference', 'Audio System'],
            features: ['video-conference', 'presentation', 'whiteboard', 'audio-system'],
            location: '1st Floor',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
        },
        {
            id: 'room2',
            name: 'Conference Room B',
            capacity: 15,
            status: 'booked',
            equipment: ['Projector', 'Whiteboard', 'Video Conference'],
            features: ['video-conference', 'presentation', 'whiteboard'],
            location: '1st Floor',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
        },
        {
            id: 'room3',
            name: 'Board Room',
            capacity: 20,
            status: 'available',
            equipment: ['Projector', 'Whiteboard', 'Video Conference', 'Audio System', 'Coffee Service'],
            features: ['video-conference', 'presentation', 'whiteboard', 'audio-system', 'premium'],
            location: '2nd Floor',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
        },
        {
            id: 'room4',
            name: 'Small Meeting Room',
            capacity: 6,
            status: 'maintenance',
            equipment: ['Whiteboard'],
            features: ['whiteboard'],
            location: '1st Floor',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
        },
        {
            id: 'room5',
            name: 'Training Room',
            capacity: 25,
            status: 'available',
            equipment: ['Projector', 'Whiteboard', 'Video Conference', 'Audio System', 'Training Equipment'],
            features: ['video-conference', 'presentation', 'whiteboard', 'audio-system', 'training'],
            location: '3rd Floor',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
        }
    ],

    // Sample meetings
    meetings: [
        {
            id: 1,
            title: 'Team Standup Meeting',
            date: '2024-01-15',
            startTime: '09:00',
            duration: 60,
            room: 'Conference Room A',
            roomId: 'room1',
            attendees: ['john.doe@company.com', 'jane.smith@company.com', 'mike.johnson@company.com'],
            recurring: true,
            videoConference: true,
            status: 'upcoming',
            type: 'recurring',
            createdBy: 'john.doe@company.com',
            createdAt: '2024-01-10T10:00:00Z'
        },
        {
            id: 2,
            title: 'Project Review',
            date: '2024-01-15',
            startTime: '14:00',
            duration: 120,
            room: 'Board Room',
            roomId: 'room3',
            attendees: ['john.doe@company.com', 'sarah.wilson@company.com', 'david.brown@company.com'],
            recurring: false,
            videoConference: true,
            status: 'upcoming',
            type: 'one-time',
            createdBy: 'sarah.wilson@company.com',
            createdAt: '2024-01-12T14:00:00Z'
        },
        {
            id: 3,
            title: 'Design Sprint Planning',
            date: '2024-01-16',
            startTime: '10:00',
            duration: 180,
            room: 'Training Room',
            roomId: 'room5',
            attendees: ['mike.johnson@company.com', 'jane.smith@company.com', 'sarah.wilson@company.com'],
            recurring: false,
            videoConference: false,
            status: 'upcoming',
            type: 'one-time',
            createdBy: 'mike.johnson@company.com',
            createdAt: '2024-01-13T16:00:00Z'
        },
        {
            id: 4,
            title: 'Weekly All-Hands',
            date: '2024-01-17',
            startTime: '16:00',
            duration: 90,
            room: 'Conference Room B',
            roomId: 'room2',
            attendees: ['john.doe@company.com', 'jane.smith@company.com', 'mike.johnson@company.com', 'sarah.wilson@company.com'],
            recurring: true,
            videoConference: true,
            status: 'upcoming',
            type: 'recurring',
            createdBy: 'john.doe@company.com',
            createdAt: '2024-01-08T09:00:00Z'
        }
    ],

    // Sample minutes
    minutes: [
        {
            id: 1,
            meetingId: 1,
            meetingTitle: 'Team Standup Meeting',
            date: '2024-01-15',
            attendees: [
                { name: 'John Doe', role: 'Manager' },
                { name: 'Jane Smith', role: 'Developer' },
                { name: 'Mike Johnson', role: 'Designer' }
            ],
            agenda: [
                { text: 'Team Updates', duration: 5, completed: true },
                { text: 'Blockers', duration: 5, completed: true },
                { text: 'Today\'s Goals', duration: 5, completed: true }
            ],
            decisions: [
                { text: 'Use JWT for authentication', maker: 'Team', date: '2024-01-15' },
                { text: 'Implement OAuth2 for third-party integrations', maker: 'Team', date: '2024-01-15' }
            ],
            actionItems: [
                { description: 'Complete user authentication module', assignee: 'John Doe', priority: 'high', dueDate: '2024-01-20', completed: false },
                { description: 'Review API documentation', assignee: 'Jane Smith', priority: 'medium', dueDate: '2024-01-18', completed: true },
                { description: 'Update deployment scripts', assignee: 'Mike Johnson', priority: 'low', dueDate: '2024-01-10', completed: false }
            ],
            notes: 'Team discussed current sprint progress and identified blockers in the authentication module. Jane completed the API documentation review ahead of schedule.',
            attachments: [],
            nextMeeting: {
                date: '2024-01-22',
                time: '09:00',
                room: 'Conference Room A',
                purpose: 'Weekly standup continuation'
            },
            lastUpdated: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            meetingId: 2,
            meetingTitle: 'Project Review',
            date: '2024-01-14',
            attendees: [
                { name: 'John Doe', role: 'Manager' },
                { name: 'Sarah Wilson', role: 'Product Manager' },
                { name: 'David Brown', role: 'Stakeholder' }
            ],
            agenda: [
                { text: 'Review Previous Sprint', duration: 30, completed: true },
                { text: 'Sprint Planning', duration: 45, completed: true },
                { text: 'Resource Allocation', duration: 15, completed: true }
            ],
            decisions: [
                { text: 'Extend project timeline by 2 weeks', maker: 'John Doe', date: '2024-01-14' },
                { text: 'Increase budget for additional resources', maker: 'David Brown', date: '2024-01-14' }
            ],
            actionItems: [
                { description: 'Prepare quarterly report', assignee: 'Sarah Wilson', priority: 'high', dueDate: '2024-01-25', completed: false },
                { description: 'Schedule stakeholder meeting', assignee: 'David Brown', priority: 'medium', dueDate: '2024-01-22', completed: false }
            ],
            notes: 'Project is 85% complete but needs additional time and resources to meet quality standards. Stakeholder approved budget increase.',
            attachments: [],
            nextMeeting: null,
            lastUpdated: '2024-01-14T16:00:00Z'
        }
    ],

    // Sample notifications
    notifications: [
        {
            id: 1,
            type: 'info',
            title: 'Meeting Reminder',
            message: 'Team Standup in 15 minutes',
            time: '5 min ago',
            meetingId: 1,
            priority: 'high',
            read: false
        },
        {
            id: 2,
            type: 'success',
            title: 'Booking Confirmed',
            message: 'Project Review confirmed for 2:00 PM',
            time: '1 hour ago',
            meetingId: 2,
            priority: 'normal',
            read: false
        },
        {
            id: 3,
            type: 'warning',
            title: 'Room Maintenance',
            message: 'Small Meeting Room is under maintenance until tomorrow',
            time: '2 hours ago',
            priority: 'normal',
            read: true
        },
        {
            id: 4,
            type: 'info',
            title: 'New Meeting Request',
            message: 'Sarah Wilson requested to join Design Sprint Planning',
            time: '3 hours ago',
            priority: 'low',
            read: false
        }
    ],

    // Sample room availability
    roomAvailability: {
        'room1': [
            { date: '2024-01-15', startTime: '09:00', endTime: '10:00', status: 'booked' },
            { date: '2024-01-15', startTime: '14:00', endTime: '15:00', status: 'available' },
            { date: '2024-01-16', startTime: '10:00', endTime: '11:00', status: 'available' }
        ],
        'room2': [
            { date: '2024-01-15', startTime: '14:00', endTime: '16:00', status: 'booked' },
            { date: '2024-01-16', startTime: '09:00', endTime: '10:00', status: 'available' }
        ],
        'room3': [
            { date: '2024-01-15', startTime: '14:00', endTime: '16:00', status: 'booked' },
            { date: '2024-01-16', startTime: '10:00', endTime: '13:00', status: 'available' }
        ]
    },

    // Sample analytics data
    analytics: {
        roomUsage: {
            labels: ['Conference Room A', 'Conference Room B', 'Board Room', 'Small Meeting Room', 'Training Room'],
            data: [75, 60, 80, 20, 45]
        },
        meetingStats: {
            totalMeetings: 156,
            avgDuration: 67,
            utilization: 68.5,
            monthlyGrowth: 12.3
        },
        popularTimes: {
            '09:00': 25,
            '10:00': 18,
            '14:00': 22,
            '15:00': 15,
            '16:00': 20
        }
    }
};

// Helper function to get demo data
window.getDemoData = function(type, filters = {}) {
    const data = window.demoData[type] || [];
    
    if (filters.search) {
        return data.filter(item => {
            const searchableText = JSON.stringify(item).toLowerCase();
            return searchableText.includes(filters.search.toLowerCase());
        });
    }
    
    if (filters.status) {
        return data.filter(item => item.status === filters.status);
    }
    
    if (filters.priority) {
        return data.filter(item => item.priority === filters.priority);
    }
    
    return data;
};

// Helper function to simulate API delay
window.simulateApiCall = function(data, delay = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: data,
                status: 200
            });
        }, delay);
    });
};

// Helper function to simulate API error
window.simulateApiError = function(message, status = 500, delay = 300) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject({
                success: false,
                error: message,
                status: status
            });
        }, delay);
    });
}; 