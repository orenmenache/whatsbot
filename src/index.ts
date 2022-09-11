import dotenv from 'dotenv';
dotenv.config();

import * as mysql from 'mysql2';
import { STRIPE } from './api/STRIPE';

import { whatsAppAPI } from './api/whatsAppAPI';
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

    //whatsAppAPI.chatBot(authPath, adminGroupId);
    let SS = new STRIPE();
    await SS.main();

    db.end();

    //let result = await getAllOpenOrders(db);
    //console.log(result);

    // let isProcessed = await order.checkIfProcessed(db);
    // if (!isProcessed) {
    //     console.warn(`Order hasn't been processed`);
    //     let result = await order.processIncoming(db);
    //     console.log(result[0]);
    // } else {
    //     console.log(`Order processed`);
    // }
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
