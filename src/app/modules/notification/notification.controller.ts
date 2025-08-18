import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { notificationService } from "./notification.service";
import { JwtPayload } from "jsonwebtoken";
import { handleResponse } from "../../utils/handleResponse";
import httpStatus from "http-status-codes"

const handleNotification = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const getToken = req.user;
    const sendToken = await notificationService.getNotification(getToken as JwtPayload)
    handleResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: sendToken,
        message: "Parcel deleted"
    })
})
export const NotificationController = {
    handleNotification
}