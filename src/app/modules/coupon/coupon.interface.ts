
export interface ICoupon {
    couponCode: string;
    maxLimit: number;
    couponStatus: "ACTIVE" | "EXPIRED";
    discountPercent: number;
    expiryDate: Date;
    minimumFee?: number
}