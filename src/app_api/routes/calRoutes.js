import express from 'express';
import { GoogleCalendarService } from '../controllers/googleCalService.js';
const router = express.Router();
const calService = new GoogleCalendarService();
router.get('/', async (req, res) => {
    try {
        const events = await calService.listEvents(); // your function to fetch from Google Calendar
        res.json(events);
    }
    catch (error) {
        console.error('Failed to get events:', error);
        res.status(500).json({ error: 'Unable to fetch events' });
    }
});
router.post('/', express.json(), async (req, res) => {
    try {
        await calService.createEvent(req.body); // req.body should match Schema$Event
        res.status(201).send('Event created');
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Failed to create event');
    }
});
router.delete('/:eventId', async (req, res) => {
    const {eventId} = req.params;
    try {
      await calService.deleteEvent(eventId);
    res.status(200).send('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting event:', err);
     res.status(500).send('Failed to delete event');
    }
  });
export default router;
