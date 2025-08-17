import { Router } from "express";
import { checkUserRole } from "../../middlewares/checkUser";
import { Role } from "../user/user.interface";
import { CouponController } from "./coupon.controller";

const route = Router();
route.post("/create", checkUserRole(Role.ADMIN, Role.SUPER_ADMIN), CouponController.handleCreateCoupon)
export const CouponRoutes = route