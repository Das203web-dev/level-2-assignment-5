import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { checkUserRole } from "../../middlewares/checkUser";
import { Role } from "../user/user.interface";

const route = Router();
route.post("/create", checkUserRole(Role.SENDER), ParcelController.handleCreateParcel);
route.get("/all-parcel", checkUserRole(Role.ADMIN, Role.SENDER), ParcelController.handleGetAllPArcels)
route.patch("/cancel/:id", checkUserRole(Role.ADMIN, Role.SENDER), ParcelController.handleParcelCancel)
route.patch("/approved/:trackingID", (checkUserRole(Role.ADMIN, Role.SUPER_ADMIN)), ParcelController.handleApprovedParcel)
export const ParcelRoutes = route;