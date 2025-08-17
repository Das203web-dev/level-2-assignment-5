import { Router } from "express";
import { ParcelController } from "./parcel.controller";
import { checkUserRole } from "../../middlewares/checkUser";
import { Role } from "../user/user.interface";
import { validationRequest } from "../../middlewares/validation";
import { ParcelSchema } from "./parcel.validation";

const route = Router();
route.post("/create",
    validationRequest(ParcelSchema),
    checkUserRole(Role.SENDER),
    ParcelController.handleCreateParcel);
route.get("/all-parcel",
    checkUserRole(Role.ADMIN, Role.SENDER, Role.RECEIVER, Role.SUPER_ADMIN),
    ParcelController.handleGetAllPArcels)
route.get("/incoming",
    checkUserRole(Role.RECEIVER),
    ParcelController.handleIncomingParcelsForReceiver)
route.get("/history",
    checkUserRole(Role.RECEIVER),
    ParcelController.handleParcelHistory)
route.patch("/cancel/:id",
    checkUserRole(Role.ADMIN, Role.SENDER),
    ParcelController.handleParcelCancel);
route.patch("/flagged/:id",
    checkUserRole(Role.ADMIN, Role.SUPER_ADMIN),
    ParcelController.handleFlagParcel)
route.patch("/blocked/:id",
    checkUserRole(Role.ADMIN, Role.SUPER_ADMIN),
    ParcelController.handleParcelBlock)
route.patch("/approved/:trackingID",
    (checkUserRole(Role.ADMIN, Role.SUPER_ADMIN)),
    ParcelController.handleApprovedParcel);
route.patch("/dispatch/:parcelId",
    checkUserRole(Role.DELIVERY_AGENT),
    ParcelController.handleDispatchParcel)
route.patch("/in_transit/:id",
    checkUserRole(Role.DELIVERY_AGENT),
    ParcelController.handelInTransit)
route.patch("/otp/send/:id",
    checkUserRole(Role.DELIVERY_AGENT),
    ParcelController.handleSendOTP)
route.patch("/otp/verify/:id",
    checkUserRole(Role.DELIVERY_AGENT, Role.RECEIVER),
    ParcelController.handleVerifyOTP)

route.delete("/delete/:id", checkUserRole(Role.SENDER), ParcelController.handleParcelDelete)

route.get("/track/:id", ParcelController.handlePublicTracking)

export const ParcelRoutes = route;