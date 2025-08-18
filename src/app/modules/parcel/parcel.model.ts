import { model, Schema } from "mongoose";
import { IDeliveryInfoTypes, IParcel, IReceiverType, IStatusLog, ParcelStatus, ParcelType } from "./parcel.interface";
import * as crypto from "crypto";
import { Role } from "../user/user.interface";
import { feeCalculation } from "../../utils/feeCalculation";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { Coupon } from "../coupon/coupon.model";


const receiverSchema = new Schema<IReceiverType>({
    address: {
        type: String,
        required: [
            true,
            "Receiver address must be provided"
        ]
    },
    receiverId: {
        type: String
    },
    receiverName: {
        type: String,
        required: [
            true,
            "Receiver name must be provided"
        ]
    },
    receiverPhone: {
        type: String,
        required: [
            true,
            "Receiver phone must be provided"
        ]
    },
    receiverEmail: {
        type: String,
        required: [
            true,
            "Email must be provided"
        ]
    }
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
            required: [
                true,
                "Delivery person Name is required"
            ]
        },
        email: {
            type: String,
            required: [
                true,
                "Email must be provided"
            ]
        },
        userId: {
            type: String,
            required: [
                true,
                "Email must be provided"
            ]
        },
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
            required: [
                true,
                "Assigned by person name must be provided"
            ]
        },
        email: {
            type: String,
            required: [
                true,
                "Email must be provided"
            ]
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
        required: true,
        min: [1, "Negative value is not allowed"]
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
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    trackingId: { type: String, unique: true },
    trackingEvent: [trackingEventSchema],
    deliveryInfo: deliveryInfoSchema,
    coupon: {
        type: String,
        ref: "Coupon"
    }
}, {
    timestamps: true,
    versionKey: false
})

const now = new Date()

parcelSchema.pre("save", async function (next) {
    const now = new Date();

    // If new parcel
    if (this.isNew) {
        if (this.parcelName) {
            const parcelLogArray = [];
            let coupon = null;
            const checkIdExist = await Parcel.findOne({ parcelName: this.parcelName });
            if (checkIdExist) {
                return next(new Error("The parcel name already exists"));
            }

            const trackingId = crypto
                .createHash("md5")
                .update(`${this.parcelName}-${this.senderId}-${Date.now()}`)
                .digest("hex")
                .slice(0, 16);

            const statusLog: IStatusLog = {
                location: this.location || "",
                status: {
                    parcelStatus: this.parcelStatus,
                    date: now
                },
                note: `This parcel is ${this.parcelStatus} on ${now.toLocaleString("en-BD")}`
            };
            if (this.coupon) {
                coupon = await Coupon.findOne({ couponCode: this.coupon });
                if (!coupon) {
                    return next(new AppError(httpStatus.NOT_FOUND, `This coupon ${this.coupon} is not found`))
                }
                if (coupon.couponStatus === "EXPIRED") {
                    return next(new AppError(httpStatus.BAD_REQUEST, `The coupon ${coupon?.couponCode} is expired`))
                }
                if (coupon.maxLimit === 0) {
                    await Coupon.findOneAndUpdate(
                        { couponCode: coupon.couponCode },
                        { $set: { couponStatus: "EXPIRED" } }
                    )
                    return next(new AppError(httpStatus.BAD_REQUEST, `The coupon ${coupon?.couponCode} reached its max limit`))
                }
            }

            parcelLogArray.push(statusLog);
            let fee;
            const normalFee = feeCalculation(this.parcelType, this.weight);
            if (coupon && normalFee >= Number(coupon.minimumFee)) {
                fee = normalFee - (normalFee * coupon.discountPercent) / 100;
                await Coupon.findOneAndUpdate(
                    {
                        couponCode: coupon?.couponCode,
                        maxLimit: { $gt: 0 }
                    },
                    { $inc: { maxLimit: - 1 } })
            }
            else {
                this.coupon = undefined
                fee = normalFee;
            }
            this.fee = fee;
            this.trackingEvent = parcelLogArray;
            this.trackingId = `TRK-${trackingId.toUpperCase()}`;
        }
    }
    // for existing parcel & status changed
    else if (this.isModified("parcelStatus")) {
        this.trackingEvent = this.trackingEvent ?? [];
        this.trackingEvent.push({
            location: this.location || "",
            status: {
                parcelStatus: this.parcelStatus,
                date: now
            },
            note: `This parcel is ${this.parcelStatus} on ${now.toLocaleString("en-BD")}`
        });
    }

    next();
});

const terminalStatuses = [
    ParcelStatus.DELIVERED,
    ParcelStatus.CANCELLED,
    ParcelStatus.RETURNED,
    ParcelStatus.FAILED
];

parcelSchema.pre("findOneAndUpdate", async function (next) {
    const docToUpdate = await this.model.findOne(this.getQuery());
    const parcelLogArray = []
    if (!docToUpdate) return next();

    if (terminalStatuses.includes(docToUpdate.parcelStatus)) {
        return next(new AppError(
            httpStatus.BAD_REQUEST,
            `Cannot modify parcel in terminal state: ${docToUpdate.parcelStatus}`
        ));
    }
    const statusLog: IStatusLog = {
        location: docToUpdate.location ? docToUpdate.location : "",
        status: {
            parcelStatus: docToUpdate.parcelStatus,
            date: now
        },
        note: `This parcel is ${docToUpdate.parcelStatus} on ${now.toLocaleString("en-BD")}`
    }
    parcelLogArray.push(statusLog)
    docToUpdate.trackingEvent = parcelLogArray
    next();
});

export const Parcel = model<IParcel>("Parcel", parcelSchema)

