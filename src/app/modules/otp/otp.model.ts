import { model, Schema } from "mongoose";
import { IOtp } from "./otp.interface";
import { required } from "zod/v4/core/util.cjs";
import { number } from "zod";

const otpSchema = new Schema<IOtp>({
    userId: {
        type: String,
        required: true
    },
    parcelId: {
        type: String
    },
    expireTime: {
        type: Date,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    otpFor: {
        type: String,
        required: true
    },
    attempt: {
        type: Number,
        required: true,
        default: 2
    },
    coolDownTime: {
        type: Date,
        required: true
    },
    maxLimit: {
        type: Number,
        required: true,
        default: 3
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
})
otpSchema.index({ expireTime: 1 }, { expireAfterSeconds: 0 })
export const OTP = model<IOtp>("OTP", otpSchema)
