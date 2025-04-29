// googleCalendarService.ts
import { authenticate } from '@google-cloud/local-auth';
import * as fs from 'fs/promises';
import { google } from 'googleapis';
import * as path from 'path';
import * as process from 'process';
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/tasks'
];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
export async function readSavedcreds() {
    const cred = await fs.readFile(TOKEN_PATH, 'utf8');
    return JSON.parse(cred);
}
export class GoogleCalendarService {
    authClient = null;
    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(TOKEN_PATH, 'utf8');
            const credentials = JSON.parse(content);
            const client = google.auth.fromJSON(credentials);
            return client instanceof google.auth.OAuth2 ? client : null;
        }
        catch {
            return null;
        }
    }
    async saveCredentials(client) {
        const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
            token_uri: 'https://oauth2.googleapis.com/token'
        });
        await fs.writeFile(TOKEN_PATH, payload);
    }
    async authorize() {
        if (this.authClient)
            return this.authClient;
        const saved = await this.loadSavedCredentialsIfExist();
        if (saved) {
            this.authClient = saved;
            return saved;
        }
        const authclient = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (!(authclient instanceof google.auth.OAuth2)) {
            throw new Error('Expected OAuth2Client from authenticate()');
        }
        if (authclient.credentials.refresh_token) {
            await this.saveCredentials(authclient);
        }
        this.authClient = authclient;
        return authclient;
    }
    async listEvents() {
        const auth = await this.authorize();
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 20,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return res.data.items ?? [];
    }
    async createEvent(event) {
        const auth = await this.authorize();
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        console.log('Event created:', res.data.htmlLink);
    }
    // Google Tasks integration
    async listTaskLists() {
        const auth = await this.authorize();
        const tasks = google.tasks({ version: 'v1', auth });
        const res = await tasks.tasklists.list({
            maxResults: 10,
        });
        return res.data.items ?? [];
    }
    async listTasksFromList(listId) {
        const auth = await this.authorize();
        const tasks = google.tasks({ version: 'v1', auth });
        const taskListsResponse = await tasks.tasklists.list();
        const taskLists = taskListsResponse.data.items;
        if (!taskLists || taskLists.length === 0) {
            throw new Error('No task lists found.');
        }
        // Use the first available task list
        const actualListId = taskLists[0].id;
        const response = await tasks.tasks.list({
            tasklist: actualListId || '', // fallback to empty string
            showCompleted: true,
            maxResults: 20,
        });
        return response.data.items || [];
    }
    async createTask(taskListId, task) {
        const auth = await this.authorize();
        const tasks = google.tasks({ version: 'v1', auth });
        const res = await tasks.tasks.insert({
            tasklist: taskListId,
            requestBody: task,
        });
        return res.data;
    }
    async markTaskComplete(taskListId, taskId) {
        const auth = await this.authorize();
        const tasks = google.tasks({ version: 'v1', auth });
        const res = await tasks.tasks.patch({
            tasklist: taskListId,
            task: taskId,
            requestBody: {
                status: 'completed',
                completed: new Date().toISOString(),
            },
        });
        return res.data;
    }
    async deleteTask(taskListId, taskId) {
        const auth = await this.authorize();
        const tasks = google.tasks({ version: 'v1', auth });
        await tasks.tasks.delete({
            tasklist: taskListId,
            task: taskId,
        });
    }
}
