import { JwtPayload } from "jsonwebtoken";
import { Notification } from "./notification.model";

const getNotification = async (token: JwtPayload) => {
    console.log(token, "noti sercvise");
    const findNotification = await Notification.find({

    })
}
export const notificationService = {
    getNotification
}