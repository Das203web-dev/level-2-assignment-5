import { z } from "zod";
import { ParcelStatus, ParcelType } from "./parcel.interface";

// Enums from your interfaces
const ParcelTypeEnum = z.enum(Object.values(ParcelType));
const ParcelStatusEnum = z.enum(Object.values(ParcelStatus));

// Nested Schemas

const StatusLogSchema = z.object({
    location: z.string({
        message: "Location has to be string"
    }).optional(),
    status: z.object({
        parcelStatus: ParcelStatusEnum,
        date: z.preprocess((arg) => {
            if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
        }, z.date()),
    }),
    note: z.string().optional(),
});

const ReceiverInfoSchema = z.object({
    address: z.string().min(1, "Receiver address is required"),
    receiverId: z.string().optional(),
    receiverName: z.string().min(1, "Receiver name is required"),
    receiverPhone: z.string().min(1, "Receiver phone is required"),
    receiverEmail: z.email({ error: "Email is required" })
});

const DeliveryPersonInfoSchema = z.object({
    name: z.string().min(1, "Delivery person name is required"),
    email: z.email({ error: "Email is required" }),
    userId: z.string().min(1, "User ID is required"),
    phone: z.string().optional(),
});

const AssignedBySchema = z.object({
    name: z.string().min(1, "Assigned by name is required"),
    email: z.email({ error: "Email is required" }),
    role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

const DeliveryInfoSchema = z.object({
    deliveryPersonInfo: DeliveryPersonInfoSchema,
    assignedAt: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    assignedBy: AssignedBySchema,
    completedAt: z
        .preprocess((arg) => {
            if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
        }, z.date())
        .optional(),
});

// Main Parcel Schema

export const ParcelSchema = z.object({
    parcelName: z.string().min(1, "Parcel name is required"),
    // senderId: z.string().min(1, "Sender ID is required"),
    senderAddress: z.string().min(1, "Sender address is required"),
    location: z.string().optional(),
    receiverInfo: ReceiverInfoSchema,
    parcelType: ParcelTypeEnum,
    weight: z.number().positive("Weight must be positive"),
    deliveryDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    fee: z.number().nonnegative("Fee must be zero or positive").optional(),
    isPaid: z.boolean().optional(),
    trackingId: z.string().optional(),
    trackingEvent: z.array(StatusLogSchema).optional(),
    deliveryInfo: DeliveryInfoSchema.optional(),
    coupon: z.string().optional()
});
