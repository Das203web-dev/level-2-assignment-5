import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { CouponService } from "./coupon.service";
import { JwtPayload } from "jsonwebtoken";
import { ICoupon } from "./coupon.interface";
import { handleResponse } from "../../utils/handleResponse";
import httpStatus from "http-status-codes"

const handleCreateCoupon = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user;
    const payload = req.body;
    const coupon = await CouponService.createCoupon(token as JwtPayload, payload as Partial<ICoupon>);
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: coupon,
        message: "Coupon created successfully"
    })
})
export const CouponController = {
    handleCreateCoupon
}