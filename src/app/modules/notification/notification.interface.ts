import { IParcel } from "../parcel/parcel.interface";
import { Role } from "../user/user.interface";


export enum NotificationType {
    NEW_PARCEL_REQUEST = "NEW_PARCEL_REQUEST",
    PARCEL_APPROVED = "PARCEL_APPROVED",
    PARCEL_ASSIGN = "PARCEL_ASSIGN",
    PARCEL_CANCELLED = "PARCEL_CANCELLED",
    PARCEL_DISPATCHED = "PARCEL_DISPATCHED",
    PARCEL_DELIVERED = "PARCEL_DELIVERED",
    PARCEL_IN_TRANSIT = "PARCEL_IN_TRANSIT",
    PARCEL_RETURNED = "PARCEL_RETURNED",
    PARCEL_FAILED = "PARCEL_FAILED",
    PARCEL_SEND_OTP = "OTP_SEND_FOR_PARCEL",
    PARCEL_FLAGGED = "PARCEL_FLAGGED",
    PARCEL_BLOCKED = "PARCEL_BLOCKED"
}


export interface INotification {
    recipientId: string;
    senderId?: string;
    senderRole?: Role | "";
    recipientRole: Role | "";
    parcelId: string;
    message: string;
    data?: Partial<IParcel> | null;
    notificationType: NotificationType;
}