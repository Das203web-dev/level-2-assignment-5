import { model, Schema } from "mongoose";
import { ICoupon } from "./coupon.interface";

const couponSchema = new Schema<ICoupon>({
    couponCode: {
        type: String,
        required: [true, "Coupon code is required"],
        minlength: [1, "Minimum length is 1"],
        unique: true,
        index: true
    },
    maxLimit: {
        type: Number,
        required: [true, "Please provide a limit of the coupon"],
        min: [1, "Non negative number is not allowed"]
    },
    couponStatus: {
        type: String,
        required: true,
        enum: ["ACTIVE", "EXPIRED"],
        default: "ACTIVE"
    },
    discountPercent: {
        type: Number,
        required: true,
        min: [1, "Non negative number is not allowed"]
    },
    expiryDate: {
        type: Date,
        required: true
    },
    minimumFee: {
        type: Number,
        min: [1, "Non negative number is not allowed"]
    }
}, {
    timestamps: true,
    versionKey: false
})
export const Coupon = model<ICoupon>("Coupon", couponSchema)