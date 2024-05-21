export interface Search {
    orderId?: number;
    agencyId?: number;
    productId?: number;
    startDate?: string;
    endDate?: string;
    status?: number;
    userId?: number;
    approvedNumber?: number;
}

export interface SearchDetailsOrder {
    agencyId: number;
    deliveryId: string;
    licensePlate: string;
    driver: string;
    receipt: string;
    status: string;
    productId: string;
    startDate: string;
    endDate: string;
    userId: number;
}