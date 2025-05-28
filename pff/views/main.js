// API URL
const API_URL = 'http://localhost:5000/api';

// Store events in memory
let events = [];

// DOM Elements
const eventForm = document.getElementById('eventForm');
const listView = document.getElementById('listView');
const calendarView = document.getElementById('calendarView');
const listViewBtn = document.getElementById('listViewBtn');
const calendarViewBtn = document.getElementById('calendarViewBtn');

// Event Listeners
eventForm.addEventListener('submit', addEvent);
listViewBtn.addEventListener('click', () => switchView('list'));
calendarViewBtn.addEventListener('click', () => switchView('calendar'));

// Initialize the app
async function init() {
    await fetchEvents();
    // Set minimum date as today for the date input
    document.getElementById('eventDate').min = new Date().toISOString().split('T')[0];
}

// Fetch events from API
async function fetchEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        events = await response.json();
        displayEvents();
    } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to load events. Please try again later.');
    }
}

// Add new event
async function addEvent(e) {
    e.preventDefault();

    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;

    const newEvent = {
        title: eventName,
        description: 'Event created from frontend',
        date: new Date(`${eventDate}T${eventTime}`),
        location: 'Default Location'
    };

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent)
        });

        if (!response.ok) throw new Error('Failed to create event');

        await fetchEvents();
        eventForm.reset();
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
    }
}

// Display events in list view
function displayListView() {
    listView.innerHTML = '';
    
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();
        
        const eventElement = document.createElement('div');
        eventElement.className = `event-card ${isUpcoming ? 'upcoming' : ''}`;
        eventElement.innerHTML = `
            <h3>${event.title}</h3>
            <div class="event-time">
                ${formatDate(event.date)} at ${formatTime(event.date)}
            </div>
            <div class="event-actions">
                <button onclick="editEvent('${event._id}')" class="edit-btn">Edit</button>
                <button onclick="deleteEvent('${event._id}')" class="delete-btn">Delete</button>
            </div>
        `;
        
        listView.appendChild(eventElement);
    });
}

// Display events in calendar view
function displayCalendarView() {
    calendarView.innerHTML = '';
    
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarView.appendChild(dayHeader);
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarView.appendChild(emptyDay);
    }
    
    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toISOString().split('T')[0] === dateStr;
        });
        
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-event');
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayEvents.map(event => `
                <div class="calendar-event">
                    ${event.title} (${formatTime(event.date)})
                </div>
            `).join('')}
        `;
        
        calendarView.appendChild(dayElement);
    }
}

// Switch between list and calendar views
function switchView(view) {
    if (view === 'list') {
        listView.classList.add('active');
        calendarView.classList.remove('active');
        listViewBtn.classList.add('active');
        calendarViewBtn.classList.remove('active');
        displayListView();
    } else {
        calendarView.classList.add('active');
        listView.classList.remove('active');
        calendarViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        displayCalendarView();
    }
}

// Edit event
async function editEvent(id) {
    const event = events.find(e => e._id === id);
    if (!event) return;

    const newName = prompt('Enter new event name:', event.title);
    const newDate = prompt('Enter new date (YYYY-MM-DD):', new Date(event.date).toISOString().split('T')[0]);
    const newTime = prompt('Enter new time (HH:MM):', formatTime(event.date));

    if (newName && newDate && newTime) {
        try {
            // Create date string in ISO format with local timezone offset
            const [hours, minutes] = newTime.split(':');
            const dateObj = new Date(newDate);
            dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newName,
                    description: event.description,
                    date: dateObj.toISOString(),
                    location: event.location
                })
            });

            if (!response.ok) throw new Error('Failed to update event');

            await fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Failed to update event. Please try again.');
        }
    }
}

// Delete event
async function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete event');

            await fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        }
    }
}

// Helper function to format date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Helper function to format time
function formatTime(date) {
    return new Date(date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Display events based on current view
function displayEvents() {
    if (listView.classList.contains('active')) {
        displayListView();
    } else {
        displayCalendarView();
    }
}

// Initialize the app when the page loads
init(); 