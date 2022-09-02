import axios from 'axios';
import dotenv from 'dotenv';
import MISC from '../functions/misc';
import ORGANIZE from '../functions/organize';
dotenv.config();
const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
const stripe = require('stripe')(stripeKey);
const waitingFolderPath = process.env.WAITING_FOLDER_PATH ?? '';
const nameAudioFolderPath = process.env.NAMEAUDIO_FOLDER_PATH ?? '';

type StripeJSONResponse = {
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request: any;
    data: {
        object: string;
        data: {
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
        }[];
        has_more: boolean;
        url: string;
    };
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

const STRIPE = {
    async main(): Promise<any | false> {
        let now = new Date();
        let yesterday = new Date(
            Date.parse(now.toString()) - 24 * 60 * 60 * 1000
        );
        let nowFormatted = MISC.formatDateTo_sixDigits(now);
        let yesterdayFormatted = MISC.formatDateTo_sixDigits(yesterday);

        let namesAudio = ORGANIZE.getNamesAudioSet(nameAudioFolderPath);
        if (!namesAudio) {
            return false;
        }
        let transactions = await STRIPE.getTransactions();
        for (let i = 0; i < transactions.length; i++) {
            let trans = transactions[i];
            console.log(
                `when: ${trans.whenString} yesterDayFormatted: ${yesterdayFormatted}`
            );
            if (
                trans.whenString != nowFormatted &&
                trans.whenString != yesterdayFormatted
            ) {
                console.log(`when the day is done`);
                return true;
            }
            let name = trans.bdPersonName;
            let result = ORGANIZE.writeTxtFile(trans, waitingFolderPath);
            if (!result) {
                console.warn(`Couldn't create file ${trans.bdPersonName}`);
            } else {
                console.log(`txt file ${trans.bdPersonName} created`);
            }
            if (!namesAudio.has(name)) {
                console.log(`You need to record this name: ${name}`);
            }
        }

        //let res = await stripeAxiosGet(`${stripeAPIbaseUrl}/v1/balance_transactions`);
    },

    async getTransactions(): Promise<MetaData[]> {
        const stripeAPIbaseUrl = `https://api.stripe.com`;
        let res = await this.axiosGet(`${stripeAPIbaseUrl}/v1/payment_intents`);
        let intents: MetaData[] = [];
        if (res) {
            let paymentIntents = res.data.data;
            for (let i = 0; i < paymentIntents.length; i++) {
                let intent = paymentIntents[i];
                let whenCreated = new Date(Number(intent.created) * 1000);
                let metaData = new MetaData(intent.metadata, whenCreated);
                intents.push(metaData);
            }
        }
        return intents;
    },
    async axiosGet(URL: string): Promise<StripeJSONResponse | false> {
        let runThis: any = {
            method: 'get',
            url: URL,
            headers: { Authorization: `Bearer ${stripeKey}` },
        };
        try {
            let response = (await axios(runThis)) as unknown;
            //console.log(response);
            if (this.isPositiveResponse(response)) {
                return response as StripeJSONResponse;
            }
        } catch (e) {
            console.warn(`${e}`);
        }
        return false;
    },
    isPositiveResponse(response: any) {
        return response.status >= 200 && response.status < 300;
    },
};

export { STRIPE, StripeJSONResponse, MetaDataObj, MetaData };
