import sch from 'node-schedule';
import { Client } from 'whatsapp-web.js';
import { googleAPI } from './api/googleAPI';
import { Order } from './models/Order';

const cron: string = `0 */6 * * *`;

async function schedule(whatsAppClient: Client, adminGroupId: string) {
    sch.scheduleJob(cron, async () => {
        // Check last 24 hours in GS and Stripe
        // Check GS
        // Check Stripe
        // Check DB
    });
}

async function getAllOpenOrders(db: any): Promise<Order[]> {
    const sql = `
        SELECT * FROM orders
        WHERE status = 'OPEN';
    `;
    const result = await db.execute(sql);
    const openOrders: Order[] = result[0];

    for (let order of openOrders) {
        for (let prop in order) {
            console.log(`prop ${prop} ${order[prop as keyof Order]}`);
        }
    }

    return openOrders;
}

export { schedule, getAllOpenOrders };
