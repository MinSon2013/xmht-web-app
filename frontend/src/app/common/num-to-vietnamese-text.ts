export class NumToVietnameseText {

    defaultNumbers = ' hai ba bốn năm sáu bảy tám chín';
    dict = {
        units: ('? một' + this.defaultNumbers).split(' '),
        tens: ('lẻ mười' + this.defaultNumbers).split(' '),
        hundreds: ('không một' + this.defaultNumbers).split(' '),
    }
    tram = 'trăm';
    digits = 'x nghìn triệu tỉ nghìn'.split(' ');


    toVietnamese(input: any, currency?: any) {
        let str = parseInt(input) + '';
        let index = str.length;
        if (index === 0 || str === 'NaN')
            return '';
        let i = 0;
        let arr = [];
        let result = []

        while (index >= 0) {
            arr.push(str.substring(index, Math.max(index - 3, 0)));
            index -= 3;
        }

        let digitCounter = 0;
        let digit;
        let adding;
        for (i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === '000') {
                digitCounter += 1;
                if (i === 2 && digitCounter === 2) {
                    result.push(this.digitCounting(i + 1, digitCounter));
                }
            }
            else if (arr[i] !== '') {
                digitCounter = 0
                result.push(this.blockOfThree(arr[i]))
                digit = this.digitCounting(i, digitCounter);
                if (digit && digit != 'x') result.push(digit);
            }
        }
        if (currency) {
            result.push(currency);
        }

        return result.join(' ')
    }

    convertDecimal(input: any, currency: string) {
        let idx = input.toString().indexOf('.');
        if (idx === -1) {
            return ' tấn';
        }
        let str = input.split('.');
        let arrDec = str[1];
        if (arrDec.length === 1) {
            if (arrDec === '5') {
                return ' ' + currency + ' rưỡi';
            } else {
                return ' ' + currency + this.decimail1(arrDec);
            }
        } else {
            return ' phẩy ' + this.toVietnamese(arrDec) + ' ' + currency;
        }
    }

    decimail1(num: string) {
        let s = '';
        switch (num) {
            case '1':
                s = ' mốt';
                break;
            case '2':
                s = ' hai';
                break;
            case '3':
                s = ' ba';
                break;
            case '4':
                s = ' tư';
                break;
            case '6':
                s = ' sáu';
                break;
            case '7':
                s = ' bảy';
                break;
            case '8':
                s = ' tám';
                break;
            case '9':
                s = ' chín';
                break;
        }

        return s;
    }

    tenth(blockOf2: any): string {
        let arr = blockOf2;
        let sl1 = this.dict.units[arr[1]];
        let result = [this.dict.tens[arr[0]]]
        if (arr[0] > 0 && arr[1] === '5')
            sl1 = 'lăm';
        if (arr[0] > 1) {
            result.push('mươi');
            if (arr[1] === '1')
                sl1 = 'mốt';
        }
        if (sl1 != '?') result.push(sl1);
        return result.join(' ');
    }

    blockOfThree(block: any): string {

        let blockNum = block;
        switch (block.length) {
            case 1:
                return this.dict.units[blockNum];

            case 2:
                return this.tenth(block);

            case 3:
                var result = [this.dict.hundreds[blockNum[0]], this.tram];
                if (block.slice(1, 3) !== '00') {
                    var sl12 = this.tenth(block.slice(1, 3));
                    result.push(sl12);
                }
                return result.join(' ');
        }
        return '';
    }

    formatnumber(nStr: string): string {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    digitCounting(i: number, digitCounter: any) {
        let result = this.digits[i]
        return result
    }

}
