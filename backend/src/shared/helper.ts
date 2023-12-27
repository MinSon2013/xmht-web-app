import moment from "moment";

export class Helper {
    private readonly UPDATE_DATE_FORMAT_1 = 'HH:mm:ss DD/MM/YYYY';
    private readonly UPDATE_DATE_FORMAT_2 = 'HH:mm DD/MM/YYYY';

    public getUpdateDate(t: number) {
        if (t = 1) {
            return moment(new Date).format(this.UPDATE_DATE_FORMAT_1);
        } else if (t = 2) {
            return moment(new Date).format(this.UPDATE_DATE_FORMAT_2);
        }

    }
}