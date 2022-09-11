const qrcode = require('qrcode-terminal');
import { Client as WhatsAppClient, LocalAuth } from 'whatsapp-web.js';
import dotenv from 'dotenv';
dotenv.config();

//'C:\\Users\\User\\Documents\\programming\\bob\\whatsbot\\src'

//import { schedule } from '../schedule.temp';

type WhatsAppMessage = {
    body: string;
    author: string;
    getChat: () => any;
};

// type WhatsAppClient = {
//     sendMessage: (groupId: string, message: string) => Promise<{}>;
//     on: (actionName: string, callBack: Function) => {};
//     initialize: () => {};
// };

class WHATSBOT {
    static autoPath = process.env.WHATSAPP_AUTH_PATH || '';
    static adminGroupId = process.env.WHATSAPP_GROUP_ID || '';

    client: false | WhatsAppClient;

    constructor() {
        this.client = {} as false | WhatsAppClient;
    }
    async createWhatsAppClient(): Promise<false | WhatsAppClient> {
        try {
            return new Promise((resolve, reject) => {
                const whatsAppClient = new WhatsAppClient({
                    authStrategy: new LocalAuth({
                        clientId: undefined,
                        dataPath: WHATSBOT.autoPath,
                    }),
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
                    await whatsAppClient.sendMessage(
                        WHATSBOT.adminGroupId,
                        `I'm ready`
                    );
                    resolve(whatsAppClient);
                });
            });
        } catch (e) {
            console.warn(`Error initializing whatsAppClient: ${e}`);
            return false;
        }
    }
    async logIds() {
        if (!this.client) {
            return false;
        }

        this.client.on('message', async (message: WhatsAppMessage) => {
            let chat = await message.getChat();

            console.log(chat);
            console.log(chat.id._serialized);
            //await whatsAppClient.sendMessage(groupId,message);
        });
    }
    async sendMessage(message: string) {
        if (!this.client) {
            return false;
        }
        await this.client.sendMessage(WHATSBOT.adminGroupId, message);
    }
}

export { WHATSBOT };