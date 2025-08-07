import { model, Schema } from "mongoose";
import { INotification, NotificationType } from "./notification.interface";
import { Role } from "../user/user.interface";

const notificationSchema = new Schema<INotification>({
    recipientId: {
        type: String,
        required: true
    },
    recipientRole: {
        type: String,
        required: true,
        enum: Object.values(Role)
    },
    parcelId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
    },
    senderRole: {
        type: String,
        enum: [Role.SENDER]
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
    },
    notificationType: {
        type: String,
        required: true,
        enum: Object.values(NotificationType)
    }
},
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    })
export const Notification = model<INotification>("Notification", notificationSchema)