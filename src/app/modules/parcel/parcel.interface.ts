import { Types } from "mongoose";
import { IUser } from "../user/user.interface";

export enum ParcelType {
    DOCUMENT = "DOCUMENT",
    BOX = "BOX",
    FRAGILE = "FRAGILE",
    LARGE = "LARGE"
}
export enum ParcelStatus {
    REQUESTED = "REQUESTED",
    APPROVED = "APPROVED",
    ASSIGNED_TO = "ASSIGNED_TO",
    DISPATCHED = "DISPATCHED",
    IN_TRANSIT = "IN_TRANSIT",
    SEND_OTP = "SEND_OTP",
    PARCEL_DELIVERY_NOTIFICATION = "PARCEL_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    FAILED = "FAILED",
    FLAG = "FLAG",
    BLOCKED = "BLOCKED"
}
export interface IStatusLog {
    location: string,
    status: {
        parcelStatus: ParcelStatus,
        date: Date
    },
    note?: string
}
export interface IReceiverType {
    address: string;
    receiverId?: string | null;
    receiverName: string;
    receiverPhone: string;
    receiverEmail: string
}
export interface IDeliveryInfoTypes {
    deliveryPersonInfo: {
        name: string,
        email: string,
        userId: string,
        phone?: string
    };
    assignedAt: Date;
    assignedBy: {
        name: string,
        email: string,
        role: string
    };
    completedAt?: Date
}


export interface IParcel {
    parcelName: string,
    senderId: string,
    senderAddress: string,
    location?: string,
    receiverInfo: IReceiverType;
    parcelType: ParcelType;
    weight: number;
    deliveryDate: Date;
    parcelStatus: ParcelStatus;
    fee?: number;
    isPaid?: boolean;
    trackingId: string;
    trackingEvent?: IStatusLog[];
    deliveryInfo?: IDeliveryInfoTypes;
    coupon?: string
}