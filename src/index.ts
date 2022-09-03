import dotenv from 'dotenv';
import { googleAPI } from './api/googleAPI';
dotenv.config();

import * as mysql from 'mysql2';
import { STRIPE } from './api/stripeAPI';

import { whatsAppAPI } from './api/whatsAppAPI';
import Sheet from './classes/Sheet';
import Order from './models/Order';

/*

    connect to whatsApp (local auth)

    get data from
        stripe
        freebobs (google sheet)
    
    schedule (using node-schedule) scanning in 
        morning, 
        afternoon,
        evening
    
    alert when new order arrives
    create txt file for processing
    and let me know which name to record
    
*/

const authPath = process.env.WHATSAPP_AUTH_PATH ?? '';
const adminGroupId = process.env.WHATSAPP_GROUP_ID ?? '';
const sheetID = process.env.GOOGLE_SHEET_ID_FREEBOBS ?? '';

const pi = process.env.GOOGLE_PROJECT_ID ?? '';
const pki = process.env.GOOGLE_PRIVATE_KEY_ID ?? '';
const pk = process.env.GOOGLE_PRIVATE_KEY ?? '';
const ce = process.env.GOOGLE_CLIENT_EMAIL ?? '';
const ci = process.env.GOOGLE_CLIENT_ID ?? '';
const c509 = process.env.GOOGLE_CLIENT_X509_URL ?? '';

// Set up DB
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});

const db = pool.promise();

async function googleTest() {
    console.log(`GOOGLETEST`);
    const googleClient = googleAPI.createGoogleClient(
        pi,
        pki,
        pk,
        ce,
        ci,
        c509
    );
    const freeBobsSheet = new Sheet(
        googleClient,
        sheetID,
        `Free Bobs`,
        `Form Responses 1`,
        1,
        'A1:K1000'
    );
    await freeBobsSheet.getValues();
    console.log(freeBobsSheet.values[0][0]);
}

async function mysqlTest() {
    let dummyOrder = new Order(
        'clientName',
        'client@email',
        'Oren',
        'Male',
        '13',
        'Animals',
        new Date()
    );
    let execResult = await dummyOrder.processIncoming(db);
    console.log(execResult);
}

mysqlTest();

//googleTest();

//console.log(authPath);

//whatsAppAPI.chatBot(authPath, adminGroupId);

//STRIPE.main();
