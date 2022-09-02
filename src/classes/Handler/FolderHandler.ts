const stripeSecretKey = `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`;
const Stripe = require('stripe');
const stripe = Stripe(stripeSecretKey);

import axios from 'axios';
//import { google } from 'googleapis';
//const gscreds: GoogleCreds = require('../googleServiceAccountKey.json');

import * as fs from 'fs';
import * as pathLib from 'path';
import Handler from './Handler';
import MISC from '../../functions/misc';
import FileHandler from './FileHandler';

class FolderHandler extends Handler {
    files: FileHandler[];
    filesByType: FileHandler[];
    folders: FolderHandler[];
    valid: boolean;

    constructor(path: string) {
        super(path);
        this.files = [];
        this.folders = [];
        this.filesByType = [];
        this.valid = this.validate();
    }

    validate() {
        if (!this.exists) {
            return false;
        }
        return fs.lstatSync(this.path).isDirectory();
    }

    getFiles() {
        if (!this.valid) {
            console.log(
                `Cannot getFiles. ${this.parsed?.dir} doesn't exist`,
                'color: red'
            );
            return false;
        }
        fs.readdirSync(this.path).forEach((file) => {
            this.files.push(new FileHandler(pathLib.resolve(this.path, file)));
        });
    }

    getFilesByType(fileType: string): FileHandler[] {
        let filesByType: FileHandler[] = [];
        if (!this.valid) {
            console.log(
                `Cannot getFiles. ${this.parsed?.dir} doesn't exist`,
                'color: red'
            );
            return filesByType;
        }
        this.getFiles();
        this.files.forEach((file: FileHandler) => {
            if (file.parsedLower) {
                if (file.parsedLower.ext == fileType) {
                    filesByType.push(file);
                }
            }
        });
        return filesByType;
    }

    getFolders() {
        if (!this.valid) {
            console.log(
                `Cannot getFolders. ${this.parsed?.dir} doesn't exist`,
                'color: red'
            );
            return;
        }
        fs.readdirSync(this.path).forEach((item) => {
            let fullPath = pathLib.resolve(this.path, item);
            let stat = fs.lstatSync(fullPath);
            if (stat.isDirectory()) {
                this.folders.push(new FolderHandler(fullPath));
            }
        });
    }

    copyVerify(dest: FolderHandler) {
        //dest is an INVALID FolderHandler -- copy all files from folder this to folder dest
        //copy each file seperately cause you can't copy an entire folder
        //console.log(`this.files.length: ${this.files.length}`);
        if (!this.valid) {
            console.log(`%cfolder ${this.path} doesn't exist`, 'color: red');
            return false;
        }
        if (dest.valid) {
            console.log(
                `%cdestination folder ${dest.path} already exist`,
                'color: cyan'
            );
            return true;
        }
        fs.mkdirSync(dest.path);
        dest.exists = fs.existsSync(dest.path);

        for (let i = 0; i < this.files.length; i++) {
            //console.log(`file: ${this.files[i].parsedLower!.name}`);
            let result = this.files[i].copyVerify(dest); //copyVerify FILE
            if (result != true) {
                console.log(
                    `%cerror copying file: ${this.files[i].parsed?.name}`,
                    'color: red'
                );
                return false;
            }
        }
        return true;
    }

    deleteVerify() {
        if (!this.valid) {
            console.log(`folder ${this.path} doesn't exist`);
            return true;
        }
        //Firstly delete each file
        for (let i = 0; i < this.files.length; i++) {
            let result = this.files[i].deleteVerify(); //deleteVerify FILE
            if (result != true) {
                console.log('error copying file');
                return false;
            }
        }
        //Then delete the empty folder
        try {
            fs.rmdirSync(this.path);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    qualifyByTypeAndCount(count: number, type: string) {
        this.filesByType = this.getFilesByType(type);
        let result = this.filesByType.length == count;
        //console.log(`%ccount: ${count} this.filesByType: ${this.filesByType.length} result: ${result}`,'color: orange');
        return result;
    }

    createTxtFile(fileName: string, contents: string): boolean {
        try {
            fs.writeFileSync(`${this.path}/${fileName}.txt`, contents);
            return true;
        } catch (error) {
            console.log(`error when trying to write file: ${error}`);
            return false;
        }
    }
}

export default FolderHandler;
