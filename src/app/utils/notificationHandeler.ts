import AppError from "../errorHelpers/AppError";
import { INotification, NotificationType } from "../modules/notification/notification.interface";
import { Notification } from "../modules/notification/notification.model";
// import { NotificationRoute } from "../modules/notification/notification.route";
import { ParcelStatus } from "../modules/parcel/parcel.interface";
import { Parcel } from "../modules/parcel/parcel.model";
import { Role } from "../modules/user/user.interface";
// import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes"

export const handleNotification = async (status: ParcelStatus, parcelId: string, recipientId: string): Promise<INotification> => {
    const findSender = await Parcel.findOne({ trackingId: parcelId }).select("senderId")
    console.log(findSender);
    if (!findSender) {
        throw new AppError(httpStatus.NOT_FOUND, "Sender is not found")
    }
    const senderId = findSender?.senderId
    let notifications: INotification = {
        recipientId: "",
        // senderId: "",
        recipientRole: "",
        // senderRole: "",
        parcelId: "",
        message: "",
        data: null,
        notificationType: NotificationType.NEW_PARCEL_REQUEST
    };
    switch (status) {
        case ParcelStatus.REQUESTED:
            notifications = {
                recipientId: recipientId,
                recipientRole: Role.ADMIN,
                parcelId: parcelId,
                message: `You got a new parcel request`,
                notificationType: NotificationType.NEW_PARCEL_REQUEST,
            }
            break;
        case ParcelStatus.APPROVED:
            notifications = {
                recipientId: recipientId,
                recipientRole: Role.SENDER,
                parcelId: parcelId,
                message: `Your parcel request is approved`,
                notificationType: NotificationType.PARCEL_APPROVED,
            }
            break;
        case ParcelStatus.CANCELLED:
            notifications = {
                recipientId: recipientId,
                recipientRole: Role.SENDER,
                parcelId: parcelId,
                message: `You parcel request is cancel`,
                notificationType: NotificationType.PARCEL_CANCELLED,
            }
            break;
        case ParcelStatus.ASSIGNED_TO:
            notifications = {
                recipientId: recipientId,
                recipientRole: Role.DELIVERY_AGENT,
                parcelId: parcelId,
                message: `You got a new parcel to delivery`,
                notificationType: NotificationType.PARCEL_ASSIGN,
            }
            break;
        case ParcelStatus.DISPATCHED:
            notifications = {
                recipientId: recipientId,
                senderId: senderId,
                recipientRole: Role.ADMIN,
                senderRole: Role.SENDER,
                parcelId: parcelId,
                message: `This parcel is accepted by delivery person`,
                notificationType: NotificationType.NEW_PARCEL_REQUEST,
            }
            break;
        case ParcelStatus.IN_TRANSIT:
            notifications = {
                recipientId: recipientId,
                senderId: senderId,
                recipientRole: Role.ADMIN,
                senderRole: Role.SENDER,
                parcelId: parcelId,
                message: `This parcel is on the way`,
                notificationType: NotificationType.PARCEL_IN_TRANSIT,
            }
            break;
        case ParcelStatus.DELIVERED:
            notifications = {
                recipientId: recipientId,
                senderId: senderId,
                recipientRole: Role.ADMIN,
                senderRole: Role.SENDER,
                parcelId: parcelId,
                message: `This parcel is delivered`,
                notificationType: NotificationType.PARCEL_DELIVERED,
            }
            break;
        case ParcelStatus.FAILED:
            notifications = {
                recipientId: recipientId,
                senderId: senderId,
                recipientRole: Role.ADMIN,
                senderRole: Role.SENDER,
                parcelId: parcelId,
                message: `This parcel delivery is failed`,
                notificationType: NotificationType.PARCEL_FAILED,
            }
            break;
        case ParcelStatus.RETURNED:
            notifications = {
                recipientId: recipientId,
                senderId: senderId,
                recipientRole: Role.ADMIN,
                senderRole: Role.SENDER,
                parcelId: parcelId,
                message: `This parcel is returned`,
                notificationType: NotificationType.PARCEL_RETURNED,
            }
    }
    return await Notification.create(notifications)
    // return notifications
}