import { NextFunction, Request, Response } from "express";
import { catchAsyncFunction } from "../../utils/catchAsync";
import { notificationService } from "./notification.service";
import { JwtPayload } from "jsonwebtoken";

const handleNotification = catchAsyncFunction(async (req: Request, res: Response, next: NextFunction) => {
    const getToken = req.user;
    const sendToken = await notificationService.getNotification(getToken as JwtPayload)
    console.log(sendToken);
})
export const NotificationController = {
    handleNotification
}