import dotenv from 'dotenv';
dotenv.config();
import { googleAPI } from './api/googleAPI';

import * as mysql from 'mysql2';
import { STRIPE } from './api/stripeAPI';

import { whatsAppAPI } from './api/whatsAppAPI';
import Sheet from './classes/Sheet';
import { Order } from './models/Order';
import { getAllOpenOrders } from './schedule';

/**
 * General:
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

// Set up DB
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});
const db = pool.promise();

async function main() {
    //whatsAppAPI.chatBot(authPath, adminGroupId);

    const freeBobsSheet: Sheet = await googleAPI.getFreeBobs();
    const locs = freeBobsSheet.locs;
    const gCheck = googleAPI.checkLast24Hours(freeBobsSheet);

    if (gCheck.length > 0) {
        console.log(`New FreeBOB! getting gOrders`);
        let gOrders: Order[] = [];
        for (let row of gCheck) {
            let clientEmail = row[locs['Your email']];
            let clientName = await getClientNameByEmail(db, clientEmail);

            let order = new Order(
                googleAPI.parseGoogleStrDate(row[locs['Timestamp']]),
                clientName,
                clientEmail,
                row[locs[`Birthday Person's Name`]],
                row[locs[`Birthday Person's Gender`]],
                row[locs[`Birthday Person's Age`]],
                row[
                    locs[`Would you like Bob to mention Birthday Person's age?`]
                ],
                row[locs[`Birthday Person's Selected Quality`]]
            );

            gOrders.push(order);
        }

        for (let order of gOrders) {
            let isProcessed = await order.checkIfProcessed(db);
            if (!isProcessed) {
                let result = await order.processIncoming(db);
                console.log(`Processing... ${result[0].length} row created`);
            } else {
                console.log(
                    `Order ${order.bdpName} ${order.bdpQuality} was processed`
                );
            }
        }
    }

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

async function getClientNameByEmail(
    db: any,
    clientEmail: string
): Promise<string> {
    // Locate Client Name in DB
    let sql = `
    SELECT * FROM orders
    WHERE clientEmail = '${clientEmail}'
    `;

    let results = (await db.execute(sql)) as any;
    let clientName = 'NULL';
    if (results[0].length == 0) {
        // No clientName found
    } else {
        clientName = results[0][0]['clientName'];
    }
    return clientName;
}

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
