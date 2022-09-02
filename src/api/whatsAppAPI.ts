const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
//'C:\\Users\\User\\Documents\\programming\\bob\\whatsbot\\src'

//import { schedule } from '../schedule.temp';

type WhatsAppMessage = {
    body: string;
    author: string;
    getChat: () => any;
};

const whatsAppAPI = {
    // async getFreeBobsSheet(googleClient: any): Promise<SheetOBJ | false> {
    //     const masterV7ssid: string = `159Ntqb28bif3Mm4Yc-omteGxLpHDHGPIhD8XXYO7SKc`;
    //     const internalSheetName: string = 'masterv7';
    //     const officialSheetName: string = 'groupids';
    //     const dataRange: string = 'A1:C20';
    //     const sheet = new Sheet(
    //         googleClient,
    //         masterV7ssid,
    //         internalSheetName,
    //         officialSheetName,
    //         1,
    //         dataRange
    //     );
    //     const sheetOBJ: SheetOBJ | false = await googleAPI.sheetToOBJ(sheet);
    //     return sheetOBJ;
    // },

    async chatBot(authPath: string, adminGroupId: string) {
        //const googleClient = googleAPI.createGoogleClient();
        // const whatsAppGroups = await this.getFreeBobsSheet(googleClient);
        // if (!whatsAppGroups) {
        //     console.log(`whatsAppGroups sheet not found`);
        //     return false;
        // }
        //const adminGroupId = ``;

        const whatsAppClient = new Client({
            authStrategy: new LocalAuth({ undefined, authPath }),
        });

        whatsAppClient.initialize();

        whatsAppClient.on('qr', (qr: any) => {
            qrcode.generate(qr, { small: true });
        });

        whatsAppClient.on('authenticated', () => {
            console.log(`%cAUTHENTICATED`, 'color: pink');
        });

        whatsAppClient.on('ready', async () => {
            console.log('whatsAppClient is ready!');
            await whatsAppClient.sendMessage(adminGroupId, `I'm ready`);
        });
    },
    async logIds(authPath: string) {
        const whatsAppClient = new Client({
            authStrategy: new LocalAuth({ undefined, authPath }),
        });

        whatsAppClient.initialize();

        whatsAppClient.on('qr', (qr: any) => {
            qrcode.generate(qr, { small: true });
        });

        whatsAppClient.on('authenticated', () => {
            console.log(`%cAUTHENTICATED`, 'color: pink');
        });

        whatsAppClient.on('ready', () => {
            console.log('whatsAppClient is ready!');

            whatsAppClient.on('message', async (message: WhatsAppMessage) => {
                let groupId = await message.getChat();

                console.log(groupId);
                console.log(groupId._serialized);
                //await whatsAppClient.sendMessage(groupId,message);
            });
        });
    },
};

export { whatsAppAPI };
