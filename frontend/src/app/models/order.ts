export interface Order {
    id: number;
    createdDate: string, // Ngày tạo đơn
    deliveryId: number, // Nơi nhận hàng
    pickupId: number, // Nơi giao hàng
    productTotal: number,
    transport: number, // Phương tiện vận chuyển (1: bộ, 2: thủy, 3: hàng không)
    receipt: number,
    licensePlates: string, // Biển số
    driver: string,
    receivedDate: string,
    note: string,
    status: number,
    contract: string,
    products: ProductItem[],
    selectedDelivery?: string,
    selectedPickup?: string,
    selectedTransport?: string,
    statusLabel?: string,
    updatedDate?: string,
    agencyId?: number,
    agencyName?: string,
    isViewed?: boolean;
    sender?: number;
    notifyReceiver?: number;
    userUpdated?: number;
    approvedNumber: number | string;
    editer: string;
    confirmedDate: string,
    shippingDate: string,
}

export interface ProductItem {
    id: number,
    name: string,
    quantity: number | string,
}