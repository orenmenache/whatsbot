import fs from 'fs';
import { MetaData } from '../api/STRIPE';
import FolderHandler from './Handler/FolderHandler';

class AudioFolderHandler {
    static waitingFolderPath = process.env.WAITING_FOLDER_PATH ?? '';
    static nameAudioFolderPath = process.env.NAMEAUDIO_FOLDER_PATH ?? '';

    constructor() {}

    MAIN() {
        // Get namesAudio:
        let namesAudio: false | Set<string> = this.getNamesAudioSet();
        if (!namesAudio) {
            console.warn(`Cannot get namesAudio`);
            return false;
        }
    }
    getNamesAudioSet(): Set<string> | false {
        if (!fs.existsSync(AudioFolderHandler.nameAudioFolderPath)) {
            console.warn(`Cannot find waiting folder`);
            return false;
        }
        const nameAudioFolder = new FolderHandler(
            AudioFolderHandler.nameAudioFolderPath
        );
        nameAudioFolder.getFiles();
        let namesSet = new Set<string>();
        nameAudioFolder.files.forEach((file) => {
            let name = file.parsedLower!.name as string;
            if (name.indexOf('_') > -1) {
                name = name.split('_')[0];
            }
            namesSet.add(name);
        });
        return namesSet;
    }
    writeTxtFile(trans: MetaData): boolean {
        let waitingFolder = new FolderHandler(
            AudioFolderHandler.waitingFolderPath
        );
        let contents = `name:${trans.bdPersonName.toLowerCase()},gender:${trans.bdPersonGender.toLowerCase()},age:${
            trans.bdPersonAge
        },quality:${trans.bdPersonQuality.toLowerCase()}`;
        let fileName = `${trans.bdPersonName} ${trans.bdPersonAge} ${trans.bdPersonQuality}`;
        return waitingFolder.createTxtFile(fileName, contents);
    }
}

export { AudioFolderHandler };
