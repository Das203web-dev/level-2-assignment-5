import { Request } from "express";
import { OTP } from "../modules/otp/otp.model";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes"

export const verifyOTP = async (parcelId: string, otp: number) => {
    const findOTP = await OTP.findOne({ parcelId });
    if (!findOTP) {
        throw new AppError(httpStatus.NOT_FOUND, "The otp is missing")
    }
    if (findOTP.otp === otp) {
        console.log("yes otp matched");
    }
    return findOTP
}