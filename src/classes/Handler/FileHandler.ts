import * as fs from 'fs';
import * as pathLib from 'path';
import FolderHandler from './FolderHandler';
import Handler from './Handler';

class FileHandler extends Handler {
    constructor(path: string) {
        super(path);
    }

    copyVerify(dest: FolderHandler) {
        if (!this.exists) {
            console.log(`file ${this.path} doesn't exist`);
            return;
        }
        if (!dest.exists) {
            console.log(`destination folder ${dest.path} doesn't exist`);
            return;
        }
        if (this.parsed) {
            let destFilePath = pathLib.join(dest.path, this.parsed.base);
            if (fs.existsSync(destFilePath)) {
                console.log(`file ${destFilePath} already exists`);
                return true;
            }
            try {
                fs.copyFileSync(this.path, destFilePath);
                //console.console.log(`${dest} copied successfully.`);
                return true;
            } catch (e) {
                console.log(e);
                return false;
            }
        }
        return false;
    }

    deleteVerify() {
        try {
            fs.unlinkSync(this.path);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    getWhenCreated() {
        return fs.statSync(this.path).birthtime;
    }
}

export default FileHandler;
