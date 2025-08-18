import { JwtPayload } from "jsonwebtoken";
import { Notification } from "./notification.model";

const getNotification = async (token: JwtPayload) => {
    const findNotification = await Notification.find({})
    return findNotification
}
export const notificationService = {
    getNotification
}