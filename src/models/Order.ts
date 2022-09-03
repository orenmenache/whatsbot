class Order {
    clientName: string;
    clientEmail: string;
    bdpName: string;
    bdpGender: string;
    bdpAge: string;
    bdpQuality: string;
    date: Date;
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
    }
    /**
     * Take either Stripe or FreeBob order and put in DB
     */
    async processIncoming(db: any) {
        const year = this.date.getFullYear();
        const month = this.date.getMonth() + 1;
        const day = this.date.getDate();
        const sqlDate = `${year}-${month}-${day}`;

        let sql = `
            INSERT INTO orders
            VALUES (
                DEFAULT,
                '${sqlDate}',
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
    /**
     * Mark openOrder as done
     * Move from open orders to done orders
     */
    done() {}
}

export default Order;
