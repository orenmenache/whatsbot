import * as fs from 'fs';
import * as pathLib from 'path';
import { MetaData } from '../api/stripeAPI';
import FolderHandler from '../classes/Handler/FolderHandler';

const ORGANIZE = {
    getNamesAudioSet(nameAudioFolderPath: string): Set<string> | false {
        if (!fs.existsSync(nameAudioFolderPath)) {
            console.log(`Cannot find waiting folder`);
            return false;
        }
        const nameAudioFolder = new FolderHandler(nameAudioFolderPath);
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
    },
    writeTxtFile(trans: MetaData, waitingFolderPath: string): boolean {
        let waitingFolder = new FolderHandler(waitingFolderPath);
        let contents = `name:${trans.bdPersonName.toLowerCase()},gender:${trans.bdPersonGender.toLowerCase()},age:${
            trans.bdPersonAge
        },quality:${trans.bdPersonQuality.toLowerCase()}`;
        let fileName = `${trans.bdPersonName} ${trans.bdPersonAge} ${trans.bdPersonQuality}`;
        return waitingFolder.createTxtFile(fileName, contents);
    },
};

export default ORGANIZE;
