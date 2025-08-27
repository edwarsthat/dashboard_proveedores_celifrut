import cron from 'node-cron';
import { getAuthorizedEmails } from './obtenerDataBD.js';

export function initJobs() {
    cron.schedule('26 16 * * *', async () => {
        await getAuthorizedEmails();
    });
}