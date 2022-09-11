import * as mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config();

class DB_Handler {
    static config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
    };

    db: any;

    constructor() {
        this.db = this.setupDB();
    }

    setupDB() {
        const pool = mysql.createPool(DB_Handler.config);
        const db = pool.promise();
        return db;
    }
}

export { DB_Handler };
