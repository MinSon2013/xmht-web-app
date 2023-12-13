export interface Store {
    id: number;
    agencyId: number;
    storeName: string,
    districtId: number;
    provinceId: number;
    updateDate: string;
    userId: number;
    provinceName?: string;
    agencyName?: string;
    districtName?: string;
    storeList?: string[];
    districtList?: string[];
    provinceList?: string[];
}

export interface Store1 {
    agencyId: number;
    districtList: [
        {
            districtId: number;
            provinceList: [
                {
                    provinceId: number;
                    storeList: [
                        {
                            id: number;
                            storeName: string;
                        }
                    ];
                    provinceName?: string;
                }
            ];
            districtName?: string;
        }
    ];
    agencyName?: string;
    updateDate: string;
    userId: number;
}