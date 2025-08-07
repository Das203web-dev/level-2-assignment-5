import { model, Schema } from "mongoose";
import { IAuth, IUser, Role, UserStatus } from "./user.interface";
import * as crypto from "crypto";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"


const authModel = new Schema<IAuth>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    _id: false,
    versionKey: false
})

const userModel = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    userStatus: {
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    address: { type: String },
    role: {
        type: String,
        enum: Object.values(Role)
    },
    phone: { type: String },
    auths: [authModel],
    userId: { type: String, unique: true }
}, {
    timestamps: true,
    versionKey: false
})
userModel.pre("save", async function (next) {
    if (this.isNew) {
        if (this.email) {
            const findUser = await User.findOne({ email: this.email });
            if (findUser) {
                throw new AppError(httpStatus.CONFLICT, "User already exist")
            }
            const userId = crypto
                .createHash("md5")
                .update(`${this.email}-${Date.now()}`)
                .digest("hex")
                .slice(0, 12);
            this.userId = `USER-${userId}`
        }
    }
    next()
})
export const User = model<IUser>("User", userModel)