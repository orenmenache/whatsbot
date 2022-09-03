import sch from 'node-schedule';
import { Client } from 'whatsapp-web.js';

const cron: string = `0 */6 * * *`;

async function schedule(whatsAppClient: Client, adminGroupId: string) {
    sch.scheduleJob(cron, async () => {
        // Check last 24 hours in GS and Stripe
    });
}

export { schedule };
