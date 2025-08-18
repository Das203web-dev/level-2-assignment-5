import { JwtPayload } from "jsonwebtoken";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import { Role, UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes"
import { handleParcelStatusUpdate } from "../../utils/handleParcelStatusUpdate";
import { handleNotification } from "../../utils/notificationHandeler";
import { checkAdminOrSuperAdminAccess, checkCancelStatus, checkIsTheParcelIsAlreadyApproved, checkParcelExistence, checkTokenExistence, createDeliveryInfo, handleInvalidOtp, notifyAdmin } from "../../helperFunction/helperfunction";
import { sendEmail } from "../../utils/sendEmail";
import { sendOTPEmail } from "../../utils/sendOTPemail";
import { OTP } from "../otp/otp.model";
import { NotificationType } from "../notification/notification.interface";

const createParcel = async (payload: Partial<IParcel>, token: JwtPayload) => {
    const getToken = await checkTokenExistence(token);
    const checkUserStatus = await User.findOne({ userId: getToken.userId }).select("userStatus");
    if (checkUserStatus?.userStatus === UserStatus.BLOCKED) {
        throw new AppError(httpStatus.FORBIDDEN, `Sorry you are not permitted to create Parcel cause you are ${checkUserStatus.userStatus}`)
    }
    if (getToken.role === Role.RECEIVER || getToken.role === Role.DELIVERY_AGENT) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry ${getToken.role} does not create parcel request`)
    }
    const findReceiver = await User.findOne({ email: payload.receiverInfo?.receiverEmail }).select("userId name email");

    const parcelBody = {
        ...payload,
        senderId: getToken.userId,
        receiverInfo: {
            ...payload.receiverInfo,
            receiverId: findReceiver ? findReceiver.userId : undefined
        }
    }
    const createParcel = await Parcel.create(parcelBody)
    if (createParcel.parcelStatus === ParcelStatus.REQUESTED) {
        await notifyAdmin(ParcelStatus.REQUESTED, createParcel.trackingId, NotificationType.NEW_PARCEL_REQUEST)
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { _id, ...parcel } = createParcel.toObject()
    return parcel
}
const cancelParcel = async (id: string, token: JwtPayload) => {
    const isParcelExist = await checkParcelExistence(id)
    const status = [
        ParcelStatus.REQUESTED,
        ParcelStatus.FLAG,
        ParcelStatus.BLOCKED,
        ParcelStatus.APPROVED
    ]
    if (!status.includes(isParcelExist.parcelStatus)) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry the parcel is already ${isParcelExist.parcelStatus} . You can't cancel the parcel now`)
    }
    if (token.role === Role.ADMIN) {
        checkCancelStatus(isParcelExist.parcelStatus)
        const cancelParcel = await handleParcelStatusUpdate(id, ParcelStatus.CANCELLED)
        if (cancelParcel?.parcelStatus === ParcelStatus.CANCELLED) {
            await handleNotification(ParcelStatus.CANCELLED, isParcelExist.trackingId, isParcelExist.senderId, NotificationType.PARCEL_CANCELLED);
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
                await notifyAdmin(ParcelStatus.CANCELLED, cancelParcel.trackingId, NotificationType.PARCEL_CANCELLED)
            }
            return cancelParcel
        }
        else {
            throw new AppError(httpStatus.FORBIDDEN, "Access denied")
        }
    }
}
const allParcels = async (token: JwtPayload, parcelStatus?: string) => {
    const query: any = {};
    if (token.role === Role.ADMIN || token.role === Role.SUPER_ADMIN) {
        if (parcelStatus) {
            query.parcelStatus = parcelStatus;
        }
    } else if (token.role === Role.RECEIVER) {
        query["receiverInfo.receiverId"] = token.userId;
        if (parcelStatus) {
            query.parcelStatus = parcelStatus;
        }
    } else {
        query.senderId = token.userId;
        if (parcelStatus) {
            query.parcelStatus = parcelStatus;
        }
    }
    const parcels = await Parcel.find(query, { _id: 0 }).sort({ createdAt: -1 });
    return parcels;
};

const approvedParcel = async (parcelId: string, token: JwtPayload, deliveryManID: string) => {
    if (!deliveryManID) {
        throw new AppError(httpStatus.BAD_REQUEST, "You must have to provide delivery man")
    }
    const findParcel = await checkParcelExistence(parcelId)
    const findAssignedTo = await User.findOne({ userId: deliveryManID }).select("name email userId");
    const allowedFields = [ParcelStatus.REQUESTED, ParcelStatus.FLAG]
    const findAssignedBy = await User.findOne({ userId: token.userId }).select("name email role");
    if (!findAssignedTo || !findAssignedBy) {
        throw new AppError(httpStatus.NOT_FOUND, `You must have to fullfill all criteria`)
    }
    if (!allowedFields.includes(findParcel.parcelStatus)) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry parcel with this ${findParcel.parcelStatus} status can't be approved`)
    }
    checkCancelStatus(findParcel.parcelStatus)
    checkAdminOrSuperAdminAccess(token)
    checkIsTheParcelIsAlreadyApproved(findParcel.parcelStatus)
    let updateStatus = await handleParcelStatusUpdate(findParcel.trackingId, ParcelStatus.APPROVED)
    if (updateStatus?.parcelStatus === ParcelStatus.APPROVED) {
        const deliveryInfo = createDeliveryInfo(findAssignedTo, findAssignedBy)
        findParcel.deliveryInfo = deliveryInfo;
        await updateStatus.save();
        if (updateStatus.parcelStatus !== ParcelStatus.APPROVED) {
            throw new AppError(httpStatus.BAD_REQUEST, `Parcel must be on ${findParcel.parcelStatus} before assigning to someone`)
        }
        const parcelAssignedTo = await handleParcelStatusUpdate(findParcel.trackingId, ParcelStatus.ASSIGNED_TO)
        if (parcelAssignedTo && parcelAssignedTo.parcelStatus === ParcelStatus.ASSIGNED_TO) {
            await handleNotification(ParcelStatus.APPROVED, findParcel.trackingId, findParcel.senderId, NotificationType.PARCEL_APPROVED)
        }
        return parcelAssignedTo
    }
    return findParcel;
}
const dispatchParcel = async (token: JwtPayload, parcelId: string) => {
    const parcel = await Parcel.findOne({ trackingId: parcelId })
    const getToken = await checkTokenExistence(token)
    if (getToken.role !== Role.DELIVERY_AGENT) {
        throw new AppError(httpStatus.BAD_REQUEST, "Sorry you are not allowed to dispatch parcel")
    }
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
    }
    if (parcel.parcelStatus !== ParcelStatus.ASSIGNED_TO) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry parcel with this status ${parcel.parcelStatus} can't be dispatched`)
    }
    const parcelDispatched = await handleParcelStatusUpdate(parcelId, ParcelStatus.DISPATCHED);
    if (parcelDispatched?.parcelStatus === ParcelStatus.DISPATCHED) {
        const dispatchDate = parcel.trackingEvent?.find(status => status.status.parcelStatus === ParcelStatus.DISPATCHED);
        const emailBody = {
            parcel_name: parcel.parcelName,
            senderId: parcel.senderId,
            senderAddress: parcel.senderAddress,
            receiverInfo: {
                address: parcel.receiverInfo.address,
                receiverName: parcel.receiverInfo.receiverName,
                receiverPhone: parcel.receiverInfo.receiverPhone,
                receiverEmail: parcel.receiverInfo.receiverEmail
            },
            deliveryInfo: {
                dispatchDate: dispatchDate?.status?.date,
                deliveryPersonName: parcel.deliveryInfo?.deliveryPersonInfo.name,
                deliveryPersonEmail: parcel.deliveryInfo?.deliveryPersonInfo.email
            }
        }
        try {
            await sendEmail({
                emailTo: parcel.receiverInfo.receiverEmail,
                subject: `Your parcel ${parcel.parcelName} dispatch`,
                templateName: "parcelDispatch",
                templateData: emailBody
            })
        } catch (error) {
            throw new AppError(httpStatus.BAD_REQUEST, "Something went wrong in the email.")
        }
        parcel.parcelStatus = parcelDispatched?.parcelStatus;
        await parcel.save()
        return parcelDispatched
    }
    return parcel;
}
const inTransit = async (token: JwtPayload, parcelId: string) => {
    const getToken = await checkTokenExistence(token);
    const checkParcel = await checkParcelExistence(parcelId)
    if (!checkParcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
    }
    if (checkParcel.parcelStatus !== ParcelStatus.DISPATCHED) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry parcel with this status ${checkParcel.parcelStatus} can't be updated`)
    }
    if (getToken.role === Role.DELIVERY_AGENT) {
        const findParcel = await Parcel.findOne({ trackingId: parcelId });
        if (!findParcel) {
            throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
        }
        const updateParcel = await handleParcelStatusUpdate(findParcel.trackingId, ParcelStatus.IN_TRANSIT);
        return updateParcel
    }
    else {
        throw new AppError(httpStatus.BAD_REQUEST, "Permission denied")
    }
}

const sendOTP = async (token: JwtPayload, parcelId: string) => {
    const getToken = await checkTokenExistence(token);
    const findParcel = await checkParcelExistence(parcelId);
    const findOTP = await OTP.findOne({ parcelId });
    if (findParcel && findParcel.parcelStatus === ParcelStatus.SEND_OTP) {
        throw new AppError(httpStatus.BAD_REQUEST, `The Parcel is already in ${findParcel.parcelStatus} state`)
    }

    if (findParcel.parcelStatus !== ParcelStatus.IN_TRANSIT) {
        throw new AppError(httpStatus.BAD_REQUEST, `Can't jump to this state without being transit`)
    }

    if (getToken.role !== Role.DELIVERY_AGENT) {
        throw new AppError(httpStatus.BAD_REQUEST, "permission denied")
    }

    // Fixed: Check if maxLimit is 0 (no attempts left)
    if (findOTP && Number(findOTP.maxLimit) <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Sorry max limit reached")
    }

    await sendOTPEmail(
        findParcel?.receiverInfo?.receiverId as string,
        findParcel.trackingId,
        3, // Initial attempt should be 3, not 2
        findParcel.receiverInfo.receiverEmail,
        "PARCEL_DELIVERY",
        findParcel.deliveryInfo?.deliveryPersonInfo?.userId
    )

    const parcelUpdate = await handleParcelStatusUpdate(findParcel.trackingId, ParcelStatus.SEND_OTP)
    return parcelUpdate
}

// old code 
const confirmParcel = async (token: JwtPayload, parcelID: string, otp: number) => {
    const getToken = await checkTokenExistence(token);
    const parcelFromOtp = await OTP.findOne({ parcelId: parcelID });
    const parcelFromCollection = await checkParcelExistence(parcelID);
    const checkReceiverExistence = await User.findOne({ userId: parcelFromCollection?.receiverInfo?.receiverId });
    const currentDate = new Date();
    if (parcelFromOtp && parcelFromOtp.coolDownTime && parcelFromOtp.coolDownTime > currentDate) {
        const remainingTime = Math.ceil((parcelFromOtp.coolDownTime.getTime() - currentDate.getTime()) / 1000);
        throw new AppError(httpStatus.BAD_REQUEST, `Please wait ${remainingTime} seconds before trying again`);
    }
    if (parcelFromCollection.parcelStatus !== ParcelStatus.SEND_OTP) {
        throw new AppError(httpStatus.BAD_REQUEST, `Please send OTP first`);
    }
    if (!parcelFromOtp) {
        throw new AppError(httpStatus.NOT_FOUND, "OTP not found for this parcel");
    }
    if (parcelFromOtp.expireTime && parcelFromOtp.expireTime < currentDate) {
        throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired. Please request a new one.");
    }
    if (getToken.role === Role.RECEIVER && checkReceiverExistence) {
        if (Number(parcelFromOtp.otp) === Number(otp) && parcelFromOtp.parcelId === parcelFromCollection.trackingId) {
            const updateParcel = await handleParcelStatusUpdate(parcelFromCollection.trackingId, ParcelStatus.DELIVERED, parcelFromCollection?.trackingEvent?.[0].location);
            await OTP.findOneAndDelete({ parcelId: parcelID });
            return updateParcel;
        } else {
            await handleInvalidOtp(parcelFromOtp.parcelId as string);
            return;
        }
    }
    if (getToken.role === Role.DELIVERY_AGENT && !checkReceiverExistence) {
        if (getToken.userId !== parcelFromCollection?.deliveryInfo?.deliveryPersonInfo?.userId) {
            throw new AppError(httpStatus.FORBIDDEN, "Permission not granted");
        }
        if (Number(parcelFromOtp.otp) === Number(otp) && parcelFromOtp.parcelId === parcelFromCollection.trackingId) {
            const updateParcel = await handleParcelStatusUpdate(parcelFromCollection.trackingId, ParcelStatus.DELIVERED, parcelFromCollection?.trackingEvent?.[0].location);
            await OTP.findOneAndDelete({ parcelId: parcelID });
            return updateParcel;
        } else {
            await handleInvalidOtp(parcelFromOtp.parcelId as string);
            return;
        }
    }
    throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to confirm this delivery");
};

const deleteParcel = async (parcelId: string, token: JwtPayload) => {
    const findParcel = await checkParcelExistence(parcelId);
    if (findParcel.parcelStatus !== ParcelStatus.REQUESTED) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry parcel with this ${findParcel.parcelStatus} can not be deleted`)
    }
    const parcel = await Parcel.findOneAndDelete({ trackingId: findParcel.trackingId, senderId: token.userId });
    if (!parcel) {
        throw new AppError(httpStatus.BAD_REQUEST, "Something wrong")
    }
    return parcel
}


const incomingParcels = async (token: JwtPayload) => {
    await checkTokenExistence(token);
    const statusForIncomingParcels = [
        ParcelStatus.DELIVERED,
        ParcelStatus.CANCELLED
    ]
    const findParcels = await Parcel.find({
        "receiverInfo.receiverId": token.userId,
        parcelStatus: { $nin: statusForIncomingParcels }
    }, { _id: 0 })
    if (!findParcels || findParcels.length < 1) {
        throw new AppError(httpStatus.NOT_FOUND, "Sorry no parcels found")
    }
    return findParcels
}
const parcelHistory = async (token: JwtPayload) => {
    const getToken = await checkTokenExistence(token);
    if (getToken.role !== Role.RECEIVER) {
        throw new AppError(httpStatus.FORBIDDEN, "Only receivers can access this route")
    }
    const parcels = await Parcel.find({ "receiverInfo.receiverId": token.userId, parcelStatus: ParcelStatus.DELIVERED }, { _id: 0 });
    if (!parcels || parcels.length < 1) {
        throw new AppError(httpStatus.NOT_FOUND, "No parcel found")
    }
    return parcels
}
const flagParcel = async (token: JwtPayload, parcelId: string) => {
    const getToken = await checkTokenExistence(token);
    const parcel = await checkParcelExistence(parcelId);
    const allowedStatusesForFlagging = [
        ParcelStatus.REQUESTED,
        ParcelStatus.APPROVED,
        ParcelStatus.ASSIGNED_TO,
        ParcelStatus.DISPATCHED
    ];
    if (!allowedStatusesForFlagging.includes(parcel.parcelStatus)) {
        throw new AppError(httpStatus.BAD_REQUEST, `Parcel with this ${parcel.parcelStatus} status are not allowed to flagged`)
    }
    if (getToken.role === Role.ADMIN || getToken.role === Role.SUPER_ADMIN) {
        parcel.parcelStatus = ParcelStatus.FLAG;
        const updateParcel = await parcel.save();
        if (updateParcel.parcelStatus === ParcelStatus.FLAG) {
            await handleNotification(updateParcel.parcelStatus, updateParcel.trackingId, updateParcel.senderId, NotificationType.PARCEL_FLAGGED,)
        }
        else {
            throw new AppError(httpStatus.BAD_REQUEST, "Parcel is not flagged")
        }
        return updateParcel

    }
}
const blockParcel = async (token: JwtPayload, parcelId: string) => {
    const parcel = await checkParcelExistence(parcelId);
    const notAllowedStatus = [
        ParcelStatus.DELIVERED,
        ParcelStatus.IN_TRANSIT,
        ParcelStatus.SEND_OTP,
        ParcelStatus.PARCEL_DELIVERY_NOTIFICATION
    ]
    if (token.role !== Role.ADMIN && token.role !== Role.SUPER_ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Access denied")
    }
    if (notAllowedStatus.includes(parcel.parcelStatus)) {
        throw new AppError(httpStatus.BAD_REQUEST, `Sorry the parcel is already ${parcel.parcelStatus} and can not be blocked`)
    }
    parcel.parcelStatus = ParcelStatus.BLOCKED;
    const updatedParcel = await parcel.save();
    if (updatedParcel.parcelStatus === ParcelStatus.BLOCKED) {
        await handleNotification(ParcelStatus.BLOCKED, updatedParcel.trackingId, updatedParcel.senderId, NotificationType.PARCEL_BLOCKED)
    }
    return updatedParcel
}
const publicTracking = async (parcelId: string) => {
    const parcel = await checkParcelExistence(parcelId);
    return {
        trackingId: parcel.trackingId,
        parcelName: parcel.parcelName,
        parcelStatus: parcel.parcelStatus,
        deliveryDate: parcel.deliveryDate,
        trackingEvent: (parcel.trackingEvent ?? []).map(event => ({
            location: event.location,
            status: event.status.parcelStatus,
            date: event.status.date,
            note: event.note,
        })),
        receiverName: parcel.receiverInfo.receiverName,
    };
};

export const ParcelServices = {
    createParcel,
    cancelParcel,
    allParcels,
    approvedParcel,
    dispatchParcel,
    inTransit,
    sendOTP,
    confirmParcel,
    incomingParcels,
    parcelHistory,
    flagParcel,
    blockParcel,
    publicTracking,
    deleteParcel
} 