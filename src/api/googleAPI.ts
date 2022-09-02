import { google } from 'googleapis';

const googleAPI = {
    createGoogleClient(
        project_id: string,
        private_key_id: string,
        private_key: string,
        client_email: string,
        client_id: string,
        client_x509_cert_url: string
    ) {
        const gscreds = {
            type: 'service_account',
            project_id: project_id,
            private_key_id: private_key_id,
            private_key: private_key,
            client_email: client_email,
            client_id: client_id,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url:
                'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: client_x509_cert_url,
        };

        let client = new google.auth.JWT(
            gscreds.client_email,
            undefined,
            gscreds.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        client.authorize(function (err: any) {
            //tokens unused for now
            if (err) {
                console.log(`$c${err}`, 'color: red');
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
};

export { googleAPI };
