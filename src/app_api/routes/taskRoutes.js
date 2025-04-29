import express from 'express';
import { GoogleCalendarService } from '../controllers/googleCalService.js';
const router = express.Router();
const calService = new GoogleCalendarService();
//tasks api routes
router.get('/tasklists', async (req, res) => {
    try {
        const taskLists = await calService.listTaskLists();
        res.json(taskLists);
    }
    catch (error) {
        console.error('Failed to fetch task lists:', error);
        res.status(500).json({ error: 'Unable to fetch task lists' });
    }
});
router.get('/tasklists/:id/tasks', async (req, res) => {
    try {
        const tasks = await calService.listTasksFromList(req.params.id);
        res.json(tasks);
    }
    catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ error: 'Unable to fetch tasks for list' });
    }
});
router.post('/tasklists/:id/tasks', express.json(), async (req, res) => {
    try {
        const taskListId = req.params.id;
        const task = await calService.createTask(taskListId, req.body);
        res.status(201).json(task);
    }
    catch (error) {
        console.error('Failed to create task:', error);
        res.status(500).json({ error: 'Unable to create task' });
    }
});
router.patch('/tasklists/:listId/tasks/:taskId/complete', async (req, res) => {
    try {
        const { listId, taskId } = req.params;
        const result = await calService.markTaskComplete(listId, taskId);
        res.json(result);
    }
    catch (error) {
        console.error('Failed to complete task:', error);
        res.status(500).json({ error: 'Unable to complete task' });
    }
});
router.delete('/tasklists/:listId/tasks/:taskId', async (req, res) => {
    try {
        const { listId, taskId } = req.params;
        await calService.deleteTask(listId, taskId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Failed to delete task:', error);
        res.status(500).json({ error: 'Unable to delete task' });
    }
});
export default router;
