import { model, Schema } from "mongoose";
import { IDeliveryInfoTypes, IParcel, IReceiverType, IStatusLog, ParcelStatus, ParcelType } from "./parcel.interface";
import * as crypto from "crypto";
import { string } from "zod";
import { Role } from "../user/user.interface";
import { required } from "zod/v4/core/util.cjs";


const receiverSchema = new Schema<IReceiverType>({
    address: String,
    receiverId: String,
    receiverName: String,
    receiverPhone: String
}, {
    _id: false,
    versionKey: false
})

const trackingEventSchema = new Schema<IStatusLog>({
    location: { type: String },
    status: {
        parcelStatus: {
            type: String,
            enum: Object.values(ParcelStatus),
            default: ParcelStatus.REQUESTED
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    note: { type: String }
}, {
    timestamps: false,
    _id: false,
    versionKey: false
})
const deliveryInfoSchema = new Schema<IDeliveryInfoTypes>({
    deliveryPersonInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        userId: { type: String, required: true },
        phone: { type: String }
    },
    assignedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    assignedBy: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: [Role.ADMIN, Role.SUPER_ADMIN],
            required: true
        }
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: false,
    _id: false,
    versionKey: false
})

const parcelSchema = new Schema<IParcel>({
    parcelName: { type: String, required: true, unique: true },
    senderId: {
        type: String,
        ref: "User",
        required: true,
        index: true
    },
    senderAddress: {
        type: String,
        required: true,
    },
    location: {
        type: String
    },
    receiverInfo: receiverSchema,
    parcelType: {
        type: String,
        enum: Object.values(ParcelType),
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    parcelStatus: {
        type: String,
        required: true,
        enum: Object.values(ParcelStatus),
        default: ParcelStatus.REQUESTED
    },
    fee: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    trackingId: { type: String, unique: true },
    trackingEvent: [trackingEventSchema],
    deliveryInfo: deliveryInfoSchema
}, {
    timestamps: true,
    versionKey: false
})


parcelSchema.pre("save", async function (next) {
    if (this.isNew) {
        if (this.parcelName) {
            const parcelLogArray = []
            const now = new Date()
            const checkIdExist = await Parcel.findOne({ parcelName: this.parcelName });
            if (checkIdExist) {
                return next(new Error("The parcel name is already exist"))
            }
            const trackingId = crypto
                .createHash("md5")
                .update(`${this.parcelName}-${this.senderId}-${Date.now()}`)
                .digest("hex")
                .slice(0, 16);
            const statusLog: IStatusLog = {
                location: this.location ? this.location : "",
                status: {
                    parcelStatus: this.parcelStatus,
                    date: now
                },
                note: `This parcel is ${this.parcelStatus} on ${now.toLocaleString("en-BD")}`
            }
            parcelLogArray.push(statusLog)
            this.trackingEvent = parcelLogArray
            this.trackingId = `TRK-${trackingId.toUpperCase()}`
        }
    }
    next()
})

export const Parcel = model<IParcel>("Parcel", parcelSchema)