export class ModifyStoreDTO {
  id?: number;
  agencyId: number;
  districtId: number;
  provinceId: number;
  storeName: string;
  address: string;
  phone: string;
  note: string;
  userId: number;
  updatedByUserId: number;
}