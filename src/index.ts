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

import { SCHEDULE } from './classes/SCHEDULE';

async function main() {
    try {
        let SCH = new SCHEDULE();
        await SCH.MAIN();
    } catch (e) {
        console.warn(`${e}`);
    }
}

main();
