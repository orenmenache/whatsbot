import { google } from 'googleapis';
import { googleAPI } from '../api/googleAPI';

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
    //structure: string;
    valid: boolean;

    constructor(
        client: any,
        ssid: string,
        ssName: string,
        sheetName: string,
        titleDepth: number,
        entireRange: string
    ) {
        this.client = client;
        this.ssid = ssid;
        this.link = `https://docs.google.com/spreadsheets/d/${this.ssid}`;
        this.ssName = ssName;
        this.sheetName = sheetName;
        this.titleDepth = titleDepth;
        this.gsapi = google.sheets({ version: 'v4', auth: this.client }); //https://youtu.be/MiPpQzW_ya0?t=1366
        this.entireRange = entireRange;
        //this.structure = "";

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
        for (let n in rawData) {
            if (rawData.status !== 200) {
                console.log(
                    `%cstatus ${rawData.status} in ${this.ssName}`,
                    `color: red`
                );
                this.valid = false;
            }
        }
        [this.values, this.titles, this.locs] = googleAPI.getValuesTitlesLocs(
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
        return googleAPI.isPositiveResponse(response);
    }
}

export default Sheet;
