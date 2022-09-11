type OrderStatus = `OPEN` | `DELIVERED`;
type YESNO = 'YES' | 'NO';
class Order {
    clientName: string;
    clientEmail: string;
    bdpName: string;
    bdpGender: string;
    bdpAge: string;
    mentionAge: YESNO;
    bdpQuality: string;
    date: Date;
    sqlDate: string;
    status?: OrderStatus;
    constructor(
        date: Date,
        clientName: string,
        clientEmail: string,
        bdpName: string,
        bdpGender: string,
        bdpAge: string,
        mentionAge: string,
        bdpQuality: string,
        status?: OrderStatus
    ) {
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.bdpName = bdpName;
        this.bdpGender = bdpGender;
        this.bdpAge = bdpAge.trim() == '' ? '29' : bdpAge;
        this.mentionAge = this.toSQL_YESNO(mentionAge);
        this.bdpQuality = bdpQuality;
        this.date = date;
        this.sqlDate = this.toSQLDate(this.date);
        this.status = status;
    }
    /**
     * Inserts order into DB
     * Assumes the order doesn't exist already
     */
    async process__WithStatusOpen(db: any) {
        // Deal with possible NULL values
        let bdPersonName =
            this.bdpName.trim() == '' ? 'NULL' : `'${this.bdpName}'`;
        let sql = `
            INSERT INTO orders
            VALUES (
                DEFAULT,
                '${this.sqlDate}',
                '${this.clientName}',
                '${this.clientEmail}',
                ${bdPersonName},
                '${this.bdpGender}',
                '${this.bdpAge}',
                '${this.mentionAge}',
                '${this.bdpQuality}',
                DEFAULT
            );
        `;

        let result = await db.execute(sql);
        return result;
    }
    toSQLDate(date: Date): string {
        const year = this.date.getFullYear();
        const month = this.date.getMonth() + 1;
        const day = this.date.getDate();
        const sqlDate = `${year}-${month}-${day}`;
        return sqlDate;
    }
    toSQL_YESNO(yesNo: string): YESNO {
        if (yesNo.toLowerCase().indexOf('no') > -1) {
            return 'NO';
        }
        return 'YES';
    }
    /**
     * Checks if order with given params is in status OPEN
     * @param  {any} db
     * @returns Promise
     */
    async checkIfProcessed(db: any): Promise<boolean> {
        let sql = `
            SELECT * FROM orders
            WHERE (
                bdpName = '${this.bdpName}' AND
                clientName = '${this.clientName}' AND
                bdpQuality = '${this.bdpQuality}' AND
                orderDate = '${this.sqlDate}'
            )
        `;

        let result = await db.execute(sql);
        console.log(result);
        return result[0].length > 0;
    }
    /**
     * Mark openOrder as done
     * Move from open orders to done orders
     */
    done() {}
}

export { Order, OrderStatus };
