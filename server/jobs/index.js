import cron from 'node-cron';
import { getAuthorizedEmails, getTiposFruta } from './obtenerDataBD.js';

export async function initJobs() {
    await getTiposFruta();
    await getAuthorizedEmails();

    cron.schedule('05 9 * * *', async () => {
        await getAuthorizedEmails();
    });

    cron.schedule("*/45 * * * *", async () => {
        await getTiposFruta();
    });

}