import { JwtPayload } from "jsonwebtoken";
import { IDeliveryInfoTypes, IParcel, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { handleParcelStatusUpdate } from "../../utils/handleParcelStatusUpdate";
import { handleNotification } from "../../utils/notificationHandeler";
import { checkAdminOrSuperAdminAccess, checkCancelStatus, checkIsTheParcelIsAlreadyApproved, checkParcelExistence, createDeliveryInfo, handleFindAdmin, notiFyAdmins } from "../../helperFunction/helperfunction";

const createParcel = async (payload: Partial<IParcel>, token: JwtPayload) => {
    const getToken = token;
    if (!getToken || !getToken.userId) {
        throw new AppError(httpStatus.NOT_FOUND, "You must login before creating a parcel")
    }
    if (getToken.role === Role.RECEIVER || getToken.role === Role.DELIVERY_AGENT) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry ${getToken.role} does not create parcel request`)
    }
    const parcelBody = {
        ...payload,
        senderId: token.userId
    }
    const createParcel = await Parcel.create(parcelBody)
    if (createParcel.parcelStatus === ParcelStatus.REQUESTED) {
        await notiFyAdmins(ParcelStatus.REQUESTED, createParcel.trackingId)
    }
    return createParcel
}
const cancelParcel = async (id: string, token: JwtPayload) => {
    const isParcelExist = await checkParcelExistence(id)
    if (isParcelExist.parcelStatus === ParcelStatus.APPROVED ||
        isParcelExist.parcelStatus === ParcelStatus.DISPATCHED ||
        isParcelExist.parcelStatus === ParcelStatus.IN_TRANSIT ||
        isParcelExist.parcelStatus === ParcelStatus.DELIVERED) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry the parcel is already ${isParcelExist.parcelStatus}`)
    }
    if (token.role === Role.ADMIN) {
        checkCancelStatus(isParcelExist.parcelStatus)
        const cancelParcel = await handleParcelStatusUpdate(id, ParcelStatus.CANCELLED)
        if (cancelParcel?.parcelStatus === ParcelStatus.CANCELLED) {
            await handleNotification(ParcelStatus.CANCELLED, isParcelExist.trackingId, isParcelExist.senderId);
        }
        return cancelParcel;
    }
    if (token.role !== Role.ADMIN) {
        checkCancelStatus(isParcelExist.parcelStatus)
        const findUser = await User.findOne({
            userId: token.userId,
            email: token.email
        })
        if (findUser?.userId === isParcelExist.senderId) {
            const cancelParcel = await handleParcelStatusUpdate(id, ParcelStatus.CANCELLED)
            if (cancelParcel?.parcelStatus === ParcelStatus.CANCELLED) {
                await notiFyAdmins(ParcelStatus.CANCELLED, cancelParcel.trackingId)
            }
            return cancelParcel
        }
        else {
            throw new AppError(httpStatus.FORBIDDEN, "Access denied")
        }
    }
}
const allParcels = async (token: JwtPayload) => {
    if (token.role === Role.ADMIN) {
        const allParcels = await Parcel.find()
        return allParcels
    }
    else {
        const parcels = await Parcel.find({
            senderId: token.userId,
        });
        return parcels
    }
}
const approvedParcel = async (parcelId: string, token: JwtPayload, deliveryManID: string) => {
    const findParcel = await checkParcelExistence(parcelId)
    const findAssignedTo = await User.findOne({ userId: deliveryManID }).select("name email userId");
    const findAssignedBy = await User.findOne({ userId: token.userId }).select("name email role");
    if (!findAssignedTo || !findAssignedBy) {
        throw new AppError(httpStatus.NOT_FOUND, "The parcel is not found")
    }
    checkCancelStatus(findParcel.parcelStatus)
    checkAdminOrSuperAdminAccess(token)
    checkIsTheParcelIsAlreadyApproved(findParcel.parcelStatus)
    let updateStatus = await handleParcelStatusUpdate(findParcel.trackingId, ParcelStatus.APPROVED)
    if (updateStatus?.parcelStatus === ParcelStatus.APPROVED) {
        const deliveryInfo = createDeliveryInfo(findAssignedTo, findAssignedBy)
        findParcel.deliveryInfo = deliveryInfo;
        await findParcel.save();
        const parcelAssignedTo = await handleParcelStatusUpdate(findParcel.trackingId, ParcelStatus.ASSIGNED_TO)
        if (parcelAssignedTo && parcelAssignedTo.parcelStatus === ParcelStatus.ASSIGNED_TO) {
            await handleNotification(ParcelStatus.APPROVED, findParcel.trackingId, findParcel.senderId)
        }
    }
    return updateStatus;
}
const dispatchParcel = async (token: JwtPayload) => {
    console.log(token, "from dispatch service");
}
export const ParcelServices = {
    createParcel, cancelParcel, allParcels, approvedParcel, dispatchParcel
} 