export class ModifyStoreDto {
  id?: number;
  agencyId: number;
  districtId: number;
  provinceId: number;
  storeName: string;
  address: string;
  phone: string;
  note: string;
  updatedDate: string;
  userId: number;
  updatedByUserId: string;
}