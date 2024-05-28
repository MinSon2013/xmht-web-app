export class DetailsOrderDTO {
    agencyId: string;
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

    take: number;
    skip: number;
}