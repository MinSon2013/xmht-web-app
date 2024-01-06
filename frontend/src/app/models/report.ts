export interface Reports {
    id: number;
    districtId?: number;
    provinceId?: number;
    storeId?: number;
    agencyId?: number;
    storeInformation: string;
    reportContent: string;
    attachFile: string;
    filePath?: string;
    note: string;
    updateDate: string;
    otherStoreName: string;
    updatedByUserId: number;
    updateDateVisisble?: string;
    userId?: number;
    districtName?: string;
    provinceName?: string;
    storeName?: string;
    agencyName?: string;
    file?: any;
    fileName?: string;
    rowId?: number;
    showDetail?: boolean;
    showLabel?: string;
    showContent?: string
    fullName?: string;
}