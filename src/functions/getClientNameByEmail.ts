async function getClientNameByEmail(
    db: any,
    clientEmail: string
): Promise<string> {
    // Locate Client Name in DB
    let sql = `
    SELECT * FROM orders
    WHERE clientEmail = '${clientEmail}'
    `;

    let results = (await db.execute(sql)) as any;
    let clientName = 'NULL';
    if (results[0].length == 0) {
        // No clientName found
    } else {
        clientName = results[0][0]['clientName'];
    }
    return clientName;
}

export default getClientNameByEmail;
