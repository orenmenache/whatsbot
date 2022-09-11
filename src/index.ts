import dotenv from 'dotenv';
dotenv.config();

import * as mysql from 'mysql2';
import { STRIPE } from './api/STRIPE';

import { WHATSBOT } from './api/WHATSBOT';
import Sheet from './classes/Sheet';
import { Order } from './models/Order';
import { getAllOpenOrders } from './schedule';

/** General:
 *
 * connect to whatsApp (local auth)
 *
 * get data from:
 *      stripe
 *      freebobs (google sheet)
 *
 * schedule (using node-schedule) scanning in
 *      morning,
 *      afternoon,
 *      evening
 *
 * alert when new order arrives
 * create txt file for processing
 * and let me know which name to record
 */

// Define the local auth path for whatsAppAPI
const authPath = process.env.WHATSAPP_AUTH_PATH ?? '';
const adminGroupId = process.env.WHATSAPP_GROUP_ID ?? '';

async function main() {
    // Set up DB
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
    });
    const db = pool.promise();

    let WHAT = new WHATSBOT();
    WHAT.client = await WHAT.createWhatsAppClient();
    await WHAT.logIds();

    //whatsAppAPI.chatBot(authPath, adminGroupId);
    //let SS = new STRIPE();
    //let report = await SS.MAIN__processAll(db);
    //console.log(report);

    db.end();
}

main();

// async function mysqlTest() {
//     let dummyOrder = new Order(
//         'clientName',
//         'client@email',
//         'Oren',
//         'Male',
//         '13',
//         'Animals',
//         new Date()
//     );
//     let execResult = await dummyOrder.processIncoming(db);
//     console.log(execResult);
// }

//mysqlTest();

//googleTest();

//console.log(authPath);

//STRIPE.main();
