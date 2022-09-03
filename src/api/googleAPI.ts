import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';
import Sheet from '../classes/Sheet';

// Define Google Sheet specs
const private_key = process.env.GOOGLE_PRIVATE_KEY ?? '';
const client_email = process.env.GOOGLE_CLIENT_EMAIL ?? '';
const sheet_id = process.env.GOOGLE_SHEET_ID_FREEBOBS ?? '';

const googleAPI = {
    createGoogleClient() {
        let client = new google.auth.JWT(client_email, undefined, private_key, [
            'https://www.googleapis.com/auth/spreadsheets',
        ]);

        client.authorize(function (err: any) {
            //tokens unused for now
            if (err) {
                console.warn(err);
                return false;
            }
            //console.log('client created');
        });
        return client;
    },

    buildTitleObject(titleArray: string[]) {
        var obj: { [key: string]: number } = {};
        for (var i = 0; i < titleArray.length; i++) {
            obj[titleArray[i]] = i;
        }
        return obj;
    },

    getValuesTitlesLocs(rawData: any, titleDepth: number) {
        /*
            Gets sheet with a titleDepth that may or may not be greater than 1;
            Titles becomes a twoD array
        */

        let values = rawData.data.values;

        if (titleDepth > 0) {
            let titles = [];

            for (let i = 0; i < titleDepth; i++) {
                let titleRow = values.shift();
                titles.push(titleRow);
            }

            let locs = this.buildTitleObject(titles[0]); //build only with first title row
            return [values, titles, locs];
        }

        return [values, null, null];
    },

    numToLetter(num: number) {
        const letters = [
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
        ];
        let ahadot = num % 26;
        let asarot = Math.round(num / 26 - 0.499) - 1;
        let ahadotSTR = letters[ahadot];
        if (asarot > -1) {
            let asarotSTR = letters[asarot];
            return asarotSTR + ahadotSTR;
        }
        return ahadotSTR;
    },

    isPositiveResponse(response: any) {
        return response.status >= 200 && response.status < 300;
    },

    checkLast24Hours(freeBobsSheet: Sheet) {
        const { values, locs } = freeBobsSheet;
        let queryResult: string[][] = [];

        for (let i = values.length - 1; i > 0; i--) {
            let row: string[] = values[i];
            let date: Date = this.parseGoogleStrDate(row[locs['Timestamp']]);
            let isWithinRange: boolean = this.isStrDateWithinLast24Hours(date);
            if (isWithinRange) {
                queryResult.push(row);
            }
        }

        return queryResult;
    },

    isStrDateWithinLast24Hours(date: Date): boolean {
        const now = new Date();
        const nowParsed = Date.parse(now);
        let parsed = Date.parse(date);

        let gap = (nowParsed - parsed) / (60 * 60 * 1000);
        return gap <= 24;
    },
    parseGoogleStrDate(strDate: string): Date {
        let dateTime: string[] = strDate.split(' ');
        let splittedDate = dateTime[0].split('/');
        let splittedTime = dateTime[1].split(':');

        let year = Number(splittedDate[2]);
        let month = Number(splittedDate[1]) - 1;
        let day = Number(splittedDate[0]);
        let hour = Number(splittedTime[0]);
        let minute = Number(splittedTime[1]);

        return new Date(year, month, day, hour, minute);
    },
    async getFreeBobs() {
        const googleClient = this.createGoogleClient();

        const freeBobsSheet = new Sheet(
            googleClient,
            sheet_id,
            `Free Bobs`,
            `Form Responses 1`,
            1,
            'A1:K1000'
        );

        await freeBobsSheet.getValues();
        return freeBobsSheet;
    },
};

export { googleAPI };
