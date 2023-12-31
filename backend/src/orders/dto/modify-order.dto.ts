export class ModifyOrderDto {
  id?: number;
  createdDate: string;
  deliveryId: number;
  pickupId: number;
  productTotal: string;
  transport: number;
  licensePlates: string; 
  driver: string;
  receivedDate: string;
  note: string;
  status: number;
  contract: string;
  products: ProductItem[];
  selectedDelivery?: string;
  selectedPickup?: string;
  selectedTransport?: string;
  statusLabel?: string;
  updatedDate?: string;
  agencyId?: number;
  agencyName?: string;
  isAdmin?: boolean;
  isViewed?: boolean;
  sender?: number;
  notifyReceiver?: number;
  agencyUpdated?: number;
  adminId?: number;
  approvedNumber?: number;
  editer: string;
  receipt: number;
  confirmedDate: string;
  shippingDate: string;
  stockerId?: number; 
}

export interface ProductItem {
  id: number;
  name: string;
  quantity: string;
}