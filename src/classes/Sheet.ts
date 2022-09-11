import { google } from 'googleapis';

type GoogleSheetsResponse = {
    config: any; //{}
    data: { [key: string]: any };
    headers: any; //{}
    status: number; //200
    statusText: string; //"OK"
};

class Sheet {
    client: any;
    ssid: string;
    link: string;
    ssName: string;
    sheetName: string;
    titleDepth: number;
    entireRange: string;
    gsapi: any;

    values: any[][];
    titles: string[];
    locs: { [key: string]: number };
    valid: boolean;

    constructor(
        client: any,
        ssid: string,
        ssName: string,
        sheetName: string,
        titleDepth: number,
        entireRange: string
    ) {
        this.ssid = ssid;
        this.link = `https://docs.google.com/spreadsheets/d/${this.ssid}`;
        this.ssName = ssName;
        this.sheetName = sheetName;
        this.titleDepth = titleDepth;
        this.gsapi = google.sheets({ version: 'v4', auth: client }); //https://youtu.be/MiPpQzW_ya0?t=1366
        this.entireRange = entireRange;

        this.values = [];
        this.titles = [];
        this.locs = {};
        this.valid = true;
    }
    async getValues() {
        const options = {
            spreadsheetId: this.ssid,
            range: `${this.sheetName}!${this.entireRange}`,
        };

        let rawData: GoogleSheetsResponse =
            await this.gsapi.spreadsheets.values.get(options);
        if (rawData.status !== 200) {
            console.warn(`status ${rawData.status} in ${this.ssName}`);
            this.valid = false;
            return;
        }

        [this.values, this.titles, this.locs] = this.getValuesTitlesLocs(
            rawData,
            this.titleDepth
        );
    }
    async setValues(range: string, values: string[][]) {
        //https://stackoverflow.com/questions/39125937/update-a-spreadsheet-with-the-google-api
        const options = {
            spreadsheetId: this.ssid,
            range: `${this.sheetName}!${range}`,
            valueInputOption: 'RAW',
            resource: {
                range: `${this.sheetName}!${range}`,
                majorDimension: 'ROWS',
                values: values,
            },
        };

        let response = await this.gsapi.spreadsheets.values.update(options);
        return response.status >= 200 && response.status <= 300;
    }
    /**
     * Gets sheet with a titleDepth that may or may not be greater than 1;
     * Titles becomes a twoD array
     */
    getValuesTitlesLocs(rawData: any, titleDepth: number) {
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
    }
    buildTitleObject(titleArray: string[]) {
        var obj: { [key: string]: number } = {};
        for (var i = 0; i < titleArray.length; i++) {
            obj[titleArray[i]] = i;
        }
        return obj;
    }
}

export default Sheet;
