const MISC = {
    formatDateTo_sixDigits(date: Date): string {
        let year = (date.getFullYear() - 2000).toString();
        let month = (date.getMonth() + 1).toString();
        if (month.length == 1) {
            month = '0' + month;
        }
        let day = date.getDate().toString();
        if (day.length == 1) {
            day = '0' + day;
        }
        return day + month + year;
    },
};

export default MISC;
