import * as fs from 'fs';
import * as pathLib from 'path';

class Handler {
    path: string;
    lower: string;
    exists: boolean;
    parsed: pathLib.ParsedPath | undefined;
    parsedLower: pathLib.ParsedPath | undefined;

    //gets the info of file or folder
    constructor(path: string) {
        this.path = path;
        this.lower = path.toLocaleLowerCase();
        this.exists = fs.existsSync(this.path);
        if (this.exists) {
            //path.parse('/home/user/dir/file.txt');
            // Returns:
            // { root: '/',
            //   dir: '/home/user/dir',
            //   base: 'file.txt',
            //   ext: '.txt',
            //   name: 'file' }
            this.parsed = pathLib.parse(path);
            this.parsedLower = pathLib.parse(this.lower);
        }
    }
}

export default Handler;
