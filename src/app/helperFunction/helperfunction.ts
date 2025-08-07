import AppError from "../errorHelpers/AppError";
import { IDeliveryInfoTypes, IParcel, ParcelStatus } from "../modules/parcel/parcel.interface";
import { Parcel } from "../modules/parcel/parcel.model";
import { IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { handleNotification } from "../utils/notificationHandeler";
import { JwtPayload } from "jsonwebtoken";

export const handleFindAdmin = async () => {
    const findAdmins = await User.find({ role: Role.ADMIN }).select("userId");
    if (findAdmins.length < 1) {
        throw new AppError(httpStatus.NOT_FOUND, "No admin found")
    }
    return findAdmins
}

export const checkCancelStatus = (status: ParcelStatus) => {
    if (status === ParcelStatus.CANCELLED) {
        throw new AppError(httpStatus.BAD_REQUEST, `The parcel is already ${status}`)
    }
}

export const checkParcelExistence = async (id: string) => {
    const isParcelExist = await Parcel.findOne({ trackingId: id })
    if (!isParcelExist) {
        throw new AppError(httpStatus.NOT_FOUND, "The parcel is not found")
    }
    return isParcelExist
}

export const notiFyAdmins = async (status: ParcelStatus, trackingId: string) => {
    const findAdmins = await handleFindAdmin()
    const notification = findAdmins.map(async (admin) => {
        await handleNotification(status, trackingId, admin.userId);
    })
    await Promise.all(notification)
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