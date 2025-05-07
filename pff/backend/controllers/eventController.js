const Event = require('../models/Event');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Display events in browser
exports.displayEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.send(`
      <html>
        <head>
          <title>Events in Database</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .event { border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .event h3 { margin: 0 0 10px 0; }
            .event p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Events in Database</h1>
          ${events.length === 0 ? '<p>No events found in database.</p>' : ''}
          ${events.map(event => `
            <div class="event">
              <h3>${event.title}</h3>
              <p><strong>Description:</strong> ${event.description}</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Created:</strong> ${new Date(event.createdAt).toLocaleString()}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}; 