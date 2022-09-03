class Order {
    clientName: string;
    clientEmail: string;
    bdpName: string;
    bdpGender: string;
    bdpAge: string;
    bdpQuality: string;
    date: Date;
    sqlDate: string;
    constructor(
        clientName: string,
        clientEmail: string,
        bdpName: string,
        bdpGender: string,
        bdpAge: string,
        bdpQuality: string,
        date: Date
    ) {
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.bdpName = bdpName;
        this.bdpGender = bdpGender;
        this.bdpAge = bdpAge;
        this.bdpQuality = bdpQuality;
        this.date = date;
        this.sqlDate = this.toSQLDate(this.date);
    }
    /**
     * Take either Stripe or FreeBob order and put in DB
     */
    async processIncoming(db: any) {
        let sql = `
            INSERT INTO orders
            VALUES (
                DEFAULT,
                '${this.sqlDate}',
                '${this.clientName}',
                '${this.clientEmail}',
                '${this.bdpName}',
                '${this.bdpGender}',
                '${this.bdpAge}',
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
    async checkIfProcessed(db: any): Promise<boolean> {
        let sql = `
            SELECT * FROM orders
            WHERE (
                bdp_name = '${this.bdpName}' AND
                client_name = '${this.clientName}' AND
                order_date = '${this.sqlDate}' AND
                status = 'OPEN'
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

export default Order;
