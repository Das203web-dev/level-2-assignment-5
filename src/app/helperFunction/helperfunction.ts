import AppError from "../errorHelpers/AppError";
import { IDeliveryInfoTypes, ParcelStatus } from "../modules/parcel/parcel.interface";
import { Parcel } from "../modules/parcel/parcel.model";
import { IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { handleNotification } from "../utils/notificationHandeler";
import { JwtPayload } from "jsonwebtoken";
import { NotificationType } from "../modules/notification/notification.interface";
import { OTP } from "../modules/otp/otp.model";
import { sendOTPEmail } from "../utils/sendOTPemail";
import { ClientSession } from "mongoose";

export const handleFindAdmin = async () => {
    const findAdmin = await User.findOne({ role: Role.ADMIN }).select("userId");
    if (!findAdmin) {
        throw new AppError(httpStatus.NOT_FOUND, "No admin found")
    }
    return findAdmin
}

export const checkCancelStatus = (status: ParcelStatus) => {
    if (status === ParcelStatus.CANCELLED) {
        throw new AppError(httpStatus.BAD_REQUEST, `The parcel is already ${status}`)
    }
}

export const checkParcelExistence = async (id: string, session: ClientSession | null = null) => {
    const isParcelExist = await Parcel.findOne({ trackingId: id }).session(session);
    if (!isParcelExist) {
        throw new AppError(httpStatus.NOT_FOUND, "The parcel is not found")
    }
    return isParcelExist
}

export const notifyAdmin = async (status: ParcelStatus, trackingId: string, notificationFor: NotificationType) => {
    const admin = await handleFindAdmin()
    await handleNotification(status, trackingId, admin.userId, notificationFor);
}


export const checkAdminOrSuperAdminAccess = (token: JwtPayload) => {
    if (token.role !== Role.ADMIN && token.role !== Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Sorry you don't have permission to Approve")
    }
}
export const checkIsTheParcelIsAlreadyApproved = (status: string) => {
    if (status === ParcelStatus.APPROVED) {
        throw new AppError(httpStatus.BAD_REQUEST, `The parcel is already ${status}`)
    }
}
export const createDeliveryInfo = (findAssignedTo: Partial<IUser>, findAssignedBy: Partial<IUser>) => {
    if (!findAssignedTo?.name || !findAssignedTo?.email || !findAssignedTo?.userId) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Assigned delivery person info is incomplete");
    }

    if (!findAssignedBy?.name || !findAssignedBy?.email || !findAssignedBy?.role) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Assigning admin info is incomplete");
    }
    const deliveryInfo: IDeliveryInfoTypes = {
        deliveryPersonInfo: {
            name: findAssignedTo?.name,
            email: findAssignedTo?.email,
            userId: findAssignedTo?.userId
        },
        assignedAt: new Date(),
        assignedBy: {
            name: findAssignedBy?.name,
            email: findAssignedBy?.email,
            role: findAssignedBy?.role
        }
    }
    return deliveryInfo
}
export const checkTokenExistence = async (token: JwtPayload) => {
    if (!token) {
        throw new AppError(httpStatus.NOT_FOUND, "No token found");
    }
    return token as JwtPayload
}
export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp
}

// handleInvalidOtp function
export const handleInvalidOtp = async (parcelID: string) => {
    const parcelFromOtp = await OTP.findOne({ parcelId: parcelID });
    const parcel = await checkParcelExistence(parcelID);

    if (!parcelFromOtp) {
        throw new AppError(httpStatus.NOT_FOUND, "No OTP record found for this parcel");
    }

    // Decrease attempt count
    parcelFromOtp.attempt -= 1;

    if (parcelFromOtp.attempt > 0) {
        // Still have attempts left
        await parcelFromOtp.save();
        throw new AppError(httpStatus.BAD_REQUEST, `Invalid OTP. You have ${parcelFromOtp.attempt} attempt(s) left.`);
    } else {
        // No attempts left, check if we can send new OTP
        if (parcelFromOtp.maxLimit > 1) {
            // Can send new OTP
            parcelFromOtp.maxLimit -= 1;
            parcelFromOtp.attempt = 3; // Reset attempt to 3
            parcelFromOtp.coolDownTime = new Date(Date.now() + 1 * 60 * 1000); // 2 minutes cooldown
            await parcelFromOtp.save();
            // Send new OTP
            await sendOTPEmail(
                parcel?.receiverInfo?.receiverId as string,
                parcel.trackingId,
                3, // Reset to 3 attempts
                parcel.receiverInfo.receiverEmail,
                "PARCEL_DELIVERY",
                parcel.deliveryInfo?.deliveryPersonInfo?.userId
            );

            const cooldownMinutes = Math.ceil((parcelFromOtp.coolDownTime.getTime() - Date.now()) / 60000);
            throw new AppError(httpStatus.BAD_REQUEST, `Maximum attempts reached. A new OTP has been sent. Please wait ${cooldownMinutes} minutes before trying again.`);
        } else {
            // No more OTP allowed - mark parcel as failed
            parcel.parcelStatus = ParcelStatus.FAILED;
            await parcel.save();
            throw new AppError(httpStatus.BAD_REQUEST, "Maximum OTP limit reached. Parcel delivery has failed.");
        }
    }
};




