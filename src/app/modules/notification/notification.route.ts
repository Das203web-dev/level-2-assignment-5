import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { checkUserRole } from "../../middlewares/checkUser";
import { Role } from "../user/user.interface";

const route = Router();
route.get("/all", checkUserRole(Role.ADMIN, Role.SENDER, Role.SUPER_ADMIN, Role.RECEIVER, Role.DELIVERY_AGENT), NotificationController.handleNotification)
export const NotificationRoute = route