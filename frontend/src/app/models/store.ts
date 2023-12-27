export interface Store {
    id: number;
    agencyId: number;
    storeName: string,
    districtId: number;
    provinceId: number;
    address: string;
    phone: string;
    updateDate: string;
    userId: number;
    note: string;
    updatedByUserId: number;
    provinceName?: string;
    agencyName?: string;
    districtName?: string;
    storeList?: string[];
    districtList?: string[];
    provinceList?: string[];
}
