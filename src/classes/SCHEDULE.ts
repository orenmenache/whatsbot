import sch from 'node-schedule';
import { G_SUITE } from '../api/G_SUITE';
import { S_SUITE } from '../api/STRIPE';
import { WHATSBOT } from '../api/WHATSBOT';
import { Order } from '../models/Order';
import { DB_Handler } from './DB_Handler';

class SCHEDULE {
    // Run every 6 hours
    static cron: string = `0 */6 * * *`;

    constructor() {}
    async MAIN() {
        sch.scheduleJob(SCHEDULE.cron, async (): Promise<void> => {
            this.MANUAL__processAll();
            // Check last 24 hours in GS and Stripe
            // Check GS
            // Check Stripe
            // Check DB
        });
    }
    async MANUAL__processAll() {
        let WHAT = new WHATSBOT();
        await WHAT.createWhatsAppClient();

        let DB = new DB_Handler();
        let GOOGLE = new G_SUITE();
        let STRIPE = new S_SUITE();

        // Populate DB with data from Google and Stripe
        await GOOGLE.MAIN__processAll(DB.db);
        await STRIPE.MAIN__processAll(DB.db);

        // Get all orders with status OPEN from db
        let openOrders: Order[] = await this.getAllOpenOrders(DB.db);
        console.log(openOrders.length);
    }

    async getAllOpenOrders(db: any): Promise<Order[]> {
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
}

export { SCHEDULE };
