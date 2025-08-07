import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import passport from "passport";
import { checkUserRole } from "../../middlewares/checkUser";
import { Role } from "../user/user.interface";

const route = Router()
route.post("/login", AuthController.handleUserLogin);
route.post("/refresh-token", AuthController.handleGetNewTokenUsingRefreshToken)
route.post("/reset-password", checkUserRole(...Object.values(Role)), AuthController.handleResetPassword);
route.post("/logout", AuthController.handleUserLogout)
export const AuthRoutes = route; 