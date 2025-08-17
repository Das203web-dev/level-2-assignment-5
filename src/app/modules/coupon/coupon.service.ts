import { JwtPayload } from "jsonwebtoken";
import { ICoupon } from "./coupon.interface";
import { Coupon } from "./coupon.model";
import { Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"

const createCoupon = async (token: JwtPayload, payload: Partial<ICoupon>) => {
    if (token.role === Role.ADMIN && token.role === Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Permission denied")
    }
    const coupon = await Coupon.create(payload);
    return coupon
}
export const CouponService = { createCoupon }