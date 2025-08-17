export interface IOtp {
    userId: string;
    parcelId: string;
    expireTime: Date;
    otp: number;
    attempt: number;
    otpFor: "PARCEL_DELIVERY";
    coolDownTime: Date;
    maxLimit: number
}