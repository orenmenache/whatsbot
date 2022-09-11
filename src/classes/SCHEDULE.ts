import sch from 'node-schedule';
import { G_SUITE } from '../api/G_SUITE';
import { S_SUITE } from '../api/STRIPE';
import { WHATSBOT } from '../api/WHATSBOT';
import { Order } from '../models/Order';
import { DB_Handler } from './DB_Handler';

class SCHEDULE {
    // Run every 6 hours
    static cron: string = `0 */6 * * *`;
    // Run every 2 minutes
    static testCron: string = `*/2 * * * *`;

    constructor() {}
    async MAIN() {
        let WHAT = new WHATSBOT();
        WHAT.client = await WHAT.createWhatsAppClient();

        sch.scheduleJob(SCHEDULE.cron, async (): Promise<void> => {
            let openOrders: Order[] = await this.MANUAL__processAll();
            if (openOrders.length > 0) {
                console.warn(WHAT);
                console.warn(WHAT.client);
                WHAT.sendMessage(`openOrderLength: ${openOrders.length}`);
            }
        });
    }
    async MANUAL__processAll(): Promise<Order[]> {
        console.log(`MANUAL__processAll DB`);
        let DB = new DB_Handler();
        console.log(`MANUAL__processAll GOOGLE`);
        let GOOGLE = new G_SUITE();
        console.log(`MANUAL__processAll STRIPE`);
        let STRIPE = new S_SUITE();

        // Populate DB with data from Google and Stripe
        await GOOGLE.MAIN__processAll(DB.db);
        await STRIPE.MAIN__processAll(DB.db);

        // Get all orders with status OPEN from db
        let openOrders: Order[] = await this.getAllOpenOrders(DB.db);
        console.log(`OpenOrder Length: ${openOrders.length}`);
        DB.db.end();
        return openOrders;
    }

    async getAllOpenOrders(db: any): Promise<Order[]> {
        const sql = `
        SELECT * FROM orders
        WHERE status = 'OPEN';
    `;
        const result = await db.execute(sql);
        const openOrders: Order[] = result[0];

        // for (let order of openOrders) {
        //     for (let prop in order) {
        //         console.log(`prop ${prop} ${order[prop as keyof Order]}`);
        //     }
        // }

        return openOrders;
    }
}

export { SCHEDULE };
