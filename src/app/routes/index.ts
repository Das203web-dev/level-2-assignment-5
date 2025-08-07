import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ParcelRoutes } from "../modules/parcel/parcel.route";
import { NotificationRoute } from "../modules/notification/notification.route";

export const routes = Router()
const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/parcel",
        route: ParcelRoutes
    },
    {
        path: "/notification",
        route: NotificationRoute
    }
]
moduleRoutes.forEach(route => routes.use(route.path, route.route))