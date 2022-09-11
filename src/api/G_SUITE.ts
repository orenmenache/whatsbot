import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';
import Sheet from '../classes/Sheet';
import getClientNameByEmail from '../functions/getClientNameByEmail';
import { Order } from '../models/Order';

class G_SUITE {
    // Define Google Sheet specs
    static config = {
        private_key: process.env.GOOGLE_PRIVATE_KEY ?? '',
        client_email: process.env.GOOGLE_CLIENT_EMAIL ?? '',
        sheet_id: process.env.GOOGLE_SHEET_ID_FREEBOBS ?? '',
    };

    client: any;

    constructor() {
        this.client = this.createGoogleClient();
    }

    createGoogleClient() {
        let client = new google.auth.JWT(
            G_SUITE.config.client_email,
            undefined,
            G_SUITE.config.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        client.authorize(function (err: any) {
            //tokens unused for now
            if (err) {
                console.warn(err);
                return false;
            }
            //console.log('client created');
        });
        return client;
    }
    async getFreeBobs(): Promise<Sheet> {
        const freeBobsSheet = new Sheet(
            this.client,
            G_SUITE.config.sheet_id,
            `Free Bobs`,
            `Form Responses 1`,
            1,
            'A1:K1000'
        );

        await freeBobsSheet.getValues();
        return freeBobsSheet;
    }
    async processAll(db: any): Promise<string> {
        try {
            const freeBobsSheet: Sheet = await this.getFreeBobs();
            const locs = freeBobsSheet.locs;
            const gCheckRawValues: string[][] =
                this.checkLast24Hours(freeBobsSheet);

            if (gCheckRawValues.length > 0) {
                console.log(`New FreeBOB! getting gOrders`);

                const gOrders: Order[] = await this.convertToOrders(
                    db,
                    gCheckRawValues,
                    locs
                );
                let report = await this.processTheUnprocessed(db, gOrders);
                return report;
            }
            return 'Nothin to do here';
        } catch (e) {
            return `Failed to run googleAPI.main: ${e}`;
        }
    }
    async convertToOrders(
        db: any,
        gCheckRawValues: string[][],
        locs: any
    ): Promise<Order[]> {
        let gOrders: Order[] = [];
        for (let row of gCheckRawValues) {
            let clientEmail = row[locs['Your email']];
            let clientName = await getClientNameByEmail(db, clientEmail);

            // Convert quality to single word lowerCased
            let quality = this.toSingleWordQuality(
                row[locs[`Birthday Person's Selected Quality`]]
            );

            // If no age was mentioned pass '29'
            let age = row[locs[`Birthday Person's Age`]];
            if (Number(age) == 0) {
                age = '29';
            }

            let order = new Order(
                this.formatDateFromGoogle(row[locs['Timestamp']]),
                clientName,
                clientEmail,
                row[locs[`Birthday Person's Name`]],
                row[locs[`Birthday Person's Gender`]],
                age,
                row[
                    locs[`Would you like Bob to mention Birthday Person's age?`]
                ],
                quality
            );

            gOrders.push(order);
        }
        return gOrders;
    }
    /**
     * Check if the orders from freeBobs in the last 24 hours
     * Have been processed or not
     * Once inserted into DB it's no longer the G_SUITE's
     * concern weather the order is open or not.
     * That's now the DB's role
     *
     * @param {any} db
     * @param {Order[]} gOrders
     * @returns Promise
     */
    async processTheUnprocessed(db: any, gOrders: Order[]): Promise<string> {
        try {
            let report = '';

            for (let order of gOrders) {
                let isProcessed = await order.checkIfProcessed(db);
                if (!isProcessed) {
                    let result = await order.process__WithStatusOpen(db);
                    let rowsCreated = result[0].affectedRows;
                    if (rowsCreated > 1) {
                        report = `Too many rows created`;
                        return report;
                    }
                    if (rowsCreated == 0) {
                        report = `Failed to create row`;
                        return report;
                    }
                    report += `Processing... ${rowsCreated} row created\n`;
                } else {
                    report += `Order ${order.bdpName} ${order.bdpQuality} has already been processed\n`;
                }
            }
            return report;
        } catch (e) {
            return `Failed to processTheUnprocessed: ${e}`;
        }
    }
    checkLast24Hours(freeBobsSheet: Sheet) {
        const { values, locs } = freeBobsSheet;
        let queryResult: string[][] = [];

        for (let i = values.length - 1; i > 0; i--) {
            let row: string[] = values[i];
            let date: Date = this.formatDateFromGoogle(row[locs['Timestamp']]);
            let isWithinRange: boolean = this.isStrDateWithinLast24Hours(date);
            if (isWithinRange) {
                console.log(`${row[0]} FOUND!`);
                queryResult.push(row);
            } else {
                //console.log(`${row[0]} not in the last 24 hours`);
            }
        }

        return queryResult;
    }
    isStrDateWithinLast24Hours(date: Date): boolean {
        const now = new Date();
        const nowParsed = Date.parse(now as any);
        let parsed = Date.parse(date as any);

        let gap = (nowParsed - parsed) / (60 * 60 * 1000);
        return gap <= 24;
    }
    formatDateFromGoogle(googleDate: string): Date {
        let dateTime: string[] = googleDate.split(' ');
        let splittedDate = dateTime[0].split('/');
        let splittedTime = dateTime[1].split(':');

        let year = Number(splittedDate[2]);
        let month = Number(splittedDate[1]) - 1;
        let day = Number(splittedDate[0]);
        let hour = Number(splittedTime[0]);
        let minute = Number(splittedTime[1]);

        return new Date(year, month, day, hour, minute);
    }
    toSingleWordQuality(qualitySentence: string): string {
        const lower = qualitySentence.toLowerCase();
        const singleWords = [
            'animals',
            'power',
            'horny',
            'kids',
            'multitasking',
            'gardening',
            'creative',
            'funny',
            'optimistic',
            'surprises',
        ];
        for (let quality of singleWords) {
            if (lower.indexOf(quality) > -1) {
                return quality;
            }
        }
        return 'NULL';
    }
}

export { G_SUITE };
