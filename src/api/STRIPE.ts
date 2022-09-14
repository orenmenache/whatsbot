import MISC from '../functions/misc';
import toSingleWordQuality from '../functions/toSingleWordQuality';
import { Order } from '../models/Order';
import dotenv from 'dotenv';
dotenv.config();

type StripeJSONResponse = {
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request: any;
    data: StripePaymentListResponse;
};
type StripePaymentListResponse = {
    object: string;
    data: PaymentIntentData[];
    has_more: boolean;
    url: string;
};
type PaymentIntentData = {
    id: string;
    object: string;
    amount: number;
    amount_received: number;
    charges: any;
    created: string; //date
    currency: string;
    invoice: any;
    livemode: boolean;
    metadata: MetaDataObj;
    payment_method_options: any;
};
type MetaDataObj = {
    bdPersonName: string;
    bdPersonAge: number;
    bdPersonGender: string;
    bdPersonQuality: string;
    bdPersonMentionAge: 'yes' | 'no';
    bookingPersonName: string;
    bookingPersonEmail: string;
};
class MetaData {
    bdPersonName: string;
    bdPersonAge: number;
    bdPersonQuality: string;
    bdPersonGender: string;
    bookingPersonName: string;
    bookingPersonEmail: string;
    whenCreated: Date;
    whenString: string;
    constructor(metaDataObj: MetaDataObj, whenCreated: Date) {
        this.bdPersonName = metaDataObj.bdPersonName.toLowerCase();
        this.bdPersonAge = Number(metaDataObj.bdPersonAge);
        this.bdPersonGender = metaDataObj.bdPersonGender;
        this.bdPersonQuality = metaDataObj.bdPersonQuality.toLowerCase();
        if (this.bdPersonQuality.indexOf(' ') > -1) {
            let splitted = this.bdPersonQuality.split(' ');
            this.bdPersonQuality = splitted[splitted.length - 1];
        }
        if (metaDataObj.bdPersonMentionAge == 'no') {
            this.bdPersonAge = 29;
        }
        this.bookingPersonName = metaDataObj.bookingPersonName;
        this.bookingPersonEmail = metaDataObj.bookingPersonEmail;
        this.whenCreated = whenCreated;
        this.whenString = MISC.formatDateTo_sixDigits(whenCreated);
    }
}
class S_SUITE {
    static stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
    static stripe = require('stripe')(S_SUITE.stripeKey);

    constructor() {}

    async MAIN__processAll(db: any): Promise<string> {
        console.log(`%cStripe Main`, 'color: pink');

        // Get last 100 transactions
        let transActions = await this.getTransActions(100);
        // Filter transActions from the last 24 hours
        let last24Hours__PID: PaymentIntentData[] =
            this.filterLast24Hours(transActions);

        console.log(
            `%ctransActions.length ${last24Hours__PID.length}`,
            'color: orange'
        );

        let last24Hours__ORDERS: Order[] =
            this.convertToOrders(last24Hours__PID);

        let report: string = await this.processTheUnprocessed(
            db,
            last24Hours__ORDERS
        );

        return report;
    }

    async getTransActions(limit: number): Promise<PaymentIntentData[]> {
        const paymentIntents: StripePaymentListResponse =
            await S_SUITE.stripe.paymentIntents.list({
                limit: limit,
                //created: { gte: yesterday },
            });

        let transActions: PaymentIntentData[] = paymentIntents.data;
        return transActions;
    }
    filterLast24Hours(transActions: PaymentIntentData[]): PaymentIntentData[] {
        let now = new Date();
        //@ts-ignore
        let nowSeconds = Date.parse(now) / 1000;

        // Check which of the transactions are from the last 24 hours
        let filtered = transActions.filter(
            /**
             * We get time in seconds cause that's
             * the format the comes from Stripe
             */
            (transAction: PaymentIntentData) => {
                let createdSec = Number(transAction.created);
                let secondsGap = nowSeconds - createdSec;
                let hoursAgo = Math.floor(secondsGap / (60 * 60));
                let isUnder24hoursAgo = hoursAgo <= 24;
                return isUnder24hoursAgo;
            }
        );
        return filtered;
    }
    convertToOrders(transActions: PaymentIntentData[]): Order[] {
        let sOrders: Order[] = [];
        transActions.forEach((transAction: PaymentIntentData) => {
            let order: Order = this.convertToOrders__SINGLE(transAction);
            sOrders.push(order);
        });
        return sOrders;
    }
    convertToOrders__SINGLE(transAction: PaymentIntentData): Order {
        let meta: MetaDataObj = transAction.metadata;
        let sOrder = new Order(
            this.formatDateFromStripe(transAction.created),
            meta.bookingPersonName,
            meta.bookingPersonEmail,
            meta.bdPersonName,
            meta.bdPersonGender,
            meta.bdPersonAge.toString(),
            meta.bdPersonMentionAge,
            toSingleWordQuality(meta.bdPersonQuality)
        );
        return sOrder;
    }
    /**
     * Stripe dates are presented as seconds from 1970
     * @param stripeDate
     */
    formatDateFromStripe(stripeDate: string): Date {
        let seconds = Number(stripeDate);
        let date = new Date(seconds * 1000);
        return date;
    }
    /**
     * Check if the orders from Stripe in the last 24 hours
     * Have been processed or not
     * Once inserted into DB it's no longer Stripe's
     * concern weather the order is open or not.
     * This is where Stripe's role ends and DB's role begins
     *
     * @param {any} db
     * @param {Order[]} sOrders
     * @returns Promise
     */
    async processTheUnprocessed(db: any, sOrders: Order[]): Promise<string> {
        try {
            let report = '';

            for (let order of sOrders) {
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
}

export { S_SUITE, StripeJSONResponse, MetaDataObj, MetaData };
