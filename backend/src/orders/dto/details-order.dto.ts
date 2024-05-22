export class DetailsOrderDTO {
    agencyId: number;
    deliveryId: string; // Giao
    pickupId: string; // Nhan
    licensePlate: string;
    driver: string;
    receipt: string;
    status: string;//"a,b"
    productId: string;
    startDate: string;
    endDate: string;
    userId: number; // Login userId
}