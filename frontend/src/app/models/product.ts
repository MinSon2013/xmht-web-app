export interface Product {
    id: number,
    name: string,
    quantity: number,
    price: number,
    note: string,
    category: number;
    createdDate?: string,
    updatedDate?: string,
    updatedByUserId: number;
}
